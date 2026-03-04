---
name: validate-setup
description: "Verify the documentation system template was deployed correctly to this project"
disable-model-invocation: true
allowed-tools:
  - Read
  - Glob
  - Bash
---

# Validate Setup

Verify the documentation system template was deployed correctly to this project. Run this after copying `documentation/` and `.claude/` to a new project.

## Checks

### 1. Prompt Templates
Verify all 15 prompts exist:
- [ ] `documentation/.prompts/discovery.md`
- [ ] `documentation/.prompts/bootstrap.md`
- [ ] `documentation/.prompts/init.md`
- [ ] `documentation/.prompts/closeout.md`
- [ ] `documentation/.prompts/readme.md`
- [ ] `documentation/.prompts/testing.md`
- [ ] `documentation/.prompts/code-review.md`
- [ ] `documentation/.prompts/debugging.md`
- [ ] `documentation/.prompts/release.md`
- [ ] `documentation/.prompts/architecture.md`
- [ ] `documentation/.prompts/refactor.md`
- [ ] `documentation/.prompts/migration.md`
- [ ] `documentation/.prompts/incident.md`
- [ ] `documentation/.prompts/requirements.md`
- [ ] `documentation/.prompts/dependency-audit.md`

### 2. .claude Directory (at project root)
- [ ] `.claude/settings.json` exists and parses as valid JSON
- [ ] `.claude/hooks/` directory exists with 6 `.js` files
- [ ] `.claude/agents/` directory exists with 3 `.md` files
- [ ] `.claude/skills/` directory exists with 19 skill directories, each containing `SKILL.md`

### 3. Hook Scripts
Verify all hook scripts exist and are valid JS:
- [ ] `block-protected-files.js`
- [ ] `block-dangerous-commands.js`
- [ ] `typecheck-on-edit.js`
- [ ] `lint-on-edit.js`
- [ ] `session-context.js`
- [ ] `stop-closeout-check.js`

### 4. CLAUDE.md Placement
- [ ] `CLAUDE.md` exists at the project root (not inside `documentation/`)

### 5. Core Documents
- [ ] `documentation/PROJECT_ROADMAP.md` exists
- [ ] `documentation/IMPLEMENTATION_PLAN.md` exists

## Output

Report each check as PASS/FAIL. If any fail, provide the specific fix:
- Missing file → "Copy from canonical source at repos/Prompt_Engineering/..."
- Wrong location → "Move .claude/ to project root"
- Parse error → "Fix JSON syntax in settings.json"
