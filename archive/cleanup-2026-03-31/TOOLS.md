# spoke-dev — Tools

## brain.db — My Brain

Location: `{spoke folder}/.ava/brain.db` | Schema v10 | DAL runtime at `.ava/dal.mjs`

```bash
# Status & context
node .ava/dal.mjs status                          # Health check
node .ava/dal.mjs context                         # Full state injection (run at session start)
node .ava/dal.mjs verify                          # 8-layer integrity check

# Session lifecycle
node .ava/dal.mjs session start "description"     # Start tracked session
node .ava/dal.mjs session close                   # Close with summary

# Task queue
node .ava/dal.mjs note list                       # Open notes
node .ava/dal.mjs note add "text" --category improvement|issue|bug|idea|handoff|feedback
node .ava/dal.mjs note complete <id>

# Knowledge
node .ava/dal.mjs identity list                   # Core project facts
node .ava/dal.mjs identity set "key" --value "v"
node .ava/dal.mjs arch set "key" --value "v" --scope project|ecosystem|infrastructure|convention
node .ava/dal.mjs arch list --scope project
node .ava/dal.mjs decision add --title T --context C --chosen O --rationale R

# Content
node .ava/dal.mjs prompt get <key> --content      # Load skill prompt
node .ava/dal.mjs kb search <query>               # Full-text search knowledge base

# Learning loop
node .ava/dal.mjs action record "desc" --type <type> --outcome success|failure|partial
node .ava/dal.mjs metric record <key> --value <number>
node .ava/dal.mjs loop summary                    # Performance overview
```

## Hub Context — Cross-Read Only

```bash
node {hub path}/.ava/dal.mjs context              # Ecosystem state (never write)
```

## Domain Tools

<!-- Customize per deployment: domain DB queries, API endpoints, test commands, sync commands -->

| Tool | Command | What |
|------|---------|------|
| Domain DB | `sqlite3 {db path}` | Domain-specific queries |
| API health | `curl localhost:{port}/health` | Service alive check |
| Tests | `{test command}` | Domain test suite |
| Build | `{build command}` | Build and deploy |
