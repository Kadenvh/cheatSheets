---
name: plan-validator
description: "Audit plans for completeness, identify gaps, optionally spawn research agents. Use --research to auto-investigate unknowns."
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
---

# Plan Validator

Audit project plans and design documents for completeness, identify gaps and unknowns, and optionally spawn research agents to investigate them.

## Instructions

1. Load the plan-validator prompt:
   - Read `.claude/.prompts/plan-validator.md` (relative to project root)
2. Follow its protocol — discovers plans, runs completeness checks, classifies gaps, optionally delegates research.

## Modes

- **`/plan-validator`** — Audit all active plans in `plans/`, report only
- **`/plan-validator --research`** — Audit + spawn agents per gap category
- **`/plan-validator --curate`** — Audit + check cross-references + identify stale plans + surface plans relevant to current work
- **`/plan-validator <path>`** — Audit a specific plan file

## Key Rules

- **Read-only by default.** Never modify plan files without `--curate` flag. Report findings only.
- **Classify gaps.** Don't just list what's missing — categorize as technical, dependency, design, or evidence gaps.
- **Cross-reference validation.** Check that plans reference each other where dependencies exist. Flag orphaned plans with no cross-refs.
- **Staleness detection.** Flag plans not updated in 5+ sessions. All plans in `plans/` should be active — stale plans should move to `plans/archive/<event>/` with a receipt.
- **Consolidation pressure.** Projects should aim for a single canonical plan. If 2+ active plans exist, recommend consolidation (the Phase 4 validator warns at ≥2, fails at ≥4).
- **Agent fallback.** When Agent tool is unavailable, research inline sequentially. Note this in the output.

## Plan Conventions

Plans in `plans/` (project root) should follow this structure:
- **Header:** Title, created date, status (Active/Curating/Stabilized/Reference), updated date, dependencies
- **Known Items:** Checkboxed list of work items, grouped by source/phase
- **Open Questions:** Unresolved design decisions
- **Sessions Contributing:** Which sessions touched this plan and what they added
- **Cross-References:** Links to related plans, brain.db entries, sessions/ notes, research entries

## Inline Fallback (if prompt file not found)

If `.claude/.prompts/plan-validator.md` cannot be located:

1. **Discover plans.** Glob `plans/*.md` (project root, excluding `plans/archive/`). List what was found.
2. **Check each plan.** For each file: does it have a problem statement? Technical approach? Risks section? Next actions?
3. **Classify gaps.** Group missing elements into: technical unknowns, dependency unknowns, design unknowns, missing evidence.
4. **Report.** PASS (all checks pass), PARTIAL (has problem + approach but missing secondary), FAIL (missing problem statement or technical approach).

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "plan-validator: <what failed>" --type investigation --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.
