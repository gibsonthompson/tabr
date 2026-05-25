/* ═══════════════════════════════════════
   Tab Parser — Full technique recognition
   ═══════════════════════════════════════ */

const TECHNIQUE_MAP = {
  h: "hammer-on",
  p: "pull-off",
  b: "bend",
  r: "release",
  s: "slide",
  t: "tap",
};

/**
 * Tokenize a single string's tab data into events
 * Returns array of { col, fret, type, technique, vibrato }
 */
function tokenizeLine(data) {
  const tokens = [];
  let i = 0;
  let pendingTech = null;

  while (i < data.length) {
    const ch = data[i];

    // Dashes — skip
    if (ch === "-" || ch === " " || ch === "|") {
      i++;
      continue;
    }

    // Muted note (x or X)
    if (ch === "x" || ch === "X") {
      tokens.push({ col: i, fret: -1, type: "mute", technique: null, vibrato: false });
      pendingTech = null;
      i++;
      continue;
    }

    // Natural harmonic <n>
    if (ch === "<") {
      let num = "";
      i++;
      while (i < data.length && data[i] !== ">") {
        num += data[i];
        i++;
      }
      i++; // skip >
      if (num && !isNaN(num)) {
        tokens.push({ col: i - num.length - 1, fret: parseInt(num), type: "harmonic", technique: null, vibrato: false });
      }
      pendingTech = null;
      continue;
    }

    // Ghost note (n)
    if (ch === "(") {
      let num = "";
      const startCol = i;
      i++;
      while (i < data.length && data[i] !== ")") {
        num += data[i];
        i++;
      }
      i++; // skip )
      if (num && !isNaN(num)) {
        tokens.push({ col: startCol, fret: parseInt(num), type: "ghost", technique: null, vibrato: false });
      }
      pendingTech = null;
      continue;
    }

    // Vibrato
    if (ch === "~" || ch === "v") {
      if (tokens.length > 0) tokens[tokens.length - 1].vibrato = true;
      i++;
      continue;
    }

    // Slide symbols
    if (ch === "/") {
      pendingTech = "slide-up";
      i++;
      continue;
    }
    if (ch === "\\") {
      pendingTech = "slide-down";
      i++;
      continue;
    }

    // Technique letters (h, p, b, r, s, t)
    if (TECHNIQUE_MAP[ch.toLowerCase()] && !(ch >= "0" && ch <= "9")) {
      pendingTech = ch.toLowerCase();
      i++;
      continue;
    }

    // Fret number (1 or 2 digits)
    if (ch >= "0" && ch <= "9") {
      let numStr = ch;
      if (i + 1 < data.length && data[i + 1] >= "0" && data[i + 1] <= "9") {
        numStr += data[i + 1];
      }
      const fret = parseInt(numStr);
      const col = i;

      let technique = null;
      if (pendingTech) {
        technique = TECHNIQUE_MAP[pendingTech] || pendingTech;
        pendingTech = null;
      }

      tokens.push({ col, fret, type: "note", technique, vibrato: false });
      i += numStr.length;
      continue;
    }

    // P.M. detection (palm mute)
    if (ch === "P" && i + 1 < data.length && data[i + 1] === "M") {
      // Skip P.M. marker — it's metadata, not a note
      i += 2;
      if (i < data.length && data[i] === ".") i++;
      continue;
    }

    i++;
  }

  return tokens;
}

/**
 * Parse full tab text into structured steps
 * Each step = { notes: [...], durationWeight, techniques: [...] }
 * Each note = { string, fret, type, technique, vibrato }
 */
