import type {
  AdapterEvent,
  AdapterListener,
  DeviceAdapter,
  Unsubscribe,
} from '../../domain/DeviceAdapter';
import { commandToPayload, type DeviceCommand } from '../../domain/command';
import { makeAppError, type AppError } from '../../domain/error';
import { parseState } from '../../domain/parse';
import type { ConnectionStatus, Device } from '../../domain/type';

export type HttpAdapterOptions = {
  /** Spec badge: HTTP • POLL 3s */
  pollingMs?: number;
  /** Spec §6.5: "did not respond within 3000ms" */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class HttpAdapter implements DeviceAdapter {
  readonly deviceId: string;
  readonly protocol = 'http' as const;

  private readonly baseUrl: string;
  private readonly type: Device['type'];
  private readonly pollingMs: number;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  private readonly listeners = new Set<AdapterListener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private inFlight = false;
  private connected = false;

  constructor(device: Device, options: HttpAdapterOptions = {}) {
    if (device.config.protocol !== 'http') {
      throw new Error(
        'HttpAdapter hanya untuk device dengan config.protocol "http".',
      );
    }
    this.deviceId = device.id;
    this.type = device.type;
    this.baseUrl = device.config.baseUrl.replace(/\/+$/, '');
    this.pollingMs = options.pollingMs ?? 3000;
    this.timeoutMs = options.timeoutMs ?? 3000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  subscribe(listener: AdapterListener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    this.connected = true;
    await this.pollOnce();
    this.timer = setInterval(() => {
      void this.pollOnce();
    }, this.pollingMs);
  }

  disconnect(): Promise<void> {
    this.connected = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.listeners.clear();
    return Promise.resolve();
  }

  async send(command: DeviceCommand): Promise<void> {
    const state = await this.request(this.setUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(commandToPayload(command)),
    });
    this.emit({ type: 'state', state });
    this.setStatus('online');
  }

  /** One poll; never throws. Overlapping polls are skipped. */
  private async pollOnce(): Promise<void> {
    if (!this.connected || this.inFlight) return;
    this.inFlight = true;
    try {
      const state = await this.request(this.deviceUrl(), { method: 'GET' });
      this.emit({ type: 'state', state });
      this.setStatus('online');
    } catch (error) {
      this.setStatus('offline');
      this.emit({ type: 'error', error: toAppError(error) });
    } finally {
      this.inFlight = false;
    }
  }

  /** fetch + AbortController; parses the payload or throws a typed AppError. */
  private async request(url: string, init: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        ...init,
        // mqtt's typings pull @types/node in, which redeclares AbortSignal with
        // Node's `onabort`. RN's fetch only cares about the runtime behaviour, so
        // the cast keeps the adapter compiling without weakening anything real.
        signal: controller.signal as unknown as AbortSignal,
      } as RequestInit);
    } catch (error) {
      // AbortController fired -> we cancelled it ourselves -> timeout.
      if (controller.signal.aborted) {
        throw makeAppError(
          'request_timeout',
          error,
          `Request timeout — ${url} tidak merespons dalam ${this.timeoutMs}ms`,
        );
      }
      // fetch failed before any response: connection refused / bad URL / DNS.
      if (error instanceof TypeError) {
        throw makeAppError(
          'device_offline',
          error,
          `Device offline — no response from ${url}`,
        );
      }
      throw makeAppError('device_offline', error);
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 404) {
      throw makeAppError(
        'wrong_url',
        undefined,
        `Wrong URL (404) — check base URL: ${url}`,
      );
    }
    if (!response.ok) {
      throw makeAppError(
        'device_offline',
        undefined,
        `Device offline — ${url} menjawab ${response.status}`,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw makeAppError(
        'wrong_url',
        error,
        `Wrong URL — ${url} tidak mengembalikan JSON`,
      );
    }

    const parsed = parseState(this.type, payload);
    if (!parsed.ok) {
      throw makeAppError(
        'wrong_url',
        undefined,
        `Wrong URL — payload tidak sesuai: ${parsed.reason}`,
      );
    }
    return parsed.state;
  }

  private deviceUrl(): string {
    return `${this.baseUrl}/devices/${this.deviceId}`;
  }

  /** Write endpoint from the message contract: POST /devices/<id>/set */
  private setUrl(): string {
    return `${this.deviceUrl()}/set`;
  }

  private setStatus(status: ConnectionStatus): void {
    // Only report changes; avoids resetting the error banner on every poll.
    this.emit({ type: 'status', status });
  }

  private emit(event: AdapterEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
}

/** Maps a thrown value to an AppError, keeping already-typed ones. */
function toAppError(error: unknown): AppError {
  if (typeof error === 'object' && error !== null && 'kind' in error) {
    return error as AppError;
  }
  return makeAppError('device_offline', error);
}

export function createHttpAdapter(
  device: Device,
  options?: HttpAdapterOptions,
): DeviceAdapter {
  return new HttpAdapter(device, options);
}
