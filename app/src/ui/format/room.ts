import { ROOMS, type Device, type Room } from '../../domain/model/type';

export type RoomFilter = 'ALL' | Room;

export const ROOM_FILTERS: RoomFilter[] = ['ALL', ...ROOMS];

export function filterByRoom(devices: Device[], filter: RoomFilter): Device[] {
  return filter === 'ALL' ? devices : devices.filter(d => d.room === filter);
}

export function countByRoom(devices: Device[]): Record<RoomFilter, number> {
  const counts = { ALL: devices.length } as Record<RoomFilter, number>;
  for (const room of ROOMS) counts[room] = 0;
  for (const device of devices) {
    if (device.room) counts[device.room] += 1;
  }
  return counts;
}
