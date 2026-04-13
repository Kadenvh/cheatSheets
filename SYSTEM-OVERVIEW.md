# System Overview - Agent Operating Manual

**Version:** 7.0.0-rc1 | **Updated:** 2026-04-13 | **Schema:** v13

This document is the single operator manual for the PE framework and every downstream project that uses it. Read it at session start alongside `CLAUDE.md`. `CLAUDE.md` holds project-specific rules; this file explains what exists, how it works, and how to use it. Both ship with the template.

**Before editing anything, read `§2 Operating Principles` below.** It captures the doctrine the system enforces — verify before self-reporting, verify before planning, keep DAL lean, use GitNexus for structure, cobbler's-children, operator model, scope discipline. These are not optional; they are the reliability contract.

---

## 0. Critical Rules (Project Default)

These apply to every project using the PE framework. Project `CLAUDE.md` may add more but should not contradict these.

### DO NOT
- Commit `.ava/` — brain.db is gitignored by design
- Manually create memory files — `.claude/memory/` is AutoMemory-managed or sparingly curated, never hand-authored
- Create documentation files for content that belongs in brain.db (architecture, decisions, session state)
- Put `plans/` or `sessions/` under `.claude/` — they live at the project root (non-deployable working state)
- Create or maintain Obsidian vault folders for projects — the vault layer was retired in v7

### ALWAYS
- Start a DAL session for significant work: `node .ava/dal.mjs session start "..."`
- Record traces during work as findings happen, not only at closeout: `node .ava/dal.mjs trace add <type> "what you did and why"`
- Record decisions with rationale: `node .ava/dal.mjs decision add --title "..." --context "..." --chosen "..." --rationale "..."`
- Close session with summary: `node .ava/dal.mjs session close --summary "what happened"`
- Export a structured session note at closeout when the session warrants it: `node .ava/dal.mjs session-export session "summary"` — writes `sessions/session-{N}.md` at project root
- Ask GitNexus or read code directly when you need structural answers — do not duplicate code structure into docs or the DAL

### Session Lifecycle
`/session-init` → work → `/session-closeout`. Each is a skill; the full protocol lives in `.claude/.prompts/init.md` and `.claude/.prompts/closeout.md`.

### When brain.db Doesn't Exist
Run `/dal-doctor`. It provisions the `.ava/` runtime, creates brain.db, and hydrates minimal identity. Do not fall back to file-only mode.

### Settings Priority
Project `.claude/settings.local.json` overrides `.claude/settings.json`. Global `~/.claude/` settings are system-level defaults — **project settings always win.** `autoMemoryDirectory` must be set in `settings.local.json` to `.claude/memory`.

### Error Handling
Never swallow errors silently. If a command fails, a file is missing, or brain.db is unreachable:
1. Record it as a note or include it in the handoff/closeout summary
2. Report the error to the user — what failed, the error message, and a suggested fix
3. If it reveals a systemic issue, record it as a brain.db decision or convention `arch` entry

---

## 1. Knowledge Layers & Storage Rules

### Core Working Layers

The system works best when each layer answers a different class of question.

