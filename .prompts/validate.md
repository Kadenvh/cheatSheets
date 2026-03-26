# Validate — Project Health Audit

Unified validation covering documentation consistency, template deployment, and README coverage. Merges the former validate-docs, validate-setup, and readme skills into one tool.

---

## MODE SELECTION

Parse arguments to determine scope:

- **No flags** → Run all 3 domains
- **`--fix`** → Run all 3 domains + auto-fix safe issues
- **`--docs`** → Domain 1 only (documentation consistency)
- **`--setup`** → Domain 2 only (template deployment)
- **`--readme`** → Domain 3 only (README coverage)

Flags can combine: `--docs --fix` runs Domain 1 with auto-fix.

---

## DOMAIN 1: DOCUMENTATION CONSISTENCY

### 1.1 Version & Date Consistency
- Version numbers match across CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md (if they exist)
- brain.db `project.version` matches CLAUDE.md
- "Last Updated" / "Updated" dates are consistent
- **Auto-fixable:** Sync version numbers to the highest found. Sync dates to today.

### 1.2 Routing Rule Compliance
Scan for content placed in the wrong file:
- CLAUDE.md should NOT contain: architectural rationale, version history, task lists
- PROJECT_ROADMAP.md should NOT contain: build commands, debugging notes, sprint tasks
- IMPLEMENTATION_PLAN.md should NOT contain: architectural philosophy, anti-patterns
- brain.db is NOT a data store — it tracks decisions and understanding, not code or content
- **NOT auto-fixable:** Report with specific recommendation.

### 1.3 Duplication Check
Flag content that appears in multiple files beyond brief cross-references.
- **NOT auto-fixable:** Report with recommendation on which copy to keep.

### 1.4 Completeness Check
- CLAUDE.md has: version header, critical rules, file structure, build/run commands
- PROJECT_ROADMAP.md has: vision/goals, version history, architecture, future roadmap
- IMPLEMENTATION_PLAN.md has: current status, task checklists, handoff notes
- **NOT auto-fixable:** Report what's missing.

### 1.5 Orphan & Staleness Check
- No references to removed/renamed features
- No completed tasks still marked `[ ]` pending
- No stale dates (>30 days without update on an active project)
- **Auto-fixable:** Mark completed tasks `[x]`, remove dead references, update stale dates.

### 1.6 brain.db Alignment (if `.ava/brain.db` exists)
- Run `node .ava/dal.mjs status` — verify schema, integrity
- If brain.db has 0 identity entries and 0 sessions: **FAIL** — "DAL deployed but never populated. Run /cleanup to hydrate."
- Spot-check key identity entries against CLAUDE.md (version, tech stack). Flag contradictions.
- Verify active decisions haven't been superseded by doc changes.
- **NOT auto-fixable:** brain.db updates require /cleanup's reconciliation protocol.

---

## DOMAIN 2: TEMPLATE DEPLOYMENT

Run this after deploying `.claude/` and `.prompts/` to a new project, or periodically to check drift.

### 2.1 Prompt Templates
Verify expected prompts exist in `.prompts/` (project root):
- Core lifecycle: init.md, closeout.md, cleanup.md, explore.md, together.md
- Quality: validate.md, code-review.md, debugging.md, refactor.md
- Design: architecture.md, requirements.md, testing.md, migration.md
- Reference: system-reference.md, dal-doctor.md
- Data: agent-qa.md, METRICS.md
- **Legacy check:** If `documentation/.prompts/` exists, flag as WARNING — stale legacy location.

### 2.2 Skills Directory
- `.claude/skills/` exists with skill directories, each containing `SKILL.md`
- No orphan skill directories (skill exists but no corresponding prompt or inline content)

### 2.3 Hooks
Verify hook scripts exist in `.claude/hooks/`:
- `block-protected-files.js` (or .cjs)
- `block-dangerous-commands.js` (or .cjs)
- `typecheck-on-edit.js` (or .cjs)
- `lint-on-edit.js` (or .cjs)
- `session-context.js` (or .cjs)
- `stop-closeout-check.js` (or .cjs)
- `log-util.js` (or .cjs)

