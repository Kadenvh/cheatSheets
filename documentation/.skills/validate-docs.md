---
description: "Use to audit cross-file consistency between CLAUDE.md, PROJECT_ROADMAP.md, and IMPLEMENTATION_PLAN.md. Run when documentation state is uncertain, after closeout, or at session start if something feels off."
---

# Documentation Validation

Perform a consistency audit of the project's three-document architecture. Read all three files completely before reporting.

## Validation Checks

### 1. Version & Date Consistency
Read the header/status line of each file:
- [ ] Version numbers match across CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md
- [ ] "Last Updated" / "Updated" dates match
- [ ] Init prompt version matches (if it exists)

### 2. Routing Rule Compliance
Scan for content in the wrong file:

| Found in... | But answers... | Belongs in... |
|---|---|---|
| CLAUDE.md | "Why was this decided?" | PROJECT_ROADMAP.md |
| CLAUDE.md | "What should I do next?" | IMPLEMENTATION_PLAN.md |
| PROJECT_ROADMAP.md | "How do I build this?" | CLAUDE.md |
| PROJECT_ROADMAP.md | "What's currently broken?" | IMPLEMENTATION_PLAN.md |
| IMPLEMENTATION_PLAN.md | "Why did we choose X?" | PROJECT_ROADMAP.md |
| IMPLEMENTATION_PLAN.md | "What must I never do?" | CLAUDE.md |

### 3. Duplication Check
Flag content that appears in multiple files beyond brief cross-references:
- Duplicated task lists
- Duplicated schema/API documentation
- Duplicated architectural descriptions
- Duplicated anti-patterns or rules

### 4. Completeness Check
- [ ] CLAUDE.md has: version header, critical rules/anti-patterns, file structure, build/run commands
- [ ] PROJECT_ROADMAP.md has: vision/goals, version history table, architecture, future roadmap
- [ ] IMPLEMENTATION_PLAN.md has: current status, task checklists, handoff notes for next session

### 5. Orphan & Staleness Check
- [ ] No references to files, features, or endpoints that have been removed or renamed
- [ ] No completed tasks still marked as `[ ]` pending
- [ ] No "next steps" referencing already-completed work
- [ ] No stale dates (e.g., "Updated" date from weeks ago when recent work happened)

## Output Format

```
## Documentation Validation Report

**Date:** {date}
**Status:** PASS / FAIL ({n} issues)

### Results
1. [PASS/FAIL] Version Consistency — {details}
2. [PASS/FAIL] Routing Compliance — {details}
3. [PASS/FAIL] No Duplication — {details}
4. [PASS/FAIL] Completeness — {details}
5. [PASS/FAIL] No Orphans — {details}

### Fixes Required
- {specific fix with file and location}
```

If all checks pass, report PASS and confirm the documentation is healthy. If any fail, list specific fixes with file paths and recommended actions.
