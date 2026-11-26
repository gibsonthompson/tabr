# Open Questions

Questions that block or shape work. Each has an owner who can answer it. When answered, record the answer and date and move it to "Resolved" at the bottom; never delete.

**Owner:** `Education` (ChatGPT conversation) · `Gibson` · `Engineering`

---

## Open

### Q-001: Mastery framework details
- **Owner:** Education · **Raised:** 2026-11-25 · **Blocks:** mastery updates, Learn and Progress skill views
- The database has five levels (D-009). Needed from a spec: final level names and definitions; the criteria to reach each level; which assessment dimensions apply to which kinds of skill (knowledge, technique, ear, application, creative, or another set); how evidence from different sources combines into a level and a confidence; and when a level can drop.

### Q-002: Retention and review scheduling
- **Owner:** Education · **Raised:** 2026-11-25 · **Blocks:** review scheduling, "review due" on Today
- Needed: when a skill first becomes due for review, how intervals grow after success and shrink after a lapse, whether the spacing differs by skill type, and what a retention check consists of. The database has `next_review_at`, `review_interval_days`, `successful_reviews` and `lapses` ready, with no defaults.

### Q-003: Onboarding questions and baseline assessments
- **Owner:** Education · **Raised:** 2026-11-25 · **Blocks:** onboarding flow
- Engineering drafted a placeholder ability checklist and goal list (`src/lib/guitarist.ts`, D-014) only so the founder profile could be stored. Needed: the onboarding questions and their order, the ability taxonomy (ideally mapped to skill graph ids), which baseline diagnostics to offer, and how answers seed the first curriculum. Engineering will build the onboarding interface once this lands.

### Q-004: Separate Supabase project before public release?
- **Owner:** Gibson · **Raised:** 2026-11-24
- Sharing the Detail Pro project (D-002) means shared logins, shared auth email templates and shared redirect settings with your other apps. Fine for building; worth deciding before strangers sign up. Moving later is a data migration plus re-login for users.

### Q-005: Password reset needs tabr's web address allowed in Supabase
- **Owner:** Gibson · **Raised:** 2026-11-25 · **Blocks:** password reset
- Reset links only return to addresses on the project's allow list (Supabase dashboard, Authentication, URL Configuration, Redirect URLs). tabr's Vercel address and `http://localhost:8081` need to be added, or reset links go to the project's default site (another app). Engineering needs the Vercel address.

### Q-006: How playing gets assessed with a headphone amp
- **Owner:** Education, with Gibson · **Raised:** 2026-11-25 · **Blocks:** any microphone-based assessment
- The founder plays through a Mustang Micro into headphones, so the phone or laptop mic only hears the unplugged strings. Tuning probably works close to the mic (not yet measured); judging notes, timing or chords will not be reliable. Options: (a) an audio interface into the computer or phone, (b) self-confirmed assessments in v1, as the brief allows, (c) measured tests of what the mic picks up from an unplugged Strat. Which methods should early assessments use?

### Q-007: Desktop-first effect on lesson and assessment design
- **Owner:** Education · **Raised:** 2026-11-25
- The founder will mostly use tabr on a computer (D-006). Lessons should assume mouse and keyboard, a bigger screen beside the guitar, and the computer's microphone. Specs written for phone interactions (swipes, holding the phone) should say so, or work both ways.

### Q-008: Daily session structure
- **Owner:** Education · **Raised:** 2026-11-25 · **Blocks:** Today screen rework
- The brief gives a 45-minute starting template and says the engine should vary it. Needed: the rules for building a session (blocks, durations, selection by objective, review placement) and what Today shows when no curriculum exists yet. Today currently shows a practice timer, goal ring and weekly chart.

### Q-009: First lesson components
- **Owner:** Education · **Raised:** 2026-11-25
- The brief lists about 20 component types. Which ones does the first lesson (the minor pentatonic lesson, brief section 15) need, with what configuration? Engineering will build those first as reusable components. The fretboard, chord view, tab player, tuner and pitch detection already exist and can be wrapped as components.

### Q-010: Progress metrics
- **Owner:** Education · **Raised:** 2026-11-25
- The brief says streaks should not be the main measure (section 21), but the current Progress screen leads with a day streak. Needed: which metrics to show and how to separate activity, knowledge, physical ability, application, retention and creative development. Until then engineering will avoid adding new streak-style metrics.

---

## Resolved

None yet.
