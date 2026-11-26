# tabr Documentation

This folder is the shared source of truth for tabr. Neither AI conversation is. If something was decided, specified or learned and it is not written here, it does not exist yet.

## Who Does What

| Side | Owns | Writes to |
| --- | --- | --- |
| **Education** (ChatGPT conversation) | Guitar pedagogy and learning science research, skill graph, mastery framework, assessment design, curriculum generation rules, lesson design, AI teacher instructions | `education/`, `handoffs/` |
| **Engineering** (Claude conversation) | Software architecture, implementation, UI, infrastructure, technical validation, deployment | `implementation/`, `STATUS.md`, `DECISIONS.md`, `QUESTIONS.md`, code |
| **Gibson** (founder) | Approves specs, resolves open questions, final say on product decisions, moves documents between the two conversations | Approval lines in any document |

Engineering does **not** finalize educational progression, mastery criteria, curriculum generation rules or teaching methods before the matching education spec is approved. Until then, anything in those areas is built as replaceable structure and marked **Provisional** in `DECISIONS.md`.

Engineering treats approved specs as requirements, and pushes back in writing when a spec runs into a technical limitation or an architectural problem (see "Challenging a Spec" below).

## Folder Map

| Path | What lives there |
| --- | --- |
| `context/` | Founding briefs, saved verbatim. Background, not requirements. |
| `education/` | Educational specifications (skill graph, mastery, curriculum rules, lesson specs, AI teacher). Requirements once approved. |
| `handoffs/` | Implementation handoffs from the education side: "build this". One file per handoff. |
| `implementation/` | Implementation reports from engineering: what was built for a handoff, deviations, limitations, open questions. One per handoff. |
| `STATUS.md` | Current state of the app: built, in progress, waiting on specs, known limitations. |
| `DECISIONS.md` | Log of significant architectural and product decisions, including provisional ones. |
| `QUESTIONS.md` | Open questions, who needs to answer them, and their resolution. |

## The Loop

1. **Education writes a spec or handoff.** Gibson saves it to `education/` or `handoffs/` using the naming and header rules in those folders' READMEs, with status `Draft` or `Proposed`.
2. **Gibson approves it.** The status changes to `Approved` with a date. Only approved documents are requirements.
3. **Engineering reviews it** against the codebase and records the review at the top of an implementation report in `implementation/`: accepted as written, accepted with changes, or blocked. Concerns go to `QUESTIONS.md`.
4. **Engineering implements it**, then completes the implementation report: what was built, where it lives, deviations, technical limitations, test results, follow-ups.
5. **Engineering updates the shared files:** `STATUS.md` always; `DECISIONS.md` when a significant choice was made; `QUESTIONS.md` when something is unresolved.
6. **Education reads the report** (Gibson brings it over) before writing the next spec, so specs build on what actually exists rather than on what was planned.

## Challenging a Spec

When an approved spec can't or shouldn't be built as written, engineering:

1. Does not silently change it.
2. Adds a question to `QUESTIONS.md` addressed to `Education` or `Gibson`, stating the limitation, the evidence (measurement, API constraint, platform rule) and at least one alternative.
3. Builds the unaffected parts, and marks the affected part `Blocked` in the implementation report.
4. Only implements an alternative once the question is resolved or Gibson approves the deviation, and records it in `DECISIONS.md`.

## Document Status Values

Used in the header of every spec, handoff and report:

- `Draft`: being written, not ready to review
- `Proposed`: ready for review, not yet a requirement
- `Approved`: a requirement (record who approved and when)
- `Accepted with changes` / `Blocked`: engineering's review outcome (reports only)
- `Implemented`: built, with a linked implementation report
- `Superseded`: replaced, with a link to what replaced it

## Numbering

| Prefix | Document | Example |
| --- | --- | --- |
| `EDU-###` | Education spec | `education/EDU-001-skill-graph.md` |
| `HO-###` | Implementation handoff | `handoffs/HO-001-first-lesson.md` |
| `IR-###` | Implementation report for a handoff (same number as the handoff) | `implementation/IR-001-first-lesson.md` |
| `IR-F###` | Implementation report for foundation work with no handoff | `implementation/IR-F001-foundation.md` |
| `D-###` | Decision | in `DECISIONS.md` |
| `Q-###` | Open question | in `QUESTIONS.md` |

Numbers are never reused. Superseded documents stay in place with a link forward.
