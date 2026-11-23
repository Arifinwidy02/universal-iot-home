module.exports = {
  preset: '@react-native/jest-preset',
  // Redux Toolkit pulls immer's ESM build, which Jest cannot parse untransformed.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|@reduxjs/toolkit|redux|immer|reselect)/)',
  ],
};
