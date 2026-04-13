# Agent System Reference

**For:** PE Documentation Framework v7.0.0-rc1 | **Schema:** v13 | **Updated:** 2026-04-13

This is the single reference document for understanding the full agent memory and documentation system. Any agent — Claude or otherwise — should be able to read this file and understand how the system works.

---

## Quick Start

- **brain.db** at `.ava/brain.db` — SQLite database, schema v13, 10 tables. Active memory cache for session continuity.
- **Prompts** at `.claude/.prompts/*.md` — protocol and support files. Canonical location: `.claude/.prompts/`. NOT any legacy `documentation/.prompts/` or root `.prompts/` location (should be deleted if found).
- **Skills** invoked via `/skill-name` slash commands. Definitions in `.claude/skills/*/SKILL.md`.
- **Hooks** in `.claude/hooks/*.js` — auto-fire on tool use and session events. Run `ls template/.claude/hooks/` for the live inventory; counts drift, queries don't.
- **Plans** at project-root `plans/` — active strategy documents, one canonical plan preferred (validator warns at 2+, fails at 4+). Superseded plans move to `plans/archive/<event>/` with receipt.
- **Sessions** at project-root `sessions/` — curated structured session notes written by `session-export` at closeout. Schema: `session-{N}.md` with Summary, Decisions, Files Changed, Notes Opened/Closed, Continuity → Next Session, Cross-Refs.
- **CLAUDE.md** at project root — critical rules, auto-loaded by Claude Code. Keep focused: rules and commands only.
- **Continuity brief:** `node .ava/dal.mjs continuity brief` — synthesized resume state (identity, open session, handoff, notes, plans, decisions, contradictions, recommended next step). Primary session-start surface.

---

## brain.db Schema (10 Tables)

brain.db is an SQLite database at `.ava/brain.db`. It stores active memory — what an agent needs to remember between sessions. It is NOT a data store for application state, user content, or runtime configuration. brain.db is a cache of project understanding; the codebase is truth.

**Single dependency:** `better-sqlite3` (zero-config, file-based, no server)

### Core Memory (5 tables)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `identity` | Core project facts (5-7 rows) | `key`, `value` — e.g., `project.name`, `project.version`, `project.vision`, `tech.stack`, `tech.build` |
| `architecture` | Scoped system knowledge | `key`, `value`, `scope` (project/ecosystem/infrastructure/convention), `confidence` |
| `sessions` | Session history | `id`, `start_time`, `end_time`, `summary`, `exit_reason` (normal/interrupted/crashed) |
| `decisions` | Architectural decisions with rationale | `id`, `title`, `context`, `chosen`, `rationale`, `status` (active/superseded), `component` |
| `notes` | Task queue and handoff items | `id`, `text`, `category` (improvement/issue/bug/idea/handoff/feedback), `completed` |

### Session Continuity (1 table)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `session_traces` | Structured episodic memory per session | `id`, `session_id`, `trace_type`, `content`, `metadata` |

### Learning Loop (3 tables)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `agent_actions` | Action log with outcomes | `id`, `session_id`, `action_type`, `description`, `outcome` (success/failure/partial) |
| `agent_metrics` | Quantitative measurements | `id`, `key`, `value`, `measured_at` |
| `agent_feedback` | Feedback on actions | `id`, `action_id`, `rating`, `source` |

### System (1 table)

| Table | Purpose |
|-------|---------|
| `schema_version` | Tracks migration state. `MAX(version)` = current schema version. |

### Architecture Scopes

| Scope | When Injected | Use For |
|-------|---------------|---------|
| `project` | General context (always) | Tech stack, build commands, project-specific patterns |
| `ecosystem` | General context | Cross-project patterns, shared infrastructure |
| `infrastructure` | Dev context | Servers, ports, deployment targets, environment |
| `convention` | Dev context | Naming conventions, coding standards, established patterns |

### CLI Quick Reference

