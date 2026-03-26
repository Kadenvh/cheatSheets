# DAL Setup — Durable Agentic Layer Reference

Guide for setting up, configuring, and using the DAL (brain.db) system. Covers the full stack: 13 purpose-built tables, CLI commands, verification, and operational patterns.

---

## 1. WHAT THE DAL IS

The DAL is a SQLite-backed persistent state engine for Claude Code projects. It tracks sessions, identity, architecture, decisions, and notes across conversations — giving every new session full context on what happened before.

**How it works:**
1. A `SessionStart` hook fires when Claude Code opens → runs `node .ava/dal.mjs context` → injects state
2. During work, the agent records identity, architecture, and decisions via the CLI
3. At session close, the agent logs what was done → next session picks up where this one left off

**Single dependency:** `better-sqlite3` (zero-config, file-based, no server required)

---

## 2. DIRECTORY STRUCTURE

```
.ava/                           # DAL root (project root, gitignored)
  dal.mjs                       # CLI entry point (v4.0.0)
  package.json                  # { "dependencies": { "better-sqlite3": "^11" } }
  brain.db                      # SQLite DB (created by bootstrap, gitignored)
  lib/
    db.mjs                      # Connection, migrations, integrity check
    identity.mjs                # Core identity rows (5-7 per project)
    architecture.mjs            # Scoped system knowledge
    sessions.mjs                # Start/close/list sessions
    decisions.mjs               # Decision CRUD + supersede
    context.mjs                 # Role-aware context payload generator
    verify.mjs                  # 8-layer cross-verification
    prompts.mjs                 # Prompt storage and retrieval
    plans.mjs                   # Plan storage and retrieval
    knowledge_base.mjs          # Knowledge base with FTS search
    pipeline.mjs                # System self-description (skills, hooks, config)
    agent-loop.mjs              # Actions, metrics, feedback tracking
  migrations/
    schema.sql                  # Single-file v10 schema (fresh installs)
    001_initial.sql             # v1 bootstrap
    002_add_notes.sql           # v2 notes
    003_dual_session.sql        # v3 permanence + agent_role
    004_render_pipeline.sql     # v4 pipeline
    005_documents.sql           # v5 prompts/plans/kb
    006_agent_loop.sql          # v6 agent loop tables
    migrate_v6_to_v4.sql        # Legacy consolidation
```

---

## 3. SETUP

### Option A: Deploy from PE (preferred)

PE is the canonical source for the DAL runtime. Copy the runtime files to your project:

```bash
# Copy runtime
cp /path/to/PE/.ava/dal.mjs .ava/
cp /path/to/PE/.ava/lib/*.mjs .ava/lib/
cp /path/to/PE/.ava/migrations/*.sql .ava/migrations/

# Install dependency and bootstrap
cd .ava && npm init -y && npm install better-sqlite3
node .ava/dal.mjs bootstrap
node .ava/dal.mjs status          # Verify: schema v10, integrity OK
```

### Option B: Fresh setup (no PE access)

```bash
mkdir -p .ava/lib .ava/migrations
# Place dal.mjs, lib/*.mjs, migrations/*.sql from the PE template
cd .ava && npm init -y && npm install better-sqlite3
node .ava/dal.mjs bootstrap
node .ava/dal.mjs status
```

### Hook wiring

The `SessionStart` hook (`.claude/hooks/session-context.js`) auto-injects DAL context. It:
1. Checks for `.ava/brain.db`
2. Reads `CLAUDE_AGENT_ROLE` env var (default: `general`)
3. Runs `node .ava/dal.mjs context --role <role>`
4. Injects output as `## DAL State (auto-injected from brain.db)`

This hook is deployed with the template — no manual wiring needed.

Add `.ava/brain.db*` to `.gitignore` (brain.db is machine-specific state, not source).

### Post-setup

Run `/cleanup` to hydrate brain.db from the codebase (reads CLAUDE.md, populates identity + architecture). Then run `/dal-doctor` to verify semantic health.

---

## 4. CLI COMMAND REFERENCE

All commands: `node .ava/dal.mjs <command> [subcommand] [flags]`

### Sessions

```bash
node .ava/dal.mjs session start "description"    # Start tracked session
node .ava/dal.mjs session close                   # Close with summary prompt
node .ava/dal.mjs session list                    # Show session history
```

### Identity (core facts — 5-7 rows)

