/**
 * String convention: index 0 = 1st string (thinnest, high e) ... index 5 = 6th string (thickest, low E).
 */
export type StringInfo = { name: string; num: string; note: string; hz: number };

export const STANDARD_STRINGS: StringInfo[] = [
  { name: 'e', num: '1st', note: 'E4', hz: 329.63 },
  { name: 'B', num: '2nd', note: 'B3', hz: 246.94 },
  { name: 'G', num: '3rd', note: 'G3', hz: 196.0 },
  { name: 'D', num: '4th', note: 'D3', hz: 146.83 },
  { name: 'A', num: '5th', note: 'A2', hz: 110.0 },
  { name: 'E', num: '6th', note: 'E2', hz: 82.41 },
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = (typeof NOTE_NAMES)[number];

/** Semitone index (C = 0) of each open string in standard tuning. */
const OPEN_SEMITONES = [4, 11, 7, 2, 9, 4];

export function noteAt(stringIdx: number, fret: number): NoteName | 'X' {
  if (fret < 0) return 'X';
  return NOTE_NAMES[(OPEN_SEMITONES[stringIdx] + fret) % 12];
}

export function frequencyOf(name: string, octave: number, a4 = 440): number {
  const i = NOTE_NAMES.indexOf(name as NoteName);
  return a4 * Math.pow(2, octave - 4 + (i - 9) / 12);
}
