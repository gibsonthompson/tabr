# Decision Log

Significant architectural and product decisions. Newest at the bottom. Entries are never deleted; a reversed decision gets a new entry that supersedes it.

**Status values:** `Accepted` (in force) · `Provisional` (placeholder until an approved spec or further validation, safe to replace) · `Superseded by D-###`

**Area:** `Engineering` decisions are engineering's to make. `Education` decisions belong to the education side; engineering may only record them as Provisional until a spec is approved. `Product` decisions are Gibson's.

---

## D-001: Stack

- **Date:** 2026-11-24 · **Area:** Engineering · **Status:** Accepted
- **Decision:** Expo SDK 58 (React Native 0.88, React 19.3), TypeScript, Expo Router (`src/app`), Supabase (Postgres, Auth, Edge Functions), react-native-svg for drawing, react-native-audio-api for microphone input on phones.
- **Context:** Initial development brief (`context/01`) and master brief (`context/02`, section 23).
- **Consequences:** One codebase for iPhone, Android and web. Expo APIs change every SDK, so `AGENTS.md` requires checking versioned docs before using one.

## D-002: Shared Detail Pro Supabase Project

- **Date:** 2026-11-24 · **Area:** Product · **Status:** Accepted
- **Decision:** tabr uses Gibson's existing Detail Pro Supabase project (`szdrpdjyordvqtkuuazh`) instead of its own. Every tabr object is prefixed `tabr_`.
- **Context:** Gibson's call. He will enable RLS on other apps' tables himself.
- **Consequences:**
  - The sign-in pool is shared with other apps in that project. Anyone with a login from those apps can sign into tabr, and tabr signups land in the same user list. Each user still only sees their own tabr rows.
  - Auth emails (confirmation, password reset) use that project's shared templates and redirect settings.
  - tabr profiles are created by the app on sign-in, not by a database trigger (D-010).
  - Revisit before a public release: a separate project would give tabr its own auth branding and isolation (see Q-004).

## D-003: Repository Replaced the Web Prototype

- **Date:** 2026-11-24 · **Area:** Product · **Status:** Accepted
- **Decision:** `gibsonthompson/tabr` was fully replaced with the native app. The Vite prototype lives only in git history (before commit `b4006b3`). Its verified chord shapes, tunings and tab parser were ported to `src/lib/music/`.

## D-004: Working Name "tabr"

- **Date:** 2026-11-24 · **Area:** Product · **Status:** Accepted

## D-005: Visual Identity, Cherry Sunburst Les Paul

- **Date:** 2026-11-24 · **Area:** Product · **Status:** Accepted
- **Decision:** Palette drawn from a cherry sunburst Les Paul (dark cherry base, honey sunburst glow, cream binding text, nickel), with new values rather than the prototype's. Fonts: Bricolage Grotesque for display and headings, JetBrains Mono for tab and numbers. Finger colors: honey (index), cherry (middle), nickel (ring), cream (pinky). Tokens live in `src/lib/theme.ts`.
- **Context:** Gibson rejected a green redesign.

## D-006: Desktop-First, Web Deployed on Vercel

- **Date:** 2026-11-24 · **Area:** Product · **Status:** Accepted
- **Decision:** Desktop web is a primary target, at least as important as the phone. At 960px and wider the app uses a sidebar and multi-column layouts; narrower widths and native phones keep single-column layouts. The repo auto-deploys to Vercel on push to `main` (`vercel.json` builds the Expo web export).
- **Context:** Gibson expects to use tabr on desktop more than on the phone. This changes the briefs' iPhone-first framing (`context/02`, section 23), which the education side should know when designing interactive and audio experiences.
- **Consequences:** Every screen must work with mouse and keyboard. Features built on phone-only APIs need a browser version (D-012, D-013).

## D-007: Data Boundaries and Row Level Security

- **Date:** 2026-11-24 · **Area:** Engineering · **Status:** Accepted
- **Decision:** Four kinds of data with different write rules:
  1. **Learning content** (skills, prerequisites, exercises, criteria, lessons, components): shared, read-only to users, published rows only, written by the server.
  2. **Personal data** (profile, gear, songs, practice sessions and items, lesson attempts): the owner reads and writes their own rows.
  3. **Results** (mastery, assessments, curricula): the owner can read; only the server writes. A student can never award themselves mastery.
  4. **Integrations** (Align tokens, sync outbox): server only.
- **Consequences:** Grading, mastery updates and curriculum generation must run server-side (Edge Functions), not in the app.

## D-008: Mastery Moves Only Through Evidence, With Its Source Recorded

- **Date:** 2026-11-25 · **Area:** Engineering (structure only) · **Status:** Accepted
- **Decision:** Every mastery change is backed by a timestamped row in `tabr_mastery_evidence` recording its source: `verified` (assessed), `self_reported`, or `ai_inferred`, plus confidence and detail. `tabr_skill_mastery` stores the current level, its source, confidence and next review date. Students may only file `self_reported` evidence.
- **Context:** Master brief sections 10 and 11 require distinguishing verified, self-reported and AI-inferred ability, and tracking confidence, evidence, last assessment and retention.
- **Note:** This is structure only. **How** evidence turns into a level is an education decision (D-009).

