# Guitar Learning Application — Initial Development Brief

## Product Vision

Build a standalone, native-first, AI-powered guitar learning application designed for eventual public distribution through the Apple App Store.

The application should function as an intelligent personal guitar teacher, providing researched and personalized learning curricula, guided daily practice, interactive educational tools, skill assessments and adaptive progression.

It must be independently functional while supporting optional integration with Align, a personal life operating system.

## Technical Architecture

Use the following proposed stack, validating compatibility before implementation:

- React Native with Expo
- TypeScript
- Expo Router
- Supabase and PostgreSQL
- Supabase Authentication
- Server-side OpenAI API integration
- React Native SVG for initial fretboard rendering
- Native audio processing where necessary
- Expo EAS for development and production builds
- Versioned REST API for external integrations
- RevenueCat and StoreKit for future subscriptions

Prioritize iOS while preserving Android compatibility.

Do not build a web-only application with the intention of wrapping it later.

## Core Product Architecture

The application consists of the following systems:

1. Personal guitarist knowledge base.
2. Universal researched guitar knowledge base.
3. Skill dependency graph.
4. Personalized and adaptive curriculum engine.
5. Interactive lesson engine.
6. Guided daily practice system.
7. Guitar tools and visual learning components.
8. Skill assessments and mastery tracking.
9. Context-aware AI guitar teacher.
10. Song repertoire and interactive tablature system.
11. Optional Align integration.

## Personalization

The guitarist profile must contain:

- Current ability and experience.
- Technical skills.
- Theoretical knowledge.
- Preferred genres and artists.
- Existing repertoire.
- Equipment.
- Learning preferences.
- Musical ambitions.
- Practice frequency and duration.
- Knowledge gaps.
- Assessment history.
- Individual skill mastery.

Do not reduce personalization to a single beginner, intermediate or advanced classification.

## Learning Engine

The curriculum must be generated using a structured and researched knowledge base, not solely free-form AI output.

Each skill should have prerequisite relationships, learning objectives, explanations, original exercises, musical applications, assessment criteria and common mistakes.

The learning engine must distinguish between exposure, recognition, independent demonstration, practical application and internalized mastery.

Progression should respond to demonstrated proficiency rather than lesson completion alone.

## Primary Navigation

- Today
- Learn
- Tools
- Songs
- Progress

## Interactive Tools

Plan for:

- Chromatic tuner with alternate tuning support.
- Metronome.
- Interactive fretboard.
- Chord and scale visualization.
- Note and interval highlighting.
- Chord-tone overlays.
- Interactive tablature.
- Adjustable playback tempo.
- Section looping.
- Synchronized fretboard playback.
- Original backing tracks and exercises.

Architect interactive components so they can be embedded directly within lessons.

## Future Song Intelligence

Reserve architectural support for authorized audio imports, source separation, pitch detection, note transcription, plausible string and fret assignment, tablature editing, and synchronized graphical playback.

Do not attempt full commercial-song transcription in the initial development phase.

## Align Integration

The guitar application must maintain independent user accounts and data.

Align integration must be optional, using secure account authorization and backend API communication.

Support importing relevant guitar goals, milestones and practice availability.

Support exporting completed practice sessions, actual duration, skill assessments, milestone progress and recommended plan adjustments.

Use stable external identifiers, scoped authorization, versioned event schemas, idempotency and retryable synchronization.

Align must not be required for registration or core functionality.

## App Store Readiness

Design from the beginning for native iOS distribution.

Account for microphone permissions, privacy disclosures, account deletion, accessible interfaces, secure credential handling and compliant subscription billing.

Keep AI service credentials and privileged database credentials exclusively on the backend.

## Initial Development Assignment

Do not implement the entire product yet.

First:

1. Inspect the available development environment and validate the proposed stack.
2. Create the application repository and project structure.
3. Establish the Expo application and navigation.
4. Establish the Supabase development environment.
5. Design the database schema and row-level security policies.
6. Establish architectural boundaries between learning content, personal user data, curriculum generation and integrations.
7. Implement the initial authentication flow.
8. Build an initial native iOS development version.
9. Provide a technical architecture summary, implementation decisions and proposed next development steps.

Use a temporary product name and avoid spending time on final branding.

Do not fabricate lesson content, assessment results, integration endpoints or functioning features. Clearly identify unresolved technical dependencies.

The first deliverable is a functioning, extensible mobile application foundation running on a physical iPhone.