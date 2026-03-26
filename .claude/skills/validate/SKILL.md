---
name: validate
description: "Validate project health: cross-file consistency, template deployment, README coverage. Use --fix for auto-corrections, --readme for README audit."
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Validate

Unified project validation: documentation consistency, template deployment verification, and README coverage.

## Instructions

1. Load the validate prompt. Try brain.db first, fall back to file:
   - **brain.db:** `node .ava/dal.mjs prompt get validate --content` (if `.ava/brain.db` exists)
   - **File fallback:** Read `.prompts/validate.md` (relative to project root)
2. Follow its protocol — runs 3 validation domains by default:
   - **Domain 1: Documentation Consistency** — version/date sync, routing compliance, duplication, completeness, orphans, brain.db alignment
   - **Domain 2: Template Deployment** — prompts, skills, hooks, agents, settings, DAL state
   - **Domain 3: README Coverage** — directory audit, gap detection, content freshness

## Modes

- **`/validate`** — Full audit (all 3 domains), report only
- **`/validate --fix`** — Audit + auto-fix safe issues (version sync, date sync, completed tasks)
- **`/validate --readme`** — README-focused: audit directories, create/update READMEs where needed
- **`/validate --setup`** — Template deployment check only (useful post-deploy)
- **`/validate --docs`** — Documentation consistency check only

## Inline Fallback (if prompt file not found)

If `.prompts/validate.md` cannot be located:

1. **Docs check.** Read CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md. Verify versions match, dates match, no content in wrong files, no duplication, all required sections present.
2. **Template check.** Verify `.prompts/` has expected files, `.claude/skills/` has skill dirs with SKILL.md, `.claude/hooks/` has hook scripts, settings.json parses.
3. **README check.** List directories with 3+ files. Flag those missing README.md. Report gaps.
4. **DAL check** (if `.ava/brain.db` exists). Run `dal.mjs status` and `dal.mjs verify`. Flag unpopulated databases.
5. Report each check as PASS/FAIL with specific fix instructions.