| Layer | What It Stores | How You Access It | Updated When |
|-------|---------------|-------------------|-------------|
| **CLAUDE.md** | DO/DON'T rules, build commands, key constraints | Auto-loaded every session | Closeout or when rules change |
| **plans/** (project root) | Active strategy and execution plans | Read directly | Sessions that touch the plan's domain |
| **sessions/** (project root) | Curated structured session notes | Written by `session-export` at closeout | Every significant session |
| **brain.db** | Continuity state: sessions, notes, decisions, minimal identity | Hook-injected at session start via `continuity brief`, DAL commands during work | During work + closeout |
| **GitNexus / live code** | Code structure, symbol relationships, route maps, impact analysis | GitNexus tools or direct inspection | On demand |

### Optional / Compatibility Layers

| Layer | What It Stores | Status |
|-------|---------------|--------|
| **.claude/memory/** | Optional observations that are not canonical elsewhere | Compatibility surface, not first-class |

### Deployable vs Non-Deployable Surface

The project root splits into two kinds of content:

| Surface | Contents | Ships via Sync All? |
|---|---|---|
| **Deployable (`.claude/`)** | skills, hooks, `.prompts/`, agents, settings | Yes — template sync pushes this to downstream |
| **Non-deployable (project root)** | `plans/`, `sessions/`, `agent-definitions/` (PE only), README, CHANGELOG, CLAUDE.md, OVERVIEW.md | No — project-local, each project manages its own |
| **Exception** | `CLAUDE.md` is in the deployable set conceptually but the sync never overwrites an existing project's CLAUDE.md — so it behaves as non-deployable in practice. Template no longer ships a scaffold CLAUDE.md; projects author their own. |

### Where Things Live — canonical rules

The system had accumulated too many overlapping storage locations. These rules resolve it: **one place per question, obvious by domain**.

| Information type | Lives in | Rationale |
|------------------|----------|-----------|
| Rules / commands / DO-DON'T | `CLAUDE.md` (project root) | Auto-loaded every session. Keep focused: rules and commands only |
| Agent operating manual (what exists, how to use it) | `SYSTEM-OVERVIEW.md` (this file) | Read on demand, reference material |
| "Who am I / what is this project?" | Minimal brain.db `identity` + `CLAUDE.md` | Lightweight continuity, not identity sprawl |
| "Why did we choose X?" | brain.db `decisions` | Active constraints and rationale |
| "What should we do next?" | brain.db `notes` + latest handoff + active plans | Next-step continuity |
| "What happened in session N?" | brain.db `sessions` + handoffs + `sessions/session-{N}.md` | Structured continuity, recent + historical |
| Living strategy being executed across sessions | `plans/` (project root) | Active work only |
| Superseded plans worth keeping | `plans/archive/` with extraction receipts | After value is extracted to canonical homes |
| One-off session-specific kickstart | `.ava/handoffs/` (YAML) **NOT plans/** | Kickstarts are not plans |
| Long-term mission / vision | `END-GOAL.md` at project root (optional) + `project.vision` identity key when load-bearing | Stable north star |
| User preferences / patterns / debug gotchas | `.claude/memory/` only if still useful | Optional compatibility, not canon |
| Code structure / file layout / dependencies | GitNexus or direct code inspection | **Never duplicate into docs or DAL by default** |
| Metrics / counts | Live queries at read time | **Never manually maintained as identity keys** |

**Enforcement:** `/validate` should flag content in the wrong place. Until all checks land, the rules are doctrine first and automation second.

**Retired storage (do not create or maintain):**
- `PROJECT_ROADMAP.md` / `IMPLEMENTATION_PLAN.md`
- `documentation/` folder
- root `archive/` directory
- `.claude/archive/cleanup-*` timestamped dirs
- `.claude/plans/` (plans moved to project root `plans/` in v7)
- Obsidian vault folders per project (vault layer retired in v7)
- ChromaDB semantic search (deferred for a long time, not in the active model)
- manual file-tree docs as a default requirement

---

## 2. Operating Principles

These principles are the reliability contract.

### Verify before self-reporting

Every `[x] done` claim must have a corresponding verification artifact: grep output, SQL/query result, file diff, or command return value.

- File edits → `git diff --stat` or grep showing the new value
- DAL writes → `dal.mjs identity get <key>`, `dal.mjs decision list`, or `dal.mjs note list`
- Deletions → `ls` or `git status` showing the file gone
- Record important verification evidence in the handoff or traces when useful

**No completion without an artifact.** Not negotiable.

### Verify before planning

Plans can launder unverified values as easily as completions can. Before asserting any value in a plan, trace it to a live query or verified artifact.

### Honest metrics or no metrics

Counts, percentages, and quantitative keys must be **derived from live queries at read time**, never manually maintained as identity strings.

If you cannot make a metric objective, remove it.

### Keep DAL lean

brain.db should answer continuity questions:

- what happened recently
- what is still open
- what decisions constrain the next move
- what the next session should do

It should **not** become a second documentation tree, a code-structure index, or a project encyclopedia.

### GitNexus owns derivable structure

If the question is about callers, imports, routes, blast radius, or how symbols connect, prefer GitNexus or direct code reads.

Do not maintain manual file trees, route maps, symbol inventories, or broad structural summaries unless they add human interpretation GitNexus cannot provide.

### Cobbler's-children rule

Frameworks must eat their own dog food. If PE owns the template, PE's own `.claude/` must match `template/.claude/` exactly. Drift is a bug.

### Operator model

Not every project self-operates on a daily lifecycle. In this ecosystem:

- **Ava_Main** is the primary development environment and the default operator for PE template changes
- **PE** is the canonical template source plus PE's own implementation and validation environment
- **Downstream projects** receive the deployable `.claude` surface from the PE template, then provision or repair their own `.ava` runtime through `/dal-doctor`
- **Cross-project writes violate the operator model**

### Scope discipline

Every plan must include an explicit **"what I'm NOT doing"** section.

### State your understanding before acting

At session start, after reading CLAUDE.md, continuity state, and active plans, state your understanding back to the user: current state, likely next move, and proposed plan. Wait for confirmation.

### Context budget

Session-start injection should be bounded and continuity-first. The injected context should help the next session resume work, not dump the whole project into the prompt.

Target:

- continuity injection stays small enough to scan quickly
- structural questions go to GitNexus or direct inspection
- broad architecture accumulation trends down over time

---

## 3. Toolbox (skills/hooks/agents)

### Skills (slash commands)

Invoke with `/skill-name`. Each has a SKILL.md at `.claude/skills/{name}/SKILL.md` and a protocol file at `.claude/.prompts/{name}.md`.

| Skill | When to Use |
|-------|-------------|
| `/session-init` | Start of every session. Reads rules, verifies continuity, surfaces insights. |
| `/session-closeout` | End of session. Records continuity, updates the docs that actually changed, commits. |
| `/cleanup` | Structural hygiene + lean continuity repair. `--full-ingest` is for legacy migrations only. |
| `/validate` | Project health audit. Checks storage boundaries, deployment drift, and lean-DAL alignment. |
| `/dal-doctor` | System health, first-run setup, remediation. Run this if brain.db is missing or broken. |
| `/explore` | Non-implementation thinking. `--discovery` for structured pre-dev research. |
| `/triage` | Ecosystem-wide status. Reads health beacons and project-local state via brain.db. |
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
| `/criticism` | Adversarial strategic analysis. Find what's broken, fragile, or misaligned. |
| `/ship` | Secure commit/push/release. Secret scan, contribution attribution, release checklist. |
| `documentation-awareness` | Passive (not invocable). Thin boundary rules for continuity and storage discipline. |

### Hooks (fire automatically)

You don't invoke these. They run around you. Know they exist. **9 lifecycle hooks + 1 utility helper (`log-util.js` — a shared logging module that hooks require, not a hook itself). Total files in `.claude/hooks/`: 11 including `README.md`.**

| Hook | When | What It Does |
|------|------|-------------|
| `session-context.js` | Session start/resume | Injects git context, DAL continuity state, latest handoff YAML, agent identity (when used), drift reminders, health beacon emission, Syncthing health check, and SYSTEM-OVERVIEW read reminder. Treat structural questions separately via GitNexus or direct reads. |
| `block-protected-files.js` | Before Edit/Write | Blocks writes to `.env`, secrets, lock files, and selected protected files. Do not assume it protects `brain.db`; use DAL commands for `brain.db` changes. |
| `gitnexus-impact-check.js` | Before Edit/Write | Automatic impact analysis on source files (.js/.ts/.py/.rs/.go etc). Mode 1: injects blast radius to context, never blocks. Fail-open on errors. Bypass: `PE_GITNEXUS_SKIP=1` |
| `block-dangerous-commands.js` | Before Bash | Blocks rm -rf /, force push main, etc. |
| `typecheck-on-edit.js` | After Edit/Write | Runs `tsc --noEmit` on TS/TSX files |
| `lint-on-edit.js` | After Edit/Write | Runs eslint on modified files |
| `gitnexus-post-commit.js` | After git commit | Re-indexes codebase intelligence, scaffolds skill files |
| `stop-closeout-check.js` | Session end | Warns if docs stale >2hrs with uncommitted changes |
| `completion-check.js` | Session end | Compatibility hook for projects still using `agent_actions`. The long-term continuity model should not depend on it. |

### Agents (subprocesses)

| Agent | Purpose |
|-------|---------|
| `closeout-worker` | Autonomous session closeout. Dispatch instead of running /session-closeout inline. |
| `spoke-agent/` | Template for domain agents (Echelon pattern). Not invoked directly. |

---

## 4. brain.db - Your Active Memory

brain.db is a SQLite database at `.ava/brain.db`. You interact with it via `node .ava/dal.mjs`.

brain.db is the **continuity layer**. Its job is to help the next session resume work cleanly. It is not the place to mirror code structure, store broad narrative docs, or accumulate every fact an agent could possibly learn.

### Core Commands

```bash
# Health
node .ava/dal.mjs status              # Schema version, table counts, integrity
node .ava/dal.mjs context             # Current DAL context dump (transitional surface)
node .ava/dal.mjs verify              # 8-layer health verification

# Identity (minimal load-bearing project facts)
node .ava/dal.mjs identity list       # All identity entries
node .ava/dal.mjs identity set "key" --value "value"
node .ava/dal.mjs identity get "key"

# Decisions (architectural choices with rationale)
node .ava/dal.mjs decision add --title "T" --context "C" --chosen "O" --rationale "R"
node .ava/dal.mjs decision list

# Notes (task queue)
node .ava/dal.mjs note add "description" --category improvement|issue|bug|idea|handoff
node .ava/dal.mjs note list            # Open notes
node .ava/dal.mjs note complete <id>   # Mark done

# Sessions
node .ava/dal.mjs session start "description"
node .ava/dal.mjs session close --summary "what happened"

# Traces (breadcrumbs within a session)
node .ava/dal.mjs trace add "investigating: found X"

# Handoffs (session continuity)
node .ava/dal.mjs handoff generate "summary"
node .ava/dal.mjs handoff latest

# Template management
node .ava/dal.mjs template pull            # Fetch deployable template updates (.claude + system docs)
node .ava/dal.mjs template pull --dry-run  # Show what would change
node .ava/dal.mjs template manifest        # List all deployable files

# Session export (structured session notes — replaces retired vault-export)
node .ava/dal.mjs session-export session "summary"   # Writes sessions/session-{N}.md at project root
node .ava/dal.mjs session-export session "summary" --number 125  # Explicit session number

# Continuity brief (primary resume surface)
node .ava/dal.mjs continuity brief           # Human-readable
node .ava/dal.mjs continuity brief --json    # Machine-readable ContinuityBriefV1
#                                            # detectContradictions runs 6 Phase 4 checks:
#                                            # retired-storage, orphan-prompt, duplicate-active-plans,
#                                            # brain-db-outside-ava, scaffold-in-template, hook-protection-claims

# Plan consolidation (extract-first archival)
node .ava/dal.mjs consolidate <event-slug> --keep <plan> --archive <p1,p2,...> [--dry-run]
#                                            # Moves superseded plans to plans/archive/<slug>/ with receipt

# Health beacons (ecosystem monitoring)
node .ava/dal.mjs health --emit          # Write beacon to ~/.pe-health/
node .ava/dal.mjs ecosystem status       # Read all beacons
```

### Compatibility / Legacy DAL Surfaces

These still exist in the current schema but should not be treated as first-class by default:

```bash
# Legacy compatibility only
node .ava/dal.mjs arch list
node .ava/dal.mjs arch set "key" --value "description" --scope project|convention|ecosystem|infrastructure
node .ava/dal.mjs action record "description" --type feature|bugfix|maintenance --outcome success|failure|partial
node .ava/dal.mjs metric record <key> --value <number>
node .ava/dal.mjs loop summary
```

Use these only when a project still relies on them. The default direction is to keep DAL small and continuity-first.

### Schema (v13, 10 tables)

| Table | Role | Notes |
|-------|------|-------|
| `identity` | Minimal project facts | Keep small and load-bearing only |
| `decisions` | Active constraints and rationale | Core continuity surface |
| `sessions` | Session tracking | Core continuity surface |
| `notes` | Open work / blockers / handoff tasks | Core continuity surface |
| `schema_version` | Migration tracking | Operational only |
| `session_traces` | Optional breadcrumbs | Useful only when they improve handoffs |
| `architecture` | Legacy compatibility table | Do not use for broad structure dumps |
| `agent_actions` | Legacy learning-loop table | Compatibility only |
| `agent_metrics` | Legacy metrics table | Compatibility only |
| `agent_feedback` | Deprecated self-assessment table | Do not write new entries |

---

## 5. File Layout

### Canonical Project Structure

```
{Project}/
  CLAUDE.md                    # Rules (auto-loaded, project-specific)
  SYSTEM-OVERVIEW.md           # This file (system reference)
  README.md                    # Human entry point
  CHANGELOG.md                 # Version history
  END-GOAL.md                  # Long-term mission / vision (optional)
  plans/                       # Active strategy documents (project-local, non-deployable)
    archive/                   # Superseded plans with extraction receipts
  sessions/                    # Structured session notes (written by session-export)
  .claude/                     # Deployable surface — ships via template sync
    settings.json              # Hook registrations (checked in, from template)
    settings.local.json        # Machine overrides + autoMemoryDirectory (gitignored)
    skills/                    # Skill definitions (SKILL.md each)
    hooks/                     # Lifecycle hooks + utility helpers
    agents/                    # Subagents (closeout-worker, spoke-agent template)
    .prompts/                  # Skill protocol content
    memory/                    # Optional compatibility observations (not canonical)
  .ava/                        # DAL runtime (gitignored: brain.db, handoffs; lib/ canonical at PE)
    brain.db                   # SQLite continuity ledger
    dal.mjs                    # CLI interface
    lib/                       # Runtime modules
    migrations/                # Schema evolution
    handoffs/                  # YAML session handoffs (auto-pruned to 20)
  .gitnexus/                   # Codebase intelligence index (optional)
```

### Key Rules

- `plans/` and `sessions/` live at the **project root**, not under `.claude/`. They are project-local working state, never deployed.
- `.claude/` is the deployable surface: skills, hooks, agents, `.prompts/`, settings. Template sync pushes this to downstream projects.
- `.ava/brain.db` is gitignored. The DAL runtime (`lib/`, `dal.mjs`, `migrations/`) is canonical at PE and deployed to downstream projects via `template sync --dal`.
- `.claude/settings.local.json` is gitignored — machine-specific config.
- `.prompts/` lives inside `.claude/` (at `.claude/.prompts/`), not at project root.
- Retired: `.claude/plans/`, Obsidian vault folders, `documentation/`, `PROJECT_ROADMAP.md`, `IMPLEMENTATION_PLAN.md`, root `archive/`.

### Plans Convention

Plans in `plans/` (at project root) are **living strategy documents curated across sessions**. They are not one-shot artifacts — each session that touches a plan's domain should update it.

**Lifecycle:** Create → Curate (across sessions) → Implement → Validate → Extract durable value → Archive or delete intentionally

**All files in `plans/` are active by definition, except files already moved into `plans/archive/`.** If a plan is complete or superseded, extract its durable value into current docs/brain.db first. Keep it in `plans/archive/` only if the historical plan is still worth preserving, and write an `ARCHIVE_RECEIPT.md` alongside it documenting what was extracted and where.

**Plan structure convention:**

```markdown
# Title

**Created:** date (Session N) | **Status:** Active|Curating|Stabilized | **Updated:** date
**Depends on:** other-plan.md (what it needs)

## [Content sections specific to the plan's domain]

## Known Items (checkboxed work items, grouped by source/phase)

## Open Questions (unresolved design decisions)

## Sessions Contributing
| Session | Contribution |
|---------|-------------|

## Cross-References (links to related plans, brain.db entries, research)
```

**Status values:**
- **Active** — Strategic direction, being executed
- **Curating** — Being designed across sessions, not yet implementing
- **Stabilized** — Research/reference, no longer evolving but still relevant

**Session summaries are NOT plans.** They belong in `sessions/session-{N}.md` (written by `session-export`) + brain.db session records + handoff YAML. Don't accumulate session logs in `plans/`.

**Plans vs brain.db vs sessions:**
- **Plans** (`plans/`) — Working strategy (what SHOULD be). Living, evolving, agent-loaded.
- **brain.db** — Continuity state (what matters next). Decisions, notes, sessions, handoffs, minimal identity. Queryable.
- **Sessions** (`sessions/`) — Structured session notes with decisions/files-changed/notes-opened/continuity pointers. Indexed by GitNexus. Written by `session-export` at closeout.

### Template Deployment

This project's `.claude/` files (skills, hooks, agents, prompts, settings) come from the PE template. They are deployed via:

```bash
node .ava/dal.mjs template pull           # Pull template updates
```

The template source is set in brain.db: `node .ava/dal.mjs identity get template.source`

**Template sync NEVER overwrites:** `CLAUDE.md`, `brain.db`, `settings.local.json`. These are project-specific.

**Deployment boundary:** template deployment and `Documentation -> Sync All` at `ava:4173/documentation` update the deployable `.claude` and documentation surface. Project-local `.ava/` setup, repair, and validation are handled separately through `/dal-doctor`.

### Settings Priority

Project `.claude/settings.local.json` overrides `.claude/settings.json`. Global `~/.claude/` settings are system-level defaults. **Project settings always win.**

`autoMemoryDirectory` MUST be in `settings.local.json` (not settings.json) set to `.claude/memory`.

---

## 6. Session Lifecycle

### Standard Flow

```
/session-init
  1. CLAUDE.md auto-loaded (rules)
  2. DAL continuity brief injected by hook (state — latest handoff, open notes, decisions, plans, contradictions)
  3. Read SYSTEM-OVERVIEW.md (system understanding - this file)
  4. Read active `plans/` files at project root (exclude `archive/`)
  5. Skim latest `sessions/session-{N}.md` only if the handoff is ambiguous
  6. Use GitNexus or direct code reads for structural questions
  7. Surface insights, present plan
  8. Await confirmation

node .ava/dal.mjs session start "description"

  [work - record decisions, notes, and traces AS findings happen, not batched at closeout]

/session-closeout
  1. Inventory changes, determine version increment
  2. Record minimal continuity to brain.db (identity only if changed, decisions, notes)
  3. Update active plans touched by this session's work
  4. Generate handoff YAML
  5. Export structured session note if qualified (`session-export session "..."`)
  6. Update CLAUDE.md
  7. Commit
```

### When to Export a Session Note

Use `session-export` when the session has durable narrative or architectural value, for example:
- 1+ decisions made
- Version change
- Cross-project work
- Significant features implemented

Trivial sessions (minor fixes, maintenance only) normally skip session-export. Session notes are curated, not mandatory.

### Reliability Contract (session 134)

Init and closeout are the heartbeat. If they aren't reliable, nothing downstream is.

**Closeout enforces:**
- `dal.mjs health --emit` — refresh beacon (PE was silently skipping this pre-session-134)
- Cobbler's diff (PE only): `diff -rq .claude template/.claude | grep -v -E "^Only in \.claude(/hooks)?: (memory|hook-log\.jsonl|settings\.local\.json)$" | grep -v gitnexus` — output must be empty
- Verification artifacts for every `[x] done` claim (see §2 Operating Principles)
- Commit with attribution + session ID in message

**Init enforces:**
- State understanding before acting (see §2)
- Verify before planning (see §2)
- No cross-project writes (operator model, see §2)

---

## 7. Ecosystem Validation

### projects.json (Ava_Main)

`dal.mjs verify` Layer 6 checks cross-project consistency. It reads a registry file and iterates listed projects, verifying each has a working brain.db and (when run from PE) matches the template bundle.

**Location:** `.ava/agents/dal-doctor/projects.json` in Ava_Main (gitignored, local state).

**Schema:**
```json
{
  "projects": {
    "ProjectName": {
      "local_path": "/home/ava/ProjectName",
      "host": "optional-remote-host-name"
    }
  }
}
```

**Current state:** Ava_Main's `projects.json` registers 10 downstream projects (Prompt_Engineering, CloudBooks, seatwise, tradeSignal, cheatSheets, 3D_Printing, WATTS, SPDRbot, adze-cad remote zoe, McQueenyML remote frank). Created session 134 — Layer 6 was silent WARN for the entire v5.x lifecycle before that (session 120 PE handoff surfaced the gap).

**Dual-mode behavior:**
- When Ava_Main runs `dal verify`: brain.db sanity check runs for each project. Template bundle drift checks auto-skip (Ava_Main has no `template/` dir).
- When PE runs `dal verify`: full template bundle check runs for each downstream project (skills, hooks, prompts present/match).

### Health beacons

Each project emits a beacon to `~/.pe-health/<project-slug>.json` at closeout via `dal.mjs health --emit`. The beacon contains version, schema, drift counts, session count, last session timestamp.

`dal.mjs ecosystem status` reads all beacons and returns a summary. Beacons >48h old should be treated as stale — the project hasn't been touched or its closeout is skipping `health --emit`.

---

## 8. Error Protocol

**Never swallow errors silently.** If a command fails, a file is missing, or brain.db is unreachable:

1. Record the failure in the strongest current continuity surface available: note, decision, handoff, or `agent_actions` only if the project still relies on that legacy table
2. Report the error to the user - what failed, the error message, and a suggested fix
3. If systemic: capture it in a note, decision, or handoff. Use `arch set` only if the project still depends on that legacy surface.

Errors recorded this way become institutional knowledge that prevents future agents from hitting the same problem.

---

## 9. First Run / Missing System

If brain.db doesn't exist or is empty, run `/dal-doctor`. It handles:
- First-run detection and full system setup
- DAL runtime deployment from PE template
- brain.db creation and schema migration
- Identity hydration from existing docs
- Template sync validation
- Ongoing health checks and remediation

Do NOT manually create brain.db or fall back to file-only mode. `/dal-doctor` is the single entry point for all system health operations.
