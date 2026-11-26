/**
 * The guitarist profile vocabulary (brief, section 10).
 * Keys here are stored in tabr_profiles and must stay stable. Labels can change freely.
 *
 * Everything collected from these lists is SELF-REPORTED. It sets the starting point for the
 * curriculum but never counts as demonstrated ability. Mastery only moves through evidence.
 */

export type SelfLevel = 'new' | 'beginner' | 'advanced_beginner' | 'intermediate' | 'advanced';

export const LEVELS: { key: SelfLevel; label: string; desc: string }[] = [
  { key: 'new', label: 'Brand New', desc: "Haven't really played yet" },
  { key: 'beginner', label: 'Beginner', desc: 'A few chords, still building basics' },
  { key: 'advanced_beginner', label: 'Advanced Beginner', desc: 'Riffs and a scale shape, gaps in theory' },
  { key: 'intermediate', label: 'Intermediate', desc: 'Songs, positions and some theory' },
  { key: 'advanced', label: 'Advanced', desc: 'Comfortable across the neck and styles' },
];

export const EXPERIENCE: { months: number; label: string }[] = [
  { months: 3, label: 'Under 6 months' },
  { months: 9, label: '6 to 12 months' },
  { months: 24, label: '1 to 3 years' },
  { months: 72, label: '3 to 10 years' },
  { months: 150, label: '10+ years' },
];

/** Closest experience bucket for a stored month count. */
export function experienceBucket(months: number | null): number | null {
  if (months === null) return null;
  return EXPERIENCE.reduce((best, e) => (Math.abs(e.months - months) < Math.abs(best - months) ? e.months : best), EXPERIENCE[0].months);
}

export type SelfRating = 'not_yet' | 'some' | 'can';

export const RATINGS: { value: SelfRating; label: string }[] = [
  { value: 'not_yet', label: 'Not Yet' },
  { value: 'some', label: 'Some' },
  { value: 'can', label: 'Can Do' },
];

export type Ability = { key: string; label: string };
export type AbilityGroup = { title: string; abilities: Ability[] };

export const ABILITY_GROUPS: AbilityGroup[] = [
  {
    title: 'Chords and Rhythm',
    abilities: [
      { key: 'open_chords', label: 'Open chords (G, C, D, E, A)' },
      { key: 'power_chords', label: 'Power chords on the E and A strings' },
      { key: 'dom7_chords', label: 'Dominant 7th chords (E7, A7, B7)' },
      { key: 'barre_chords', label: 'Barre chords' },
      { key: 'double_stops', label: 'Rock double stops' },
      { key: 'palm_muting', label: 'Palm muting' },
      { key: 'strum_in_time', label: 'Strumming steadily in time' },
      { key: 'metronome', label: 'Playing along with a metronome' },
    ],
  },
  {
    title: 'Lead Playing',
    abilities: [
      { key: 'minor_pent_box', label: 'The minor pentatonic box shape' },
      { key: 'pent_positions', label: 'More than one pentatonic position' },
      { key: 'bends', label: 'String bends that land in tune' },
      { key: 'vibrato', label: 'Controlled vibrato' },
      { key: 'legato', label: 'Hammer-ons and pull-offs' },
      { key: 'improvise', label: 'Improvising over a backing track' },
    ],
  },
  {
    title: 'Theory and the Fretboard',
    abilities: [
      { key: 'notes_low_strings', label: 'Note names on the low E and A strings' },
      { key: 'notes_all', label: 'Note names anywhere on the neck' },
      { key: 'intervals', label: 'Intervals (what a 3rd, 5th or octave is)' },
      { key: 'major_scale', label: 'How the major scale is built' },
      { key: 'chord_construction', label: 'How chords are built' },
      { key: 'keys', label: 'Keys and which chords belong to them' },
      { key: 'progressions', label: 'Common progressions like I-IV-V' },
    ],
  },
  {
    title: 'Ear, Songs and Playing With Others',
    abilities: [
      { key: 'riffs_by_ear', label: 'Working out riffs by ear' },
      { key: 'find_key', label: 'Finding the key of a song' },
      { key: 'riffs_intros', label: 'Riffs and intros from songs' },
      { key: 'full_songs', label: 'Complete songs, start to finish' },
      { key: 'write_riffs', label: 'Writing my own riffs' },
      { key: 'jam', label: 'Jamming with other musicians' },
    ],
  },
];

