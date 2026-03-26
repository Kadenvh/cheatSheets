---
name: documentation-awareness
description: "Always-on awareness of the documentation system. Enforces content boundaries, session lifecycle conventions, and brain.db-first principles."
version: 2.0.0
user-invocable: false
---

# Documentation Awareness

Activates automatically when the project has CLAUDE.md. Adapts to the project's documentation mode.

## Documentation Mode

**brain.db mode** (`.ava/brain.db` exists): CLAUDE.md is the only hand-authored file. All other state (decisions, architecture, handoff, version history) lives in brain.db.

**File mode** (no brain.db): Traditional three-file system — CLAUDE.md + PROJECT_ROADMAP.md + IMPLEMENTATION_PLAN.md.

## Content Boundaries

Information lives in ONE place. Ask: "What question does this answer?"

**brain.db mode:**

| Question | Belongs in... |
|---|---|
| "What do I need to know to work right now?" | CLAUDE.md |
| "How did we get here and where are we going?" | brain.db decisions + identity + architecture entries |
| "What's done, what's broken, what's next?" | brain.db notes + session records |

**File mode:**

| Question | Belongs in... |
|---|---|
| "What do I need to know to work right now?" | CLAUDE.md |
| "How did we get here and where are we going?" | PROJECT_ROADMAP.md |
| "What's done, what's broken, what's next?" | IMPLEMENTATION_PLAN.md |

Never duplicate information. Reference, never copy.

## CLAUDE.md Boundaries (both modes)

**Contains:** Version header, critical rules, anti-patterns, file structure, build/run commands, schema/API reference.
**Does NOT contain:** Architectural rationale, version history, task lists, future roadmap — these belong in brain.db (or ROADMAP/IMPL_PLAN in file mode).

## Principles

- **No Silent Decisions:** Every deviation from established patterns must be documented explicitly.
- **Front-Load CLAUDE.md:** Anti-patterns and critical rules before file structure and commands.
- **Plan Before Implementing:** State understanding, identify affected files, flag concerns, propose approach, then proceed.
- **Flag and Stop on Ambiguity:** When uncertain, ask — don't guess.

## Session Lifecycle

1. **Init** (`/session-init`) — brain.db context is injected automatically. Read CLAUDE.md. Verify state.
2. **Work** — Respect boundaries. Record decisions as you make them.
3. **Closeout** (`/session-closeout`) — Record to brain.db (identity, architecture, decisions, notes, loop data). Update CLAUDE.md. Commit.

Skipping closeout causes context loss. The Stop hook will remind you.
