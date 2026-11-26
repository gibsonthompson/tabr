# Education Specifications

Specs written by the education side. Once **Approved**, they are requirements for engineering.

## File Naming

`EDU-###-short-slug.md`, for example `EDU-001-skill-graph.md`. Numbers are never reused.

## Required Header

Every spec starts with this block so engineering can tell what it is and whether it can be built yet:

```
# EDU-###: Title

| Field | Value |
| --- | --- |
| Status | Draft / Proposed / Approved / Superseded |
| Approved by | Gibson, YYYY-MM-DD (blank until approved) |
| Version | 1 |
| Supersedes | EDU-### or none |
| Depends on | EDU-### list, or none |
| Evidence level | Which claims are established research, reasonable inference, or untested hypothesis |
```

## What a Spec Should Contain

Engineering can only build what is stated precisely. A spec is ready when it gives:

1. **Requirements**: rules the software must follow, written so they can be tested ("a skill reaches Demonstrated only after two passing assessments at least 24 hours apart"), not descriptions of intent.
2. **Data**: the exact objects, fields, allowed values and examples (skills, prerequisites, criteria, intervals).
3. **Decision logic**: what is deterministic (rules engine) and what is left to the AI teacher, with the inputs each one receives.
4. **Edge cases**: what happens with missing data, failed assessments, skipped days and conflicting evidence.
5. **Sources**: references for research-backed claims, kept separate from product hypotheses.
6. **Acceptance criteria**: how to tell the implementation is correct.

## Specs Engineering Is Waiting On

Tracked in `../STATUS.md` under "Waiting on Education Specs".
