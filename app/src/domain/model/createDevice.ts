// app/src/domain/createDevice.ts

import { initialStateFor } from './initialState';
import { DeviceType } from './type';
import { Room } from './type';
import { DeviceConfig } from './type';
import { Device } from './type';

export type DeviceDraft = {
  id: string;
  name: string;
  room?: Room;
  type: DeviceType;
  config: DeviceConfig;
};

export function toDevice(draft: DeviceDraft): Device {
  return {
    ...draft,
    status: 'offline',
    errorType: null,
    errorMessage: null,
    state: initialStateFor(draft.type),
  } as Device;
}

export function makeDeviceId(name: string, existing: string[]): string {
  const slug =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'device';
  if (!existing.includes(slug)) return slug;
  let n = 2;
  while (existing.includes(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}
