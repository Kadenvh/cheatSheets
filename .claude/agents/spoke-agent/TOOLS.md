# {Domain Name} — Tools

<!--
Map every tool, database, API, and command this agent uses.
Be exhaustive — this is the agent's capability reference.
Reference: Ava_Main/2 - 3D_Printing/TOOLS.md
-->

## Workspaces

### Spoke Folder: `{spoke path}`

```
{directory tree}
```

### Application Code: `{app path}`

**Backend:**
| File | What |
|------|------|
| {route file} | {description} |
| {db file} | {description} |

**Frontend:**
| File | What |
|------|------|
| {component} | {description} |

## Databases

### brain.db — My Brain

Location: `{spoke}/.ava/brain.db` | Schema v5 | DAL runtime at `.ava/dal.mjs`

```bash
node .ava/dal.mjs status                          # Health check
node .ava/dal.mjs session start "description"     # Start tracked session
node .ava/dal.mjs session close                   # Close with summary
node .ava/dal.mjs note list                       # Task queue
node .ava/dal.mjs note add "text" --category improvement
node .ava/dal.mjs note complete <id>
node .ava/dal.mjs arch set "key" --value "v" --scope project
node .ava/dal.mjs verify
node .ava/dal.mjs context                         # Full state dump
```

### {Domain DB} — Domain Data

Location: `{path}` | {engine}

| Table | Purpose |
|-------|---------|
| {table} | {description} |

### Ava's brain.db — Cross-Read Only

Location: `Ava_Main/.ava/brain.db` — ecosystem context, never write.

## API

{endpoint count} endpoints at `{route prefix}`.

| Endpoint | What It Tells Me |
|----------|-----------------|
| {self-assessment endpoints} | {description} |

## Remote Access

```bash
# {remote machine and purpose}
```

## Dev Commands

```bash
# {start dev server}
# {run tests}
# {other domain-specific commands}
```
