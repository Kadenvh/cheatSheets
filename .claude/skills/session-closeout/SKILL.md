---
name: session-closeout
description: "End a development session — persist state, update all documentation, ensure next session continuity"
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

Follow the protocol below. For the full detailed version, read `.claude/.prompts/closeout.md`.
2. Follow its complete process:
   - **Part A:** Capture session state (inventory changes, determine version increment)
   - **Part A-2:** Record session knowledge to brain.db (identity, architecture, decisions, notes)
   - **Part A-3:** Verify traces were recorded + record learning loop data (actions, metrics, self-assessment)
   - **Part A-4:** Vault export, handoff generation (auto-detects session + files + decisions), and **close DAL session with summary**
   - **Part B:** Update CLAUDE.md (brain.db mode) or all 3 docs (file mode)
   - **Part C:** Self-verification
   - **Part D:** Git commit

## Autonomous Option

If you want hands-off closeout, ask Claude to dispatch the `closeout-worker` agent instead. Provide a brief session summary of what was accomplished.

## Routing Rule Reminder

**brain.db mode:**
| Question | Belongs In |
|---|---|
| "What do I need to know right now?" | CLAUDE.md |
| "Why was this decided?" | brain.db decisions |
| "What's done/broken/next?" | brain.db notes + sessions |

**File mode:**
| Question | Belongs In |
|---|---|
| "What do I need to know right now?" | CLAUDE.md |
| "Why was this decided?" | PROJECT_ROADMAP.md |
| "What's done/broken/next?" | IMPLEMENTATION_PLAN.md |

Information lives in ONE place. Reference, never duplicate.

## Full Protocol

Detailed steps (always follow these):

1. **Inventory changes.** List all features implemented, bugs fixed, files modified, decisions made, and issues discovered but not fixed.
2. **Determine version increment.** Bug fixes only → patch. New features → minor. Breaking changes → major.
3. **Record to brain.db** (if exists):
   - `node .ava/dal.mjs identity set "project.version" --value "X.Y.Z"`
   - `node .ava/dal.mjs arch set "key" --value "..." --scope project` for system knowledge
   - `node .ava/dal.mjs decision add ...` for architectural choices
   - `node .ava/dal.mjs note add "..." --category handoff` for next-session context
   - `node .ava/dal.mjs action record "..." --type <type> --outcome success|failure|partial`
4. **Handoff generation** (if brain.db exists):
   - `node .ava/dal.mjs handoff generate "session summary"`
   - Export vault session note if session has 1+ decisions, version change, cross-project work, or significant features. Trivial sessions skip. `node .ava/dal.mjs vault-export session "summary"`
   - Sync to ChromaDB if embedding service running: `node .ava/dal.mjs vault sync {ProjectSlug} 2>/dev/null || true`
5. **Update CLAUDE.md.** Update version header, refresh "Recent Changes," add any new anti-patterns.
6. **Update working documents.** If `OVERVIEW.md`, `FileStructure.md`, or `.claude/plans/` contain active audit annotations or execution plans, update them to reflect completed work. Mark completed phases. Add new findings if discovered during implementation.
7. **File mode additionally:** Update `IMPLEMENTATION_PLAN.md` (tasks, handoff) and `PROJECT_ROADMAP.md` (if milestone) at project root.
8. **Create READMEs** for any new major directories.
9. **Verify consistency.** Version numbers match. No orphaned references. No duplicated content.
10. **Commit.** Stage specific files, commit with descriptive message.

## Error Handling

If any closeout step fails (brain.db unreachable, git commit fails, vault export errors):
1. Record the failure: `node .ava/dal.mjs action record "session-closeout: <what failed>" --type closeout --outcome partial`
2. Do NOT skip remaining steps — attempt each one independently.
3. If brain.db is unreachable, commit what you can and note the failure in the commit message.
4. A partial closeout is always better than no closeout.
