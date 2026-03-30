# .claude Template — Automation Layer

**Version:** 5.12.0 | **Updated:** 2026-03-30

This folder is the Claude Code automation layer. It ships alongside `.prompts/` as part of the PE template. Copy to your project root — Claude Code only detects `.claude/` at root level.

---

## What's In Here

```
.claude/
├── settings.json          # Hook wiring, permissions, env vars
├── statusline.sh          # Terminal status bar (git + brain.db)
├── memory/                # AutoMemory writes here (project-local)
├── hooks/                 # Automated guards + context injection (7)
│   ├── session-context.js       # SessionStart: inject brain.db + git state + agent identity
│   ├── block-protected-files.js # PreToolUse: block .env, secrets, lock files
│   ├── block-dangerous-commands.js # PreToolUse: block rm -rf /, force push, etc.
│   ├── typecheck-on-edit.js     # PostToolUse: tsc --noEmit on TS/TSX edits
│   ├── lint-on-edit.js          # PostToolUse: eslint on edited files
│   ├── stop-closeout-check.js   # Stop: warn if docs stale >120 minutes
│   ├── completion-check.js      # Stop: check for partial-outcome actions
│   └── log-util.js              # Shared logging utility
├── skills/ (19)           # Slash commands, each reads from .prompts/
│   └── (see skills/README.md for full inventory)
└── agents/ (1)            # Claude Code subagents
    └── closeout-worker.md       # Autonomous session closeout
```

---

## Your Workflow

```
1. Open project     →  Hooks auto-inject brain.db context + git state
2. /session-init    →  Agent orients, verifies state, surfaces priorities
3. Work             →  Use skills as needed
4. /session-closeout →  Persists state to brain.db, updates docs
```

If you forget closeout, the stop hook warns you.

---

## Skill Tiers

| Tier | Skills | When |
|------|--------|------|
| **Core** | session-init, session-closeout, documentation-awareness | Every session |
| **Frequent** | cleanup, validate, dal-doctor | Maintenance, health checks |
| **On-demand** | code-review, testing, debugging, refactor, architecture, requirements | Development work |
| **Situational** | explore, together, migration, triage, ui-dev, supabase, plan-validator | Context-specific |

---

## What's Automatic vs Manual

**Automatic (no action needed):**
- session-context.js injects brain.db state + git info at session start
- Agent identity injection when `CLAUDE_AGENT_ROLE` is set
- documentation-awareness skill silently enforces routing rules
- typecheck + lint hooks run after edits (skip if no tsconfig/eslint config)
- Protection hooks block dangerous operations
- Stop hooks warn about incomplete sessions

**Manual (you invoke):**
- All 18 invocable slash commands (see `skills/README.md`)
- `CLAUDE_AGENT_ROLE=hub-main claude` to start a session with agent identity

---

## Deployment

When deploying to a new project:
1. Copy `template/.claude/` → `<project>/.claude/`
2. Copy `template/.prompts/` → `<project>/.prompts/`
3. Deploy `.ava/` runtime separately (`dal.mjs`, `lib/`, `migrations/`, then `npm install`)
4. Run `/dal-doctor` to create brain.db
5. Run `/cleanup` to hydrate from existing docs
6. Run `/session-init` to begin

---

## Customization

**Permissions:** Add project-specific permissions in `.claude/settings.local.json` (gitignored).

**Hooks:** typecheck and lint auto-detect config files. No configuration needed if your project doesn't use TypeScript or ESLint.

**Agent identity:** Place agent definition files in `agent-definitions/<name>/` with SOUL.md and TOOLS.md. Start sessions with `CLAUDE_AGENT_ROLE=<name>`.

---

## See Also

- `hooks/README.md` — Hook details and customization
- `agents/README.md` — Subagent usage (closeout-worker)
- `skills/README.md` — Full skill inventory with trigger conditions
- `../.prompts/` — Raw prompt protocols (skills reference these)
