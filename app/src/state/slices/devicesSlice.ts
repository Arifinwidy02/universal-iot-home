import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Devices are added in a later step; the slice exists so the store has its
  // real shape from the start.
  items: [] as { id: string; name: string; protocol: 'http' | 'mqtt' }[],
};

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {},
});

export default devicesSlice.reducer;
