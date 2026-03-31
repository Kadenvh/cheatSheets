# Echelon Spoke Agent Template

Deploy an autonomous domain development agent. Brain.db-first — state lives in the database, identity docs define who the agent is.

## What You Get

| File | Purpose | Hand-authored? |
|------|---------|---------------|
| SOUL.md | Personality, values, Echelon contract | Yes — defines who the agent IS |
| IDENTITY.md | Role, responsibilities, boundaries, operating model | Yes — defines what it OWNS |
| TOOLS.md | Workspaces, databases, APIs, commands | Yes — defines what it CAN DO |
| AGENTS.md | Hub relationship, delegation, escalation | Yes — defines how it RELATES |
| USER.md | Human collaborator profile | Yes — shared or customized |
| HEARTBEAT.md | Concrete health checks with runnable commands | Yes — defines what it MONITORS |
| seed.sql | Initial brain.db identity, architecture, and notes | Run once at deployment |

**NOT included:** MEMORY.md. The agent's memory IS brain.db (identity + architecture tables).

## Deployment

### Prerequisites

- Domain workspace directory exists (e.g., `project/2 - DomainName/`)
- brain.db deployed to `domain/.ava/brain.db` with DAL runtime
- CLAUDE.md exists with domain-specific rules

### Steps

```bash
# 1. Copy identity docs to domain workspace
cp SOUL.md IDENTITY.md TOOLS.md AGENTS.md USER.md HEARTBEAT.md /path/to/domain/

# 2. Customize each file for the domain
#    - SOUL.md: domain personality, values, what it won't do
#    - IDENTITY.md: what it owns, its two codebases, boundaries
#    - TOOLS.md: all databases, APIs, commands, file paths
#    - AGENTS.md: hub relationship, escalation rules
#    - USER.md: human's domain-specific context
#    - HEARTBEAT.md: domain-specific health queries

# 3. Seed brain.db with initial identity and architecture
cd /path/to/domain
sqlite3 .ava/brain.db < /path/to/seed.sql
# OR use DAL CLI:
node .ava/dal.mjs identity set "project.name" --value "DomainName"
node .ava/dal.mjs identity set "project.version" --value "0.1.0"
# ... (see seed.sql for full list)

# 4. Verify
node .ava/dal.mjs status
node .ava/dal.mjs identity list
```

## Reference Implementation

**3D Printing (Slicer-Loop)** at `Ava_Main/2 - 3D_Printing/` is the first spoke agent and reference implementation. When filling in template files, look at the Slicer-Loop instance for a complete, working example.

## Echelon Architecture

```
PE (template source)
└── template/spoke-agent/     ← You are here (the pattern)

Ava_Main (hub)
├── .ava/brain.db             ← Hub brain (ecosystem context)
├── 2 - 3D_Printing/          ← Spoke #1 (reference implementation)
│   ├── .ava/brain.db         ← Spoke brain (isolated)
│   ├── SOUL.md ... HEARTBEAT.md  ← Identity docs
│   └── CLAUDE.md             ← Domain rules
├── 3 - NextDomain/           ← Spoke #2 (future)
│   ├── .ava/brain.db
│   └── ...
```

### Data Flow

- **Spoke → Hub:** Cross-read only (`node hub/.ava/dal.mjs context`)
- **Hub → Spoke:** Notes in spoke's brain.db, direct conversation
- **Spoke → PE:** Friction facts (`pe.friction.*` in spoke's brain.db)
- **Spoke ↔ Spoke:** Cross-read only (hub mediates coordination)

### Key Principles

1. Each spoke has its own isolated brain.db — no shared state
2. Identity docs are hand-authored (prescriptive, like CLAUDE.md)
3. Memory/state is brain.db facts (not markdown files)
4. The agent is autonomous — reads notes as task queue, implements, tests, self-assesses
5. Friction with PE's systems is a finding, not a failure — report it
