---
name: validate
description: "Validate project health: storage boundaries, template deployment, CLAUDE.md coverage, and skill compliance. Use --fix for safe corrections, --claude for CLAUDE.md audit."
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Validate

Unified project validation: documentation consistency, template deployment verification, CLAUDE.md coverage, and skill compliance.

## Instructions

1. Load the validate prompt:
   - Read `.claude/.prompts/validate.md` (relative to project root)
2. Follow its protocol — runs 4 validation domains by default:
   - **Domain 1: Documentation Consistency** — version/date sync, routing compliance, duplication, completeness, stale structural docs, and lean-DAL alignment
   - **Domain 2: Template Deployment** — prompts, skills, hooks, settings, deployable docs, DAL state
   - **Domain 3: CLAUDE.md & Doc Coverage** — sub-project audit, staleness check, content boundaries, END-GOAL.md freshness, sessions coverage
   - **Domain 4: Skill Compliance** — SKILL.md structure, frontmatter, prompt linkage, invocation rules, transitional inventory accuracy

## Modes

- **`/validate`** — Full audit (all 4 domains), report only
- **`/validate --fix`** — Audit + auto-fix safe issues (version sync, date sync, completed tasks, obvious stale counts)
- **`/validate --claude`** — CLAUDE.md-focused: audit sub-projects, staleness, content boundaries (alias: `--readme`)
- **`/validate --setup`** — Template deployment check only (useful post-deploy)
- **`/validate --docs`** — Documentation consistency check only
- **`/validate --skills`** — Skill structural compliance check only

## Inline Fallback (if prompt file not found)

If `.claude/.prompts/validate.md` cannot be located:

1. **Docs check.** Read CLAUDE.md, SYSTEM-OVERVIEW.md, and active plans. Verify versions and dates match where appropriate, no content lives in the wrong place, and no structural docs are being maintained manually when GitNexus should answer the question.
2. **Template check.** Verify `.claude/.prompts/` has expected files, `.claude/skills/` has skill dirs with SKILL.md, `.claude/hooks/` has hook scripts, and settings.json parses.
3. **CLAUDE.md check.** Verify sub-projects have CLAUDE.md with version, rules, and build commands. Check staleness and content boundaries. READMEs are secondary (human-facing).
4. **Skill check.** Verify each `.claude/skills/*/SKILL.md` has valid frontmatter, matching prompt, required sections, correct invocation rules, and no stale structural assumptions.
5. **DAL check** (if `.ava/brain.db` exists). Run `dal.mjs status` and `dal.mjs verify`. Flag unpopulated or bloated continuity stores and note any legacy tables that are still being treated as first-class.
6. Report each check as PASS/FAIL with specific fix instructions.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure as a note or include it in the handoff/closeout summary. Use `agent_actions` only if the project still relies on that legacy surface.
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- If this project still uses `agent_actions`, record the validate result there. Otherwise rely on notes + handoff continuity.
- If this work changed CLAUDE.md rules or key commands, update CLAUDE.md
