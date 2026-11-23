import type { Device } from "../types";

export const seedDevices: Device[] = [
  {
    id: "light-1",
    type: "light",
    name: "Studio Desk Lamp",
    state: { on: false, brightness: 70 },
  },
  {
    id: "plug-1",
    type: "plug",
    name: "Living Room Plug",
    state: { on: true },
  },
  {
    id: "sensor-1",
    type: "sensor",
    name: "Kitchen Sensor",
    state: { temperature: 26.5, humidity: 61 },
  },
];
