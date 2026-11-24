import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistConfig } from 'redux-persist';
import { createTransform } from 'redux-persist';
import type { Device, DeviceType } from '../domain/type';
import type { DevicesState } from '../state/slices/devicesSlice';

/** Placeholder until the first poll/subscription delivers a real state. */
function initialStateFor(type: DeviceType): Device['state'] {
  switch (type) {
    case 'light':
      return { on: false, brightness: 0 };
    case 'plug':
      return { on: false };
    case 'sensor':
      return { temperature: 0, humidity: 0 };
  }
}

const stripRuntime = createTransform(
  (inbound: { items: Device[] }) => ({
    items: inbound.items.map(({ id, name, room, type, config }) => ({
      id,
      name,
      room,
      type,
      config,
    })),
  }),
  (outbound: any) => ({
    items: (outbound.items ?? []).map((d: any) => ({
      ...d,
      status: 'offline',
      errorType: null,
      errorMessage: null,
      state: initialStateFor(d.type as DeviceType),
    })),
  }),
  { whitelist: ['devices'] },
);

export const persistConfig: PersistConfig<DevicesState> = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['devices'],
  transforms: [stripRuntime],
};
