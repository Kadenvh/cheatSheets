---
name: session-closeout
description: "End a development session — persist continuity, update the docs that actually changed, and ensure the next session can resume cleanly."
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Session Closeout

Perform end-of-session documentation updates. This is the most critical continuity step — skipping it causes drift and context loss.

## Instructions

Follow the protocol below. For the full detailed version, read `.claude/.prompts/closeout.md`.
2. Follow its complete process:
   - **Part A:** Capture session state (inventory changes, determine version increment)
   - **Part A-2:** Record minimal continuity to brain.db (identity only when changed, decisions, notes, handoff context)
   - **Part A-3:** Record traces and optional legacy loop data only if the project still uses those surfaces
   - **Part A-4:** Handoff generation first, then optional `session-export` to `sessions/`, then **close DAL session with summary**
   - **Part B:** Update CLAUDE.md and any active plans or design-intent docs that actually changed
   - **Part C:** Self-verification
   - **Part D:** Git commit

## Autonomous Option

If you want hands-off closeout, ask Claude to dispatch the `closeout-worker` agent instead. Provide a brief session summary of what was accomplished.

## Routing Rule Reminder

| Question | Belongs In |
|---|---|
| "What do I need to know right now?" | `CLAUDE.md` |
| "Why was this decided?" | brain.db decisions |
| "What's done/broken/next?" | brain.db notes + sessions + handoff |
| "What's the active strategy?" | `plans/` (project root) |
| "How do the files and symbols connect?" | GitNexus or direct code inspection |
| "What's the historical record?" | `plans/archive/` + `sessions/` + brain.db superseded decisions |

Information lives in ONE place. Reference, never duplicate.

## Full Protocol

Detailed steps (always follow these):

1. **Inventory changes.** List all features implemented, bugs fixed, files modified, decisions made, and issues discovered but not fixed.
2. **Determine version increment.** Bug fixes only → patch. New features → minor. Breaking changes → major.
3. **Record minimal continuity to brain.db** (if exists):
   - `node .ava/dal.mjs identity set "project.version" --value "X.Y.Z"` only when version changed
   - `node .ava/dal.mjs decision add ...` for real architectural or workflow constraints
   - `node .ava/dal.mjs note add "..." --category handoff` for next-session context, blockers, and unfinished work
   - Use `arch set`, `action record`, or `metric record` only if the project still relies on those legacy surfaces
4. **Handoff generation** (if brain.db exists):
   - `node .ava/dal.mjs handoff generate "session summary"`
   - Export a structured session note only if the session has durable narrative or architectural value. Trivial sessions skip. `node .ava/dal.mjs session-export session "summary"` — writes `sessions/session-{N}.md` at project root with the standard schema (Summary, Decisions, Files Changed, Notes Opened/Closed, Continuity → Next Session, Cross-Refs).
5. **Update CLAUDE.md.** Update version header, rules, key commands, or operational constraints if this session changed them.
6. **Update authoritative working docs only.** If `plans/` (project root) or `OVERVIEW.md` contain active strategy or design intent touched by this session, update them. Do not maintain `FileStructure.md` snapshots or broad structural summaries.
7. **Create READMEs** for any new major directories.
8. **Verify consistency.** Version numbers match. No orphaned references. No duplicated content.
9. **Commit.** Stage specific files, commit with descriptive message.

## Error Handling

If any closeout step fails (brain.db unreachable, git commit fails, session-export errors):
1. Record the failure as a note or include it in the handoff/closeout summary. Use `agent_actions` only if the project still relies on that legacy surface.
2. Do NOT skip remaining steps — attempt each one independently.
3. If brain.db is unreachable, commit what you can and note the failure in the commit message.
4. A partial closeout is always better than no closeout.
