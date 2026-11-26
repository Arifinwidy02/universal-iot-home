import { persistor, store } from '../src/state/store';

test('store starts with an empty device list', () => {
  expect(store.getState().devices.items).toEqual([]);
});

// redux-persist keeps a throttled timer alive; pausing it and dropping pending
// fake timers lets Jest exit without an open handle.
afterAll(() => {
  persistor.pause();
  jest.clearAllTimers();
});
