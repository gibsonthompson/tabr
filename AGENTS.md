This is an Expo/React Native application for desktop web, iPhone and Android. Desktop web is a primary target (docs/DECISIONS.md, D-006): build every screen to work at desktop width with mouse and keyboard, and keep the phone layout working below 960px.

## Project Workflow (read first)

`docs/` is the source of truth for this project, not any AI conversation. Before starting work:

1. Read `docs/README.md` (how the education and engineering sides work together), `docs/STATUS.md`, `docs/DECISIONS.md` and `docs/QUESTIONS.md`.
2. Educational decisions (skill progression, mastery criteria, assessment, curriculum rules, teaching methods, review spacing, lesson content) come from approved specs in `docs/education/` and handoffs in `docs/handoffs/`. Do not finalize them in code ahead of a spec. If something is needed to unblock engineering, build it as replaceable structure and log it as Provisional in `docs/DECISIONS.md`.
3. Treat approved specs as requirements. When one conflicts with a technical limitation or the architecture, raise it in `docs/QUESTIONS.md` instead of silently changing it.
4. After implementing anything significant: write or update an implementation report in `docs/implementation/`, update `docs/STATUS.md`, and log significant decisions in `docs/DECISIONS.md`, in the same commit as the code.
5. Every new per-user `tabr_` table must also be added to `supabase/functions/tabr-delete-account/index.ts`.
6. Use `src/lib/confirm.ts` for confirmations (React Native `Alert` does nothing on the web).

## Expo has changed: do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt: an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add: resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/`: every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`): no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand: configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
