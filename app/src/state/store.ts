import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from './slices/devicesSlice';
import { persistReducer, persistStore } from 'redux-persist';
import { persistConfig } from '../storage/persistConfig';

const persistDeviceReducer = persistReducer(persistConfig, devicesReducer);
export const store = configureStore({
  reducer: {
    devices: persistDeviceReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
