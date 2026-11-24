/**
 * ASCII tab parser. Reads standard 6-line text tab including technique symbols:
 * h p / \ s b r t x ~ v <n> (n)
 */
export type Technique =
  | 'hammer-on'
  | 'pull-off'
  | 'slide-up'
  | 'slide-down'
  | 'slide'
  | 'bend'
  | 'release'
  | 'tap';

export type NoteType = 'note' | 'mute' | 'harmonic' | 'ghost';

export type TabNote = {
  string: number; // 0 = 1st (high e) ... 5 = 6th (low E)
  fret: number; // -1 for muted
  type: NoteType;
  technique: Technique | null;
  /** For bends: the fret whose pitch the bend reaches. The finger stays on `fret`. */
  bendTo?: number;
  vibrato: boolean;
  finger?: number; // 0 open, 1-4
};

export type TabStep = { notes: TabNote[]; durationWeight: number };

type Token = Omit<TabNote, 'string' | 'finger'> & { col: number };

const LETTERS: Record<string, Technique> = {
  h: 'hammer-on',
  p: 'pull-off',
  s: 'slide',
  b: 'bend',
  r: 'release',
  t: 'tap',
};

const isDigit = (c: string | undefined) => c !== undefined && c >= '0' && c <= '9';

function tokenizeLine(data: string): Token[] {
  const tokens: Token[] = [];
  let pending: Technique | null = null;
  let i = 0;

  while (i < data.length) {
    const ch = data[i];

    if (ch === '-' || ch === ' ' || ch === '|') {
      i++;
      continue;
    }
    if (ch === 'x' || ch === 'X') {
      tokens.push({ col: i, fret: -1, type: 'mute', technique: null, vibrato: false });
      pending = null;
      i++;
      continue;
    }
    if (ch === '<' || ch === '(') {
      const close = ch === '<' ? '>' : ')';
      const start = i;
      let num = '';
      i++;
      while (i < data.length && data[i] !== close) num += data[i++];
      i++;
      if (num && !isNaN(Number(num))) {
        tokens.push({
          col: start,
          fret: parseInt(num, 10),
          type: ch === '<' ? 'harmonic' : 'ghost',
          technique: null,
          vibrato: false,
        });
      }
      pending = null;
      continue;
    }
    if (ch === '~' || ch === 'v') {
      if (tokens.length) tokens[tokens.length - 1].vibrato = true;
      i++;
      continue;
    }
    if (ch === '/') {
      pending = 'slide-up';
      i++;
      continue;
    }
    if (ch === '\\') {
      pending = 'slide-down';
      i++;
      continue;
    }
    // Palm mute marker "PM" / "P.M." is a performance note, not a pull-off.
    if (ch === 'P' && (data[i + 1] === 'M' || (data[i + 1] === '.' && data[i + 2] === 'M'))) {
      i += data[i + 1] === '.' ? 4 : 2;
      continue;
    }
    const letter = LETTERS[ch.toLowerCase()];
    if (letter) {
      pending = letter;
      i++;
      continue;
    }
    if (isDigit(ch)) {
      const numStr = isDigit(data[i + 1]) ? ch + data[i + 1] : ch;
      const value = parseInt(numStr, 10);
      const prev = tokens[tokens.length - 1];

      if (pending === 'bend' && prev && prev.type === 'note') {
        // "7b9": finger stays on 7 and the string is pushed until it sounds like 9.
        tokens.push({ col: i, fret: prev.fret, type: 'note', technique: 'bend', bendTo: value, vibrato: false });
      } else if (pending === 'release' && prev && prev.bendTo !== undefined) {
        // "7b9r7": let the bend back down to the fretted pitch.
        tokens.push({ col: i, fret: prev.fret, type: 'note', technique: 'release', vibrato: false });
      } else if (pending === 'slide' && prev) {
        tokens.push({ col: i, fret: value, type: 'note', technique: value >= prev.fret ? 'slide-up' : 'slide-down', vibrato: false });
      } else {
        tokens.push({ col: i, fret: value, type: 'note', technique: pending, vibrato: false });
      }
      pending = null;
      i += numStr.length;
      continue;
    }
    i++;
  }
  return tokens;
}

const LINE = /^([eEBGDA])\s*\|(.+?)\|?\s*$/;
const ORDER = ['e', 'B', 'G', 'D', 'A', 'E'];

/** Put a 6-line block in 1st-to-6th string order. Lowercase e is the 1st string. */
function orderBlock(block: { name: string; data: string }[]) {
  const hasLowerE = block.some((l) => l.name === 'e');
  if (hasLowerE) {
    const ordered = ORDER.map((n) => block.find((l) => l.name === n));
    if (ordered.every(Boolean)) return ordered as { name: string; data: string }[];
  }
  // Both E lines uppercase: by convention the top line is the 1st string.
  return block;
}

