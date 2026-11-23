module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // redux-persist keeps a throttled timer alive; fake timers keep Jest exit clean.
  fakeTimers: { enableGlobally: true },
  // Redux Toolkit pulls immer's ESM build, which Jest cannot parse untransformed.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|@react-native-async-storage|redux-persist|@reduxjs/toolkit|redux|immer|reselect)/)',
  ],
};
