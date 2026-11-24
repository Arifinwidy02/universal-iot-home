import mqtt, { type MqttClient, type IClientOptions } from 'mqtt';
import type {
  AdapterEvent,
  AdapterListener,
  DeviceAdapter,
  Unsubscribe,
} from '../../domain/DeviceAdapter';
import { commandToPayload, type DeviceCommand } from '../../domain/command';
import { makeAppError, type AppError } from '../../domain/error';
import { parseState, parseStatus } from '../../domain/parse';
import type { Device } from '../../domain/type';

export type MqttAdapterOptions = {
  connectTimeoutMs?: number;
  maxReconnectMs?: number;
  connectFactory?: (url: string, options: IClientOptions) => MqttClient;
};

export class MqttAdapter implements DeviceAdapter {
  readonly deviceId: string;
  readonly protocol = 'mqtt' as const;

  private readonly brokerUrl: string;
  private readonly prefix: string;
  private readonly type: Device['type'];
  private readonly connectTimeoutMs: number;
  private readonly maxReconnectMs: number;
  private readonly connectFactory: (
    url: string,
    options: IClientOptions,
  ) => MqttClient;

  private readonly listeners = new Set<AdapterListener>();
  private client: MqttClient | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private stopped = false;
  /** mqtt.js fires 'error' on every reconnect attempt; report the banner once. */
  private reportedError = false;
  private sawStatus = false;
  /** Fires when the broker is connected but the device never publishes status. */
  private statusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(device: Device, options: MqttAdapterOptions = {}) {
    if (device.config.protocol !== 'mqtt') {
      throw new Error(
        'MqttAdapter hanya untuk device dengan config.protocol "mqtt".',
      );
    }
    this.deviceId = device.id;
    this.type = device.type;
    this.brokerUrl = device.config.brokerUrl;
    this.prefix = device.config.topicPrefix.replace(/\/+$/, '');
    this.connectTimeoutMs = options.connectTimeoutMs ?? 5000;
    this.maxReconnectMs = options.maxReconnectMs ?? 15000;
    this.connectFactory = options.connectFactory ?? mqtt.connect;
  }

  private topic(channel: 'state' | 'status' | 'set'): string {
    return `${this.prefix}/${this.deviceId}/${channel}`;
  }

  subscribe(listener: AdapterListener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  connect(): Promise<void> {
    if (this.client || this.stopped) return Promise.resolve();

    // Backoff: 1s, 2s, 4s, 8s, lalu tetap di maxReconnectMs.
    const backoff = Math.min(1000 * 2 ** this.attempt, this.maxReconnectMs);
    this.attempt += 1;

    const client = this.connectFactory(this.brokerUrl, {
      clientId: `app-${this.deviceId}-${Math.random()
        .toString(16)
        .slice(2, 8)}`,
      clean: true,
      reconnectPeriod: backoff,
      connectTimeout: this.connectTimeoutMs,
      // Tanpa will: app tidak boleh mengaku offline atas nama device.
    });
    this.client = client;

    client.on('connect', () => {
      this.attempt = 0;
      this.reportedError = false;
      this.sawStatus = false;
      client.subscribe([this.topic('state'), this.topic('status')], { qos: 1 });

      // Connected to the broker is not the same as the device being alive.
      // If no retained `status` arrives, say so and name the topic.
      if (this.statusTimer) clearTimeout(this.statusTimer);
      this.statusTimer = setTimeout(() => {
        if (this.sawStatus || this.stopped) return;
        this.emit({ type: 'status', status: 'offline' });
        this.emit({
          type: 'error',
          error: makeAppError(
            'device_offline',
            undefined,
            `Device offline — no status published on ${this.topic('status')}`,
          ),
        });
      }, 2000);
    });

    client.on('message', (topic: string, payload: Buffer) => {
      this.handleMessage(topic, payload.toString());
    });

    client.on('error', (error: Error) => {
      // mqtt.js memicu 'error' setiap percobaan reconnect. Laporkan sekali saja,
      // kalau tidak banner error berkedip 10x per menit saat broker mati.
      if (this.reportedError) return;
      this.reportedError = true;
      this.emit({ type: 'status', status: 'offline' });
      this.emit({ type: 'error', error: toAppError(error, this.brokerUrl) });
    });

    // Satu-satunya timer milik adapter: batas waktu koneksi awal.
    this.connectTimer = setTimeout(() => {
      if (client.connected) return;
      this.emit({ type: 'status', status: 'offline' });
      this.emit({
        type: 'error',
        error: makeAppError(
          'broker_unreachable',
          undefined,
          `Broker unreachable — Failed to connect to ${this.brokerUrl}`,
        ),
      });
    }, this.connectTimeoutMs);

    return Promise.resolve();
  }

  private handleMessage(topic: string, text: string): void {
    if (topic === this.topic('status')) {
      const status = parseStatus(text.trim());
      if (!status) return;
      this.sawStatus = true;
      if (this.statusTimer) {
        clearTimeout(this.statusTimer);
        this.statusTimer = null;
      }
      this.emit({ type: 'status', status });
      if (status === 'offline') {
        this.emit({
          type: 'error',
          error: makeAppError(
            'device_offline',
            undefined,
            `Device offline — Last will status: offline`,
          ),
        });
      }
      return;
    }

    if (topic !== this.topic('state')) return;

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return; // bukan JSON, abaikan; jangan rusak state terakhir yang baik
    }

    const parsed = parseState(this.type, payload);
    if (!parsed.ok) return;
    this.emit({ type: 'state', state: parsed.state });
  }

  send(command: DeviceCommand): Promise<void> {
    const client = this.client;
    if (!client?.connected) {
      return Promise.reject(
        makeAppError(
          'device_offline',
          undefined,
          'Device offline — broker belum terhubung.',
        ),
      );
    }
    client.publish(
      this.topic('set'),
      JSON.stringify(commandToPayload(command)),
      {
        qos: 1,
        retain: false,
      },
    );
    // Konfirmasi datang sebagai pesan `state`; tidak ada resolve optimistis.
    return Promise.resolve();
  }

  disconnect(): Promise<void> {
    this.stopped = true;
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = null;
    const client = this.client;
    this.client = null;
    this.listeners.clear();
    if (this.statusTimer) clearTimeout(this.statusTimer);
    this.statusTimer = null;
    if (client) client.end(true);
    return Promise.resolve();
  }

  /** Every AdapterEvent leaves the adapter through here — no other channel. */
  private emit(event: AdapterEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
}

/** mqtt.js melempar Error biasa; kita beri kind supaya banner bisa bicara. */
function toAppError(error: unknown, brokerUrl: string): AppError {
  const message = error instanceof Error ? error.message : String(error);

  const looksMalformed = /Invalid URL|Failed to parse URL|getaddrinfo/i.test(
    message,
  );
  return makeAppError(
    looksMalformed ? 'wrong_url' : 'broker_unreachable',
    error,
    `${message} — ${brokerUrl}`,
  );
}

export function createMqttAdapter(
  device: Device,
  options?: MqttAdapterOptions,
): DeviceAdapter {
  return new MqttAdapter(device, options);
}
