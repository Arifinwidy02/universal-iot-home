/* eslint-env jest */

// AsyncStorage is a native module; Jest needs the in-memory implementation that
// ships with the package (v3 exposes it at /jest).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest').default,
);