```bash
# Session lifecycle
node .ava/dal.mjs session start "description"     # Start tracked session
node .ava/dal.mjs session close --summary "what happened"  # Close with summary
node .ava/dal.mjs status                           # DB health, schema, size
node .ava/dal.mjs context                          # Full state payload
node .ava/dal.mjs context --role dev               # Dev-focused context

# Core memory
node .ava/dal.mjs identity set "key" --value "v"   # Upsert identity row
node .ava/dal.mjs identity list                     # All identity rows
node .ava/dal.mjs arch set "key" --value "v" --scope project
node .ava/dal.mjs arch list --scope convention      # Filter by scope
node .ava/dal.mjs decision add --title T --context C --chosen O --rationale R

# Notes (task queue)
node .ava/dal.mjs note list                         # Open notes
node .ava/dal.mjs note add "text" --category improvement
node .ava/dal.mjs note complete <id>

# Session continuity
node .ava/dal.mjs trace add|list|summary            # Episodic memory
node .ava/dal.mjs handoff generate|latest|list      # YAML handoffs

# Learning loop
node .ava/dal.mjs action record "desc" --type feature --outcome success
node .ava/dal.mjs metric record <key> --value <n>
node .ava/dal.mjs loop summary                      # Full performance overview

# System
node .ava/dal.mjs verify                            # 8-layer cross-verification
node .ava/dal.mjs migrate                           # Run pending migrations

# Template deployment
node .ava/dal.mjs template manifest                 # List deployable files + checksums
node .ava/dal.mjs template diff <path>              # Compare target vs template
node .ava/dal.mjs template sync <path>              # Copy missing/stale
```

Template deployment handles the deployable `.claude` and documentation surface. DAL runtime provisioning is handled separately through `/dal-doctor`.

---

## File System Layout

### `.claude/.prompts/` — Skill Protocol Files

Markdown files containing detailed protocols that skills read at invocation time. **Canonical location: `.claude/.prompts/`.** Skills reference `.claude/.prompts/*.md` — never any legacy `documentation/.prompts/` or root `.prompts/` path.

Each prompt file is a standalone protocol: oriented toward a specific workflow (init, closeout, debugging, etc.) with step-by-step instructions an agent can follow.

Current inventory is the shipped directory contents, not a hard-coded count. Run `ls template/.claude/.prompts/` for the live list.

### `.claude/skills/` — Slash Command Definitions

Each subdirectory contains a `SKILL.md` file defining a slash command (`/skill-name`). The SKILL.md provides:
- Frontmatter: name, description, allowed-tools
- Brief protocol summary (inline fallback if .claude/.prompts/ file missing)
- References the corresponding `.claude/.prompts/*.md` for full protocol

Skills are thin wrappers. The real protocol lives in `.claude/.prompts/`.

### `.claude/hooks/` — Automated Guards & Context Injection

Hooks fire automatically on Claude Code events. They are `.js` files (CommonJS via `require()`).

| Hook | Event | Purpose |
|------|-------|---------|
| `session-context.js` | SessionStart, SessionResume | Injects git context, brain.db context, latest handoff, and session reminders |
| `block-protected-files.js` | PreEdit, PreWrite | Blocks writes to `.env`, lock files, credentials, secrets, and selected protected files. Do not assume it protects `brain.db`. |
| `block-dangerous-commands.js` | PreBash | Blocks catastrophic commands (rm -rf /, force push main, etc.) |
| `gitnexus-impact-check.js` | PreEdit, PreWrite | Injects edit blast-radius context for indexed codebases |
| `typecheck-on-edit.js` | PostEdit, PostWrite | Runs type checker on modified files (if tsconfig exists) |
| `lint-on-edit.js` | PostEdit, PostWrite | Runs linter on modified files (if eslint/prettier configured) |
| `gitnexus-post-commit.js` | PostBash (`git commit`) | Re-indexes code intelligence after commits |
| `stop-closeout-check.js` | Stop | Warns if docs stale >120min and uncommitted changes exist |
| `completion-check.js` | Stop | Warns about partial-outcome actions in the learning loop |
| `log-util.js` | Utility | Shared hook logging helper, not an event hook |

Hooks are configured in `.claude/settings.json` under the `hooks` key. Each entry maps an event type to a command.

