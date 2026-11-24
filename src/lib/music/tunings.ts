import { frequencyOf } from './theory';

export type TuningString = { name: string; note: string; hz: number };
export type Tuning = { id: string; name: string; notesLowToHigh: string; desc: string; strings: TuningString[] };

/** Spelled with sharps/flats as players read them; frequency computed from the pitch class. */
const PITCH: Record<string, string> = {
  C: 'C', 'C#': 'C#', Db: 'C#', D: 'D', 'D#': 'D#', Eb: 'D#', E: 'E', F: 'F', 'F#': 'F#', Gb: 'F#',
  G: 'G', 'G#': 'G#', Ab: 'G#', A: 'A', 'A#': 'A#', Bb: 'A#', B: 'B',
};

function s(name: string, spelled: string, octave: number): TuningString {
  return { name, note: `${spelled}${octave}`, hz: Math.round(frequencyOf(PITCH[spelled], octave) * 100) / 100 };
}

/**
 * strings[] runs 1st string (thinnest) to 6th string (thickest), matching the fretboard.
 * notesLowToHigh is how players say a tuning out loud (6th string first).
 */
export const TUNINGS: Tuning[] = [
  {
    id: 'standard',
    name: 'Standard',
    notesLowToHigh: 'E A D G B E',
    desc: 'The default tuning almost every song and lesson assumes.',
    strings: [s('e', 'E', 4), s('B', 'B', 3), s('G', 'G', 3), s('D', 'D', 3), s('A', 'A', 2), s('E', 'E', 2)],
  },
  {
    id: 'eb',
    name: 'Eb Standard',
    notesLowToHigh: 'Eb Ab Db Gb Bb Eb',
    desc: 'Every string a half step down. Hendrix, Stevie Ray Vaughan, Slash.',
    strings: [s('eb', 'Eb', 4), s('Bb', 'Bb', 3), s('Gb', 'Gb', 3), s('Db', 'Db', 3), s('Ab', 'Ab', 2), s('Eb', 'Eb', 2)],
  },
  {
    id: 'dropd',
    name: 'Drop D',
    notesLowToHigh: 'D A D G B E',
    desc: 'Low E dropped a whole step to D. One-finger power chords on the bottom three strings.',
    strings: [s('e', 'E', 4), s('B', 'B', 3), s('G', 'G', 3), s('D', 'D', 3), s('A', 'A', 2), s('D', 'D', 2)],
  },
  {
    id: 'openg',
    name: 'Open G',
    notesLowToHigh: 'D G D G B D',
    desc: 'Strumming the open strings plays a G major chord. Keith Richards territory.',
    strings: [s('D', 'D', 4), s('B', 'B', 3), s('G', 'G', 3), s('D', 'D', 3), s('G', 'G', 2), s('D', 'D', 2)],
  },
  {
    id: 'opend',
    name: 'Open D',
    notesLowToHigh: 'D A D F# A D',
    desc: 'Strumming the open strings plays a D major chord. A slide guitar favorite.',
    strings: [s('D', 'D', 4), s('A', 'A', 3), s('F#', 'F#', 3), s('D', 'D', 3), s('A', 'A', 2), s('D', 'D', 2)],
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    notesLowToHigh: 'D A D G A D',
    desc: 'Open, unresolved sound used in Celtic and fingerstyle playing. Led Zeppelin, Kashmir.',
    strings: [s('D', 'D', 4), s('A', 'A', 3), s('G', 'G', 3), s('D', 'D', 3), s('A', 'A', 2), s('D', 'D', 2)],
  },
  {
    id: 'dropc',
    name: 'Drop C',
    notesLowToHigh: 'C G C F A D',
    desc: 'Drop D taken down another whole step. Heavy rock and metal.',
    strings: [s('D', 'D', 4), s('A', 'A', 3), s('F', 'F', 3), s('C', 'C', 3), s('G', 'G', 2), s('C', 'C', 2)],
  },
];
