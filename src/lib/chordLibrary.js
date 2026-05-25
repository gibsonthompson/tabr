/* ═══════════════════════════════════════
   Chord Library — Verified Fingerings
   All shapes cross-referenced against
   Fender, JamPlay, FaChords, Guitar Space
   ═══════════════════════════════════════ */

// frets/fingers: [1st(e), 2nd(B), 3rd(G), 4th(D), 5th(A), 6th(E)]
// null = don't play, 0 = open
// fingers: 0=open, 1=index, 2=middle, 3=ring, 4=pinky

export const CATEGORIES = [
  { id: "blues", name: "Blues Essentials", desc: "Dominant 7th chords — the foundation of every 12-bar blues. All three chords (I, IV, V) use dominant 7ths, creating the unresolved tension that defines the genre." },
  { id: "power", name: "Power Chords", desc: "Root + 5th, no third. They stay clean through any amount of distortion. Two movable shapes cover the entire neck." },
  { id: "doublestops", name: "Double Stops", desc: "Two notes played simultaneously. Chuck Berry built rock and roll on these. The boogie pattern, barred slides, and bending double stops." },
  { id: "cowboy", name: "Cowboy / Open Chords", desc: "The open-position shapes every guitarist learns first. Use open strings for a full, ringing tone that barre chords can't replicate." },
  { id: "rhythm", name: "Blues Rhythm Patterns", desc: "The shuffle boogie — alternating root-5th and root-6th on two strings. AC/DC, Chuck Berry, Stevie Ray Vaughan all live here." },
];

