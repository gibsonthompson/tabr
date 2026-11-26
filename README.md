# tabr

Guitar learning app (working name). Desktop-first on the web, plus iPhone and Android from the same code. Expo SDK 58, React Native 0.88, TypeScript, Expo Router, Supabase.

## Start Here

The `docs/` folder is the source of truth for this project:

- `docs/README.md`: how the education and engineering conversations work together
- `docs/STATUS.md`: what's built, in progress and waiting on specs
- `docs/DECISIONS.md`: architectural and product decisions
- `docs/QUESTIONS.md`: open questions
- `docs/context/`: the founding briefs, verbatim

The earlier Vite web prototype lives in git history (commit `5d2bf82`). Its tab parser, chord library and tuner logic were ported into `src/lib/music`.

## Run it on your iPhone

The tuner uses a native audio module, so the app runs as a development build, not in Expo Go.

1. `npm install`
2. `cp .env.example .env`, then paste the publishable key from Supabase (Detail Pro > Project Settings > API).
3. Plug in your iPhone and pick one route:
   - **Free Apple ID + Xcode:** `npm run ios:device`. Builds on your Mac and installs on the phone. A free Apple ID's signing lasts 7 days, then you rebuild.
   - **Apple Developer Program ($99/yr), no Xcode needed:** `npx eas-cli@latest build --profile development --platform ios`, install from the link, then `npm start` and open the app.
4. iPhone setting: Settings > Privacy & Security > Developer Mode must be on.

## Layout

```
src/app/                 screens (Expo Router)
  _layout.tsx            session gate: signed out -> sign-in, signed in -> tabs
  sign-in.tsx
  account.tsx            profile, sign out, delete account
  (tabs)/                Today, Learn, Tools, Songs, Progress (native iOS tab bar)
  (tabs)/tools/          Tuner, Chords, Tab Player, Note Finder
src/components/          Fretboard (player's-eye SVG), shared UI
src/lib/music/           theory, chords, tunings, tab parser, pitch detection
src/lib/                 supabase client, auth, row types, theme
supabase/migrations/     tabr_ schema as applied to Detail Pro
supabase/functions/      tabr-delete-account (deployed)
```

## Data boundaries (Detail Pro, all tables prefixed `tabr_`)

| Area | Tables | Who writes |
| --- | --- | --- |
| Learning content | skills, skill_prerequisites, skill_relations, exercises, assessment_criteria, lessons, lesson_skills, lesson_components | Server only. Users read published rows. |
| Personal data | profiles, equipment, repertoire, practice_sessions, practice_items, lesson_attempts | The user, own rows only |
| Progress evidence | skill_mastery, mastery_evidence, assessments | Server only, except self-reported evidence. Users read their own. Mastery can't be self-awarded. |
| Curriculum | curricula, curriculum_items | Server only. Users read their own. |
| Integrations | integrations (status), integration_tokens, sync_events | Server only. Tokens and the sync outbox are never readable by the app. |

The sign-in pool is shared with other apps in Detail Pro. tabr creates its profile row from the app on first sign-in, not with a database trigger. Account deletion always removes every tabr row. It removes the login itself only when no other app uses that account.

## Secrets

Only the Supabase URL and publishable key ship in the app. The service role key and the future OpenAI key live only in Supabase Edge Function secrets.