### `.claude/agents/` — Agent Archetypes

Agent definitions for autonomous sub-agents. Each agent has a directory with identity files following the two-tier pattern:
- **Tier 1:** `SOUL.md`, `AGENTS.md` — shared via symlink to PE canonical
- **Tier 2:** `IDENTITY.md`, `TOOLS.md`, `HEARTBEAT.md`, `USER.md` — domain-specific copies

### `settings.json` Structure

```
.claude/
  settings.json          # Project settings (permissions, hooks, env vars)
  settings.local.json    # Machine-specific overrides (never committed)
```

`settings.json` contains:
- **permissions:** Bash command patterns allowed without prompting
- **hooks:** Event-to-command mappings for automated hooks
- **env:** Environment variables injected into the session

`settings.local.json` overrides `settings.json` for machine-specific values (approved skill invocations, local tool permissions). Never committed to git.

---

## Knowledge Architecture (v7)

v7 retired the Obsidian vault layer. Knowledge now lives in three surfaces, each with a single purpose:

| Layer | Tool | Purpose | Scope |
|-------|------|---------|-------|
| 1 | brain.db | Active memory cache — identity, decisions, sessions, notes, traces, handoffs | Project-local (`.ava/brain.db`) |
| 2 | Project-root `plans/` + `sessions/` | Narrative context — active strategy plans and structured session notes | Project-local, GitNexus-indexed |
| 3 | GitNexus | Code intelligence — symbol graph, call relationships, impact analysis | Ecosystem-wide index |

GitHub Projects (execution tracking) remains planned but is not part of the v7 knowledge surface.

### Project-Root Layout

```
{Project}/
├── .ava/brain.db          # Active memory (sessions, decisions, notes, identity, traces)
├── .ava/handoffs/*.yaml   # Auto-pruned to 20; emitted at closeout
├── plans/                 # Active strategy (one canonical plan preferred)
│   └── archive/           # Superseded plans with ARCHIVE_RECEIPT.md
├── sessions/session-{N}.md  # Curated session notes (written by session-export)
├── CLAUDE.md              # Rules, auto-loaded
├── SYSTEM-OVERVIEW.md     # Operating manual (optional)
└── README.md              # Human entry
```

### Session Note Schema

Every file at `sessions/session-{N}.md` uses a fixed schema for GitNexus indexing:
```
# Session {N} — {title}
**date:** YYYY-MM-DD  **version:** X.Y.Z  **session_id:** ...  **exit:** normal

## Summary
## Decisions
## Files Changed
## Notes Opened / Closed
## Continuity → Next Session
## Cross-Refs
```

### Bridges

- **Closeout to sessions/:** `/session-closeout` runs `dal.mjs session-export session "..."` when the session produced durable narrative or architectural value. Trivial sessions skip. Auto-fires via Stop hook.
- **brain.db and plans/:** brain.db holds "what's live right now" (open notes, active decisions, current session). `plans/` holds "the active strategy we're executing against." `plans/archive/` with receipts holds "the strategy we used to have, with pointers to where its live content ended up."
- **Cross-references:** session notes link back to the plan, decisions, and handoff that shaped them; archive receipts link forward to where extracted content landed.

---

## Session Lifecycle

```
SessionStart
  session-context.js fires:
  - Injects brain.db context (identity, architecture, decisions)
  - Injects git status + recent commits
  - Adds REMINDER: "Run /session-closeout at end of session"
      |
      v
/session-init
  Agent reads docs, verifies state, reviews past performance,
  reads open notes, presents ready state with priorities.
  Plans before implementing. Awaits confirmation.
      |
      v
Work
  Agent implements, records actions + metrics, makes decisions.
  Uses dal.mjs CLI to persist state throughout the session.
      |
      v
/session-closeout
  Persists state: update docs, export session note to sessions/,
  generate handoff YAML, close session.
      |
      v
Stop
  stop-closeout-check.js: warns if docs stale >120min
  session-export-on-close.js: auto-fires session-export if not already exported
  completion-check.js: warns about partial-outcome actions
```

### How Pieces Interact