## D-009: Mastery Levels, Criteria and Review Spacing

- **Date:** 2026-11-25 · **Area:** Education · **Status:** Provisional
- **Decision:** The database stores five levels (`exposure`, `recognition`, `demonstration`, `application`, `mastery`) matching the brief's proposed framework (Introduced, Recognized, Demonstrated, Applied, Internalized). Level names, definitions, criteria, assessment dimensions and review spacing are **not** finalized. No default review intervals, component catalog or dimension list is enforced (migration `20261125000902`).
- **Waiting on:** mastery and assessment spec, retention scheduling spec.

## D-010: tabr Profile Created by the App on Sign-In

- **Date:** 2026-11-24 · **Area:** Engineering · **Status:** Accepted
- **Decision:** `src/lib/auth.tsx` upserts an empty `tabr_profiles` row on sign-in. No trigger on `auth.users`, because that table is shared and already has another app's trigger.

## D-011: Account Deletion in a Shared Sign-In Pool

- **Date:** 2026-11-24 · **Area:** Engineering · **Status:** Accepted
- **Decision:** The `tabr-delete-account` Edge Function deletes every tabr row for the user, then deletes the login only if no other app in the project uses it (checks Forward Fitness, businesses and restaurant memberships). Updated 2026-11-25 to include `tabr_lesson_attempts` and `tabr_mastery_evidence`.
- **Consequences:** Every new per-user tabr table must be added to the function's table list.

## D-012: Pitch Detection on the Device

- **Date:** 2026-11-24 · **Area:** Engineering · **Status:** Accepted
- **Decision:** McLeod pitch method (`src/lib/music/pitch.ts`), tested to 0.01 Hz on every tuning at 1 to 7 ms per frame. Phones read the mic through react-native-audio-api; browsers through the Web Audio API (`usePitch.web.ts`), because the library has no recorder on the web. Audio is analyzed in memory and never stored or uploaded.

## D-013: Confirmations That Work in Browsers

- **Date:** 2026-11-24 · **Area:** Engineering · **Status:** Accepted
- **Decision:** React Native's `Alert` does nothing on the web, so all yes/no confirmations go through `src/lib/confirm.ts` (native alert on phones, browser confirm on the web).

## D-014: Self-Reported Guitarist Profile

- **Date:** 2026-11-25 · **Area:** Education (content) / Engineering (structure) · **Status:** Provisional
- **Decision:** `tabr_profiles` stores the onboarding information listed in master brief section 10: self-assessed level, self-reported abilities, favorite songs, known riffs, musical identity, goals and main goal, frustrations, previous learning, performance experience, how the student hears their guitar, and learning preferences. Gear goes in `tabr_equipment`.
- **Provisional part:** The ability checklist, goal list and option wording in `src/lib/guitarist.ts` were drafted by engineering from the brief as placeholders. The onboarding questions, ability taxonomy and how answers seed the curriculum need an education spec.
- **Waiting on:** onboarding and baseline assessment spec.

## D-015: Founder Profile Seeded From the Master Brief

- **Date:** 2026-11-25 · **Area:** Product · **Status:** Accepted
- **Decision:** Gibson's profile (`gibsonthompson1@gmail.com`) was filled in from master brief section 3: advanced beginner, 6 days x 45 minutes, genres, artists, songs and riffs, goals (main goal: jam with others), frustrations, headphone amp setup, learning preferences, and gear (Stratocaster, Mustang Micro, headphones, GarageBand). Abilities were stored as `self_reported`, never as evidence of mastery.
- **Consequences:** Uses the provisional ability keys from D-014. If the education spec changes the taxonomy, the seed must be mapped to the new keys.

## D-016: Two-Conversation Workflow, Repository as Source of Truth

- **Date:** 2026-11-25 · **Area:** Product · **Status:** Accepted
- **Decision:** Education research and specs come from a separate ChatGPT conversation; engineering is done in a Claude conversation. The `docs/` folder is the shared source of truth. Engineering treats approved education specs as requirements, challenges them in writing when there are technical concerns, and does not finalize educational progression, mastery criteria, curriculum rules or teaching methods ahead of a spec. Process: `docs/README.md`.
- **Consequences:** Values engineering had already fixed ahead of specs were unlocked and recorded as Provisional (D-009, D-014).

## D-017: Learning Content Structure

- **Date:** 2026-11-25 · **Area:** Engineering (structure) · **Status:** Provisional
- **Decision:** Added tables for lessons (`tabr_lessons`), the skills each lesson targets (`tabr_lesson_skills`), ordered lesson components with free-form configuration (`tabr_lesson_components`), per-student lesson attempts (`tabr_lesson_attempts`) and skill relations (`tabr_skill_relations`). Skills gained difficulty, assessment dimensions, mastery criteria, remediation and genre applications fields. Prerequisites gained `required` vs `recommended`.
- **Context:** Master brief sections 9, 14 and 24.
- **Provisional because:** The shape may change once the skill-definition and lesson specs arrive. The tables hold no content yet, so changing them is cheap.
