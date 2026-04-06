# System Overview - Agent Operating Manual

**Version:** 6.0.0-rc1 | **Updated:** 2026-04-06 | **Schema:** v13

This document explains the full system you're working inside. Read it at session start alongside CLAUDE.md. CLAUDE.md tells you what to do and not do. This file tells you what exists, how it works, and how to use it.

**Before editing anything, read `§2 Operating Principles` below.** It captures the doctrine the system enforces — verify before self-reporting, verify before planning, honest metrics, cobbler's-children, operator model, scope discipline. These are not optional; they are the reliability contract.

---

## 1. Knowledge Layers & Storage Rules

### Five Knowledge Layers

Content flows DOWN during closeout. Each layer has a specific purpose.

| Layer | What It Stores | How You Access It | Updated When |
|-------|---------------|-------------------|-------------|
| **CLAUDE.md** | DO/DON'T rules, build commands, tech stack, file structure | Auto-loaded every session | Closeout or when rules change |
| **.claude/memory/** | Working observations, patterns, coding style, user preferences | Auto-loaded every session | Automatically (AutoMemory) |
| **brain.db** | Decisions (why), architecture (how), identity (who), sessions (when), notes (what's next), learning loop (performance) | Hook-injected at session start | DAL commands during work + closeout |
| **Obsidian vault** | Session narratives, architecture notes, strategic plans | Read when you need strategic context | Conditional export at closeout |
| **ChromaDB** | Semantic search over vault content | `node .ava/dal.mjs vault query "search term"` | `dal.mjs vault sync` after vault updates |

### Where Things Live — canonical rules (session 134)

The system had accumulated 12+ storage locations with overlapping responsibilities. These rules resolve it: **one place per question, obvious by domain**. If the right home is non-obvious for a given piece of information, search this table first.

| Information type | Lives in | Rationale |
|------------------|----------|-----------|
| Rules / commands / DO-DON'T | `CLAUDE.md` (project root) | Auto-loaded every session. Keep focused: rules and commands only, reference content belongs in SYSTEM-OVERVIEW.md or brain.db |
| Agent operating manual (what exists, how to use it) | `SYSTEM-OVERVIEW.md` (this file) | Read on demand, reference material |
| "Who am I / what's this project" | brain.db `identity` (≤10 load-bearing keys) | Queryable, tiered |
| "How does X work" | brain.db `architecture` (tiered critical/reference) | Query on demand, not dumped at init |
| "Why did we choose X" | brain.db `decisions` (active only; superseded archived) | History of choices |
| "What should we do next" | brain.db `notes` (open only; completed archived) | Task queue |
| "What happened in session N" | brain.db `sessions` table (recent 20) + vault (older) | Recent inline, archive cold |
| Living strategy being executed across sessions | `.claude/plans/` (keep the set small and active) | Active work only |
| One-off session-specific kickstart | `.ava/handoffs/` (YAML) **NOT plans/** | Kickstarts are not plans |
| Long-term mission / vision | brain.db `project.vision` (1 line) + vault `END-GOAL.md` | Cold persistence |
| User preferences / patterns / debug gotchas | `.claude/memory/` (AutoMemory auto-loaded) | Cross-session user context |
| Settled narrative / decisions from previous eras | Obsidian vault (archived out of brain.db) | Cold archive, not active memory |
| Code structure / file layout | Derivable from the code | **Never duplicate into docs** |
| Metrics / counts | Live queries at read time | **Never manually maintained as identity keys** (rule #14 — drift proof: `portfolio.keyMetric` said "22 agents" when actual was 17) |

**Enforcement:** `/validate --strict` flags content in the wrong place. Until fully implemented, the rules are documentation, not enforcement.

**Retired storage (do not recreate):**
- `PROJECT_ROADMAP.md` / `IMPLEMENTATION_PLAN.md` — legacy root files, moved to `archive/` in v5.14.0
- `documentation/` folder — eliminated v5.14.0

**For deeper context on each rule, see:** `.claude/plans/ava-direction.md` § "Where Things Live" and § "Context & Memory Doctrine".

---

## 2. Operating Principles (session 131-134 doctrine)

These principles are the reliability contract. They are what separates this system from the "silent drift accumulates for weeks" failure mode documented in `.claude/plans/pe-v6.md`.

### Verify before self-reporting

Every `[x] done` claim must have a corresponding verification artifact: a grep output, SQL query result, file diff, or command return value. Self-reported completion with no proof is how session 132 marked env vars as `[x] done` when grep in session 134 proved neither was ever written.

- File edits → `git diff --stat` or a grep showing the new value
- brain.db writes → `dal.mjs identity get <key>` or `dal.mjs arch list` output
- Metric updates → a `SELECT key, value, measured_at FROM agent_metrics WHERE ...` row
- Deletions → `ls` or `git status` showing the file gone
- Record each verification as a trace: `dal.mjs trace add "verified X: <evidence>"`

**No completion without an artifact.** Not negotiable.

### Verify before planning

Plan mode catches fabrications that completion checks can't. Plans can launder unverified values as easily as completions can. Before asserting any value in a plan (schema version, file path, count, decision ID, commit hash), it must trace to a live query or a prior verified artifact. Plan values you cannot source are flagged as unverified.

**Proof case:** PE session 120 plan mode caught a fabricated McQueenyML schema version that had no source in any verified artifact. The plan would have landed an incorrect claim in brain.db as "verified fact" without this check. Plan mode earned its keep.

### Honest metrics or no metrics (rule #14)

Counts, percentages, and quantitative keys must be **derived from live queries at read time**, never manually maintained as identity strings. Self-reported success rates (364/365 "success" with nobody recording failure) are noise, not signal. If you cannot make a metric objective, remove it.

**Retirement candidates** (currently violate rule #14, being phased out): `portfolio.keyMetric`, `product.key-metrics`, `product.summary`. Left in place until the 6-key identity schema lands (deferred per session 134 decision).

### Cobbler's-children rule

Frameworks must eat their own dog food. If PE owns the template, PE's own `.claude/` must match `template/.claude/` exactly. Closeout runs a diff check. Drift is a bug. Generalization: any place where the system runs on itself, the self-copy must be verifiable against the canonical copy.

For Ava_Main specifically, this applies at the ecosystem level: `dal verify` Layer 6 checks downstream projects against their expected template bundle. See §8.

### Operator model

Not every project self-operates on a daily lifecycle. In this ecosystem:

- **Ava_Main** is the primary development environment and the default operator for PE template changes. Session work happens here unless a specific reason requires a different project's session.
- **PE** (`/home/ava/Prompt_Engineering`) is a template source + agent-definitions storage, not a self-operating agent. PE sessions are convened for specific purposes (template validation, schema migration, self-audit, test runs) — not as a default lifecycle.
- **Downstream projects** (CloudBooks, tradeSignal, 3D_Printing, cheatSheets, etc.) have their own sessions when domain work is happening there. They consume PE template via `dal.mjs template pull --dal`.
- **Cross-project writes violate the operator model.** A session in project A does not write files or brain.db entries into project B. If project B needs a change, the session creates a handoff note and project B's next session executes it.

### Scope discipline

Every plan must include an explicit **"what I'm NOT doing"** section. The out-of-scope list is the second half of the scope definition. A plan that only says what it WILL do is half-specified and drifts during execution.

**Proof case:** PE session 120's plan listed 14 in-scope items and an equally detailed out-of-scope list. Execution stayed bounded. Compare to session 132, which had no out-of-scope list and scope-crept into false `[x] done` claims.

### State your understanding before acting

At session start, after reading CLAUDE.md + brain.db state + plans, state your understanding back to the user: what you think the current state is, what you think needs to happen, what you propose to do. Wait for confirmation. Do not touch files or brain.db until the user confirms or corrects.

**This is what PE session 120 demonstrated** and what we expect from every session. It prevents the "agent skims injected context and forces the user to re-prompt for a deep dive" failure mode that wastes token budget.

### Context budget

Session-init injection should be bounded (target: ≤10k tokens of brain.db context). Architecture entries should be tiered: critical (always loaded) + reference (on-demand via `dal.mjs arch get <key>`). The 180k-token session start problem identified earlier is primarily caused by **re-prompted deep dives**, not the hook injection itself — agents skim past the injected context without synthesizing it, forcing the user to re-prompt. The fix is instruction compliance (state-your-understanding protocol), not shrinking the hook further.

---

## 3. Toolbox (skills/hooks/agents)

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
| `/criticism` | Adversarial strategic analysis. Find what's broken, fragile, or misaligned. |
| `/ship` | Secure commit/push/release. Secret scan, contribution attribution, release checklist. |
| `documentation-awareness` | Passive (not invocable). Enforces content boundaries automatically. |

### Hooks (fire automatically)

You don't invoke these. They run around you. Know they exist. **10 lifecycle hooks + 1 utility helper (`log-util.js` — a shared logging module that hooks require, not a hook itself). Total file count in `.claude/hooks/`: 11.**

| Hook | When | What It Does |
|------|------|-------------|
| `session-context.js` | Session start/resume | Injects git context (branch, status, log, unpushed, stashes), brain.db full state, latest handoff YAML, agent identity (SOUL.md/TOOLS.md for role-based agents), sibling project context, template drift detection + auto-pull, health beacon emission, Syncthing health check, closeout reminder, SYSTEM-OVERVIEW read reminder |
| `block-protected-files.js` | Before Edit/Write | Blocks writes to .env, secrets, lock files, brain.db, agent personality files outside .claude/ |
| `gitnexus-impact-check.js` | Before Edit/Write | Automatic impact analysis on source files (.js/.ts/.py/.rs/.go etc). Mode 1: injects blast radius to context, never blocks. Fail-open on errors. Bypass: `PE_GITNEXUS_SKIP=1` |
| `block-dangerous-commands.js` | Before Bash | Blocks rm -rf /, force push main, etc. |
| `typecheck-on-edit.js` | After Edit/Write | Runs `tsc --noEmit` on TS/TSX files |
| `lint-on-edit.js` | After Edit/Write | Runs eslint on modified files |
| `gitnexus-post-commit.js` | After git commit | Re-indexes codebase intelligence, scaffolds skill files |
| `stop-closeout-check.js` | Session end | Warns if docs stale >2hrs with uncommitted changes |
| `completion-check.js` | Session end | Warns if actions have partial outcomes |

### Agents (subprocesses)

| Agent | Purpose |
|-------|---------|
| `closeout-worker` | Autonomous session closeout. Dispatch instead of running /session-closeout inline. |
| `spoke-agent/` | Template for domain agents (Echelon pattern). Not invoked directly. |

---

## 4. brain.db - Your Active Memory

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
node .ava/dal.mjs decision add --title "T" --context "C" --chosen "O" --rationale "R"

# Notes (task queue)
node .ava/dal.mjs note add "description" --category improvement|issue|bug|idea|handoff
node .ava/dal.mjs note list            # Open notes
node .ava/dal.mjs note complete <id>   # Mark done

# Sessions
node .ava/dal.mjs session start "description"
node .ava/dal.mjs session close --summary "what happened"

# Traces (breadcrumbs within a session)
node .ava/dal.mjs trace add "investigating: found X"

# Actions (record what you did)
node .ava/dal.mjs action record "description" --type feature|bugfix|maintenance|deployment --outcome success|failure|partial

# Metrics (track progress)
node .ava/dal.mjs metric record <key> --value <number>

# Learning loop (review past performance)
node .ava/dal.mjs loop summary
node .ava/dal.mjs action rate <type>

# Handoffs (session continuity)
node .ava/dal.mjs handoff generate "summary"
node .ava/dal.mjs handoff latest

# Template management
node .ava/dal.mjs template pull          # Fetch template updates
node .ava/dal.mjs template pull --dal    # Also update DAL runtime
node .ava/dal.mjs template pull --dry-run  # Show what would change
node .ava/dal.mjs template manifest      # List all deployable files

# Vault
node .ava/dal.mjs vault-export session "summary"
node .ava/dal.mjs vault sync {ProjectSlug}
node .ava/dal.mjs vault query "search term"

# Health beacons (ecosystem monitoring)
node .ava/dal.mjs health --emit          # Write beacon to ~/.pe-health/
node .ava/dal.mjs ecosystem status       # Read all beacons
```

### Schema (v13, 10 tables)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `identity` | Core project facts (name, version, vision, stack) | key, value |
| `architecture` | System knowledge (how things work) | key, value, scope |
| `decisions` | Architectural choices with rationale | title, rationale, alternatives, status |
| `sessions` | Session tracking (start/end, summary) | id, start_time, end_time, summary, exit_reason, version_bump |
| `notes` | Task queue (bugs, improvements, ideas) | id, text, category, completed, tab_key |
| `session_traces` | Within-session breadcrumbs | session_id, trace_type, content |
| `agent_actions` | What was done and outcome | description, type, outcome |
| `agent_metrics` | Quantitative tracking | key, value |
| `agent_feedback` | Self-assessment (deprecated per session 134 — see §2 Honest metrics; retained for history, do not write new) | action_id, rating, source, detail |
| `schema_version` | Migration tracking | version |

---

## 5. File Layout

### Canonical Project Structure

```
{Project}/
  CLAUDE.md                    # Rules (auto-loaded, project-specific)
  SYSTEM-OVERVIEW.md           # This file (system reference)
  README.md                    # Human entry point
  .claude/
    settings.json              # Hook registrations (checked in, from template)
    settings.local.json        # Machine overrides + autoMemoryDirectory (gitignored)
    skills/                    # 22 skill definitions (SKILL.md each)
    hooks/                     # 10 files (9 lifecycle hooks + 1 utility helper)
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

### Plans Convention

Plans in `.claude/plans/` are **living strategy documents curated across sessions**. They are not one-shot artifacts — each session that touches a plan's domain should update it.

**Lifecycle:** Create → Curate (across sessions) → Implement → Validate → Archive (move to `archive/`)

**All plans in `.claude/plans/` are active by definition.** If a plan is complete or superseded, archive it. Session-init reads every plan. Closeout updates plans touched by the session's work.

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

## Cross-References (links to related plans, brain.db entries, vault docs, research)
```

**Status values:**
- **Active** — Strategic direction, being executed
- **Curating** — Being designed across sessions, not yet implementing
- **Stabilized** — Research/reference, no longer evolving but still relevant

**Session summaries are NOT plans.** They belong as brain.db session records + handoff YAML + vault export. Don't accumulate session logs in plans/.

**Plans vs brain.db vs vault:**
- **Plans** — Working strategy (what SHOULD be). Living, evolving, agent-loaded.
- **brain.db** — Structured facts (what IS). Decisions, architecture, identity, notes. Queryable.
- **Vault** — Long-term archive (what WAS). Curated narratives, settled decisions. Hard to access during sessions.

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

## 6. Session Lifecycle

### Standard Flow

```
/session-init
  1. CLAUDE.md auto-loaded (rules)
  2. brain.db context injected by hook (state)
  3. Read SYSTEM-OVERVIEW.md (system understanding - this file)
  4. Read ALL .claude/plans/ (living strategy documents, not just kickstarts)
  5. Check vault for strategic context
  6. Review learning loop (what worked/failed)
  7. Surface insights, present plan
  8. Await confirmation

node .ava/dal.mjs session start "description"

  [work - record traces, actions, decisions as you go]

/session-closeout
  1. Inventory changes, determine version increment
  2. Record to brain.db (identity, arch, decisions, notes, actions)
  3. Update active plans touched by this session's work
  4. Generate handoff YAML
  5. Export vault note (if qualified)
  6. Update CLAUDE.md
  7. Commit
```

### When to Export to Vault

Export a vault session note when the session has ANY of:
- 1+ decisions made
- Version change
- Cross-project work
- Significant features implemented

Trivial sessions (minor fixes, maintenance only) skip vault export.

### Reliability Contract (session 134)

Init and closeout are the heartbeat. If they aren't reliable, nothing downstream is.

**Closeout enforces:**
- `dal.mjs health --emit` — refresh beacon (PE was silently skipping this pre-session-134)
- Cobbler's diff (PE only): `diff -rq .claude template/.claude | grep -v -E "^Only in \.claude(/hooks)?: (memory|plans|hook-log\.jsonl|settings\.local\.json)$" | grep -v gitnexus` — output must be empty
- Verification artifacts for every `[x] done` claim (see §2 Operating Principles)
- Commit with attribution + session ID in message

**Init enforces:**
- State understanding before acting (see §2)
- Verify before planning (see §2)
- No cross-project writes (operator model, see §2)

---

## 7. Obsidian Vault

### Structure

```
~/Obsidian/Ava/{ProjectSlug}/
  sessions/       # Session summary notes (from vault-export)
  architecture/   # Architecture decisions and patterns
  archive/        # Archived content from project cleanup
  VAULT_GUIDE.md  # Project vault governance
  END-GOAL.md     # Project north star (optional)
```

**NOT in vault:** Plans live in `.claude/plans/` in the project. Schemas, data docs, and other working documents live in the project folder. brain.db stores decisions, architecture knowledge, and task queue. The vault is for curated narrative context only.

### VAULT_GUIDE.md

Each project vault folder has a `VAULT_GUIDE.md` that identifies the project and documents what belongs there. Session-init should read this when checking vault for strategic context. It provides:
- Project identity and purpose (what this vault folder is for)
- Governance rules (read-only for agents, human-initiated writes)
- What goes in each subfolder (sessions, architecture, archive)

**VAULT_GUIDE.md is per-project.** Template deployment should generate a project-specific guide, not copy a generic one. The guide's `project:` frontmatter field must match the actual project.

### Rules

- Dev agents READ vault for strategic context. They do NOT write directly.
- Session notes are exported via `dal.mjs vault-export session`.
- brain.db is active memory (current state). Vault is knowledge web (persistent, curated).
- NO project files in the vault - no code, configs, node_modules, .git, .ava, .claude.
- NO plans or schemas in the vault - those live in the project directory.

---

## 8. Ecosystem Validation

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

## 9. Error Protocol

**Never swallow errors silently.** If a command fails, a file is missing, or brain.db is unreachable:

1. Record: `node .ava/dal.mjs action record "<what failed>" --type <type> --outcome failure`
2. Report the error to the user - what failed, the error message, and a suggested fix
3. If systemic: `node .ava/dal.mjs arch set "error.<topic>" --value "<description + fix>" --scope convention`

Errors recorded this way become institutional knowledge that prevents future agents from hitting the same problem.

---

## 10. First Run / Missing System

If brain.db doesn't exist or is empty, run `/dal-doctor`. It handles:
- First-run detection and full system setup
- DAL runtime deployment from PE template
- brain.db creation and schema migration
- Identity hydration from existing docs
- Template sync validation
- Ongoing health checks and remediation

Do NOT manually create brain.db or fall back to file-only mode. `/dal-doctor` is the single entry point for all system health operations.