1. **Hooks inject brain.db context** — agent starts every session with the continuity brief (identity, handoff, notes, plans, contradictions)
2. **Skills read `.claude/.prompts/`** — protocols are in markdown files, skills are thin wrappers
3. **Agent records to brain.db** — identity, decisions, notes, traces during work
4. **Closeout writes session note to sessions/** — when the session warrants durable narrative context; auto-fires on Stop if not done manually
5. **Handoff YAML** — structured session state for the next session to pick up
6. **`/cleanup` reconciles** — reads codebase docs, fills brain.db gaps, detects drift

---

## CLAUDE.md Boundaries

CLAUDE.md is auto-loaded by Claude Code when entering a project directory. It should contain ONLY:

**Include:**
- Version header (first line): `**Version:** X.Y.Z | **Status:** ... | **Updated:** ...`
- Critical rules (DO NOT / ALWAYS) — front-loaded, before everything else
- Quick reference (build/run commands)
- File structure overview
- Key commands table
- Ecosystem table (for multi-project setups)

**Exclude:**
- Architecture decisions — brain.db `decisions` table
- Session state — brain.db `sessions` table
- Endpoint lists or feature inventories — codebase is truth
- Long-form historical narrative beyond the current operating rules — sessions/, plans/archive/, or brain.db decisions
- Task checklists — brain.db `notes` table

**Target size:** 80-300 lines. Keep CLAUDE.md focused on rules, commands, and DO/DON'T. When it grows beyond this, reference content should migrate to SYSTEM-OVERVIEW.md or brain.db.

---

## Documentation Creation Templates

When bootstrapping a new project's documentation system, create the core operating docs and hydrate brain.db. These templates provide the scaffold — adapt them to the specific project.

### CLAUDE.md Template

```markdown
# [Project Name]

**Version:** 1.0.0 | **Status:** [Status] | **Updated:** [Date]

---

## Critical Rules

### DO NOT
- [Anti-pattern with explanation — front-load the most dangerous ones]

### ALWAYS
- [Required practice with location reference]

---

## Quick Reference

[1-2 sentence project description]

**Run:** `[command]`
**Build:** `[command]`
**Test:** `[command]`

---

## File Structure

[Directory tree with brief descriptions]

---

## Key Commands

[Commands table or code blocks]
```

**Quality check:** Read ONLY your CLAUDE.md. Can you avoid every critical mistake in this project? If not, the DO NOT section is incomplete.

### SYSTEM-OVERVIEW.md Template

Place at project root. Contains: knowledge layers, storage rules, operating principles, toolbox, DAL command reference, plan lifecycle, session-export contract, and error protocol.

### brain.db Bootstrap

Create `.ava/brain.db` via `/dal-doctor`, then hydrate core identity, architecture, decisions, notes, and session continuity state through DAL commands. Do not recreate `PROJECT_ROADMAP.md` or `IMPLEMENTATION_PLAN.md`; those are retired.

### Routing Rule

| Question | Document |
|----------|----------|
| "What must I never do?" | CLAUDE.md |
| "How do I run/build this?" | CLAUDE.md |
| "Why was this decision made?" | brain.db decisions |
| "What should I do next?" | brain.db notes + active plans |

Information lives in ONE place. Other documents reference, never duplicate.

---

## Ecosystem Context

PE (Prompt Engineering) is the canonical source for the template. `template/` deploys to downstream projects.

| Project | Role | Schema |
|---------|------|--------|
| PE | Canonical template source | v13 |
| Ava_Main | Primary downstream, hub | v13 (local extensions) |
| McQueenyML | Downstream (Frank, remote, custom-curated) | v15 (local extensions) |
| CloudBooks, seatwise, tradeSignal, cheatSheets, 3D_Printing, adze-cad | Downstream | v13 |
| WATTS | Downstream | v12 (migration pending) |

**Deployment flow:** PE template to downstream projects via `dal.mjs template sync` or manual copy. Remote projects (Frank, Zoe) via SCP.

**PE is canonical.** dal.mjs, lib/, migrations/ come from PE. Don't edit them in downstream projects.
