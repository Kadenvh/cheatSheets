---
name: session-init
description: "Start a development session — read docs, verify state, orient before work"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Session Initialization

You are starting a new session on this project. Follow the full initialization protocol.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/init.md`.

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
2. **brain.db context** — already injected by session-context hook if brain.db exists
3. **Obsidian vault** — recent session notes, active plans, latest YAML handoff (if vault exists)
4. **File mode only:** read `documentation/PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` if no brain.db

Report ready state: current version, active blockers, insights/concerns noticed, questions, and recommended priorities.

## Planning Requirement

Before implementing ANY change, present a prioritized plan and await explicit
confirmation. List proposed changes, files affected, and sequencing. Do not begin
implementation until the user approves.

## Full Protocol

Detailed steps (always follow these):

1. **Find docs.** Look for `CLAUDE.md` at project root. Look for `PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` in `documentation/` or project root.
2. **Read in order.** CLAUDE.md first (critical rules), then ROADMAP (architecture context), then IMPLEMENTATION_PLAN (current tasks).
3. **Verify state.** Check that version numbers match across all docs. Check for stale dates (>7 days without updates). Check for blockers in IMPLEMENTATION_PLAN.
4. **Surface insights.** Before waiting for instructions: list inconsistencies or concerns, recommend 2-3 improvements, ask questions that affect approach, offer criticism of anything that looks wrong.
5. **Read project notes** (if any exist — `notes/`, `TODO.md`, `NOTES.md`, etc.). Categorize items, flag anything already resolved, merge into session plan.
6. **Report ready.** State: current version, blockers, insights, questions, and recommended priorities.
7. **Engagement rules.** Plan before implementing. No silent decisions. When tools fail, explain the error and next approach. Flag ambiguity rather than guessing.

If no documentation files exist at all, recommend running `/bootstrap` to create them.
