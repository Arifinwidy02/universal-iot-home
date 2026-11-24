import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistConfig } from 'redux-persist';
import { createTransform } from 'redux-persist';
import type { Device } from '../domain/type';
import type { DevicesState } from '../state/slices/devicesSlice';

function rehydrate(device: Device): Device {
  switch (device.type) {
    case 'light':
      return {
        ...device,
        status: 'offline',
        errorType: null,
        errorMessage: null,
        state: { on: false, brightness: 0 },
      };
    case 'plug':
      return {
        ...device,
        status: 'offline',
        errorType: null,
        errorMessage: null,
        state: { on: false },
      };
    case 'sensor':
      return {
        ...device,
        status: 'offline',
        errorType: null,
        errorMessage: null,
        state: { temperature: 0, humidity: 0 },
      };
  }
}

const stripRuntime = createTransform<Device[], Device[]>(
  devices =>
    devices.map(({ id, name, room, type, config }) => ({
      id,
      name,
      room,
      type,
      config,
    })) as Device[],
  devices => devices.map(rehydrate),
  { whitelist: ['items'] },
);

export const persistConfig: PersistConfig<DevicesState> = {
  key: 'devices',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['items'],
  transforms: [stripRuntime],
};
