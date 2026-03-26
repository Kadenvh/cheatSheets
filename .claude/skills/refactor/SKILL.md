---
name: refactor
description: "Structured code improvement with behavior preservation — extract, rename, restructure, simplify, or migrate patterns"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Refactor — Structured Code Improvement

Improve code quality while preserving all existing behavior. Zero regressions is the hard constraint.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/refactor.md`.

### Protocol
   - Define scope and type (extract, rename, restructure, simplify, pattern migration)
   - Verify safety net (tests exist and pass — if not, write characterization tests first)
   - Execute in small steps (one change, test, commit, repeat)
   - Verify results (behavior preserved, quality improved with measured delta)

## Key Rules

- **Never refactor without tests.** Write characterization tests first if none exist.
- **Refactoring and feature work don't mix.** Separate commits, separate concerns.
- **Small steps > big leaps.** Each commit leaves the code working.
- **Measure the improvement.** Before/after delta or it didn't happen.

## Full Protocol

Detailed steps:

1. **Define scope.** What are you changing? Why? What's explicitly out of scope?
2. **Safety net.** Run existing tests. If none exist, write characterization tests that capture current behavior before changing anything.
3. **Small steps.** Make one change → run tests → commit if green → repeat. Never make large sweeping changes in one commit.
4. **Cross-cutting changes.** Change the definition first, update consumers one at a time, test after each.
5. **Pattern migration.** Support both patterns simultaneously (adapter/bridge), migrate consumers one at a time, remove old pattern only when zero consumers remain.
6. **Verify.** All tests pass. Measure before/after (complexity, lines, coverage, build time). Update docs if file structure or conventions changed.
