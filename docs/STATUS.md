# Development Status

**Last updated:** 2026-11-25 by Engineering

How to keep this current: update it in the same commit as the work it describes. Move items between sections rather than deleting them; finished items move to "Built".

---

## Built

### Foundation
- Expo SDK 58 app for iPhone, Android and web from one codebase (D-001).
- Sign in and create an account with email and password (shared sign-in pool, D-002).
- tabr profile created automatically on first sign-in (D-010).
- Profile screen: name, practice days per week, minutes per session, genres, artists, ambitions.
- Account deletion that removes all tabr data, and the login if no other app uses it (D-011).
- Desktop-first layout: sidebar on wide screens with tools listed under Tools; single column on phones (D-006).
- Cherry sunburst visual identity and shared interface kit in `src/components/ui.tsx`: screen, headers, panels, buttons, pills, segmented control, fields, balanced grid, columns (D-005).
- Deployed to Vercel on every push to `main`.

### Tools
- **Tuner:** standard plus six alternate tunings, automatic string detection or lock to one string, cents meter, headstock view. Works on phones and in browsers (D-012).
- **Chords:** 28 verified shapes in five categories (blues dominant 7ths, power chords, double stops, cowboy/open chords, blues rhythm), drawn on the fretboard with a string-by-string breakdown.
- **Tab Player:** paste or pick a sample tab and step through it on the fretboard, with playback speed and technique explanations (hammer-ons, pull-offs, slides, bends, releases, mutes, vibrato, taps, harmonics, ghost notes).
- **Note Finder:** every location of a note on the neck up to fret 15.
- **Fretboard drawing** (`src/components/Fretboard.tsx`): player's-eye perspective, finger colors, techniques, muted and open strings, free-form highlights. Scales evenly on large screens.

### Practice and Songs
- Practice timer on Today; finished sessions save with notes.
- Weekly practice chart against the daily goal.
- Song list with four statuses (want to learn, learning, can play, performance ready); a board with all four columns on desktop.
- Progress screen: day streak, total hours, this week, recent sessions.

### Data Model (in the database, not yet used by the interface)
- Learning content: skills, prerequisites (required vs recommended), skill relations, exercises, assessment criteria, lessons, lesson skills, lesson components (D-017).
- Results: mastery with evidence source, confidence and review fields; an evidence log; assessments; lesson attempts; curricula (D-008).
- Guitarist profile fields for onboarding (D-014) and gear.
- Align integration tables (status, server-only tokens, sync outbox). Not connected.

### Founder Data
- Gibson's profile filled in from the master brief as self-reported (D-015).

---

## In Progress (Engineering, No Spec Needed)

Foundation and reusable components that don't depend on educational decisions:

- **Password reset**: "Forgot password" on sign in, and a page to set a new password from the email link. Needs Q-005 answered to work outside local development.
- **Music theory engine** (`src/lib/music/`): deterministic intervals, scales, chords, keys and transposition with tests. The brief requires verifiable theory calculations (sections 12, 16, 19).
- **Fretboard Explorer**: notes, intervals, scales and chords on the neck, with note names or interval labels. Replaces Note Finder.
- **Metronome**: tempo, time signature, subdivisions, accents, tap tempo, visual beat.
- **Configurable lesson building blocks**: wrapping the fretboard, chord view and tab player so a lesson can configure them with data (brief section 14). The component list is waiting on Q-009.

---

## Waiting on Education Specs

| Area | Question | What is ready on the engineering side |
| --- | --- | --- |
| Mastery levels, criteria, dimensions | Q-001 | Mastery and evidence tables, server-only writes |
| Retention and review scheduling | Q-002 | Review fields on mastery, no defaults |
| Onboarding and baseline assessments | Q-003 | Profile fields; placeholder ability list |
| Assessment methods given the headphone-amp setup | Q-006 | Pitch detection on phone and browser |
| Daily session structure | Q-008 | Practice sessions and items (with a `block` field) |
| First lesson and its components | Q-009 | Lesson tables, fretboard, chords, tab player, tuner |
| Progress metrics | Q-010 | Session history, mastery and evidence tables |
| Skill graph content | (spec not yet requested) | Skills, prerequisites, relations tables |
| AI teacher instructions and boundaries | (spec not yet requested) | Nothing yet; will be a server-side function |
| Curriculum generation rules | (spec not yet requested) | Curricula and curriculum items tables |

---

## Known Technical Limitations

| Limitation | Impact | Status |
| --- | --- | --- |
| Shared sign-in pool with other apps in the Detail Pro project | Other apps' users can sign into tabr; auth emails use shared templates | Accepted for now, Q-004 |
| Password reset links follow the project's allowed redirect addresses | Reset links go to another app until tabr's address is allowed | Q-005 |
| Mic can't hear a guitar played through a headphone amp | Microphone assessments won't work for the founder's setup | Q-006 |
| Nothing has run on a physical iPhone yet | Audio session, mic permission and latency are unverified on device | Needs an Apple developer account or a development build |
| Browser tuner verified by build only | Pitch detection math is tested; real-guitar accuracy in a browser hasn't been measured | Test with a guitar |
| react-native-audio-api has no recorder on the web | Browser mic uses a separate implementation (`usePitch.web.ts`) | Handled (D-012) |
| React Native `Alert` does nothing on the web | Confirmations use `src/lib/confirm.ts` | Handled (D-013) |
| Tab Player reads text tab only | No timing, measures or Guitar Pro / MusicXML import yet (brief section 17) | Later |

---

## Environments

| Thing | Where |
| --- | --- |
| Code | github.com/gibsonthompson/tabr, branch `main` |
| Web | Vercel, deploys on push to `main` |
| Database and auth | Supabase project Detail Pro (`szdrpdjyordvqtkuuazh`) |
| Migrations | `supabase/migrations/`, applied in filename order |
| Edge Functions | `supabase/functions/` (`tabr-delete-account`) |

## Running Locally

```
npm install
cp .env.example .env   # add the Supabase URL and publishable key
npx expo start --web   # desktop browser
npx expo start         # phone via a development build
```

Checks before every push: `npx tsc --noEmit` and `npx expo lint`.
