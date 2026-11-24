import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ConnectionStatus,
  Device,
  DeviceErrorType,
  DeviceState,
} from '../../domain/type';

type DevicesState = { items: Device[] };

const initialState: DevicesState = { items: [] };

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    deviceAdded(state, action: PayloadAction<Device>) {
      if (!state.items.some(d => d.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    stateReceived(
      state,
      action: PayloadAction<{ id: string; state: DeviceState }>,
    ) {
      const device = state.items.find(d => d.id === action.payload.id);
      if (!device) return;
      // parseState already validated the shape for this device's type.
      (device as Device).state = action.payload.state as never;
      device.errorType = null;
      device.errorMessage = null;
    },
    statusReceived(
      state,
      action: PayloadAction<{ id: string; status: ConnectionStatus }>,
    ) {
      const device = state.items.find(d => d.id === action.payload.id);
      if (!device) return;
      device.status = action.payload.status;
    },
    errorReceived(
      state,
      action: PayloadAction<{
        id: string;
        errorType: DeviceErrorType;
        message: string;
      }>,
    ) {
      const device = state.items.find(d => d.id === action.payload.id);
      if (!device) return;
      device.status = 'error';
      device.errorType = action.payload.errorType;
      device.errorMessage = action.payload.message;
    },
  },
});

export const { deviceAdded, stateReceived, statusReceived, errorReceived } =
  devicesSlice.actions;
export type { DevicesState };
export default devicesSlice.reducer;
