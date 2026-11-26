import { AdapterRegistry } from '../../../src/domain/connection/AdapterRegistry';
import type {
  AdapterFactory,
  DeviceAdapter,
} from '../../../src/domain/connection/DeviceAdapter';
import type { Device } from '../../../src/domain/model/type';

function makeFakeAdapter(device: Device): DeviceAdapter {
  return {
    deviceId: device.id,
    protocol: device.config.protocol,
    connect: async () => undefined,
    disconnect: async () => undefined,
    send: async () => undefined,
    subscribe: () => () => undefined,
  };
}

const plug: Device = {
  id: 'plug-1',
  name: 'Colokan TV',
  config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000' },
  type: 'plug',
  state: { on: true },
  status: 'offline',
  errorType: null,
  errorMessage: null,
};

const sensor: Device = {
  id: 'sensor-1',
  name: 'Sensor Dapur',
  config: {
    protocol: 'mqtt',
    brokerUrl: 'ws://10.0.2.2:9001',
    topicPrefix: 'home',
  },
  type: 'sensor',
  state: { temperature: 26.5, humidity: 61 },
  status: 'offline',
  errorType: null,
  errorMessage: null,
};

describe('AdapterRegistry', () => {
  it('reports which protocols are registered', () => {
    const registry = new AdapterRegistry();
    const factory: AdapterFactory = makeFakeAdapter;

    expect(registry.has('http')).toBe(false);
    registry.register('http', factory);
    expect(registry.has('http')).toBe(true);
    expect(registry.has('mqtt')).toBe(false);
  });

  it('creates an adapter with the protocol from config', () => {
    const registry = new AdapterRegistry();
    registry.register('http', makeFakeAdapter);

    const adapter = registry.create(plug);
    expect(adapter.deviceId).toBe('plug-1');
    expect(adapter.protocol).toBe('http');
  });

  it('throws when no factory exists for the protocol', () => {
    const registry = new AdapterRegistry();
    expect(() => registry.create(sensor)).toThrow(/mqtt/);
  });
});
