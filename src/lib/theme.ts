/**
 * tabr design tokens, drawn from a cherry sunburst Les Paul.
 * Base: the dark cherry edge of the burst. Accents: the honey center, cherry red,
 * cream binding and nickel hardware. The four finger colors come from the same guitar.
 */
export const colors = {
  bg: '#1E0D0C', // cherry burst edge, near black
  surface: '#2D1513', // raised panel
  surfaceHigh: '#40201C', // pressed / selected / input
  line: 'rgba(244,228,198,0.09)',
  text: '#F4E4C6', // cream binding
  textMuted: '#CDAF90',
  textFaint: '#94715C',
  ink: '#1E0D0C', // text on light fills

  honey: '#F3AE47', // honey center of the burst, index finger
  cherry: '#E85D5F', // cherry red, middle finger
  chrome: '#B7CAD6', // nickel pickup covers, ring finger
  cream: '#F4E4C6', // cream binding, pinky finger, primary buttons

  green: '#A2D98C', // in tune / goal hit
  stop: '#FF7B54', // don't play / errors

  // fretboard materials
  rosewood: '#1F120D',
  rosewoodEdge: '#E7D3AE', // bound neck edge
  nickel: '#C3C2BB',
  bone: '#EFE2C8',
  pearl: '#E9DDC4',
  plainString: '#DCDAD3',
  woundString: '#C0AE92',

  // sunburst glow behind every screen
  burstCenter: '#F09A3A',
  burstMid: '#B8322C',
};

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  heading: 'BricolageGrotesque_700Bold',
  headingMedium: 'BricolageGrotesque_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 };
export const radius = { sm: 10, md: 14, lg: 22, pill: 999 };

/** Finger colors: 0 open, 1 index, 2 middle, 3 ring, 4 pinky. */
export const fingerColors: Record<number, string> = {
  0: 'transparent',
  1: colors.honey,
  2: colors.cherry,
  3: colors.chrome,
  4: colors.cream,
};

export const fingerNames: Record<number, string> = {
  0: 'Open',
  1: 'Index',
  2: 'Middle',
  3: 'Ring',
  4: 'Pinky',
};
