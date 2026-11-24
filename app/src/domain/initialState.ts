import type { Device, DeviceType } from '../domain/type';

/**
 * Placeholder state for a device that has not reported yet.
 *
 * Lives in domain, not in the storage layer: both the reducer (type change) and
 * the persist transform need it, and storage already imports the slice — putting
 * it there created a require cycle.
 */
export function initialStateFor(type: DeviceType): Device['state'] {
  switch (type) {
    case 'light':
      return { on: false, brightness: 0 };
    case 'plug':
      return { on: false };
    case 'sensor':
      return { temperature: 0, humidity: 0 };
  }
}
