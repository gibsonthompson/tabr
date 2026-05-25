/* ═══════════════════════════════════
   Tuner — Pitch Detection + Tuning Presets
   ═══════════════════════════════════ */

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const ALL_NOTES = [];
for (let oct = 0; oct < 9; oct++)
  NOTE_NAMES.forEach((n, i) =>
    ALL_NOTES.push({ name: n, oct, hz: 440 * Math.pow(2, oct - 4 + (i - 9) / 12) })
  );

export function closestNote(hz) {
  let best = null, bestD = Infinity;
  for (const n of ALL_NOTES) {
    const d = Math.abs(hz - n.hz);
    if (d < bestD) { bestD = d; best = n; }
  }
  const cents = 1200 * Math.log2(hz / best.hz);
  return { ...best, cents: Math.round(cents), hz: Math.round(hz * 10) / 10 };
}

export function autoCorrelate(buf, sampleRate) {
  let size = buf.length, rms = 0;
  for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = size - 1;
  const thresh = 0.2;
  for (let i = 0; i < size / 2; i++) { if (Math.abs(buf[i]) < thresh) { r1 = i; break; } }
  for (let i = 1; i < size / 2; i++) { if (Math.abs(buf[size - i]) < thresh) { r2 = size - i; break; } }
  buf = buf.slice(r1, r2);
  size = buf.length;

  const c = new Array(size).fill(0);
  for (let i = 0; i < size; i++)
    for (let j = 0; j < size - i; j++) c[i] += buf[j] * buf[j + i];

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxVal = -1, maxPos = -1;
  for (let i = d; i < size; i++) { if (c[i] > maxVal) { maxVal = c[i]; maxPos = i; } }

  let t0 = maxPos;
  if (t0 < 1) return -1;
  const x1 = c[t0 - 1], x2 = c[t0], x3 = c[t0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
  if (a) t0 -= b / (2 * a);
  return sampleRate / t0;
}

// ── TUNING PRESETS ──
// Each: { name, description, strings: [{ name, note, hz }] }
// Strings ordered 1st(high e) to 6th(low E) to match STRINGS constant
export const TUNINGS = [
  {
    id: "standard",
    name: "Standard",
    desc: "E A D G B E",
    strings: [
      { name: "e", note: "E4", hz: 329.63 },
      { name: "B", note: "B3", hz: 246.94 },
      { name: "G", note: "G3", hz: 196.00 },
      { name: "D", note: "D3", hz: 146.83 },
      { name: "A", note: "A2", hz: 110.00 },
      { name: "E", note: "E2", hz: 82.41 },
    ],
  },
  {
    id: "eb",
    name: "Eb Standard",
    desc: "Eb Ab Db Gb Bb Eb — Half step down. Hendrix, Slash, SRV.",
    strings: [
      { name: "eb", note: "Eb4", hz: 311.13 },
      { name: "Bb", note: "Bb3", hz: 233.08 },
      { name: "Gb", note: "Gb3", hz: 185.00 },
      { name: "Db", note: "Db3", hz: 138.59 },
      { name: "Ab", note: "Ab2", hz: 103.83 },
      { name: "Eb", note: "Eb2", hz: 77.78 },
    ],
  },
  {
    id: "dropd",
    name: "Drop D",
    desc: "E B G D A D — Low E dropped to D. Foo Fighters, Tool, Rage.",
    strings: [
      { name: "e", note: "E4", hz: 329.63 },
      { name: "B", note: "B3", hz: 246.94 },
      { name: "G", note: "G3", hz: 196.00 },
      { name: "D", note: "D3", hz: 146.83 },
      { name: "A", note: "A2", hz: 110.00 },
      { name: "D", note: "D2", hz: 73.42 },
    ],
  },
  {
    id: "openg",
    name: "Open G",
    desc: "D B D G B D — Strum open = G major. Keith Richards, Robert Johnson.",
    strings: [
      { name: "D", note: "D4", hz: 293.66 },
      { name: "B", note: "B3", hz: 246.94 },
      { name: "D", note: "D3", hz: 146.83 },
      { name: "G", note: "G3", hz: 196.00 },
      { name: "B", note: "B2", hz: 123.47 },
      { name: "D", note: "D2", hz: 73.42 },
    ],
  },
  {
    id: "opend",
    name: "Open D",
    desc: "D A D F# A D — Strum open = D major. Slide guitar, Joni Mitchell.",
    strings: [
      { name: "D", note: "D4", hz: 293.66 },
      { name: "A", note: "A3", hz: 220.00 },
      { name: "F#", note: "F#3", hz: 185.00 },
      { name: "D", note: "D3", hz: 146.83 },
      { name: "A", note: "A2", hz: 110.00 },
      { name: "D", note: "D2", hz: 73.42 },
    ],
  },
  {
    id: "dadgad",
    name: "DADGAD",
    desc: "D A D G A D — Celtic, fingerstyle. Pierre Bensusan, Led Zeppelin.",
    strings: [
      { name: "D", note: "D4", hz: 293.66 },
      { name: "A", note: "A3", hz: 220.00 },
      { name: "G", note: "G3", hz: 196.00 },
      { name: "D", note: "D3", hz: 146.83 },
      { name: "A", note: "A2", hz: 110.00 },
      { name: "D", note: "D2", hz: 73.42 },
    ],
  },
  {
    id: "dropc",
    name: "Drop C",
    desc: "D A F C G C — Heavy. System of a Down, Bullet for My Valentine.",
    strings: [
      { name: "D", note: "D4", hz: 293.66 },
      { name: "A", note: "A3", hz: 220.00 },
      { name: "F", note: "F3", hz: 174.61 },
      { name: "C", note: "C3", hz: 130.81 },
      { name: "G", note: "G2", hz: 98.00 },
      { name: "C", note: "C2", hz: 65.41 },
    ],
  },
];