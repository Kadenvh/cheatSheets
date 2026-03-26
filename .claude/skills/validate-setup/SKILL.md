---
name: validate-setup
description: "Verify the documentation system template was deployed correctly to this project"
allowed-tools:
  - Read
  - Glob
  - Bash
---

# Validate Setup

Verify the documentation system template was deployed correctly to this project. Run this after deploying `.claude/` and `.prompts/` to a new project.

## Checks

### 1. Prompt Templates
Verify all 20 prompts exist (check `.prompts/` or `documentation/.prompts/`):
- [ ] discovery.md, bootstrap.md, init.md, closeout.md, readme.md
- [ ] testing.md, code-review.md, debugging.md, release.md, architecture.md
- [ ] refactor.md, migration.md, incident.md, requirements.md, dependency-audit.md
- [ ] explore.md, together.md, cleanup.md, dal-setup.md, METRICS.md

### 2. .claude Directory (at project root)
- [ ] `.claude/settings.json` exists and parses as valid JSON
- [ ] `.claude/hooks/` directory exists with 7 `.js` files (including log-util.js)
- [ ] `.claude/agents/` directory exists with 3 `.md` files
- [ ] `.claude/skills/` directory exists with 26 skill directories, each containing `SKILL.md`

### 3. Hook Scripts
Verify all hook scripts exist:
- [ ] `block-protected-files.js`
- [ ] `block-dangerous-commands.js`
- [ ] `typecheck-on-edit.js`
- [ ] `lint-on-edit.js`
- [ ] `session-context.js`
- [ ] `stop-closeout-check.js`
- [ ] `log-util.js`

### 4. CLAUDE.md Placement
- [ ] `CLAUDE.md` exists at the project root (not inside `documentation/`)

### 5. Semantic Checks
- [ ] `.prompts/` contains only `.md` files (no metadata files)
- [ ] All hooks listed in `hooks/README.md` are wired in `settings.json`
- [ ] `settings.json` does not contain machine-specific permissions (check for: openclaw, tmux, ttyd, nvidia-smi, tailscale)
- [ ] CLAUDE.md is under 300 lines / 16KB (flag as advisory if exceeded)

### 6. DAL State (if `.ava/` exists)
- [ ] `.ava/dal.mjs` exists
- [ ] `.ava/brain.db` exists
- [ ] `node .ava/dal.mjs status` returns integrity ok
- [ ] `node .ava/dal.mjs verify` returns 0 FAIL
- [ ] If identity has UNSET values: flag as "DAL deployed but unpopulated — run /cleanup to hydrate"

### 7. File Mode (if no `.ava/brain.db`)
- [ ] `PROJECT_ROADMAP.md` exists (project root or `documentation/`)
- [ ] `IMPLEMENTATION_PLAN.md` exists (project root or `documentation/`)

## Output

Report each check as PASS/FAIL. If any fail, provide the specific fix:
- Missing file → "Copy from canonical source at Prompt_Engineering/template/..."
- Wrong location → "Move .claude/ to project root"
- Parse error → "Fix JSON syntax in settings.json"
- Unpopulated DAL → "Run /cleanup to hydrate brain.db from codebase"
