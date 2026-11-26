import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ConnectionStatus,
  Device,
  DeviceErrorType,
  DeviceState,
} from '../../domain/model/type';
import type { DeviceDraft } from '../../domain/model/createDevice';
import { initialStateFor } from '../../domain/model/initialState';

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
    deviceUpdated(
      state,
      action: PayloadAction<{ id: string; patch: Partial<DeviceDraft> }>,
    ) {
      const device = state.items.find(d => d.id === action.payload.id);
      if (!device) return;
      // id sengaja tidak ikut diubah: state dan topik MQTT terikat ke id.
      const patch = { ...action.payload.patch };
      delete patch.id;

      // Changing the kind changes the shape of `state`. Without this the device
      // would keep, say, {on} while claiming to be a sensor, and rendering it
      // crashed on `state.temperature.toFixed`.
      if (patch.type && patch.type !== device.type) {
        Object.assign(device, patch);
        (device as Device).state = initialStateFor(patch.type);
        device.status = 'offline';
        device.errorType = null;
        device.errorMessage = null;
        return;
      }

      Object.assign(device, patch);
    },

    deviceRemoved(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter(d => d.id !== action.payload.id);
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

export const {
  deviceAdded,
  deviceUpdated,
  deviceRemoved,
  stateReceived,
  statusReceived,
  errorReceived,
} = devicesSlice.actions;
export type { DevicesState };
export default devicesSlice.reducer;