### 2.4 Settings
- `.claude/settings.json` exists and parses as valid JSON
- No machine-specific permissions (check for: openclaw, tmux, ttyd, nvidia-smi, tailscale)

### 2.5 Agents
- `.claude/agents/` directory exists with agent `.md` files

### 2.6 CLAUDE.md Placement
- `CLAUDE.md` exists at project root (not inside `documentation/`)

### 2.7 DAL State (if `.ava/` exists)
- `.ava/dal.mjs` and `.ava/brain.db` exist
- `node .ava/dal.mjs status` returns integrity ok
- `node .ava/dal.mjs verify` returns 0 FAIL
- If identity has UNSET values: flag "DAL deployed but unpopulated — run /cleanup"

### 2.8 File Mode (if no `.ava/brain.db`)
- `PROJECT_ROADMAP.md` exists (project root or `documentation/`)
- `IMPLEMENTATION_PLAN.md` exists (project root or `documentation/`)

---

## DOMAIN 3: README COVERAGE

### 3.1 Audit Phase (always first)
1. List all directories at the target level
2. Check which already have a README.md
3. Identify directories that need one per these criteria:
   - 3+ files with a shared purpose
   - Non-obvious conventions
   - Boundary directory (components/, hooks/, features/, config/, utils/)
   - A new agent would need context to work there
4. **Report findings before creating anything**

### 3.2 Creation Phase (only with `--fix` or `--readme`)
1. Read directory contents — every file
2. Identify conventions from existing code
3. Write README following templates below
4. Include only information that is currently true — no aspirational content

### 3.3 Update Phase
1. Read existing README.md
2. Diff against actual directory contents
3. Add new files, remove deleted ones, update descriptions
4. Preserve hand-written sections (marked with `<!-- custom -->`)

### README Templates

**Directory level:**
```markdown
# {Directory Name}

{One sentence: what this directory contains and its role.}

## Contents

| File/Folder | Purpose |
|-------------|---------|
| `Example.tsx` | {Brief description} |

## Conventions

- {Naming convention}
- {Pattern convention}

## Adding New Items

{How to add a new file. Reference naming patterns or templates.}
```

**Spoke level (sub-project roots):**
```markdown
# {Project Name}

{2-3 sentences: what, who, why.}

**Version:** {X.Y.Z} | **Status:** {status}

## Quick Start

{install/run commands}

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | {Entry point} |
```

### README Rules
- Be factual — describe what exists, not what should exist
- Be concise — scannable in 30 seconds
- Don't duplicate — reference parent READMEs instead of repeating
- Don't over-document — 3-file directory needs 5 lines, not 50
- Keep tables tight — one-line descriptions per entry
- Update, don't rewrite — preserve existing structure and custom content

---

## OUTPUT FORMAT

```
## Validation Report
**Date:** {date}
**Mode:** {Full / Docs / Setup / README} {+ Auto-Fix if applicable}
**Status:** PASS / FAIL ({n} issues)

### Domain 1: Documentation Consistency
1. [PASS/FAIL] Version Consistency — {details}
2. [PASS/FAIL] Routing Compliance — {details}
3. [PASS/FAIL] No Duplication — {details}
4. [PASS/FAIL] Completeness — {details}
5. [PASS/FAIL] No Orphans — {details}
6. [PASS/FAIL] brain.db Alignment — {details, or SKIP if no .ava/}

### Domain 2: Template Deployment
1. [PASS/FAIL] Prompts — {count}/{expected}
2. [PASS/FAIL] Skills — {count} dirs with SKILL.md
3. [PASS/FAIL] Hooks — {count}/{expected}
4. [PASS/FAIL] Settings — {details}
5. [PASS/FAIL] Agents — {details}
6. [PASS/FAIL] CLAUDE.md — {details}
7. [PASS/FAIL] DAL State — {details, or SKIP}

### Domain 3: README Coverage
- {n} directories checked, {m} have README, {k} gaps identified
- {list of gaps with recommendations}

### Auto-Fixed (if --fix)
- {what was changed, in which file, why}

### Requires Manual Fix
- {specific issue, which file, recommended action}
```
