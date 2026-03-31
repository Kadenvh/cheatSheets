---
name: session-init
description: "Start a development session — read docs, verify state, orient before work. Use --auto-dev for autonomous execution."
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Session Initialization

You are starting a new session on this project. Follow the full initialization protocol.

## Instructions

Follow the protocol below. For the full detailed version, read `.claude/.prompts/init.md`.

### Protocol
   - Find the documentation system
   - Orient to the codebase
   - Verify state (version consistency, staleness, blockers)
   - Check Obsidian vault context (recent session notes, active plans, latest handoff)
   - Review past performance (learning loop data — what worked, what failed)
   - Understand the prompt system
   - Establish the engagement protocol
   - Surface insights (inconsistencies, improvements, questions, criticism — proactively)
   - Read project notes (if they exist — categorize, flag resolved, incorporate into plan)
   - Start working

## Quick Reference

Read context in this order:
1. **CLAUDE.md** (project root) — critical rules, always auto-loaded
2. **brain.db context** — already injected by session-context hook if brain.db exists. **If brain.db does NOT exist, run `/dal-doctor` to set up the full system.** Do not fall back to file-only mode.
3. **SYSTEM-OVERVIEW.md** (project root) — **MUST READ.** Your operating manual: every skill, hook, brain.db command, knowledge layer, and file layout. Without this you are working blind.
4. **Plans** — check `.claude/plans/` for any active kickstart, analysis, or remediation plans from prior sessions
5. **Obsidian vault** — recent session notes, active plans, latest YAML handoff (if vault exists)

Report ready state: current version, active blockers, insights/concerns noticed, questions, and recommended priorities.

## Modes

- **`/session-init`** (default) — Full orientation, present plan, await confirmation before work.
- **`/session-init --auto-dev`** — Full orientation, then autonomous execution. Skips the confirmation gate. Auto-selects highest-priority work from the note queue. Dispatches closeout-worker at session end.

## Planning Requirement (default mode)

Before implementing ANY change, present a prioritized plan and await explicit
confirmation. List proposed changes, files affected, and sequencing. Do not begin
implementation until the user approves. (Overridden by `--auto-dev` — see Section 10 of init.md.)

## Full Protocol

Detailed steps (always follow these):

1. **Find docs.** Look for `CLAUDE.md` and `SYSTEM-OVERVIEW.md` at project root.
2. **Read in order.** CLAUDE.md first (rules), then SYSTEM-OVERVIEW.md (your full toolbox - skills, hooks, brain.db commands, knowledge layers). If `PROJECT_ROADMAP.md` or `IMPLEMENTATION_PLAN.md` exist (file-mode projects), read them too.
3. **Check plans.** If `.claude/plans/` has files, read them - they contain active execution plans. A kickstart file (`session-*-kickstart.md`) means the prior session prepared specific work for you.
4. **Verify state.** Check that version numbers match across all docs. Check for stale dates (>7 days without updates). Check for blockers in IMPLEMENTATION_PLAN.
5. **Surface insights.** Before waiting for instructions: list inconsistencies or concerns, recommend 2-3 improvements, ask questions that affect approach, offer criticism of anything that looks wrong.
6. **Read project notes** (if any exist — `notes/`, `TODO.md`, `NOTES.md`, brain.db notes via `dal.mjs note list`). Categorize items, flag anything already resolved, merge into session plan.
7. **Report ready.** State: current version, blockers, insights, questions, and recommended priorities.
8. **Engagement rules.** Plan before implementing. Investigate what you need to implement correctly. No silent decisions. When tools fail, explain the error and next approach. Flag ambiguity rather than guessing.

If brain.db does not exist or is empty, run `/dal-doctor` — it handles first-run detection, full system setup, ongoing health checks, and remediation. `/dal-doctor` is the comprehensive system health skill. Do not proceed with manual file-mode workarounds.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "session-init: <what failed>" --type session-init --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- Record the action: `node .ava/dal.mjs action record "session-init: <summary>" --type session-init --outcome success`
- If this work changed CLAUDE.md rules or key commands, update CLAUDE.md
