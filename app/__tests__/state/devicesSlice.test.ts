import reducer, {
  deviceAdded,
  deviceUpdated,
} from '../../src/state/slices/devicesSlice';
import type { PlugDevice } from '../../src/domain/type';

const plug: PlugDevice = {
  id: 'plug-1',
  name: 'Living Room Plug',
  type: 'plug',
  config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000' },
  status: 'online',
  errorType: null,
  errorMessage: null,
  state: { on: true },
};

describe('devicesSlice', () => {
  it('adds a device once, ignoring duplicate ids', () => {
    let state = reducer(undefined, deviceAdded(plug));
    state = reducer(state, deviceAdded(plug));
    expect(state.items).toHaveLength(1);
  });

  it('replaces the state shape when the device type changes', () => {
    let state = reducer(undefined, deviceAdded(plug));

    state = reducer(
      state,
      deviceUpdated({
        id: 'plug-1',
        patch: { type: 'sensor', config: plug.config },
      }),
    );

    const device = state.items[0];
    expect(device.type).toBe('sensor');
    // Bug yang pernah bikin crash: state.temperature.toFixed pada state plug.
    expect(device.state).toEqual({ temperature: 0, humidity: 0 });
    expect(device.status).toBe('offline');
  });

  it('keeps the state when only the name changes', () => {
    let state = reducer(undefined, deviceAdded(plug));

    state = reducer(
      state,
      deviceUpdated({ id: 'plug-1', patch: { name: 'Hallway Plug' } }),
    );

    expect(state.items[0].name).toBe('Hallway Plug');
    expect(state.items[0].state).toEqual({ on: true });
    expect(state.items[0].status).toBe('online');
  });

  it('never changes the id', () => {
    let state = reducer(undefined, deviceAdded(plug));

    state = reducer(
      state,
      deviceUpdated({ id: 'plug-1', patch: { id: 'other', name: 'X' } }),
    );

    expect(state.items[0].id).toBe('plug-1');
  });
});