```bash
node .ava/dal.mjs identity set "key" --value "v"  # Upsert core identity row
node .ava/dal.mjs identity get "key"               # Get a specific row
node .ava/dal.mjs identity list                    # All identity rows
```

### Architecture (scoped system knowledge)

```bash
node .ava/dal.mjs arch set "key" --value "v" --scope project    # Upsert architecture entry
node .ava/dal.mjs arch get "key"                   # Get a specific entry
node .ava/dal.mjs arch list                        # All architecture entries
node .ava/dal.mjs arch list --scope convention     # Filter by scope
node .ava/dal.mjs arch remove "key"                # Remove an architecture entry
```

Scopes: `project`, `ecosystem`, `infrastructure`, `convention`

### Decisions

```bash
node .ava/dal.mjs decision add --title "..." --context "..." --chosen "..." --rationale "..."
node .ava/dal.mjs decision list                   # All active decisions
node .ava/dal.mjs decision supersede <id> --reason "..."
```

### Notes (task queue)

```bash
node .ava/dal.mjs note list                       # All open notes
node .ava/dal.mjs note add "text" --category improvement  # Add a note
node .ava/dal.mjs note complete <id>              # Mark completed
node .ava/dal.mjs note remove <id>                # Remove a note
node .ava/dal.mjs note counts                     # Counts by category
```

Six categories: `improvement`, `issue`, `bug`, `idea`, `handoff`, `feedback`.

### Content (loaded on demand)

```bash
# Prompts (skill content)
node .ava/dal.mjs prompt get <key> --content      # Retrieve prompt content
node .ava/dal.mjs prompt set <key> --file <path>  # Store a prompt from file
node .ava/dal.mjs prompt list                     # List stored prompts

# Plans (design briefs)
node .ava/dal.mjs plan get <key>                  # Retrieve a plan
node .ava/dal.mjs plan set <key> --title T --content C --status active
node .ava/dal.mjs plan list                       # List plans

# Knowledge Base (FTS searchable)
node .ava/dal.mjs kb get <key>                    # Retrieve a KB entry
node .ava/dal.mjs kb set <key> --title T --content C --category guide
node .ava/dal.mjs kb list                         # List KB entries
node .ava/dal.mjs kb search <query>               # Full-text search
```

### System

```bash
# Pipeline (self-description)
node .ava/dal.mjs pipeline list                   # All pipeline entries
node .ava/dal.mjs pipeline skills core            # Core skills
node .ava/dal.mjs pipeline config                 # System configuration

# Agent Loop (learning)
node .ava/dal.mjs action record "desc" --type feature --outcome success
node .ava/dal.mjs action list                     # All recorded actions
node .ava/dal.mjs action rate <type>              # Success rate by type
node .ava/dal.mjs metric record <key> --value <n> # Track a metric
node .ava/dal.mjs metric latest                   # Latest metric values
node .ava/dal.mjs metric trend <key>              # Metric over time
node .ava/dal.mjs feedback record --action <id> --rating helpful
node .ava/dal.mjs feedback summary                # Feedback overview
node .ava/dal.mjs loop summary                    # Full performance overview
```

### Operations

```bash
node .ava/dal.mjs bootstrap                       # Initialize brain.db
node .ava/dal.mjs status                          # DB health, schema version, size
node .ava/dal.mjs version                         # DAL version
node .ava/dal.mjs context                         # Generate context payload (general)
node .ava/dal.mjs context --role dev              # Dev-focused context shape
node .ava/dal.mjs context --scope ecosystem       # Include ecosystem entries
node .ava/dal.mjs verify                          # 8-layer cross-verification
node .ava/dal.mjs verify --json                   # Machine-readable verify
node .ava/dal.mjs verify --layer 0                # Single layer check
node .ava/dal.mjs migrate                         # Run pending migrations
```

---

## 5. KNOWLEDGE TABLES & SCOPES

Knowledge is split across two tables: **identity** (core, immutable facts) and **architecture** (scoped system knowledge).

### Identity table (5-7 rows)

Core facts that define what the project IS. Always injected at session start, both roles.

| Example Key | Example Value |
|-------------|---------------|
| `project.name` | "Task Queue API" |
| `project.version` | "2.1.0" |
| `project.vision` | "Async task processing for distributed systems" |
| `tech.stack` | "Node.js, PostgreSQL, Redis" |
| `tech.build` | "npm run build && npm test" |

