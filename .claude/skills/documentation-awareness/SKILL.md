---
name: documentation-awareness
description: "Always-on awareness of the three-document architecture. Enforces routing rule, document boundaries, and session lifecycle conventions."
version: 1.3.0
user-invocable: false
---

# Documentation Awareness

Activates automatically when the project has CLAUDE.md, PROJECT_ROADMAP.md, and IMPLEMENTATION_PLAN.md.

## The Routing Rule

Every piece of information belongs in exactly one file. Ask: "What question does this answer?"

| Question | Document |
|---|---|
| "What do I need to know to work right now?" | CLAUDE.md |
| "How did we get here and where are we going?" | PROJECT_ROADMAP.md |
| "What's done, what's broken, what's next?" | IMPLEMENTATION_PLAN.md |

Never duplicate information across files. Reference from others, never copy.

## Document Boundaries

**CLAUDE.md** — Version header, critical rules, anti-patterns, file structure, build/run commands, schema/API reference, recent changes. Does NOT contain: architectural rationale, version history, task lists, future roadmap.

**PROJECT_ROADMAP.md** — Vision, version history, architecture decisions with rationale, future roadmap. Does NOT contain: build commands, file modification lists, debugging notes, sprint tasks.

**IMPLEMENTATION_PLAN.md** — Current status, task checklists, files modified, blockers, handoff notes, debugging notes. Does NOT contain: architectural philosophy, long-term speculation, critical anti-patterns.

## Principles

- **No Silent Decisions:** Every deviation from established patterns must be documented explicitly.
- **Front-Load CLAUDE.md:** Anti-patterns and critical rules before file structure and commands.
- **Plan Before Implementing:** State understanding, identify affected files, flag concerns, propose approach, then proceed.
- **Flag and Stop on Ambiguity:** When uncertain, ask — don't guess.

## Session Lifecycle

1. **Init** (`/session-init`) — Read docs, verify consistency, orient.
2. **Work** — Respect boundaries. Document decisions as you make them.
3. **Closeout** (`/session-closeout`) — Persist state. Version bump. Handoff notes. Verify consistency.

Skipping closeout causes documentation drift. The Stop hook will remind you.
