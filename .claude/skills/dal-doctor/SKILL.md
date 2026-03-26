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

Read `.prompts/dal-doctor.md` for the full protocol. Follow its phased approach:

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
- **`.prompts/` at project root** — never `documentation/.prompts/` (legacy location)

## Quick Reference

```bash
# Structural check
node .ava/dal.mjs verify
node .ava/dal.mjs status

# Template comparison
node /home/ava/Prompt_Engineering/.ava/dal.mjs template diff <project>
node /home/ava/Prompt_Engineering/.ava/dal.mjs template sync <project>

# Ecosystem health (if Ava_Main running)
curl -s http://localhost:4173/api/dal/ecosystem | python3 -m json.tool
```

## Inline Fallback (if prompt file not found)

1. Check `.ava/brain.db` exists. If not, check for `.ava/dal.mjs`. If neither -> deploy DAL from PE. If runtime exists -> run `dal.mjs migrate` to create brain.db.
2. If brain.db empty (0 identity, 0 sessions) -> run `/cleanup` to hydrate from docs.
3. Run `node .ava/dal.mjs verify` + `status`. Record baseline.
4. Run diagnostics: identity completeness, architecture coverage, session quality, decision coherence, note staleness, file health, hook alignment, loop integrity.
5. Check for `documentation/.prompts/` (legacy location -> warn and recommend deletion).
6. Remediate: Tier 1 auto-fix (stale sessions, version drift, pending migrations), Tier 2 notify (completed notes), Tier 3 ask (template deploy, legacy cleanup).
7. Output: Health GREEN/YELLOW/RED, findings by severity, remediation applied, recommendations.