Identity rows are few and rarely change. If you have more than 7, some belong in architecture instead.

### Architecture table (scoped)

System knowledge organized by scope:

| Scope | Injection | Examples |
|-------|-----------|----------|
| `project` | General context | Tech stack, build commands, version, project-specific patterns |
| `ecosystem` | General context | Cross-project patterns, shared infrastructure |
| `infrastructure` | Dev context | Servers, ports, deployment targets, environment |
| `convention` | Dev context | Naming conventions, coding standards, established patterns |

### Classification heuristics

| Content pattern | Table | Scope |
|----------------|-------|-------|
| Mission, vision, identity, project name | `identity` | — |
| Tech stack, build commands, project-specific architecture | `architecture` | project |
| Cross-project patterns, shared infrastructure | `architecture` | ecosystem |
| Servers, ports, deployment targets, environment | `architecture` | infrastructure |
| Naming conventions, coding standards, patterns | `architecture` | convention |

### Recommended cadence

- **Every closeout:** Review identity and architecture entries for accuracy
- **Every 3-5 sessions:** Check for stale or irrelevant architecture entries
- **Before milestones:** Full review to keep the knowledge store lean and accurate

---

## 6. DUAL-SESSION COGNITIVE MODES

Run two parallel cognitive modes on the same project:

| Mode | Env var | Cognitive analogy | Focus |
|------|---------|-------------------|-------|
| **General** (default) | (none) | Default mode network | Vision, architecture, exploration, relationships |
| **Dev** | `CLAUDE_AGENT_ROLE=dev` | Working memory | Tasks, bugs, implementation, focused execution |

### Running dual sessions

```bash
# Terminal 1: General (default — curious, relational)
cd /path/to/project && claude

# Terminal 2: Dev (focused execution)
cd /path/to/project && CLAUDE_AGENT_ROLE=dev claude
```

### Context shapes

**General context:** Identity (always) → architecture (project + ecosystem scopes) → decisions (5) → notes summary (count only) → last session

**Dev context:** Identity (always) → last session → interrupted session recovery → architecture (infrastructure + convention scopes) → notes (full, max 15) → decisions (3)

Both modes always receive **identity rows** at the top — the core identity never leaves context.

### Sibling registry (cross-project awareness)

Create `.ava/siblings.json` (gitignored, machine-specific):

```json
{
  "siblings": [
    { "name": "ProjectA", "path": "/path/to/project-a", "role": "Primary application" },
    { "name": "ProjectB", "path": "/path/to/project-b", "role": "Documentation framework" }
  ]
}
```

At session start, `session-context.js` reads each sibling's `dal.mjs context --brief` and appends a summary under `## Sibling Projects`. If a sibling path is invalid, it skips silently.

---

## 7. VERIFICATION

After setup, verify everything works:

```bash
node .ava/dal.mjs status           # Schema v10, integrity OK
node .ava/dal.mjs session start "test session"
node .ava/dal.mjs identity set "project.name" --value "Test Project"
node .ava/dal.mjs arch set "test.entry" --value "works" --scope project
node .ava/dal.mjs identity list    # Should show the identity row
node .ava/dal.mjs arch list        # Should show the architecture entry
node .ava/dal.mjs note list        # Empty is fine
node .ava/dal.mjs context          # Should output formatted context block
node .ava/dal.mjs verify           # Should show 8 layers
node .ava/dal.mjs session close    # Clean close
```

If `session-context.js` is wired, restart Claude Code — the hook should inject `## DAL State` automatically.

For deeper health analysis after setup, run `/dal-doctor` — it checks semantic quality beyond what verify covers (decision coherence, session hygiene, architecture staleness, cross-project consistency).

---

## 8. RULES

- **brain.db is gitignored.** It contains machine-specific session state, not source code.
- **One brain.db per project.** Scopes are never cross-pollinated. Cross-project awareness uses the sibling registry.
- **Review before deleting.** Always list entries before removing them.
- **Scope during closeout.** Every architecture entry should have an appropriate scope.
- **The hook is the heart.** If context isn't injecting at session start, check `.claude/hooks/session-context.js` and `.claude/settings.json`.
- **PE is canonical.** dal.mjs, lib/, and migrations/ come from PE. Don't edit them in downstream projects — changes flow from PE outward.
