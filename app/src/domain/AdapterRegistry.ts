import type { AdapterFactory, DeviceAdapter } from './DeviceAdapter';
import type { Device, Protocol } from './type';

export class AdapterRegistry {
  private readonly factories = new Map<Protocol, AdapterFactory>();

  register(protocol: Protocol, factory: AdapterFactory): void {
    this.factories.set(protocol, factory);
  }

  has(protocol: Protocol): boolean {
    return this.factories.has(protocol);
  }

  create(device: Device): DeviceAdapter {
    const factory = this.factories.get(device.config.protocol);
    if (!factory) {
      throw new Error(
        `Tidak ada adapter terdaftar untuk protokol "${device.config.protocol}".`,
      );
    }
    return factory(device);
  }
}
