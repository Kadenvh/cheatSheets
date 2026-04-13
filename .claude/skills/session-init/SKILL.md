---
name: session-init
description: "Start a development session — read rules, synthesize continuity, verify runtime health, and orient before work. Use --auto-dev for autonomous execution."
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
   - Orient to the codebase (let curiosity drive exploration via GitNexus)
   - Verify state (version consistency, staleness, blockers, runtime health)
   - Synthesize continuity from the injected `continuity brief` (handoff, open notes, active decisions, active plans, contradictions, recommended next step)
   - Use GitNexus or direct code reads for structural questions
   - Understand the prompt system
   - Establish the engagement protocol
   - Surface insights (inconsistencies, improvements, questions, criticism — proactively)
   - Read project notes (if they exist — categorize, flag resolved, incorporate into plan)
   - Start working

## Quick Reference

Read context in this order:
1. **CLAUDE.md** (project root) — critical rules, always auto-loaded
2. **Continuity brief** — already injected by the session-context hook. Contains latest handoff, open notes, active decisions, active plans, contradictions, required confirmations, recommended next step. **If brain.db does NOT exist, run `/dal-doctor` to set up the runtime.** Do not fall back to file-only mode.
3. **SYSTEM-OVERVIEW.md** (project root) — **MUST READ.** Your operating manual: skills, hooks, DAL boundaries, GitNexus role, knowledge layers, and file layout.
4. **Plans** — read active files in `plans/` at the project root (exclude `archive/`). These are living strategy documents curated across sessions.
5. **Sessions** — `sessions/` at the project root holds curated structured session notes. Skim the latest one if the handoff is ambiguous.
6. **GitNexus / live code inspection** — use for code-structure questions, call graphs, and dependency relationships. Explore curiously rather than expecting everything to be pre-loaded.

Report ready state: current version, active blockers, continuity summary, insights/concerns noticed, questions, and recommended priorities.

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
2. **Read in order.** CLAUDE.md first (rules), then SYSTEM-OVERVIEW.md (your full toolbox - skills, hooks, DAL boundaries, knowledge layers).
3. **Read active plans.** Read every file in `plans/` (at project root) except `archive/` -- these are living strategy documents curated across sessions.
4. **Verify continuity.** Check that version numbers match across CLAUDE.md and minimal brain.db identity. Review latest handoff, open notes, and active decisions. Check for stale dates (>7 days without updates).
5. **Verify runtime health.** If `.ava/brain.db` exists, confirm `dal.mjs status` works and that the runtime is not obviously empty or broken. If the runtime is missing or clearly unpopulated, stop and route through `/dal-doctor`.
6. **Use GitNexus or direct code reads for structure.** Do not expect manual file-tree docs or broad DAL architecture rows to answer "how does this code connect?"
7. **Surface insights.** Before waiting for instructions: list inconsistencies or concerns, recommend 2-3 improvements, ask questions that affect approach, offer criticism of anything that looks wrong.
8. **Read project notes** (if any exist — `notes/`, `TODO.md`, `NOTES.md`, brain.db notes via `dal.mjs note list`). Categorize items, flag anything already resolved, merge into session plan.
9. **Report ready.** State: current version, last-session continuity, open blockers, insights, questions, and recommended priorities.
10. **Engagement rules.** Plan before implementing. Investigate what you need to implement correctly. No silent decisions. When tools fail, explain the error and next approach. Flag ambiguity rather than guessing.

If brain.db does not exist or is empty, run `/dal-doctor` -- it handles first-run detection, full system setup, ongoing health checks, and remediation.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure as a note or include it in the handoff/closeout summary. Use `agent_actions` only if the project still relies on that legacy surface.
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- If this project still uses `agent_actions`, record the init result there. Otherwise rely on session summary + handoff continuity.
- If this work changed CLAUDE.md rules or key commands, update CLAUDE.md
