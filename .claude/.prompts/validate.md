# Validate — Project Health Audit

Unified validation covering documentation consistency, template deployment, CLAUDE.md coverage, and skill compliance. Merges the former validate-docs, validate-setup, and readme skills into one tool.

---

## MODE SELECTION

Parse arguments to determine scope:

- **No flags** → Run all 4 domains
- **`--fix`** → Run all 4 domains + auto-fix safe issues
- **`--docs`** → Domain 1 only (documentation consistency)
- **`--setup`** → Domain 2 only (template deployment)
- **`--claude`** → Domain 3 only (CLAUDE.md coverage)
- **`--readme`** → Domain 3 only (alias for `--claude`)
- **`--skills`** → Domain 4 only (skill structural compliance)

Flags can combine: `--docs --fix` runs Domain 1 with auto-fix.

---

## DOMAIN 1: DOCUMENTATION CONSISTENCY

### 1.1 Version & Date Consistency
- If `PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` exist (file-mode projects), version numbers must match across them and CLAUDE.md. brain.db-mode projects skip these files — version lives in brain.db.
- brain.db `project.version` matches CLAUDE.md (if brain.db exists)
- "Last Updated" / "Updated" dates are consistent across existing docs
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

Run this after deploying `.claude/` (including `.claude/.prompts/`) to a new project, or periodically to check drift.

### 2.1 Prompt Templates
Verify expected prompts exist in `.claude/.prompts/`:
- Core lifecycle: init.md, closeout.md, cleanup.md, explore.md, together.md
- Quality: validate.md, code-review.md, debugging.md, refactor.md
- Design: architecture.md, requirements.md, testing.md, migration.md
- Situational: triage.md, ui-dev.md, supabase.md, plan-validator.md
- Reference: system-reference.md, dal-doctor.md
- Data: agent-qa.md, METRICS.md
- **Legacy check:** If a legacy `documentation/.prompts/` or root `.prompts/` exists, flag as WARNING — stale legacy location.

### 2.2 Skills Directory
- `.claude/skills/` exists with skill directories, each containing `SKILL.md`
- No orphan skill directories (skill exists but no corresponding prompt or inline content)

### 2.3 Hooks
Verify hook scripts exist in `.claude/hooks/`:
- `block-protected-files.js`
- `block-dangerous-commands.js`
- `typecheck-on-edit.js`
- `lint-on-edit.js`
- `session-context.js`
- `stop-closeout-check.js`
- `completion-check.js`
- `log-util.js`

**Cross-check:** Verify `.claude/hooks/README.md` documents ALL hooks wired in `settings.json`. Any hook in settings.json but missing from the README is an undocumented hook. Any threshold or timing value in the README must match the actual code default.

### 2.4 Settings
- `.claude/settings.json` exists and parses as valid JSON
- No machine-specific permissions (check for: openclaw, tmux, ttyd, nvidia-smi, tailscale)

### 2.5 Agents
- `.claude/agents/` directory exists with agent `.md` files

### 2.6 CLAUDE.md Placement
- `CLAUDE.md` exists at project root

### 2.7 DAL State (if `.ava/` exists)
- `.ava/dal.mjs` and `.ava/brain.db` exist
- `node .ava/dal.mjs status` returns integrity ok
- `node .ava/dal.mjs verify` returns 0 FAIL
- If identity has UNSET values: flag "DAL deployed but unpopulated — run /cleanup"

### 2.8 File Mode (if no `.ava/brain.db`)
- `PROJECT_ROADMAP.md` exists at project root
- `IMPLEMENTATION_PLAN.md` exists at project root

---

## DOMAIN 3: CLAUDE.md COVERAGE

CLAUDE.md is the auto-loaded knowledge file agents read every session. Ensure CLAUDE.md exists and is current at every significant boundary.

