export type DeviceType = 'light' | 'plug' | 'sensor';

export const ROOMS = [
  'LIVING',
  'STUDIO',
  'BEDROOM',
  'KITCHEN',
  'BALCONY',
] as const;
export type Room = (typeof ROOMS)[number];

export type MqttConfig = {
  protocol: 'mqtt';
  /** ws:// or wss:// — React Native cannot open a raw mqtt:// TCP socket. */
  brokerUrl: string;
  /** `home`, not `home/lamp-01`; the adapter builds the full topic. */
  topicPrefix: string;
};

export type HttpConfig = {
  protocol: 'http';
  /** Host-level base URL; the adapter appends `/devices/<id>`. */
  baseUrl: string;
};

export type DeviceConfig = MqttConfig | HttpConfig;

/** Derived from config so the two can never disagree. */
export type Protocol = DeviceConfig['protocol'];

/** What an adapter can report about its link. */
export type ConnectionStatus = 'online' | 'offline';

export type DeviceStatus = ConnectionStatus | 'error';

/** Same strings as AppError.kind and the UI's errorType. */
export type DeviceErrorType =
  | 'broker_unreachable'
  | 'wrong_url'
  | 'device_offline'
  | 'request_timeout';

export type LightState = {
  on: boolean;
  /** Whole percent, 0-100. */
  brightness: number;
};

export type PlugState = {
  on: boolean;
};

export type SensorState = {
  /** Celsius. */
  temperature: number;
  /** Percent, 0-100. */
  humidity: number;
};

type DeviceBase = {
  id: string;
  name: string;
  room?: Room;
  config: DeviceConfig;
  /** Runtime only: never persisted. */
  status: DeviceStatus;
  errorType: DeviceErrorType | null;
  errorMessage: string | null;
};

export type LightDevice = DeviceBase & { type: 'light'; state: LightState };
export type PlugDevice = DeviceBase & { type: 'plug'; state: PlugState };
export type SensorDevice = DeviceBase & { type: 'sensor'; state: SensorState };

/** Discriminated on `type`, so narrowing gives the right state. */
export type Device = LightDevice | PlugDevice | SensorDevice;

export type DeviceState = Device['state'];

/** State type for one device kind: `StateOf<'light'>` is `LightState`. */
export type StateOf<T extends DeviceType> = Extract<
  Device,
  { type: T }
>['state'];
