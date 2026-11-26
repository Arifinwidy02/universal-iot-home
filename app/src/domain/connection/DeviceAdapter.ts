import type { DeviceCommand } from '../rules/command';
import type { AppError } from '../model/error';
import type {
  ConnectionStatus,
  Device,
  DeviceState,
  Protocol,
} from '../model/type';

export type AdapterEvent =
  | { type: 'state'; state: DeviceState }
  | { type: 'status'; status: ConnectionStatus }
  | { type: 'error'; error: AppError };

export type AdapterListener = (event: AdapterEvent) => void;
export type Unsubscribe = () => void;

export interface DeviceAdapter {
  readonly deviceId: string;
  readonly protocol: Protocol;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(command: DeviceCommand): Promise<void>;
  subscribe(listener: AdapterListener): Unsubscribe;
}

export type AdapterFactory = (device: Device) => DeviceAdapter;
