# Agent System Reference

**For:** PE Documentation Framework v5.12.0 | **Schema:** v12 | **Updated:** 2026-03-30

This is the single reference document for understanding the full agent memory and documentation system. Any agent — Claude or otherwise — should be able to read this file and understand how the system works.

---

## Quick Start

- **brain.db** at `.ava/brain.db` — SQLite database, schema v12, 10 tables. Active memory cache for session continuity.
- **Prompts** at `.prompts/*.md` — protocol files for skills. Canonical location: **project root**. NOT `documentation/.prompts/` (legacy, should be deleted if found).
- **Skills** invoked via `/skill-name` slash commands. Definitions in `.claude/skills/*/SKILL.md`.
- **Hooks** in `.claude/hooks/*.js` — auto-fire on tool use and session events. 8 hooks deployed.
- **Vault** — persistent knowledge web (Layer 2). Optional. Resolve path: brain.db `vault.path` > `$OBSIDIAN_VAULT` > `~/Obsidian/Ava/{ProjectName}/`.
- **CLAUDE.md** at project root — critical rules, auto-loaded by Claude Code. Keep under 5KB.
- **Full project state:** `node .ava/dal.mjs context` — generates the context payload injected at session start.

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
node .ava/dal.mjs session close                    # Close with summary
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
node .ava/dal.mjs template sync <path> --dal        # Also sync DAL runtime
```

---

## File System Layout

### `.prompts/` — Skill Protocol Files

Markdown files containing detailed protocols that skills read at invocation time. **Canonical location: project root.** Skills reference `.prompts/*.md` — never `documentation/.prompts/`.

Each prompt file is a standalone protocol: oriented toward a specific workflow (init, closeout, debugging, etc.) with step-by-step instructions an agent can follow.

Current inventory (21 active):
`init.md`, `closeout.md`, `cleanup.md`, `dal-doctor.md`, `system-reference.md` (this file), `explore.md` (includes discovery mode), `validate.md` (includes docs/setup/readme checks), `architecture.md`, `code-review.md`, `debugging.md`, `requirements.md`, `testing.md`, `refactor.md`, `migration.md`, `together.md`, `agent-qa.md`, `METRICS.md`, `plan-validator.md`, `supabase.md`, `triage.md`, `ui-dev.md`

### `.claude/skills/` — Slash Command Definitions

Each subdirectory contains a `SKILL.md` file defining a slash command (`/skill-name`). The SKILL.md provides:
- Frontmatter: name, description, allowed-tools
- Brief protocol summary (inline fallback if .prompts/ file missing)
- References the corresponding `.prompts/*.md` for full protocol

Skills are thin wrappers. The real protocol lives in `.prompts/`.

### `.claude/hooks/` — Automated Guards & Context Injection

Hooks fire automatically on Claude Code events. They are `.js` files (CommonJS via `require()`).

| Hook | Event | Purpose |
|------|-------|---------|
| `session-context.js` | SessionStart, SessionResume | Injects brain.db context + git status + REMINDER about `/session-closeout` |
| `block-protected-files.js` | PreEdit, PreWrite | Blocks writes to protected files (.env, lock files, credentials, secrets, etc.) |
| `block-dangerous-commands.js` | PreBash | Blocks catastrophic commands (rm -rf /, force push main, etc.) |
| `typecheck-on-edit.js` | PostEdit, PostWrite | Runs type checker on modified files (if tsconfig exists) |
| `lint-on-edit.js` | PostEdit, PostWrite | Runs linter on modified files (if eslint/prettier configured) |
| `stop-closeout-check.js` | Stop | Warns if docs stale >120min and uncommitted changes exist |
| `completion-check.js` | Stop | Warns about partial-outcome actions in the learning loop |

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

## Obsidian Vault — Four-Layer Knowledge Architecture

### The Four Layers

| Layer | Tool | Purpose | Status |
|-------|------|---------|--------|
| 1 | brain.db | Active memory cache — current session context | Deployed |
| 2 | Obsidian vault | Knowledge web — persistent notes with wiki-links | Deployed |
| 3 | ChromaDB | RAG retrieval — semantic search over vault | Deferred (until 50+ vault notes) |
| 4 | GitHub Projects | Execution tracking — issues, milestones, kanban | Planned |

### Vault Structure

Single vault per ecosystem. Resolve path: brain.db `vault.path` > `$OBSIDIAN_VAULT` > `~/Obsidian/Ava/`. One folder per project.

```
~/Obsidian/Ava/   (or resolved vault path)
├── _templates/              # Note templates (session, decision, plan, schema, architecture)
├── _inbox/                  # Unsorted notes
├── PE/                      # Prompt Engineering
│   ├── sessions/            # Session summaries
│   ├── architecture/        # Architecture decisions & overviews
│   ├── plans/               # Active plans
│   ├── schemas/             # Schema documentation
│   └── VAULT_GUIDE.md       # Project-specific vault guide
├── Ava_Main/
├── TradeSignal/
├── CloudBooks/
└── ...                      # One folder per project
```

### Note Templates (YAML Frontmatter)

Every vault note has frontmatter:
```yaml
---
type: session|decision|plan|schema|architecture
project: pe|ava-main|tradesignal|cloudbooks|...
status: completed|active|superseded
date: YYYY-MM-DD
tags: [tag1, tag2]
---
```

### Bridges

- **Closeout to Vault:** `/session-closeout` exports session summary, decisions, and file changes as a vault session note.
- **Vault to ChromaDB:** Future. `vault-sync` will embed vault notes for semantic retrieval.
- **brain.db and Vault:** brain.db is the fast cache; vault is the persistent record. When something graduates from "active concern" to "reference knowledge," it moves to the vault.

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
  Persists state: update docs, write vault notes, generate YAML
  handoff, record final actions/metrics, close session.
      |
      v
Stop
  stop-closeout-check.js: warns if docs stale >120min
  completion-check.js: warns about partial-outcome actions
```

### How Pieces Interact

1. **Hooks inject brain.db context** — agent starts every session with full project state
2. **Skills read `.prompts/`** — protocols are in markdown files, skills are thin wrappers
3. **Agent records to brain.db** — identity, architecture, decisions, actions, metrics during work
4. **Closeout writes vault notes** — session summaries, decisions persist beyond brain.db
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
- Version history beyond current — `PROJECT_ROADMAP.md`
- Task checklists — brain.db `notes` table or `IMPLEMENTATION_PLAN.md`

**Target size:** 80-300 lines, under 5KB. When CLAUDE.md exceeds this, content should migrate to brain.db or spoke docs.

---

## Documentation Creation Templates

When bootstrapping a new project's documentation system, create three files. These templates provide the scaffold — adapt them to the specific project.

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

### PROJECT_ROADMAP.md Template

Place in `documentation/`. Contains: project vision, version history table, architecture overview, tech stack with rationale, future roadmap, alternatives considered.

### IMPLEMENTATION_PLAN.md Template

Place in `documentation/`. Contains: current status, task checklists, known issues/blockers, debugging notes, files modified, handoff notes for next session.

### Routing Rule

| Question | Document |
|----------|----------|
| "What must I never do?" | CLAUDE.md |
| "How do I run/build this?" | CLAUDE.md |
| "Why was this decision made?" | PROJECT_ROADMAP.md |
| "What should I do next?" | IMPLEMENTATION_PLAN.md |

Information lives in ONE place. Other documents reference, never duplicate.

---

## Ecosystem Context

PE (Prompt Engineering) is the canonical source for the template. `template/` deploys to downstream projects.

| Project | Role | Schema |
|---------|------|--------|
| PE | Canonical template source | v12 |
| Ava_Main | Primary downstream, hub | v13 (local extensions) |
| McQueenyML | Downstream (Frank, remote) | v15 (local extensions) |
| CloudBooks, seatwise, tradeSignal, WATTS | Downstream | v12 |
| adze-cad | Downstream (Zoe, remote) | v12 |

**Deployment flow:** PE template to downstream projects via `dal.mjs template sync` or manual copy. Remote projects (Frank, Zoe) via SCP.

**PE is canonical.** dal.mjs, lib/, migrations/ come from PE. Don't edit them in downstream projects.