### 3.1 Audit Phase
- Project root MUST have CLAUDE.md (already checked in Domain 2)
- Sub-projects / spokes (directories with their own package.json, brain.db, or significant scope) SHOULD have their own CLAUDE.md with domain-specific rules
- Check: is each CLAUDE.md under 5KB? (larger means it's accumulating content that belongs in brain.db)
- Check: does each CLAUDE.md have version, critical rules, and build/run commands?

### 3.2 Staleness Check
- Compare CLAUDE.md version against brain.db project.version (if brain.db exists)
- Flag CLAUDE.md files not updated in >30 days on active projects
- Check for references to removed features, old skill names, or stale counts

### 3.3 Content Boundary Check
- CLAUDE.md should contain: prescriptive rules, quick reference, key commands
- CLAUDE.md should NOT contain: session state, task lists, historical decisions, architecture entries queryable from brain.db
- Flag violations with specific recommendation

### 3.4 Vault Freshness (if Obsidian vault exists)

Check `~/Obsidian/Ava/{ProjectName}/` for the project's vault folder. If it exists, perform these checks:

1. **END-GOAL.md version check** - Read the first 30 lines. Extract version references. Compare against brain.db `project.version`. Flag mismatch as FAIL.
2. **Session note gap** - Count vault session notes vs brain.db session count. Report the gap. Flag gap > 5 as WARN.
3. **ChromaDB sync** - Run `node .ava/dal.mjs vault status`. If ChromaDB is not deployed or the vault command is unavailable, flag as SKIP (ChromaDB not deployed -- optional layer). If deployed but returning errors or 0 doc count, flag as WARN.

If no vault folder exists for the project, report as INFO (vault is optional, not required).

### 3.5 README.md (secondary, human-facing)
- Project root SHOULD have README.md as human guide
- Sub-directories with 3+ files MAY have README.md for human context
- READMEs are for humans, CLAUDE.md is for agents — don't conflate

#### README Templates (optional, for human-facing docs)

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

#### README Rules
- Be factual — describe what exists, not what should exist
- Be concise — scannable in 30 seconds
- Don't duplicate — reference parent READMEs instead of repeating
- Don't over-document — 3-file directory needs 5 lines, not 50
- Keep tables tight — one-line descriptions per entry
- Update, don't rewrite — preserve existing structure and custom content

---

## DOMAIN 4: SKILL COMPLIANCE

Verify that each skill conforms to PE's structural conventions. This catches drift between skills, missing prompts, and frontmatter errors that cause silent failures.

### 4.1 SKILL.md Existence & Frontmatter
For each directory in `.claude/skills/`:
- Must contain `SKILL.md` (and only SKILL.md — no other files)
- SKILL.md must have valid YAML frontmatter (delimited by `---`)
- Required frontmatter keys: `name`, `description`, `allowed-tools`
- `allowed-tools` must be a list (not a string)

### 4.2 Name Consistency
- Frontmatter `name` must match the directory name exactly
- Example: `skills/validate/SKILL.md` must have `name: validate`

### 4.3 Prompt Linkage
- Each skill's `## Instructions` section references a `.claude/.prompts/{name}.md` file
- That file must exist in `.claude/.prompts/` and be non-empty (>10 bytes)
- **Orphan detection:**
  - Skills with no matching prompt AND no substantive inline content (<500 bytes after frontmatter): WARN
  - Prompts with no referencing skill: INFO (some are reference docs)
  - **Exempt from orphan detection:** METRICS.md, system-reference.md, agent-qa.md

### 4.4 Required Sections
Each SKILL.md must contain:
- A top-level heading (`#`)
- `## Instructions` section
- At least one of: `## Full Protocol` or `## Inline Fallback`
- Missing both fallback and protocol is a FAIL — the skill is useless if its prompt file is absent

### 4.5 Invocation Rules
- No skill may use `disable-model-invocation: true` (per CLAUDE.md critical rules)
- Only `documentation-awareness` may have `user-invocable: false`
- Any violation is a FAIL with the specific skill name and offending key

### 4.6 Count Verification
- Count skill directories (with SKILL.md), active skills (minus non-invocable), and prompt files
- Compare against CLAUDE.md reported counts
- Flag any mismatch

---

## OUTPUT FORMAT

```
## Validation Report
**Date:** {date}
**Mode:** {Full / Docs / Setup / CLAUDE.md} {+ Auto-Fix if applicable}
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

### Domain 3: CLAUDE.md & Vault Coverage
- {n} CLAUDE.md files checked, {m} current, {k} issues identified
- {list of issues with recommendations}
- [PASS/FAIL/SKIP] Vault END-GOAL.md version — {brain.db version} vs {END-GOAL version}
- [PASS/FAIL/SKIP] Vault session coverage — {vault count} notes, gap of {N} sessions
- [PASS/FAIL/SKIP] Vault ChromaDB sync — {doc count} docs indexed

### Domain 4: Skill Compliance
1. [PASS/FAIL] SKILL.md Existence — {count}/{total} dirs have valid SKILL.md
2. [PASS/FAIL] Name Consistency — {details}
3. [PASS/FAIL] Prompt Linkage — {count} linked, {n} orphaned skills, {m} orphaned prompts
4. [PASS/FAIL] Required Sections — {details}
5. [PASS/FAIL] Invocation Rules — {details}
6. [PASS/FAIL] Count Accuracy — {actual} skills, {actual} prompts vs CLAUDE.md

### Auto-Fixed (if --fix)
- {what was changed, in which file, why}

### Requires Manual Fix
- {specific issue, which file, recommended action}
```