export function parseTab(text: string): TabStep[] {
  const blocks: { name: string; data: string }[][] = [];
  let current: { name: string; data: string }[] = [];
  for (const raw of text.split('\n')) {
    const m = raw.trim().match(LINE);
    if (m) current.push({ name: m[1], data: m[2] });
    else {
      if (current.length >= 6) blocks.push(current.slice(0, 6));
      current = [];
    }
  }
  if (current.length >= 6) blocks.push(current.slice(0, 6));

  const steps: TabStep[] = [];
  for (const block of blocks) {
    const lines = orderBlock(block);
    const perString = lines.map((l) => tokenizeLine(l.data));

    // Cluster event columns: columns within 1 of each other are the same moment in time.
    const cols = [...new Set(perString.flat().map((t) => t.col))].sort((a, b) => a - b);
    const clusters: number[][] = [];
    for (const c of cols) {
      const last = clusters[clusters.length - 1];
      if (last && c - last[last.length - 1] <= 1) last.push(c);
      else clusters.push([c]);
    }
    const clusterOf = new Map<number, number>();
    clusters.forEach((cl, idx) => cl.forEach((c) => clusterOf.set(c, idx)));

    const buckets: TabNote[][] = clusters.map(() => []);
    perString.forEach((tokens, s) => {
      for (const t of tokens) {
        const idx = clusterOf.get(t.col)!;
        if (buckets[idx].some((n) => n.string === s)) continue; // one event per string per moment
        const { col: _col, ...rest } = t;
        buckets[idx].push({ ...rest, string: s });
      }
    });

    let prevStart = -1;
    clusters.forEach((cl, idx) => {
      if (!buckets[idx].length) return;
      const start = cl[0];
      const gap = prevStart >= 0 ? start - prevStart : 4;
      steps.push({ notes: buckets[idx], durationWeight: Math.max(1, Math.min(gap, 12)) });
      prevStart = start;
    });
  }
  return assignFingering(steps);
}

/**
 * Suggested fingering, one finger per fret: the hand stays in a position (index on `pos`)
 * and only moves when a note falls outside the four-fret window. Same fret = same finger.
 */
export function assignFingering(steps: TabStep[]): TabStep[] {
  let pos = 0;
  return steps.map((step) => {
    const fretted = step.notes.filter((n) => n.fret > 0 && n.type !== 'mute');
    if (fretted.length) {
      const lo = Math.min(...fretted.map((n) => n.fret));
      const hi = Math.max(...fretted.map((n) => n.fret));
      if (pos === 0 || lo < pos || hi > pos + 3) pos = lo;
    }
    const notes = step.notes.map((n) => {
      if (n.fret <= 0 || n.type === 'mute') return { ...n, finger: 0 };
      return { ...n, finger: Math.min(4, Math.max(1, n.fret - pos + 1)) };
    });
    return { ...step, notes: resolveCollisions(notes) };
  });
}

/**
 * Only the index finger can barre. When another finger lands on two strings at once,
 * the thickest string keeps it and the rest move to the next free finger (G chord: 2, 3, 4).
 */
function resolveCollisions(notes: TabNote[]): TabNote[] {
  const used = new Set(notes.filter((n) => n.finger && n.finger > 0).map((n) => n.finger));
  const thickFirst = [...notes].sort((a, b) => b.string - a.string);
  const seen = new Set<number>();
  for (const n of thickFirst) {
    if (!n.finger || n.finger === 1) continue;
    if (!seen.has(n.finger)) {
      seen.add(n.finger);
      continue;
    }
    for (let f = n.finger + 1; f <= 4; f++) {
      if (!used.has(f)) {
        n.finger = f;
        used.add(f);
        seen.add(f);
        break;
      }
    }
  }
  return notes;
}

export const TECHNIQUE_INFO: Record<Technique | 'mute' | 'harmonic' | 'ghost', { short: string; label: string; desc: string }> = {
  'hammer-on': { short: 'H', label: 'Hammer-on', desc: 'Bring a finger down hard on the higher fret without picking again.' },
  'pull-off': { short: 'P', label: 'Pull-off', desc: 'Flick the finger off so the lower note sounds without picking again.' },
  'slide-up': { short: '/', label: 'Slide up', desc: 'Keep pressure on the string and slide up to the new fret.' },
  'slide-down': { short: '\\', label: 'Slide down', desc: 'Keep pressure on the string and slide down to the new fret.' },
  slide: { short: 'S', label: 'Slide', desc: 'Slide between frets without lifting your finger.' },
  bend: { short: 'B', label: 'Bend', desc: 'Keep your finger on the same fret and push the string until it sounds like the target fret.' },
  release: { short: 'R', label: 'Release', desc: 'Let the bent string back down to its normal pitch while it rings.' },
  tap: { short: 'T', label: 'Tap', desc: 'Tap the fret with a finger of your picking hand.' },
  mute: { short: 'X', label: 'Muted', desc: 'Rest a finger on the string without pressing and strike it for a percussive click.' },
  harmonic: { short: 'NH', label: 'Harmonic', desc: 'Touch the string right over the fret wire without pressing, then pick for a chime.' },
  ghost: { short: '( )', label: 'Ghost note', desc: 'Play it very softly, felt more than heard.' },
};

export const SAMPLE_CHORDS = `e|---0---0---3---3---0---0---0---0---|
B|---1---1---0---0---1---1---1---1---|
G|---0---0---0---0---2---2---0---0---|
D|---2---2---0---0---2---2---2---2---|
A|---3---3---2---2---0---0---3---3---|
E|-----------3---3-------------------|`;

export const SAMPLE_TECHNIQUES = `e|-------5h7p5---------5/7\\5---------|
B|---5b7r5-------8~~---5------------|
G|----------------------------------|
D|----------------------------------|
A|----------------------------------|
E|---0---0--------0----0------------|`;