export const CHORDS = [
  // ═══ BLUES ESSENTIALS ═══

  // E7 = 020100 — verified: index on G fret 1, middle on A fret 2
  {
    name: "E7", category: "blues",
    frets:   [0, 0, 1, 0, 2, 0],
    fingers: [0, 0, 1, 0, 2, 0],
    context: "I chord — Key of E",
    desc: "Lift your ring finger off E major. The open D string is the flatted 7th (D note) that makes it bluesy.",
    basedOn: "E major minus one finger",
  },
  // A7 = x02020 — verified: middle on D fret 2, ring on B fret 2
  {
    name: "A7", category: "blues",
    frets:   [0, 2, 0, 2, 0, null],
    fingers: [0, 3, 0, 2, 0, null],
    context: "IV chord — Key of E",
    desc: "Lift your middle finger off A major. The open G string becomes the flatted 7th (G note).",
    basedOn: "A major minus one finger",
  },
  // B7 = x21202 — verified: index on D fret 1, middle on A fret 2, ring on G fret 2, pinky on e fret 2
  {
    name: "B7", category: "blues",
    frets:   [2, 0, 2, 1, 2, null],
    fingers: [4, 0, 3, 1, 2, null],
    context: "V chord — Key of E",
    desc: "The toughest open 7th shape. Uses all four fingers. This is the turnaround chord that pulls you back to E7.",
    basedOn: "Unique shape",
  },
  // D7 = xx0212 — verified: index on B fret 1, middle on e fret 2, ring on G fret 2
  {
    name: "D7", category: "blues",
    frets:   [2, 1, 2, 0, null, null],
    fingers: [2, 1, 3, 0, null, null],
    context: "V chord — Key of G / IV chord — Key of A",
    desc: "Only uses the top four strings. Index on B fret 1, middle on high E fret 2, ring on G fret 2.",
    basedOn: "D major variation",
  },
  // G7 = 320001 — verified: index on e fret 1, middle on A fret 2, ring on E fret 3
  {
    name: "G7", category: "blues",
    frets:   [1, 0, 0, 0, 2, 3],
    fingers: [1, 0, 0, 0, 2, 3],
    context: "I chord — Key of G",
    desc: "G major shape with index on high E fret 1. That F note is the flatted 7th. Middle on A fret 2, ring on low E fret 3.",
    basedOn: "G major plus index finger",
  },
  // C7 = x32310 — verified: index on B fret 1, middle on D fret 2, ring on A fret 3, pinky on G fret 3
  {
    name: "C7", category: "blues",
    frets:   [0, 1, 3, 2, 3, null],
    fingers: [0, 1, 4, 2, 3, null],
    context: "IV chord — Key of G",
    desc: "C major plus your pinky on the 3rd fret of the G string. That Bb is the flatted 7th.",
    basedOn: "C major plus one finger",
  },

  // ═══ POWER CHORDS ═══

  // E5 = 02xxxx
  {
    name: "E5", category: "power",
    frets:   [null, null, null, null, 2, 0],
    fingers: [null, null, null, null, 1, 0],
    context: "Open — 6th string root",
    desc: "Open low E + index on A fret 2. Mute everything else. The simplest power chord.",
  },
  // A5 = x02xxx
  {
    name: "A5", category: "power",
    frets:   [null, null, null, 2, 0, null],
    fingers: [null, null, null, 1, 0, null],
    context: "Open — 5th string root",
    desc: "Open A + index on D fret 2. Mute the 6th string with your index finger tip.",
  },
  // D5 = xx02xx
  {
    name: "D5", category: "power",
    frets:   [null, null, 2, 0, null, null],
    fingers: [null, null, 1, 0, null, null],
    context: "Open — 4th string root",
    desc: "Open D + index on G fret 2. Only strum these two strings.",
  },
  // G5 = 3x0033 — big rock G
  {
    name: "G5", category: "power",
    frets:   [3, null, null, 0, null, 3],
    fingers: [4, null, null, 0, null, 1],
    context: "Open — big rock G",
    desc: "The AC/DC G5. Index on low E fret 3, pinky on high E fret 3, open D string rings. Huge, full sound.",
  },
  // F5 movable = 133xxx
  {
    name: "F5 (movable)", category: "power",
    frets:   [null, null, null, 3, 3, 1],
    fingers: [null, null, null, 3, 4, 1],
    context: "Movable — 6th string root",
    desc: "THE movable power chord. Index on root, ring+pinky two frets up. Slide anywhere: 3rd fret = G5, 5th = A5, 7th = B5.",
  },
  // C5 movable = x355xx
  {
    name: "C5 (movable)", category: "power",
    frets:   [null, null, 5, 5, 3, null],
    fingers: [null, null, 3, 4, 1, null],
    context: "Movable — 5th string root",
    desc: "Same shape, 5th string root. 5th fret = D5, 7th = E5. Between this and the E-string shape you cover every power chord.",
  },

  // ═══ DOUBLE STOPS ═══

  {
    name: "A Boogie", category: "doublestops",
    frets:   [null, null, null, 2, 0, null],
    fingers: [null, null, null, 1, 0, null],
    context: "Root + 5th position",
    desc: "Starting position. Alternate this with the 6th shape (pinky adds D fret 4) in a shuffle rhythm. This IS rock and roll.",
  },
  {
    name: "A Boogie 6th", category: "doublestops",
    frets:   [null, null, null, 4, 0, null],
    fingers: [null, null, null, 4, 0, null],
    context: "Root + 6th position",
    desc: "The other half of the boogie pattern. Pinky reaches up to D string fret 4. Alternate with the 5th position in shuffle time.",
  },
  {
    name: "E Boogie", category: "doublestops",
    frets:   [null, null, null, null, 2, 0],
    fingers: [null, null, null, null, 1, 0],
    context: "Root + 5th position",
    desc: "Same boogie concept on E/A strings. Alternate with pinky on A fret 4 for the root-6th.",
  },
  {
    name: "E Boogie 6th", category: "doublestops",
    frets:   [null, null, null, null, 4, 0],
    fingers: [null, null, null, null, 4, 0],
    context: "Root + 6th position",
    desc: "Pinky on A fret 4. The alternation between this and E Boogie in shuffle rhythm is the backbone of blues-rock.",
  },
  {
    name: "Berry 3rds (G)", category: "doublestops",
    frets:   [3, 3, null, null, null, null],
    fingers: [1, 1, null, null, null, null],
    context: "Barred — strings 1 and 2",
    desc: "Index finger barres both strings. Slide this shape up and down the neck for the classic Chuck Berry lead sound.",
  },
  {
    name: "Berry Bend (G)", category: "doublestops",
    frets:   [null, 5, 5, null, null, null],
    fingers: [null, 3, 3, null, null, null],
    context: "Bend — strings 2 and 3",
    desc: "Ring finger barres B and G at 5th fret, bend both up. Berry invented this move.",
  },

  // ═══ COWBOY / OPEN CHORDS ═══

  // E = 022100 — verified: index on G fret 1, middle on A fret 2, ring on D fret 2
  {
    name: "E", category: "cowboy",
    frets:   [0, 0, 1, 2, 2, 0],
    fingers: [0, 0, 1, 3, 2, 0],
    context: "Major — all 6 strings",
    desc: "The fullest open chord. All six strings ring. Index on G fret 1, middle on A fret 2, ring on D fret 2.",
  },
  // Em = 022000 — verified: middle on A fret 2, ring on D fret 2
  {
    name: "Em", category: "cowboy",
    frets:   [0, 0, 0, 2, 2, 0],
    fingers: [0, 0, 0, 3, 2, 0],
    context: "Minor — all 6 strings",
    desc: "Two fingers. Middle on A fret 2, ring on D fret 2. Keeps index free for hammer-ons and embellishments.",
  },
  // A = x02220 — verified: index on D fret 2, middle on G fret 2, ring on B fret 2
  {
    name: "A", category: "cowboy",
    frets:   [0, 2, 2, 2, 0, null],
    fingers: [0, 3, 2, 1, 0, null],
    context: "Major — skip 6th string",
    desc: "Three fingers packed on the 2nd fret. Index on D, middle on G, ring on B. Don't hit the low E. Lift middle for A7.",
  },
  // Am = x02210 — verified: index on B fret 1, middle on D fret 2, ring on G fret 2
  {
    name: "Am", category: "cowboy",
    frets:   [0, 1, 2, 2, 0, null],
    fingers: [0, 1, 3, 2, 0, null],
    context: "Minor — skip 6th string",
    desc: "Index on B fret 1, middle on D fret 2, ring on G fret 2. One of the most used chords in all of music.",
  },
  // D = xx0232 — verified: index on G fret 2, middle on e fret 2, ring on B fret 3
  {
    name: "D", category: "cowboy",
    frets:   [2, 3, 2, 0, null, null],
    fingers: [2, 3, 1, 0, null, null],
    context: "Major — top 4 strings only",
    desc: "Index on G fret 2, middle on high E fret 2, ring on B fret 3. Only strum the top four strings.",
  },
  // Dm = xx0231 — verified: index on e fret 1, middle on G fret 2, ring on B fret 3
  {
    name: "Dm", category: "cowboy",
    frets:   [1, 3, 2, 0, null, null],
    fingers: [1, 3, 2, 0, null, null],
    context: "Minor — top 4 strings only",
    desc: "Index on high E fret 1, middle on G fret 2, ring on B fret 3. Melancholy, haunting quality.",
  },
  // G = 320003 — verified: middle on A fret 2, ring on E fret 3, pinky on e fret 3
  {
    name: "G", category: "cowboy",
    frets:   [3, 0, 0, 0, 2, 3],
    fingers: [4, 0, 0, 0, 2, 3],
    context: "Major — all 6 strings",
    desc: "Middle on A fret 2, ring on low E fret 3, pinky on high E fret 3. Big open sound using all six strings.",
  },
  // C = x32010 — verified: index on B fret 1, middle on D fret 2, ring on A fret 3
  {
    name: "C", category: "cowboy",
    frets:   [0, 1, 0, 2, 3, null],
    fingers: [0, 1, 0, 2, 3, null],
    context: "Major — skip 6th string",
    desc: "Index on B fret 1, middle on D fret 2, ring on A fret 3. The most common chord in popular music.",
  },

  // ═══ BLUES RHYTHM ═══

  {
    name: "E Blues Shuffle", category: "rhythm",
    frets:   [null, null, null, null, 2, 0],
    fingers: [null, null, null, null, 1, 0],
    context: "Starting position — then add pinky",
    desc: "Play this, then add pinky on A fret 4 and alternate in shuffle rhythm. The backbone of every blues song in E.",
  },
  {
    name: "A Blues Shuffle", category: "rhythm",
    frets:   [null, null, null, 2, 0, null],
    fingers: [null, null, null, 1, 0, null],
    context: "Starting position — then add pinky",
    desc: "Same pattern on A/D strings. Pinky alternates to D fret 4. This is the IV chord shuffle in key of E.",
  },
  {
    name: "B Blues Shuffle", category: "rhythm",
    frets:   [null, null, null, 4, 2, null],
    fingers: [null, null, null, 3, 1, null],
    context: "Starting position — then add pinky",
    desc: "Index on A fret 2, ring on D fret 4. Pinky reaches to D fret 6. The V chord shuffle in key of E.",
  },
];