export function parseTabs(tabText) {
  const lines = tabText.split("\n");
  const stringNames = ["e", "B", "G", "D", "A", "E"];
  const groups = [];
  let current = [];

  // Group into sets of 6 string lines
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^([eEBGDA])\s*[\|](.+?)[\|]?\s*$/i);
    if (match) {
      current.push({ name: match[1], data: match[2] });
    } else {
      if (current.length >= 6) groups.push(current.slice(0, 6));
      current = [];
    }
  }
  if (current.length >= 6) groups.push(current.slice(0, 6));

  // Normalize string order
  const normalizeGroup = (group) => {
    const ordered = [];
    const used = new Set();
    for (const name of stringNames) {
      const idx = group.findIndex(
        (s, j) => s.name.toLowerCase() === name.toLowerCase() && !used.has(j)
      );
      if (idx !== -1) {
        ordered.push(group[idx]);
        used.add(idx);
      }
    }
    return ordered.length === 6 ? ordered : group;
  };

  // Build steps from all groups
  const allSteps = [];

  for (const rawGroup of groups) {
    const group = normalizeGroup(rawGroup);

    // Tokenize each string
    const stringTokens = group.map((s) => tokenizeLine(s.data));

    // Collect all unique column positions where events occur
    const colSet = new Set();
    stringTokens.forEach((tokens) => tokens.forEach((t) => colSet.add(t.col)));
    const sortedCols = [...colSet].sort((a, b) => a - b);

    // Merge columns that are within 1 position of each other (alignment tolerance)
    const mergedCols = [];
    for (const col of sortedCols) {
      if (mergedCols.length === 0 || col - mergedCols[mergedCols.length - 1] > 1) {
        mergedCols.push(col);
      }
    }

    // For each merged column, find notes across all strings
    let prevCol = -1;
    for (const col of mergedCols) {
      const notes = [];
      for (let s = 0; s < 6; s++) {
        // Find token at or near this column
        const token = stringTokens[s].find(
          (t) => Math.abs(t.col - col) <= 1
        );
        if (token) {
          notes.push({
            string: s,
            fret: token.fret,
            type: token.type,
            technique: token.technique,
            vibrato: token.vibrato,
          });
        }
      }

      if (notes.length > 0) {
        // Compute duration weight from spacing
        const gap = prevCol >= 0 ? col - prevCol : 4;
        const durationWeight = Math.max(1, Math.min(gap, 12));

        allSteps.push({ notes, durationWeight });
        prevCol = col;
      }
    }
  }

  return allSteps;
}

/**
 * Assign fingers ergonomically
 * Returns notes with added `finger` property
 */
export function assignFingers(notes) {
  if (!notes.length) return [];

  // Open strings and mutes get finger 0
  const open = notes
    .filter((n) => n.fret === 0 || n.fret === -1 || n.type === "mute")
    .map((n) => ({ ...n, finger: 0 }));

  const fretted = notes.filter((n) => n.fret > 0 && n.type !== "mute");
  if (!fretted.length) return open;

  // Sort by fret ascending, then string descending
  fretted.sort((a, b) => a.fret - b.fret || b.string - a.string);

  // Group by fret (same fret = same finger / barre)
  const groups = [];
  let lastFret = -1;
  for (const n of fretted) {
    if (n.fret !== lastFret) {
      groups.push([n]);
      lastFret = n.fret;
    } else {
      groups[groups.length - 1].push(n);
    }
  }

  // Assign fingers 1-4 from lowest fret to highest
  const result = [...open];
  groups.forEach((grp, i) => {
    const finger = Math.min(i + 1, 4);
    grp.forEach((n) => result.push({ ...n, finger }));
  });

  return result;
}

/**
 * Technique display labels and descriptions
 */
export const TECHNIQUE_INFO = {
  "hammer-on": { short: "H", label: "Hammer-on", desc: "Strike the higher fret with your finger without re-picking" },
  "pull-off": { short: "P", label: "Pull-off", desc: "Pull finger off to sound the lower fret without re-picking" },
  "slide-up": { short: "/", label: "Slide up", desc: "Slide your finger up to the next fret while maintaining pressure" },
  "slide-down": { short: "\\", label: "Slide down", desc: "Slide your finger down to the next fret while maintaining pressure" },
  slide: { short: "S", label: "Slide", desc: "Slide between frets without lifting your finger" },
  bend: { short: "B", label: "Bend", desc: "Push the string sideways to raise pitch to the target note" },
  release: { short: "R", label: "Release", desc: "Release the bend back to the original pitch" },
  tap: { short: "T", label: "Tap", desc: "Tap the fret with your picking hand finger" },
  mute: { short: "X", label: "Muted", desc: "Lightly touch the string and strike for a percussive sound" },
  harmonic: { short: "NH", label: "Harmonic", desc: "Lightly touch the string above the fret wire and pick for a chime tone" },
  ghost: { short: "()", label: "Ghost note", desc: "Play very softly, barely audible" },
};

export const SAMPLE_TAB = `e|---0---0---0---0---3---3---3---3---|
B|---1---1---1---1---0---0---0---0---|
G|---0---0---0---0---0---0---0---0---|
D|---2---2---2---2---0---0---0---0---|
A|---3---3---3---3---2---2---2---2---|
E|---0---0---0---0---3---3---3---3---|

e|---0---0---2---2---0---0---0---0---|
B|---0---0---3---3---1---1---1---1---|
G|---1---1---2---2---0---0---0---0---|
D|---2---2---0---0---2---2---2---2---|
A|---2---2---0---0---3---3---3---3---|
E|---0---0---0---0---0---0---0---0---|`;

export const SAMPLE_TECHNIQUES = `e|-------5h7p5---------5/7\\5---------|
B|---5b7r5-------8~~---5------------|
G|--------------------------------------|
D|--------------------------------------|
A|--------------------------------------|
E|---0---0--------0----0----------------|`;