export const ALL_ABILITIES: Ability[] = ABILITY_GROUPS.flatMap((g) => g.abilities);
export const abilityLabel = (key: string) => ALL_ABILITIES.find((a) => a.key === key)?.label ?? key;

export const GOALS: { key: string; label: string }[] = [
  { key: 'jam', label: 'Jam confidently with other musicians' },
  { key: 'theory', label: 'Understand music theory' },
  { key: 'fretboard', label: 'Know my way around the fretboard' },
  { key: 'improvise', label: 'Improvise on purpose, not by accident' },
  { key: 'by_ear', label: 'Play by ear' },
  { key: 'progressions', label: 'Understand chord progressions' },
  { key: 'full_songs', label: 'Learn complete songs' },
  { key: 'write', label: 'Write original music' },
  { key: 'own_sound', label: 'Develop my own sound' },
  { key: 'play_live', label: 'Play live with a band' },
  { key: 'hobby', label: 'Enjoy it as a lifelong hobby' },
];
export const goalLabel = (key: string | null) => GOALS.find((g) => g.key === key)?.label ?? null;

export const LEARNING_PREFS: { key: string; label: string }[] = [
  { key: 'songs', label: 'Real songs' },
  { key: 'exercises', label: 'Structured exercises' },
  { key: 'video', label: 'Video' },
  { key: 'tab', label: 'Tab' },
  { key: 'theory', label: 'Theory' },
  { key: 'improvisation', label: 'Improvisation' },
  { key: 'ear', label: 'Ear training' },
  { key: 'visual', label: 'Visual diagrams' },
  { key: 'guided', label: 'A guided daily plan' },
];

export const PERFORMANCE: { key: string; label: string }[] = [
  { key: 'none', label: 'Only on my own' },
  { key: 'with_friends', label: 'With a friend or two' },
  { key: 'jams', label: 'At jams' },
  { key: 'gigs', label: 'At gigs' },
];

export type ListeningSetup = 'amp_speaker' | 'headphone_amp' | 'interface' | 'unplugged';

/**
 * How the student hears their guitar. This decides whether microphone features can work:
 * with a headphone amp, the mic only hears the unplugged strings.
 */
export const LISTENING: { key: ListeningSetup; label: string; desc: string }[] = [
  { key: 'amp_speaker', label: 'Amp With a Speaker', desc: 'The microphone can hear you' },
  { key: 'headphone_amp', label: 'Headphone Amp', desc: 'Like a Mustang Micro. The mic only hears the bare strings' },
  { key: 'interface', label: 'Audio Interface', desc: 'Guitar plugged into the computer or phone' },
  { key: 'unplugged', label: 'Unplugged or Acoustic', desc: 'The microphone can hear you' },
];

export const GEAR_KINDS: { key: string; label: string }[] = [
  { key: 'guitar', label: 'Guitar' },
  { key: 'amp', label: 'Amp' },
  { key: 'pedal', label: 'Pedal' },
  { key: 'interface', label: 'Interface' },
  { key: 'software', label: 'Software' },
  { key: 'other', label: 'Other' },
];

export const SUGGESTED_GENRES = [
  'Blues',
  'Blues Rock',
  'Classic Rock',
  'Hard Rock',
  'Southern Rock',
  'Metal',
  'Punk',
  'Grunge',
  'Indie',
  'Psychedelic',
  'Country',
  'Folk',
  'Funk',
  'Jazz',
  'Pop',
];

/** Split a comma-separated field into clean entries. */
export const splitList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

/** Split a one-per-line field (song titles can contain commas). */
export const splitLines = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
