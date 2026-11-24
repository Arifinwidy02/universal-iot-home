// app/__tests__/storage/persistConfig.test.ts
import { persistConfig } from '../../src/storage/persistConfig';
import type { Device } from '../../src/domain/type';

const plug: Device = {
  id: 'plug-1',
  name: 'Living Room Plug',
  room: 'LIVING',
  type: 'plug',
  config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000' },
  status: 'online',
  errorType: null,
  errorMessage: null,
  state: { on: true },
};

const lamp: Device = {
  id: 'light-1',
  name: 'Studio Desk Lamp',
  room: 'STUDIO',
  type: 'light',
  config: {
    protocol: 'mqtt',
    brokerUrl: 'ws://10.0.2.2:9001',
    topicPrefix: 'home',
  },
  status: 'error',
  errorType: 'wrong_url',
  errorMessage: 'Wrong URL',
  state: { on: true, brightness: 70 },
};

const transform = persistConfig.transforms![0];

it('persists only configuration, never state or status', () => {
  const stored: any = (transform as any).in([plug, lamp], 'items');

  expect(stored).toHaveLength(2);
  expect(stored[0]).toEqual({
    id: 'plug-1',
    name: 'Living Room Plug',
    room: 'LIVING',
    type: 'plug',
    config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000' },
  });
  expect(stored[0]).not.toHaveProperty('status');
  expect(stored[0]).not.toHaveProperty('state');
  expect(stored[0]).not.toHaveProperty('errorType');
});

it('rehydrates as offline with a type-correct placeholder state', () => {
  const stored = (transform as any).in([plug, lamp], 'items');
  const restored: Device[] = (transform as any).out(stored, 'items');

  expect(restored[0].status).toBe('offline');
  expect(restored[0].errorType).toBeNull();
  expect(restored[0].state).toEqual({ on: false });

  expect(restored[1].status).toBe('offline');
  expect(restored[1].state).toEqual({ on: false, brightness: 0 });
});
