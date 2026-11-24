// Temporary working palette (carried over from the web prototype). Not final branding.
export const colors = {
  bg: '#140805',
  surface: '#22100A',
  surfaceRaised: '#2E160D',
  border: 'rgba(212,175,55,0.16)',
  borderStrong: 'rgba(212,175,55,0.4)',
  text: '#EDE3D1',
  textMuted: '#A08A6A',
  textFaint: '#6B5940',
  gold: '#D4AF37',
  cherry: '#C41E3A',
  cream: '#EDDCB1',
  amber: '#CC7722',
  green: '#8FBC44',
  danger: '#E05A4F',
  wood: '#3E2723',
  woodLight: '#4E342E',
  fretWire: '#BFBFBF',
  string: '#C8C0B8',
  stringWound: '#B8B0A8',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 6, md: 10, lg: 14 };

/** Finger colors: 0 open, 1 index, 2 middle, 3 ring, 4 pinky. */
export const fingerColors: Record<number, string> = {
  0: 'transparent',
  1: colors.gold,
  2: colors.cherry,
  3: colors.cream,
  4: colors.amber,
};
export const fingerNames: Record<number, string> = {
  0: 'Open',
  1: 'Index',
  2: 'Middle',
  3: 'Ring',
  4: 'Pinky',
};
