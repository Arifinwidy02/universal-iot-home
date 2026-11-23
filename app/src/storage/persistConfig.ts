import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistConfig } from 'redux-persist';
import type { DevicesState } from '../state/slices/devicesSlice';

export const persistConfig: PersistConfig<DevicesState> = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['devices'],
};
