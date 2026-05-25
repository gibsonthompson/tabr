/* ═══════════════════════════════════════
   Chord Library — Blues, Rock, Cowboy
   Organized for learning progression
   ═══════════════════════════════════════ */

// Each chord:
//   frets: [1st(e), 2nd(B), 3rd(G), 4th(D), 5th(A), 6th(E)] — null = don't play, 0 = open
//   fingers: same indexing — 0 = open, 1-4 = index/middle/ring/pinky, null = mute

export const CATEGORIES = [
  {
    id: "blues",
    name: "Blues Essentials",
    desc: "Dominant 7th chords — the foundation of every 12-bar blues. All three chords (I, IV, V) use dominant 7ths, which creates the unresolved tension that defines the genre.",
  },
  {
    id: "power",
    name: "Power Chords",
    desc: "Root + 5th, no third. They stay clean through any amount of distortion. Two movable shapes cover the entire neck.",
  },
  {
    id: "doublestops",
    name: "Double Stops",
    desc: "Two notes played simultaneously. Chuck Berry built rock and roll on these. The boogie pattern, barred slides, and bending double stops.",
  },
  {
    id: "cowboy",
    name: "Cowboy / Open Chords",
    desc: "The open-position shapes every guitarist learns first. Use open strings for a full, ringing tone that barre chords can't replicate.",
  },
  {
    id: "rhythm",
    name: "Blues Rhythm Patterns",
    desc: "The shuffle boogie — alternating root-5th and root-6th on two strings. AC/DC, Chuck Berry, Stevie Ray Vaughan all live here.",
  },
];

