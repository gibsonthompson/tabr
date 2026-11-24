/**
 * tabr design tokens.
 * Base: Sherwood Green (a vintage guitar finish), not black.
 * The four finger colors are classic custom-shop finishes and double as the brand palette.
 */
export const colors = {
  bg: '#16231E', // Sherwood, deep
  surface: '#1F3029', // raised panel
  surfaceHigh: '#2A3F36', // pressed / selected / input
  line: 'rgba(238,234,224,0.09)',
  text: '#EEEAE0', // Olympic White
  textMuted: '#A9B8B0',
  textFaint: '#71857B',
  ink: '#10201A', // text on light fills

  daphne: '#86BDE3', // Daphne Blue, index finger
  shell: '#F2AFA6', // Shell Pink, middle finger
  sunburst: '#F1B84B', // Sunburst Amber, ring finger
  olympic: '#EEEAE0', // Olympic White, pinky finger

  surf: '#7EE0B5', // Surf Green, in tune / success
  candy: '#F0646B', // Candy Apple Red, don't play / errors

  // fretboard materials
  ebony: '#14110F',
  ebonyEdge: '#26201C',
  nickel: '#B9BCB6',
  bone: '#E9E2D0',
  pearl: '#D9D4C7',
  plainString: '#D7D9D4',
  woundString: '#B7AE9A',
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
  1: colors.daphne,
  2: colors.shell,
  3: colors.sunburst,
  4: colors.olympic,
};

export const fingerNames: Record<number, string> = {
  0: 'Open',
  1: 'Index',
  2: 'Middle',
  3: 'Ring',
  4: 'Pinky',
};
