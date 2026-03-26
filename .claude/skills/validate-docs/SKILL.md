---
name: validate-docs
description: "Audit cross-file consistency and optionally auto-fix safe issues (use --fix to apply corrections)"
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Documentation Validation

Perform a consistency audit of the project's documentation. Adapts to mode: brain.db-first (CLAUDE.md + brain.db) or file-mode (three-document architecture).

## Mode Selection

- **`/validate-docs`** — Audit only. Report issues, don't touch files.
- **`/validate-docs --fix`** or if the user says "fix" — Audit + auto-fix safe issues, report unsafe issues for manual review.

## Instructions

Detect mode first: if `.ava/brain.db` exists, use brain.db mode (CLAUDE.md is the only hand-authored doc). Otherwise, use file mode (CLAUDE.md + PROJECT_ROADMAP.md + IMPLEMENTATION_PLAN.md). Then run these checks:

### 1. Version & Date Consistency
- Version numbers match across CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md
- "Last Updated" / "Updated" dates match
- **Auto-fixable:** Sync version numbers to the highest found. Sync dates to today.

### 2. Routing Rule Compliance
Scan for content placed in the wrong file:
- CLAUDE.md should NOT contain: architectural rationale, version history, task lists
- PROJECT_ROADMAP.md should NOT contain: build commands, debugging notes, sprint tasks
- IMPLEMENTATION_PLAN.md should NOT contain: architectural philosophy, anti-patterns
- **NOT auto-fixable:** Moving content between files requires judgment about context and phrasing. Report with specific recommendation.

### 3. Duplication Check
Flag content that appears in multiple files beyond brief cross-references.
- **NOT auto-fixable:** Choosing which copy to keep requires understanding intent. Report with recommendation.

### 4. Completeness Check
- CLAUDE.md has: version header, critical rules, file structure, build/run commands
- PROJECT_ROADMAP.md has: vision/goals, version history table, architecture, future roadmap
- IMPLEMENTATION_PLAN.md has: current status, task checklists, handoff notes
- **NOT auto-fixable:** Can't generate missing content automatically. Report what's missing.

### 5. Orphan & Staleness Check
- No references to removed/renamed features
- No completed tasks still marked `[ ]` pending
- No stale dates (>30 days without update on an active project)
- **Auto-fixable:** Mark completed tasks as `[x]` if evidence confirms completion. Remove references to files/features that no longer exist. Update stale dates.

### 6. brain.db ↔ Docs Consistency (if `.ava/brain.db` exists)
- Run `node .ava/dal.mjs status` — verify schema, integrity
- If brain.db has 0 identity rows and 0 sessions: **FAIL** — "DAL deployed but never populated. Run /cleanup to hydrate."
- If brain.db has identity rows: spot-check key entries against CLAUDE.md (version, tech stack). Flag contradictions.
- If brain.db has decisions: verify active decisions haven't been superseded by doc changes.
- **NOT auto-fixable:** brain.db updates require /cleanup's reconciliation protocol.

## Auto-Fix Safety Rules

When in fix mode:

**Safe to fix automatically:**
- Version number mismatches (sync to highest)
- Date mismatches (sync to today)
- Completed tasks still marked pending (if code confirms completion)
- References to deleted files/features (remove the reference)
- Stale dates on active projects (update to today)

**Never fix automatically (report only):**
- Content in the wrong file (routing rule violations)
- Duplicated content across files
- Missing sections or incomplete documentation
- Anything where the "correct" fix is ambiguous

After auto-fixing, re-run all 5 checks to confirm fixes didn't introduce new issues.

## Output Format

```
## Documentation Validation Report
**Date:** {date}
**Mode:** Audit Only / Audit + Auto-Fix
**Status:** PASS / FAIL ({n} issues)

### Results
1. [PASS/FAIL] Version Consistency — {details}
2. [PASS/FAIL] Routing Compliance — {details}
3. [PASS/FAIL] No Duplication — {details}
4. [PASS/FAIL] Completeness — {details}
5. [PASS/FAIL] No Orphans — {details}
6. [PASS/FAIL] brain.db Consistency — {details, or SKIP if no .ava/brain.db}

### Auto-Fixed (if fix mode)
- {what was changed, in which file, why}

### Requires Manual Fix
- {specific issue, which file, recommended action}
```

## Inline Fallback (if agent definitions not available)

Run the 5 checks manually by reading each file and comparing. Focus on: version numbers match, no content in wrong files, no duplication, all required sections present, no stale references.
