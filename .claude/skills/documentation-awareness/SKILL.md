---
name: documentation-awareness
description: "Thin always-on boundary rules for documentation, continuity, and storage discipline."
version: 2.3.0
user-invocable: false
allowed-tools: []
---

# Documentation Awareness

Activates automatically when the project has CLAUDE.md. Keep this surface thin: it exists to enforce boundaries, not to become a second operating manual.

## Documentation Model

CLAUDE.md is the only auto-loaded agent rules file. Active plans live in `plans/` at the project root. The DAL is a continuity ledger: recent sessions, handoffs, open notes, active decisions, and a minimal set of identity keys. GitNexus or direct code inspection answers code-structure questions. Curated session notes live in `sessions/` at the project root. If brain.db doesn't exist, run `/dal-doctor` to set it up.

`PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` are **retired** -- do not create, read, or update them. brain.db replaces both.

## Document Hierarchy

Projects may have these document layers. Each has a specific purpose and owner:

| Document | Purpose | Updated By | Updated When |
|----------|---------|-----------|-------------|
| `CLAUDE.md` | Auto-loaded rules, critical constraints, build/run commands | Agent at closeout | Every session with rule changes |
| `SYSTEM-OVERVIEW.md` | Operating manual for the deployed system | Agent + human | When framework doctrine or operator workflow changes |
| `OVERVIEW.md` (if exists) | Design intent, invariants, open architectural questions | Agent + human | When system design evolves |
| `plans/*.md` | Active analysis and remediation plans (at project root) | Agent | Investigation/planning sessions |
| `sessions/*.md` | Curated structured session notes (at project root) | `session-export` at closeout | Every significant session |
| `.claude/memory/` (if present) | Optional compatibility surface for lean observations that are not canonical elsewhere | Auto-managed or curated sparingly | Only when still genuinely useful |

**Agents should improve these documents proactively, but only where they carry real authority.** Update `CLAUDE.md`, active plans, `SYSTEM-OVERVIEW.md`, and `OVERVIEW.md` when your work changes them. Do not create or maintain manual file-tree snapshots unless a specific project explicitly requires them.

**Downstream projects** maintain their own versions of these documents. The PE template provides skills/hooks/prompts that guide agents to create and maintain project-specific documentation. Each project's CLAUDE.md is independently authored. Template sync never overwrites CLAUDE.md, project-specific overview docs, or brain.db.

## Deployable vs Non-Deployable Surface

The project root has TWO kinds of content that must not be confused:

| Surface | Examples | Ships via Sync All? |
|---|---|---|
| **Deployable (`.claude/`)** | skills, hooks, .prompts, agents, settings | Yes — template sync pushes this to downstream |
| **Non-deployable (project root)** | `plans/`, `sessions/`, `agent-definitions/`, README, CHANGELOG | No — each project manages its own |
| **Exception: `template/CLAUDE.md`** | (not present — retired) | No — CLAUDE.md is always project-authored, never overwritten |

Plans and sessions live at the project root, not under `.claude/`, because they are project-specific working state and not meant to deploy to other projects.

## Content Boundaries

Information lives in ONE place. Ask: "What question does this answer?"

| Question | Belongs in... |
|---|---|
| "What do I need to know to work right now?" | `CLAUDE.md` |
| "What was I doing, what is open, and what should happen next?" | brain.db sessions + notes + decisions + handoff |
| "What is this project?" | Minimal brain.db identity keys + `CLAUDE.md` |
| "What is the intended system design?" | `OVERVIEW.md` (if exists) for intent and invariants only |
| "How do these files and symbols actually connect?" | GitNexus or direct code inspection |
| "What's the plan for the next session?" | `plans/` at project root |
| "What happened last session?" | brain.db sessions + latest handoff + `sessions/{latest}.md` |

Never duplicate information. Reference, never copy.

## CLAUDE.md Boundaries

**Contains:** Version header, critical rules, anti-patterns, build/run commands, essential file layout, and operational constraints.
**Does NOT contain:** Historical task lists, broad architectural rationale, stale counts, or large code-structure snapshots.

## Optional Project Identity Keys

Some projects may maintain additional identity rows beyond the minimum load-bearing `project.*` keys. These are optional and project-specific. Do not invent marketing, portfolio, or showcase keys unless the project already uses them intentionally.

## Principles

- **No Silent Decisions:** Every deviation from established patterns must be documented explicitly.
- **Front-Load CLAUDE.md:** Anti-patterns and critical rules before file structure and commands.
- **Investigate to Implement:** Understand what you're changing before changing it. Investigate as needed — but produce fixes, not just analysis.
- **Flag and Stop on Ambiguity:** When uncertain, ask — don't guess.
- **Always-On Surfaces Need A Higher Bar:** Auto-loaded doctrine must earn its place by reducing session-start confusion, not by repeating the whole system.
- **Improve Documentation Proactively:** If you find stale, incorrect, or missing authoritative documentation during your work, fix it. Don't create a note to fix it later.
- **Record Decisions and Traces As They Happen:** brain.db curation is during-work, not closeout-only. `trace add` and `decision add` are cheap; use them in real time.

## Session Lifecycle

1. **Init** (`/session-init`) — Read `CLAUDE.md` (rules), `SYSTEM-OVERVIEW.md` (operating manual), latest handoff, open notes, active decisions, and active plans (`plans/`). Use GitNexus or direct code reads for structural questions. **Start a DAL session** before implementation begins.
2. **Work** — Respect boundaries. Record decisions and open follow-up notes as you make them. Record traces only when they materially improve the next handoff. Update authoritative working documents (`CLAUDE.md`, plans, `OVERVIEW.md` if it captures design intent) as findings emerge.
3. **Closeout** (`/session-closeout`) — Record minimal continuity to brain.db (identity only if changed, decisions, notes, session summary, handoff). Update `CLAUDE.md` and any active plans touched by the session. Run `session-export` to write a structured session note to `sessions/`. **Generate handoff, then close the session with summary.** Commit.

Skipping closeout causes context loss. The Stop hook will remind you (>120 minutes since last doc edit).
