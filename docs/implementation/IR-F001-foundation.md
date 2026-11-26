# IR-F001: App Foundation, Redesign, Desktop Layout and Learning Data Model

| Field | Value |
| --- | --- |
| Status | Implemented (data model parts Provisional) |
| Implements | none (foundation), guided by `context/01` and `context/02` |
| Date started | 2026-11-24 |
| Date finished | 2026-11-25 |
| Commits | `b4006b3`, `7288c86`, `5111750`, `f3585cf`, `c2c4c42`, `33a8a6c`, plus the commit that adds this report |

## Review

No handoff. Built from the initial development brief and, for the data model, the master brief (sections 9 to 14, 24). Educational content and rules were deliberately not decided here (D-016).

## What Was Built

A working app shell that runs on desktop browsers, phones and Android/iOS builds:

- Sign in, profile, account deletion.
- Today (practice timer, daily goal ring, weekly chart), Learn (empty until lessons exist), Tools, Songs, Progress.
- Tools: Tuner, Chords, Tab Player, Note Finder.
- Desktop sidebar layout and multi-column screens.
- Database structure for skills, lessons, evidence-based mastery and the guitarist profile, with no educational content yet.

| Area | Files / tables |
| --- | --- |
| Screens | `src/app/` (`(tabs)/`, `sign-in.tsx`, `account.tsx`) |
| Interface kit | `src/components/ui.tsx`, `brand.tsx`, `Fretboard.tsx`, `Headstock.tsx`, `PracticeRing.tsx`, `WeekBars.tsx` |
| Music logic | `src/lib/music/` (`theory.ts`, `chords.ts`, `tunings.ts`, `pitch.ts`, `usePitch*.ts`, `tabParser.ts`) |
| Profile vocabulary (provisional) | `src/lib/guitarist.ts` |
| Database | `supabase/migrations/` (foundation, guitarist profile, learning model, unlock provisional values) |
| Server | `supabase/functions/tabr-delete-account/` |

## What the Education Side Can Rely On

These exist and can be referenced in specs and handoffs:

- **Fretboard drawing**: shows notes with finger numbers and finger colors, open and muted strings, bends (half and full), slides, hammer-ons, pull-offs, vibrato, harmonics, ghost notes, and free highlights with custom labels and colors, across any fret range up to 20. Standard tuning only for now.
- **Pitch detection** from the microphone on phones and browsers, accurate to well under one cent on clean tones. Monophonic only (one note at a time).
- **Tab parsing** of plain text tab with techniques, into steps that play on the fretboard.
- **Chord library** of 28 verified shapes with fingerings.
- **Data structures** for skills with prerequisites, lessons made of ordered configurable components, evidence-backed mastery with source and confidence, and review scheduling fields.

## Deviations From the Briefs

| Brief item | What was done instead | Why | Approved by |
| --- | --- | --- | --- |
| iPhone-first (`context/02`, section 23) | Desktop-first, phone layouts kept | Gibson will mostly use a computer | Gibson (D-006) |
| Separate backend and data ownership (section 23) | Shared Detail Pro Supabase project | Gibson's preference for now | Gibson (D-002), Q-004 open |
| Progress should not center on streaks (section 21) | Progress screen still leads with a day streak | Built before the master brief; waiting on a metrics spec | Q-010 |

## Technical Limitations

See `STATUS.md`, "Known Technical Limitations". The ones that matter most for lesson design:

| Limitation | Evidence | Impact | Possible path |
| --- | --- | --- | --- |
| Mic can't hear a headphone-amp setup | The Mustang Micro sends sound to headphones, not a speaker | No mic assessment for the founder | Q-006 |
| Polyphonic detection not available | Current detector is monophonic by design | Chord recognition by ear isn't possible yet | Research item (brief section 18) |
| No physical device testing yet | No development build installed | Phone audio behavior unverified | Development build |

## Verification

| Check | Result |
| --- | --- |
| Typecheck and lint | Pass |
| Web build (desktop 1440px and phone 393px) | Pass, screenshots reviewed |
| iOS bundle export | Pass |
| Physical device | Not yet tested |
| Database row security | Owner-only and read-only rules tested and rolled back (2026-11-24) |

## Open Questions

Q-001 to Q-010 in `QUESTIONS.md`.

## Follow-Ups

- Password reset (needs Q-005).
- Music theory engine, Fretboard Explorer, Metronome, configurable lesson building blocks (in progress, `STATUS.md`).
