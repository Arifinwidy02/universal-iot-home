import { Platform, type TextStyle } from 'react-native';

export type ThemeName = 'day' | 'night';

const day = {
  canvas: '#EFECE6',
  surface: '#F7F5F0',
  recessed: '#E2DDD5',
  ink: '#1A1A18',
  inkMuted: '#6E6A63',
  border: '#D2CCC1',
  borderStrong: '#B5AEA1',
  accent: '#FF4D00',
  accentSoft: 'rgba(255, 77, 0, 0.14)',
  online: '#16A34A',
  onlineSoft: 'rgba(22, 163, 74, 0.12)',
  danger: '#D92D20',
  dangerBg: '#FDF2F1',
  rockerTop: '#FFFFFF',
  rockerBot: '#DDD7CD',
} as const;

const night = {
  canvas: '#141413',
  surface: '#1E1E1C',
  recessed: '#0D0D0C',
  ink: '#F2EFE9',
  inkMuted: '#8E8A82',
  border: '#2E2D2A',
  borderStrong: '#46443F',
  accent: '#FF4D00',
  accentSoft: 'rgba(255, 77, 0, 0.20)',
  online: '#16A34A',
  onlineSoft: 'rgba(22, 163, 74, 0.16)',
  danger: '#EF4444',
  dangerBg: 'rgba(217, 45, 32, 0.11)',
  rockerTop: '#2B2B28',
  rockerBot: '#121211',
} as const;

export type ThemeColors = { [K in keyof typeof day]: string };

export const themes: Record<ThemeName, ThemeColors> = { day, night };

export const colors: ThemeColors = themes.day;

export const fonts = {
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  card: 16,
  sheet: 24,
  button: 12,
  control: 10,
  input: 10,
  badge: 6,
} as const;

export const borderWidth = {
  card: 1.5,
  hairline: 1,
} as const;

export const type = {
  wordmark: {
    fontFamily: fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.54,
  } satisfies TextStyle,
  deviceName: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.15,
  } satisfies TextStyle,
  telemetry: {
    fontFamily: fonts.mono,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
  heading: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.32,
  } satisfies TextStyle,
  action: {
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  badge: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  diagnostic: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 14.2,
  } satisfies TextStyle,
} as const;
