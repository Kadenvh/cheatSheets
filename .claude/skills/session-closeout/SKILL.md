---
name: session-closeout
description: "End a development session — persist state, update all documentation, ensure next session continuity"
disable-model-invocation: true
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Session Closeout

Perform end-of-session documentation updates. This is the most critical documentation step — skipping it causes documentation drift and context loss.

## Instructions

1. Read the full closeout template at `.prompts/closeout.md` (relative to the project's `documentation/` folder).
2. Follow its complete Part A through Part E process:
   - **Part A:** Capture session state (inventory changes, determine version increment)
   - **Part B:** Update documentation (IMPLEMENTATION_PLAN → ROADMAP → CLAUDE.md → READMEs)
   - **Part C:** Verify prompts are present in `.prompts/`
   - **Part D:** Clean up project notes (remove resolved, update remaining, add new)
   - **Part E:** Cross-file consistency check + quality check

## Autonomous Option

If you want hands-off closeout, ask Claude to dispatch the `closeout-worker` agent instead. Provide a brief session summary of what was accomplished.

## Routing Rule Reminder

| Question | Belongs In |
|---|---|
| "What do I need to know right now?" | CLAUDE.md |
| "Why was this decided?" | PROJECT_ROADMAP.md |
| "What's done/broken/next?" | IMPLEMENTATION_PLAN.md |

Information lives in ONE place. Reference, never duplicate.

## Inline Fallback (if prompt file not found)

If `.prompts/closeout.md` cannot be located, execute this minimal protocol:

1. **Inventory changes.** List all features implemented, bugs fixed, files modified, decisions made, and issues discovered but not fixed.
2. **Determine version increment.** Bug fixes only → patch. New features → minor. Breaking changes → major.
3. **Update IMPLEMENTATION_PLAN.md.** Add new version section, mark completed tasks `[x]`, update handoff notes for next session with actionable context.
4. **Update PROJECT_ROADMAP.md** (if milestone). Add version history row, document architectural decisions with rationale.
5. **Update CLAUDE.md.** Update version header, refresh "Recent Changes," add any new anti-patterns discovered.
6. **Create READMEs** for any new major directories (3+ files with shared purpose).
7. **Clean up notes.** If project has notes/issues: remove resolved items, update remaining with session context, add new items for unfixed issues.
8. **Verify consistency.** Version numbers match across all three files. Dates match. No orphaned references. No duplicated content across files.
