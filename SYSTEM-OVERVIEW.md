# System Overview - Agent Operating Manual

**Version:** 5.16.0 | **Updated:** 2026-03-30 | **Schema:** v12

This document explains the full system you're working inside. Read it at session start alongside CLAUDE.md. CLAUDE.md tells you what to do and not do. This file tells you what exists, how it works, and how to use it.

---

## 1. What You Have Access To

### Five Knowledge Layers

Content flows DOWN during closeout. Each layer has a specific purpose.

| Layer | What It Stores | How You Access It | Updated When |
|-------|---------------|-------------------|-------------|
| **CLAUDE.md** | DO/DON'T rules, build commands, tech stack, file structure | Auto-loaded every session | Closeout or when rules change |
| **.claude/memory/** | Working observations, patterns, coding style, user preferences | Auto-loaded every session | Automatically (AutoMemory) |
| **brain.db** | Decisions (why), architecture (how), identity (who), sessions (when), notes (what's next), learning loop (performance) | Hook-injected at session start | DAL commands during work + closeout |
| **Obsidian vault** | Session narratives, architecture notes, strategic plans | Read when you need strategic context | Conditional export at closeout |
| **ChromaDB** | Semantic search over vault content | `node .ava/dal.mjs vault query "search term"` | `dal.mjs vault sync` after vault updates |

### What Goes Where

| Content Type | Put It In | NOT In |
|-------------|-----------|--------|
| Rules, anti-patterns, key commands | CLAUDE.md | brain.db, vault |
| Debug patterns, coding gotchas | .claude/memory/ | CLAUDE.md |
| "Why did we choose X?" | brain.db `decision add` | Files |
| "How does X work?" | brain.db `arch set` | CLAUDE.md |
| Project name, version, vision | brain.db `identity set` | Files |
| Task queue, open bugs | brain.db `note add` | TODO.md files |
| Session narratives, strategic plans | Obsidian vault | brain.db |

---

## 2. Your Toolbox - Skills, Hooks, and Agents

### Skills (slash commands)

Invoke with `/skill-name`. Each has a SKILL.md at `.claude/skills/{name}/SKILL.md` and a protocol file at `.claude/.prompts/{name}.md`.

| Skill | When to Use |
|-------|-------------|
| `/session-init` | Start of every session. Reads docs, verifies state, surfaces insights. |
| `/session-closeout` | End of session. Records state, updates docs, commits. |
| `/cleanup` | Reconcile brain.db against docs. `--full-ingest` reads every doc. |
| `/validate` | Project health audit. `--fix` auto-corrects safe issues. |
| `/dal-doctor` | System health, first-run setup, remediation. Run this if brain.db is missing or broken. |
| `/explore` | Non-implementation thinking. `--discovery` for structured pre-dev research. |
| `/triage` | Ecosystem-wide status. Reads health beacons across all projects. |
| `/together` | Shift from execution to relationship mode. Human first, task second. |
| `/architecture` | Design systems, write ADRs, review existing architecture. |
| `/requirements` | Translate briefs into buildable specs with acceptance criteria. |
| `/testing` | Test strategy, generate tests, audit coverage. |
| `/code-review` | Structured review with prioritized feedback. |
| `/debugging` | Systematic bug investigation with root cause analysis. |
| `/refactor` | Structured improvement with behavior preservation. |
| `/migration` | Data, schema, API, or infrastructure migrations with rollback safety. |
| `/plan-validator` | Audit plans for completeness. `--research` auto-investigates unknowns. |
| `/frontier-research` | Deep technology research. Standard/deep/ultra modes. |
| `/ui-dev` | Frontend: components, pages, styling in React + Tailwind. |
| `/supabase` | Schema design, RLS, auth, edge functions, storage. |
| `documentation-awareness` | Passive (not invocable). Enforces content boundaries automatically. |

### Hooks (fire automatically)

You don't invoke these. They run around you. Know they exist.

| Hook | When | What It Does |
|------|------|-------------|
| `session-context.js` | Session start/resume | Injects brain.db state, git context, handoff YAML, template drift warning |
| `block-protected-files.js` | Before Edit/Write | Blocks writes to .env, secrets, lock files, brain.db |
| `block-dangerous-commands.js` | Before Bash | Blocks rm -rf /, force push main, etc. |
| `typecheck-on-edit.js` | After Edit/Write | Runs `tsc --noEmit` on TS/TSX files |
| `lint-on-edit.js` | After Edit/Write | Runs eslint on modified files |
| `gitnexus-post-commit.js` | After git commit | Re-indexes codebase intelligence |
| `stop-closeout-check.js` | Session end | Warns if docs stale >2hrs with uncommitted changes |
| `completion-check.js` | Session end | Warns if actions have partial outcomes |

### Agents (subprocesses)

| Agent | Purpose |
|-------|---------|
| `closeout-worker` | Autonomous session closeout. Dispatch instead of running /session-closeout inline. |
| `spoke-agent/` | Template for domain agents (Echelon pattern). Not invoked directly. |

---

## 3. brain.db - Your Active Memory

brain.db is a SQLite database at `.ava/brain.db`. You interact with it via `node .ava/dal.mjs`.

### Core Commands

```bash
# Health
node .ava/dal.mjs status              # Schema version, table counts, integrity
node .ava/dal.mjs context             # Full state dump (what session-context hook injects)
node .ava/dal.mjs verify              # 8-layer health verification

# Identity (core project facts)
node .ava/dal.mjs identity list       # All identity entries
node .ava/dal.mjs identity set "key" --value "value"
node .ava/dal.mjs identity get "key"

# Architecture (system knowledge)
node .ava/dal.mjs arch set "key" --value "description" --scope project|convention|ecosystem|infrastructure
node .ava/dal.mjs arch list
node .ava/dal.mjs arch list --scope convention

# Decisions (architectural choices with rationale)
node .ava/dal.mjs decision add "title" --rationale "why" --alternatives "what else" --status active

# Notes (task queue)
node .ava/dal.mjs note add "description" --category improvement|issue|bug|idea|handoff
node .ava/dal.mjs note list            # Open notes
node .ava/dal.mjs note resolve <id>    # Mark done

# Sessions
node .ava/dal.mjs session start "description"
node .ava/dal.mjs session close --summary "what happened"

# Traces (breadcrumbs within a session)
node .ava/dal.mjs trace add "investigating: found X"

# Actions (record what you did)
node .ava/dal.mjs action record "description" --type feature|bugfix|maintenance|deployment --outcome success|failure|partial

# Metrics (track progress)
node .ava/dal.mjs metric set "key" --value <number>

# Learning loop (review past performance)
node .ava/dal.mjs loop summary
node .ava/dal.mjs action rate <type>

# Handoffs (session continuity)
node .ava/dal.mjs handoff generate "summary"
node .ava/dal.mjs handoff latest

# Template management
node .ava/dal.mjs template pull          # Fetch template updates
node .ava/dal.mjs template pull --dal    # Also update DAL runtime
node .ava/dal.mjs template diff          # Show what's changed
node .ava/dal.mjs template manifest      # List all deployable files

# Vault
node .ava/dal.mjs vault-export session "summary"
node .ava/dal.mjs vault sync {ProjectSlug}
node .ava/dal.mjs vault query "search term"

# Health beacons (ecosystem monitoring)
node .ava/dal.mjs health --emit          # Write beacon to ~/.pe-health/
node .ava/dal.mjs ecosystem status       # Read all beacons
```

### Schema (v12, 10 tables)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `identity` | Core project facts (name, version, vision, stack) | key, value |
| `architecture` | System knowledge (how things work) | key, value, scope |
| `decisions` | Architectural choices with rationale | title, rationale, alternatives, status |
| `sessions` | Session tracking (start/end, summary) | id, description, summary, status |
| `notes` | Task queue (bugs, improvements, ideas) | body, category, status, tab_key |
| `traces` | Within-session breadcrumbs | session_id, content |
| `agent_actions` | What was done and outcome | description, type, outcome |
| `agent_metrics` | Quantitative tracking | key, value |
| `agent_feedback` | Self-assessment | type, sentiment, content |
| `schema_version` | Migration tracking | version |

---

## 4. File Layout

### Canonical Project Structure

```
{Project}/
  CLAUDE.md                    # Rules (auto-loaded, project-specific)
  SYSTEM-OVERVIEW.md           # This file (system reference)
  README.md                    # Human entry point
  .claude/
    settings.json              # Hook registrations (checked in, from template)
    settings.local.json        # Machine overrides + autoMemoryDirectory (gitignored)
    skills/                    # 20 skill definitions (SKILL.md each)
    hooks/                     # 9 automated guards + context injection
    agents/                    # Subagents (closeout-worker, spoke-agent template)
    .prompts/                  # 22 skill protocol files (from template)
    plans/                     # Active session plans + kickstarts
    memory/                    # AutoMemory observations (auto-managed)
  .ava/                        # DAL runtime (gitignored)
    brain.db                   # SQLite active memory
    dal.mjs                    # CLI interface
    lib/                       # Runtime modules
    migrations/                # Schema evolution
    handoffs/                  # YAML session handoffs (auto-pruned to 20)
  .gitnexus/                   # Codebase intelligence index (optional)
```

### Key Rules

- `.ava/` is gitignored - brain.db is never committed
- `.claude/settings.local.json` is gitignored - contains machine-specific config
- `.prompts/` lives inside `.claude/` (at `.claude/.prompts/`), not at project root
- Plans live in `.claude/plans/`, not in a `documentation/` folder
- `documentation/` folder does NOT exist (eliminated v5.14.0)

### Template Deployment

This project's `.claude/` files (skills, hooks, agents, prompts, settings) come from the PE template. They are deployed via:

```bash
node .ava/dal.mjs template pull           # Pull template updates
node .ava/dal.mjs template pull --dal     # Also update DAL runtime (.ava/)
```

The template source is set in brain.db: `node .ava/dal.mjs identity get template.source`

**Template sync NEVER overwrites:** `CLAUDE.md`, `brain.db`, `settings.local.json`. These are project-specific.

### Settings Priority

Project `.claude/settings.local.json` overrides `.claude/settings.json`. Global `~/.claude/` settings are system-level defaults. **Project settings always win.**

`autoMemoryDirectory` MUST be in `settings.local.json` (not settings.json) set to `.claude/memory`.

---

## 5. Session Lifecycle

### Standard Flow

```
/session-init
  1. CLAUDE.md auto-loaded (rules)
  2. brain.db context injected by hook (state)
  3. Read SYSTEM-OVERVIEW.md (system understanding - this file)
  4. Check .claude/plans/ for kickstarts
  5. Check vault for strategic context
  6. Review learning loop (what worked/failed)
  7. Surface insights, present plan
  8. Await confirmation

node .ava/dal.mjs session start "description"

  [work - record traces, actions, decisions as you go]

/session-closeout
  1. Inventory changes, determine version increment
  2. Record to brain.db (identity, arch, decisions, notes, actions)
  3. Generate handoff YAML
  4. Export vault note (if qualified)
  5. Update CLAUDE.md
  6. Commit
```

### When to Export to Vault

Export a vault session note when the session has ANY of:
- 1+ decisions made
- Version change
- Cross-project work
- Significant features implemented

Trivial sessions (minor fixes, maintenance only) skip vault export.

---

## 6. Obsidian Vault

### Structure

```
~/Obsidian/Ava/{ProjectSlug}/
  sessions/       # Session summary notes
  architecture/   # Architecture decisions and patterns
  plans/          # Strategic plans
  schemas/        # Data schemas
  archive/        # Archived content
  END-GOAL.md     # Project north star (optional)
  VAULT_GUIDE.md  # Project vault governance
```

### Rules

- Dev agents READ vault for strategic context. They do NOT write directly.
- Session notes are exported via `dal.mjs vault-export session`.
- brain.db is active memory (current state). Vault is knowledge web (persistent, curated).
- NO project files in the vault - no code, configs, node_modules, .git, .ava, .claude.

---

## 7. Error Protocol

**Never swallow errors silently.** If a command fails, a file is missing, or brain.db is unreachable:

1. Record: `node .ava/dal.mjs action record "<what failed>" --type <type> --outcome failure`
2. Report the error to the user - what failed, the error message, and a suggested fix
3. If systemic: `node .ava/dal.mjs arch set "error.<topic>" --value "<description + fix>" --scope convention`

Errors recorded this way become institutional knowledge that prevents future agents from hitting the same problem.

---

## 8. First Run / Missing System

If brain.db doesn't exist or is empty, run `/dal-doctor`. It handles:
- First-run detection and full system setup
- DAL runtime deployment from PE template
- brain.db creation and schema migration
- Identity hydration from existing docs
- Template sync validation
- Ongoing health checks and remediation

Do NOT manually create brain.db or fall back to file-only mode. `/dal-doctor` is the single entry point for all system health operations.
