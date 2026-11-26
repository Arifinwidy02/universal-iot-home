// app/src/domain/DeviceRepository.ts
import type { AdapterRegistry } from './AdapterRegistry';
import type { DeviceAdapter } from './DeviceAdapter';
import type { DeviceCommand } from '../rules/command';
import type { Device } from '../model/type';

export class DeviceRepository {
  private readonly adapters = new Map<string, DeviceAdapter>();
  /** Kept so ↻ RETRY can rebuild an adapter with the same event handler. */
  private readonly handlers = new Map<
    string,
    (
      id: string,
      event: Parameters<Parameters<DeviceAdapter['subscribe']>[0]>[0],
    ) => void
  >();

  constructor(private readonly registry: AdapterRegistry) {}

  async start(
    device: Device,
    onEvent: (
      id: string,
      event: Parameters<Parameters<DeviceAdapter['subscribe']>[0]>[0],
    ) => void,
  ): Promise<void> {
    await this.stop(device.id);
    this.handlers.set(device.id, onEvent);
    const adapter = this.registry.create(device);
    this.adapters.set(device.id, adapter);
    adapter.subscribe(event => onEvent(device.id, event));
    await adapter.connect();
  }

  async stop(id: string): Promise<void> {
    const adapter = this.adapters.get(id);
    if (!adapter) return;
    this.adapters.delete(id);
    this.handlers.delete(id);
    await adapter.disconnect();
  }

  async send(id: string, command: DeviceCommand): Promise<void> {
    const adapter = this.adapters.get(id);
    if (!adapter) throw new Error(`Device ${id} belum punya adapter aktif.`);
    await adapter.send(command);
  }

  /** Retry after a fault: same handler, fresh adapter. */
  async restart(device: Device): Promise<void> {
    const handler = this.handlers.get(device.id);
    if (!handler) return;
    await this.start(device, handler);
  }
}
