import { countByRoom, filterByRoom } from '../../src/ui/format/room';
import type { Device, Room } from '../../src/domain/type';

function plug(id: string, room?: Room): Device {
  return {
    id,
    name: id,
    room,
    type: 'plug',
    config: { protocol: 'http', baseUrl: 'http://localhost:3000' },
    status: 'online',
    errorType: null,
    errorMessage: null,
    state: { on: false },
  } as Device;
}

const devices = [
  plug('a', 'LIVING'),
  plug('b', 'LIVING'),
  plug('c', 'KITCHEN'),
  plug('d'),
];

describe('filterByRoom', () => {
  it('ALL returns every device, including ones without a room', () => {
    expect(filterByRoom(devices, 'ALL')).toHaveLength(4);
  });

  it('returns only the devices in that room', () => {
    expect(filterByRoom(devices, 'LIVING').map(d => d.id)).toEqual(['a', 'b']);
  });

  it('returns an empty list for a room with no devices', () => {
    expect(filterByRoom(devices, 'BALCONY')).toEqual([]);
  });
});

describe('countByRoom', () => {
  it('counts each room and ALL', () => {
    const counts = countByRoom(devices);
    expect(counts.ALL).toBe(4);
    expect(counts.LIVING).toBe(2);
    expect(counts.KITCHEN).toBe(1);
  });

  it('reports 0 for rooms nobody is in, and skips devices without a room', () => {
    const counts = countByRoom(devices);
    expect(counts.BEDROOM).toBe(0);
    expect(counts.STUDIO).toBe(0);
    expect(counts.BALCONY).toBe(0);
  });
});
