export type DeviceType = "light" | "plug" | "sensor";

export type LightState = { on: boolean; brightness: number };
export type PlugState = { on: boolean };
export type SensorState = { temperature: number; humidity: number };

export type DeviceState = LightState | PlugState | SensorState;

type DeviceBase = { id: string; name: string };

export type LightDevice = DeviceBase & { type: "light"; state: LightState };
export type PlugDevice = DeviceBase & { type: "plug"; state: PlugState };
export type SensorDevice = DeviceBase & { type: "sensor"; state: SensorState };

export type Device = LightDevice | PlugDevice | SensorDevice;

export type StatePatch = {
  on?: boolean;
  brightness?: number;
  temperature?: number;
  humidity?: number;
};

export type PatchSource = "app" | "admin" | "device";

export const ALLOWED_FIELDS: Record<DeviceType, readonly (keyof StatePatch)[]> =
  {
    light: ["on", "brightness"],
    plug: ["on"],
    sensor: ["temperature", "humidity"],
  };

export type Config = {
  httpPort: number;
  brokerUrl: string;
  topicPrefix: string;
  sensorIntervalMs: number;
};
