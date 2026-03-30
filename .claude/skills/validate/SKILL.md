---
name: validate
description: "Validate project health: docs consistency, template deployment, CLAUDE.md coverage, skill compliance. Use --fix for auto-corrections, --claude for CLAUDE.md audit."
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Validate

Unified project validation: documentation consistency, template deployment verification, and CLAUDE.md coverage.

## Instructions

1. Load the validate prompt:
   - Read `.prompts/validate.md` (relative to project root)
2. Follow its protocol — runs 4 validation domains by default:
   - **Domain 1: Documentation Consistency** — version/date sync, routing compliance, duplication, completeness, orphans, brain.db alignment
   - **Domain 2: Template Deployment** — prompts, skills, hooks, agents, settings, DAL state
   - **Domain 3: CLAUDE.md Coverage** — sub-project audit, staleness check, content boundaries
   - **Domain 4: Skill Compliance** — SKILL.md structure, frontmatter, prompt linkage, invocation rules, count accuracy

## Modes

- **`/validate`** — Full audit (all 4 domains), report only
- **`/validate --fix`** — Audit + auto-fix safe issues (version sync, date sync, completed tasks)
- **`/validate --claude`** — CLAUDE.md-focused: audit sub-projects, staleness, content boundaries (alias: `--readme`)
- **`/validate --setup`** — Template deployment check only (useful post-deploy)
- **`/validate --docs`** — Documentation consistency check only
- **`/validate --skills`** — Skill structural compliance check only

## Inline Fallback (if prompt file not found)

If `.prompts/validate.md` cannot be located:

1. **Docs check.** Read CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md. Verify versions match, dates match, no content in wrong files, no duplication, all required sections present.
2. **Template check.** Verify `.prompts/` has expected files, `.claude/skills/` has skill dirs with SKILL.md, `.claude/hooks/` has hook scripts, settings.json parses.
3. **CLAUDE.md check.** Verify sub-projects have CLAUDE.md with version, rules, build commands. Check staleness and content boundaries. READMEs are secondary (human-facing).
4. **Skill check.** Verify each `.claude/skills/*/SKILL.md` has valid frontmatter, matching prompt, required sections, correct invocation rules, accurate counts.
5. **DAL check** (if `.ava/brain.db` exists). Run `dal.mjs status` and `dal.mjs verify`. Flag unpopulated databases.
6. Report each check as PASS/FAIL with specific fix instructions.
