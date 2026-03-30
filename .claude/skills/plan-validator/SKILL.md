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
   - Read `.prompts/plan-validator.md` (relative to project root)
2. Follow its protocol — discovers plans, runs completeness checks, classifies gaps, optionally delegates research.

## Modes

- **`/plan-validator`** — Audit all reachable plans, report only
- **`/plan-validator --research`** — Audit + spawn agents per gap category
- **`/plan-validator <path>`** — Audit a specific plan file
- **`/plan-validator --vault`** — Include Obsidian vault plans

## Key Rules

- **Read-only.** Never modify plan files. Report findings only.
- **Classify gaps.** Don't just list what's missing — categorize as technical, dependency, design, or evidence gaps.
- **Agent fallback.** When Agent tool is unavailable, research inline sequentially. Note this in the output.
- **Vault path resolution.** Use brain.db identity (`vault.path`) first, then environment, then platform defaults.

## Inline Fallback (if prompt file not found)

If `.prompts/plan-validator.md` cannot be located:

1. **Discover plans.** Glob `documentation/plans/*.md` and any vault paths. List what was found.
2. **Check each plan.** For each file: does it have a problem statement? Technical approach? Risks section? Next actions?
3. **Classify gaps.** Group missing elements into: technical unknowns, dependency unknowns, design unknowns, missing evidence.
4. **Report.** PASS (all checks pass), PARTIAL (has problem + approach but missing secondary), FAIL (missing problem statement or technical approach).
