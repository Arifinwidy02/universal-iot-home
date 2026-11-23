import { store } from '../src/state/store';

test('store starts with an empty device list', () => {
  expect(store.getState().devices.items).toEqual([]);
});
