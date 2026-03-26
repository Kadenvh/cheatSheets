---
name: debugging
description: "Systematically investigate, isolate, and fix bugs with documented root cause analysis"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Debugging — Systematic Investigation & Resolution

Systematically reproduce, isolate, identify root cause, fix, and verify a bug.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/debugging.md`.
### Protocol:
   - Understand the problem (gather context, assess severity S1–S4)
   - Reproduce the bug (exact steps, minimal case)
   - Isolate the cause (binary search, logging, stack traces)
   - Identify root cause (ask "why" until the real cause)
   - Fix it (smallest change + regression test)
   - Verify (reproduction fails, tests pass, no regressions)
   - Document (report for S1/S2, commit message for S3/S4)

## Key Rules

- **Reproduce before fixing.** If you can't trigger it, you can't prove you fixed it.
- **Fix root cause, not symptoms.** A null check on a missing column is a bandaid, not a fix.
- **No shotgun debugging.** Don't change random things until it works.
- **Add a regression test.** Non-negotiable for S1/S2 bugs.

## Full Protocol

Detailed steps:

1. **Gather context.** What's the symptom? When did it start? How often? Assess severity: S1 (system down) → S2 (major feature broken) → S3 (degraded, workaround exists) → S4 (minor/cosmetic).
2. **Reproduce.** Get exact steps. Try locally. Minimize to smallest reproduction case. Document the steps.
3. **Isolate.** Use `git bisect` for regressions. Add logging at boundaries. Check stack traces carefully — read the actual error message.
4. **Root cause.** Ask "why" repeatedly: surface symptom → intermediate cause → root cause. Common categories: logic error, state corruption, integration mismatch, environment issue, data issue, timing issue.
5. **Fix.** Smallest change that fixes root cause. Add regression test. Don't refactor while debugging.
6. **Verify.** Original reproduction no longer triggers. Existing tests still pass. Fix works outside your dev setup.
7. **Document.** For S1/S2: incident report (symptom, reproduction, root cause, fix, prevention). For S3/S4: descriptive commit message.
