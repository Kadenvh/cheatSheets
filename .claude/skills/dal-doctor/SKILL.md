---
name: dal-doctor
description: "Unified system health, setup, and remediation — first-run detection, ongoing health checks, template drift, vault health, remediation"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - Agent
---

# DAL Doctor — Unified System Health & Setup

Comprehensive system tool that handles first-run setup, ongoing health checks, template drift detection, vault health, and remediation. Replaces the previous `/bootstrap` and `/dal-setup` skills.

## Instructions

Read `.claude/.prompts/dal-doctor.md` for the full protocol. Follow its phased approach:

- **Phase 0:** Detection & first-run (no DAL? create it. No CLAUDE.md? create it. No vault folder? create it.)
- **Phase 1:** Schema & identity (verify, identity completeness, architecture coverage, sessions, decisions, notes)
- **Phase 2:** Template & hook validation (prompt files, skills, hooks, settings, legacy path detection)
- **Phase 3:** Vault health (folder structure, templates, frontmatter — conditional, skip if no vault)
- **Phase 4:** Loop & cross-project (action integrity, feedback loop, schema drift, template drift)
- **Phase 5:** Remediation (3-tier: auto-fix / notify / permission-required)

## When to Use

- First-time project setup (replaces `/bootstrap` and `/dal-setup`)
- After deploying DAL updates to a project
- When `dal.mjs verify` passes but something feels off
- For ecosystem-wide health sweeps across all projects
- To deploy missing templates to downstream projects
- When debugging agent behavior that might stem from stale brain.db data
- After sessions with significant architectural changes

## Key Rules

- **Physical files are truth** — prompts, skills, hooks, agents live on disk, NOT in brain.db
- **brain.db stores active memory** — identity, architecture, decisions, sessions, notes
- **Never modify brain.db with raw SQL** — use `dal.mjs` CLI commands
- **Never delete data without user confirmation**
- **Never touch protected files** — brain.db, CLAUDE.md, settings.local.json, custom skills
- **Tiered remediation** — Tier 1 auto-fixes, Tier 2 notifies, Tier 3 asks permission
- **`.claude/.prompts/` is the canonical prompt location** — if `documentation/.prompts/` or root `.prompts/` exists, it is a legacy artifact and should be removed

## Quick Reference

```bash
# Structural check
node .ava/dal.mjs verify
node .ava/dal.mjs status

# Template drift check + update
node .ava/dal.mjs template pull --dry-run     # See what's changed
node .ava/dal.mjs template pull               # Apply template updates
node .ava/dal.mjs template pull --dal          # Also update DAL runtime

# Full health report
node .ava/dal.mjs health --json
```

## Inline Fallback (if prompt file not found)

1. Check `.ava/brain.db` exists. If not, check for `.ava/dal.mjs`. If neither -> deploy DAL from PE. If runtime exists -> run `dal.mjs migrate` to create brain.db.
2. If brain.db empty (0 identity, 0 sessions) -> run `/cleanup` to hydrate from docs.
3. Run `node .ava/dal.mjs verify` + `status`. Record baseline.
4. Run diagnostics: identity completeness, architecture coverage, session quality, decision coherence, note staleness, file health, hook alignment, loop integrity.
5. Check for `documentation/.prompts/` or root `.prompts/` (legacy locations — warn and recommend deletion; canonical location is `.claude/.prompts/`).
6. Remediate: Tier 1 auto-fix (stale sessions, version drift, pending migrations), Tier 2 notify (completed notes), Tier 3 ask (template deploy, legacy cleanup).
7. Output: Health GREEN/YELLOW/RED, findings by severity, remediation applied, recommendations.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "dal-doctor: <what failed>" --type maintenance --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- Record the action: `node .ava/dal.mjs action record "dal-doctor: <summary>" --type maintenance --outcome success`
- If this work changed CLAUDE.md rules or key commands, update CLAUDE.md
