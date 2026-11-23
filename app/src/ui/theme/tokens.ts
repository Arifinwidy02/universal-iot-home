export const colors = {
  paper: '#F7F6F3',
  surface: '#FFFFFF',
  ink: '#14161A',
  muted: '#5C5851',
  hairline: '#DEDAD2',
  accent: '#B4542A',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

export const radius = {
  control: 8,
  frame: 20,
} as const;

export const type = {
  display: { fontSize: 30, lineHeight: 38 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 20 },
} as const;
