---
name: documentation-awareness
description: "Always-on awareness of the documentation system. Enforces content boundaries, session lifecycle conventions, and brain.db-first principles."
version: 2.1.0
user-invocable: false
allowed-tools: []
---

# Documentation Awareness

Activates automatically when the project has CLAUDE.md. Adapts to the project's documentation mode.

## Documentation Mode

**brain.db mode** (`.ava/brain.db` exists): CLAUDE.md is the only auto-loaded agent rules file. All other state (decisions, architecture, handoff, version history) lives in brain.db. Reference docs (IMPLEMENTATION_PLAN.md, PROJECT_ROADMAP.md) live at project root if they exist.

**File mode** (no brain.db): Legacy fallback — CLAUDE.md + `PROJECT_ROADMAP.md` + `IMPLEMENTATION_PLAN.md` at project root. **If brain.db doesn't exist, run `/dal-doctor` to set up the full system rather than operating in file mode.**

## Document Hierarchy

Projects may have these document layers. Each has a specific purpose and owner:

| Document | Purpose | Updated By | Updated When |
|----------|---------|-----------|-------------|
| `CLAUDE.md` | Auto-loaded rules, critical constraints, build/run commands | Agent at closeout | Every session with rule changes |
| `OVERVIEW.md` (if exists) | Intended schemas, design questions, audit annotations | Agent + human | When system design evolves or audits run |
| `FileStructure.md` (if exists) | Annotated file tree snapshot with health tags | Agent or tooling | After significant structural changes |
| `.claude/plans/*.md` | Active analysis, remediation plans, kickstart prompts | Agent | Investigation/planning sessions |
| `IMPLEMENTATION_PLAN.md` (root) | Active work state (file mode) / historical reference (brain.db mode) | Agent at closeout | Every session (file mode) |
| `PROJECT_ROADMAP.md` (root) | Vision + history (file mode) / historical reference (brain.db mode) | Agent at milestones | Version milestones |
| Obsidian vault | Persistent knowledge: session summaries, architecture notes, plans, schemas. Canonical folders: `sessions/`, `architecture/`, `plans/`, `schemas/`, `VAULT_GUIDE.md` — NO project files (code, configs, node_modules) | Agent at closeout (conditional export) | Sessions with decisions, version changes, or significant features |

**Agents should improve these documents proactively.** If you discover stale content, incorrect annotations, or missing audit notes in OVERVIEW.md, FileStructure.md, or plans/ — update them as part of your work. Don't wait for explicit instruction. These are living documents, not static artifacts.

**Downstream projects** maintain their own versions of these documents. The PE template provides skills/hooks/prompts that guide agents to create and maintain project-specific documentation. Each project's CLAUDE.md is independently authored. Template sync never overwrites CLAUDE.md, OVERVIEW.md, FileStructure.md, or brain.db.

## Content Boundaries

Information lives in ONE place. Ask: "What question does this answer?"

**brain.db mode:**

| Question | Belongs in... |
|---|---|
| "What do I need to know to work right now?" | CLAUDE.md |
| "How did we get here and where are we going?" | brain.db decisions + identity + architecture entries |
| "What's done, what's broken, what's next?" | brain.db notes + session records |
| "What is the intended system design?" | OVERVIEW.md (if exists) |
| "What files exist and what's their status?" | FileStructure.md (if exists) |
| "What's the plan for the next session?" | `.claude/plans/` kickstart file |

**File mode:**

| Question | Belongs in... |
|---|---|
| "What do I need to know to work right now?" | CLAUDE.md |
| "How did we get here and where are we going?" | `PROJECT_ROADMAP.md` (root) |
| "What's done, what's broken, what's next?" | `IMPLEMENTATION_PLAN.md` (root) |

Never duplicate information. Reference, never copy.

## CLAUDE.md Boundaries (both modes)

**Contains:** Version header, critical rules, anti-patterns, file structure, build/run commands, schema/API reference.
**Does NOT contain:** Architectural rationale, version history, task lists, future roadmap — these belong in brain.db (or ROADMAP/IMPL_PLAN in file mode).

## Portfolio Identity Keys (brain.db)

Every project should populate these identity keys for ecosystem awareness and portfolio integration:

```
product.title          — display name
product.summary        — 1-2 sentence description
product.key-metric     — single highlighted stat
product.key-metrics    — pipe-separated metrics string
product.tech-highlights — notable technologies
product.category       — ml|automation|web|infrastructure|other
product.featured       — true|false
```

The `/cleanup` skill checks for these and prompts if missing.

## Principles

- **No Silent Decisions:** Every deviation from established patterns must be documented explicitly.
- **Front-Load CLAUDE.md:** Anti-patterns and critical rules before file structure and commands.
- **Investigate to Implement:** Understand what you're changing before changing it. Investigate as needed — but produce fixes, not just analysis.
- **Flag and Stop on Ambiguity:** When uncertain, ask — don't guess.
- **Improve Documentation Proactively:** If you find stale, incorrect, or missing documentation during your work, fix it. Don't create a note to fix it later.

## Session Lifecycle

1. **Init** (`/session-init`) — brain.db context is injected automatically. Read CLAUDE.md (rules). Read SYSTEM-OVERVIEW.md (your operating manual - skills, hooks, commands, knowledge layers). Check `.claude/plans/` for kickstart files. Verify state. **Start a DAL session** before implementation begins.
2. **Work** — Respect boundaries. Record decisions as you make them. **Record traces** (`node .ava/dal.mjs trace add "..."`) for significant steps — these auto-collect into the handoff. Update working documents (OVERVIEW.md, plans/) as findings emerge.
3. **Closeout** (`/session-closeout`) — Record to brain.db (identity, architecture, decisions, notes, loop data). Update CLAUDE.md. Update working documents. Export vault note if session qualifies (1+ decisions, version change, significant work). **Close session with summary.** Commit.

Skipping closeout causes context loss. The Stop hook will remind you (>120 minutes since last doc edit).
