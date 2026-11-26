# Implementation Reports

Engineering's record of what was actually built. The education side reads these before writing the next spec, so they describe reality, including what didn't work.

## File Naming

`IR-###-short-slug.md`, with the same number as the handoff it answers. Foundation work with no handoff uses its own series, `IR-F###-short-slug.md`, so handoff numbers stay aligned. Copy `_TEMPLATE.md` to start one.

## When to Write One

- For every handoff, before starting work (Review section) and after finishing (everything else).
- For significant engineering work with no handoff (foundation, infrastructure), as `IR-F###` with `Implements: none (foundation)`.

## What Must Be Recorded

- **Deviations**: anything built differently from the spec, why, and who approved it.
- **Technical limitations**: what the platform, hardware or a library could not do, with evidence (a measurement, an error, a documented constraint), not guesses.
- **Unverified parts**: anything not tested on the real target (for example "not yet run on a physical iPhone").
- **Open questions**: copied to `../QUESTIONS.md` with a `Q-###` number so they're tracked in one place.
