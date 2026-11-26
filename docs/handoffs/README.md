# Implementation Handoffs

A handoff turns approved education specs into a concrete build request: "build this, this way, and this is how we'll know it works."

## File Naming

`HO-###-short-slug.md`, for example `HO-001-first-pentatonic-lesson.md`. Copy `_TEMPLATE.md` to start one.

## Rules

- A handoff references the approved specs it implements (`EDU-###`). It should not introduce new educational rules that aren't in a spec; if it has to, those rules need approval too.
- Engineering responds with an implementation report in `../implementation/IR-###-same-slug.md`, using the same number.
- The handoff file is not edited after approval except to update its status line and link the report. Changes go in a new handoff that supersedes it.