export const CHORDS = [
  // ═══ BLUES ESSENTIALS (Dominant 7ths) ═══
  {
    name: "E7",
    category: "blues",
    frets:   [0, 0, 1, 0, 2, 0],
    fingers: [0, 0, 1, 0, 2, 0],
    context: "I chord — Key of E",
    desc: "Lift your ring finger off E major. That open D string is the flatted 7th that makes it bluesy.",
    basedOn: "E major minus one finger",
  },
  {
    name: "A7",
    category: "blues",
    frets:   [0, 2, 0, 2, 0, null],
    fingers: [0, 2, 0, 1, 0, null],
    context: "IV chord — Key of E",
    desc: "Lift your middle finger off A major. The open G string is the flatted 7th.",
    basedOn: "A major minus one finger",
  },
  {
    name: "B7",
    category: "blues",
    frets:   [2, 0, 2, 1, 2, null],
    fingers: [3, 0, 4, 1, 2, null],
    context: "V chord — Key of E",
    desc: "The toughest open 7th shape. Uses all four fingers. This is the turnaround chord that pulls you back to E7.",
    basedOn: "Unique shape",
  },
  {
    name: "D7",
    category: "blues",
    frets:   [2, 1, 2, 0, null, null],
    fingers: [3, 1, 2, 0, null, null],
    context: "V chord — Key of G / IV chord — Key of A",
    desc: "Only uses the top four strings. Drop the middle finger one fret from D major.",
    basedOn: "D major with lowered 3rd string",
  },
  {
    name: "G7",
    category: "blues",
    frets:   [1, 0, 0, 0, 0, 3],
    fingers: [1, 0, 0, 0, 0, 3],
    context: "I chord — Key of G",
    desc: "G major with your index finger on the 1st fret of the high E string. That F note is the flatted 7th.",
    basedOn: "G major plus one finger",
  },
  {
    name: "C7",
    category: "blues",
    frets:   [0, 1, 3, 2, 3, null],
    fingers: [0, 1, 4, 2, 3, null],
    context: "IV chord — Key of G",
    desc: "C major plus your pinky on the 3rd fret of the G string. That Bb is the flatted 7th.",
    basedOn: "C major plus one finger",
  },

  // ═══ POWER CHORDS ═══
  {
    name: "E5",
    category: "power",
    frets:   [null, null, null, null, 2, 0],
    fingers: [null, null, null, null, 2, 0],
    context: "Open — 6th string root",
    desc: "The simplest power chord. Open 6th string + 2nd fret on 5th. Mute everything else with your fretting hand.",
  },
  {
    name: "A5",
    category: "power",
    frets:   [null, null, null, 2, 0, null],
    fingers: [null, null, null, 2, 0, null],
    context: "Open — 5th string root",
    desc: "Open A + 2nd fret D string. Same shape as E5 shifted one string set. Mute 6th string with your index finger tip.",
  },
  {
    name: "D5",
    category: "power",
    frets:   [null, null, 2, 0, null, null],
    fingers: [null, null, 2, 0, null, null],
    context: "Open — 4th string root",
    desc: "Open D + 2nd fret G string. Only strum these two strings.",
  },
  {
    name: "G5",
    category: "power",
    frets:   [3, null, null, 0, null, 3],
    fingers: [4, null, null, 0, null, 1],
    context: "Open — big rock G",
    desc: "The AC/DC G5. Low E and high E on 3rd fret, open D string rings. Huge, full sound.",
  },
  {
    name: "F5 (movable)",
    category: "power",
    frets:   [null, null, null, 3, 3, 1],
    fingers: [null, null, null, 3, 4, 1],
    context: "Movable — 6th string root",
    desc: "THE movable power chord shape. Index on root, ring+pinky two frets up. Slide it anywhere: 3rd fret = G5, 5th = A5, 7th = B5.",
  },
  {
    name: "C5 (movable)",
    category: "power",
    frets:   [null, null, 5, 5, 3, null],
    fingers: [null, null, 3, 4, 1, null],
    context: "Movable — 5th string root",
    desc: "Same shape, 5th string root. 5th fret = D5, 7th = E5. Between this and the E-string shape you can play any power chord.",
  },

  // ═══ DOUBLE STOPS ═══
  {
    name: "A Boogie",
    category: "doublestops",
    frets:   [null, null, null, 2, 0, null],
    fingers: [null, null, null, 2, 0, null],
    context: "Root + 5th position",
    desc: "Starting position. Alternate this with the 6th shape (pinky adds 4th fret D string) in a shuffle rhythm. This IS rock and roll.",
  },
  {
    name: "A Boogie 6th",
    category: "doublestops",
    frets:   [null, null, null, 4, 0, null],
    fingers: [null, null, null, 4, 0, null],
    context: "Root + 6th position",
    desc: "The other half of the boogie pattern. Pinky reaches up to the 4th fret. Alternate with the 5th position in shuffle time.",
  },
  {
    name: "E Boogie",
    category: "doublestops",
    frets:   [null, null, null, null, 2, 0],
    fingers: [null, null, null, null, 2, 0],
    context: "Root + 5th position",
    desc: "Same boogie concept on the E/A strings. Alternate with pinky on 4th fret A string for the root-6th.",
  },
  {
    name: "E Boogie 6th",
    category: "doublestops",
    frets:   [null, null, null, null, 4, 0],
    fingers: [null, null, null, null, 4, 0],
    context: "Root + 6th position",
    desc: "Pinky on 4th fret. The alternation between this and E Boogie in shuffle rhythm is the backbone of blues-rock.",
  },
  {
    name: "Berry 3rds (G)",
    category: "doublestops",
    frets:   [3, 3, null, null, null, null],
    fingers: [1, 1, null, null, null, null],
    context: "Barred — strings 1 and 2",
    desc: "Index finger barres both strings. Slide this shape up and down the neck for the classic Chuck Berry lead sound.",
  },
  {
    name: "Berry Bend (G)",
    category: "doublestops",
    frets:   [null, 5, 5, null, null, null],
    fingers: [null, 3, 3, null, null, null],
    context: "Bend — strings 2 and 3",
    desc: "Ring finger barres strings 2 and 3 at 5th fret, bend both up together. Berry invented this move. Index anchors at 3rd fret.",
  },

  // ═══ COWBOY / OPEN CHORDS ═══
  {
    name: "E",
    category: "cowboy",
    frets:   [0, 0, 1, 2, 2, 0],
    fingers: [0, 0, 1, 3, 2, 0],
    context: "Major — all 6 strings",
    desc: "The fullest open chord. All six strings ring. Lift one finger for E7, shift one finger for Em.",
  },
  {
    name: "Em",
    category: "cowboy",
    frets:   [0, 0, 0, 2, 2, 0],
    fingers: [0, 0, 0, 2, 1, 0],
    context: "Minor — all 6 strings",
    desc: "Two fingers. The easiest chord on guitar. Dark, moody tone used in everything from Nirvana to classical.",
  },
  {
    name: "A",
    category: "cowboy",
    frets:   [0, 2, 2, 2, 0, null],
    fingers: [0, 1, 2, 3, 0, null],
    context: "Major — skip 6th string",
    desc: "Three fingers packed on the 2nd fret. Don't hit the low E. Lift middle finger for A7.",
  },
  {
    name: "Am",
    category: "cowboy",
    frets:   [0, 1, 2, 2, 0, null],
    fingers: [0, 1, 3, 2, 0, null],
    context: "Minor — skip 6th string",
    desc: "One of the most-used chords in all of music. Move one finger from A major and the whole mood shifts.",
  },
  {
    name: "D",
    category: "cowboy",
    frets:   [2, 3, 2, 0, null, null],
    fingers: [1, 3, 2, 0, null, null],
    context: "Major — top 4 strings only",
    desc: "Only strum the top four strings. Bright, ringing tone. The IV chord in key of A, V chord in key of G.",
  },
  {
    name: "Dm",
    category: "cowboy",
    frets:   [1, 3, 2, 0, null, null],
    fingers: [1, 3, 2, 0, null, null],
    context: "Minor — top 4 strings only",
    desc: "D major with the high E dropped one fret. Melancholy, haunting quality.",
  },
  {
    name: "G",
    category: "cowboy",
    frets:   [3, 0, 0, 0, 2, 3],
    fingers: [3, 0, 0, 0, 1, 2],
    context: "Major — all 6 strings",
    desc: "Big, open sound using all six strings. The I chord in key of G. Add pinky on 3rd fret B string for a fuller voicing.",
  },
  {
    name: "C",
    category: "cowboy",
    frets:   [0, 1, 0, 2, 3, null],
    fingers: [0, 1, 0, 2, 3, null],
    context: "Major — skip 6th string",
    desc: "The most common chord in popular music. Don't hit the low E. Add pinky on G string 3rd fret for C7.",
  },

  // ═══ BLUES RHYTHM PATTERNS ═══
  {
    name: "E Blues Shuffle",
    category: "rhythm",
    frets:   [null, null, null, null, 2, 0],
    fingers: [null, null, null, null, 2, 0],
    context: "Starting position — then add pinky",
    desc: "Play this, then add pinky on 4th fret (A string) and alternate in a shuffle rhythm. The backbone of every blues song in E.",
  },
  {
    name: "A Blues Shuffle",
    category: "rhythm",
    frets:   [null, null, null, 2, 0, null],
    fingers: [null, null, null, 2, 0, null],
    context: "Starting position — then add pinky",
    desc: "Same pattern on A/D strings. Pinky alternates to 4th fret (D string). This is the IV chord shuffle in key of E.",
  },
  {
    name: "B Blues Shuffle",
    category: "rhythm",
    frets:   [null, null, null, 4, 2, null],
    fingers: [null, null, null, 3, 1, null],
    context: "Starting position — then add pinky",
    desc: "Index on 2nd fret A, ring on 4th fret D. Pinky reaches to 6th fret D string. The V chord shuffle in key of E.",
  },
];