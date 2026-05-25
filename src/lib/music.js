/* ═══════════════════════════════
   Music Reference Data
   ═══════════════════════════════ */

// String reference: 1st = thinnest (high E), 6th = thickest (low E)
export const STRINGS = [
  { name: "e", num: "1st", note: "E4", hz: 329.63 },
  { name: "B", num: "2nd", note: "B3", hz: 246.94 },
  { name: "G", num: "3rd", note: "G3", hz: 196.0 },
  { name: "D", num: "4th", note: "D3", hz: 146.83 },
  { name: "A", num: "5th", note: "A2", hz: 110.0 },
  { name: "E", num: "6th", note: "E2", hz: 82.41 },
];

// Note names and open string semitone indices
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const OPEN_NOTES = [4, 11, 7, 2, 9, 4]; // E B G D A E

export function getNoteName(stringIdx, fret) {
  if (fret < 0) return "X";
  return NOTE_NAMES[(OPEN_NOTES[stringIdx] + fret) % 12];
}

// Chord detection database
const CHORD_DB = [
  // Major
  { name: "C", shape: [0,1,0,2,3,null] },
  { name: "D", shape: [2,3,2,0,null,null] },
  { name: "E", shape: [0,0,1,2,2,0] },
  { name: "F", shape: [1,1,2,3,null,null] },
  { name: "G", shape: [3,0,0,0,2,3] },
  { name: "G", shape: [3,3,0,0,2,3] },
  { name: "A", shape: [0,2,2,2,0,null] },
  // Minor
  { name: "Am", shape: [0,1,2,2,0,null] },
  { name: "Dm", shape: [1,3,2,0,null,null] },
  { name: "Em", shape: [0,0,0,2,2,0] },
  { name: "Fm", shape: [1,1,1,3,null,null] },
  // 7th
  { name: "A7", shape: [0,2,0,2,0,null] },
  { name: "B7", shape: [0,0,2,1,2,null] },
  { name: "C7", shape: [0,1,3,2,3,null] },
  { name: "D7", shape: [1,1,2,0,null,null] },
  { name: "E7", shape: [0,0,1,0,2,0] },
  { name: "G7", shape: [1,0,0,0,2,3] },
  // Minor 7th
  { name: "Am7", shape: [0,1,0,2,0,null] },
  { name: "Em7", shape: [0,0,0,0,2,0] },
  // Major 7th
  { name: "Fmaj7", shape: [0,1,2,3,null,null] },
  { name: "Cmaj7", shape: [0,0,0,2,3,null] },
  // Sus
  { name: "Dsus2", shape: [0,3,2,0,null,null] },
  { name: "Dsus4", shape: [3,3,2,0,null,null] },
  { name: "Asus2", shape: [0,2,2,0,0,null] },
  { name: "Asus4", shape: [0,2,2,3,0,null] },
];

export function detectChord(notes) {
  const shape = Array(6).fill(null);
  for (const n of notes) {
    if (n.fret >= 0 && n.type !== "mute") shape[n.string] = n.fret;
  }
  for (const chord of CHORD_DB) {
    let match = true;
    for (let i = 0; i < 6; i++) {
      if (chord.shape[i] === null && shape[i] === null) continue;
      if (chord.shape[i] === null || shape[i] === null) { match = false; break; }
      if (chord.shape[i] !== shape[i]) { match = false; break; }
    }
    if (match) return chord.name;
  }
  return null;
}

// Visual constants
export const FINGER_COLORS = {
  0: "transparent",
  1: "#D4AF37",  // Gold (index)
  2: "#C41E3A",  // Cherry (middle)
  3: "#EDDCB1",  // Cream (ring)
  4: "#CC7722",  // Amber (pinky)
};

export const FINGER_LABELS = { 0: "\u25CB", 1: "1", 2: "2", 3: "3", 4: "4" };

export const STRING_COLORS = ["#C8C0B8","#C8C0B8","#C8C0B8","#B8B0A8","#B8B0A8","#B8B0A8"];
export const STRING_WIDTHS = [1.5, 1.8, 2.2, 2.6, 3.0, 3.4];

// Technique colors (for markers/labels)
export const TECHNIQUE_COLORS = {
  "hammer-on": "#D4AF37",
  "pull-off": "#D4AF37",
  "slide-up": "#E8C84A",
  "slide-down": "#E8C84A",
  slide: "#E8C84A",
  bend: "#C41E3A",
  release: "#C41E3A",
  tap: "#CC7722",
  mute: "#6B5940",
  harmonic: "#EDDCB1",
  ghost: "#6B5940",
};