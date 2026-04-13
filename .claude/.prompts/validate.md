# Validate — Project Health Audit

Unified validation covering documentation consistency, template deployment, CLAUDE.md coverage, and skill compliance.

This validator should reflect the lean-DAL, GitNexus-backed model:

- DAL is for continuity
- GitNexus or live inspection is for code structure
- `CLAUDE.md`, `plans/` (project root), and `sessions/` (project root) carry the active working surface
- `.claude/` holds the deployable surface only (skills, hooks, .prompts, agents, settings)

---

## MODE SELECTION

Parse arguments to determine scope:

- **No flags** → Run all 4 domains
- **`--fix`** → Run all 4 domains + auto-fix safe issues
- **`--docs`** → Domain 1 only
- **`--setup`** → Domain 2 only
- **`--claude`** → Domain 3 only
- **`--readme`** → Domain 3 only (alias for `--claude`)
- **`--skills`** → Domain 4 only

Flags can combine: `--docs --fix` runs Domain 1 with auto-fix.

---

## DOMAIN 1: DOCUMENTATION CONSISTENCY

### 1.1 Version & Date Consistency

- brain.db `project.version` matches the `CLAUDE.md` version header when identity rows are used
- "Updated" dates are consistent across actively maintained docs
- **Auto-fixable:** sync obvious version/date drift

### 1.2 Routing Rule Compliance

Scan for content placed in the wrong file:

- `CLAUDE.md` should contain rules, commands, and constraints
- DAL should contain continuity state, not broad structure dumps
- `OVERVIEW.md` should contain design intent or invariants, not live file trees
- `plans/` and `sessions/` belong at project root, NOT under `.claude/` (which is the deployable surface)
- `.claude/` must not contain project-local working state (plans, sessions, per-project narrative)
- `PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` are retired
- Obsidian vault folder for this project should not exist (retired in v7)
- **Not auto-fixable:** report with specific recommendation

### 1.3 Duplication Check

Flag content that appears in multiple canonical surfaces beyond brief cross-references.

High-priority duplication failures:

- plans in both `plans/` and `.claude/plans/` (plans should be at root only)
- `brain.db` continuity mirrored in loose markdown docs
- manual file-structure docs that duplicate what GitNexus or live inspection can answer

### 1.4 Completeness Check

- `CLAUDE.md` has version header, critical rules, and build/run commands
- active plans, if present, live in `plans/` at the project root
- if `.ava/brain.db` exists, the minimum continuity surfaces exist:
  - minimal identity where used
  - active decisions when they exist
  - open notes or a clean note queue
  - recent sessions / usable handoff
- **Not auto-fixable:** report what is missing

### 1.5 Structural Doc Drift Check

Flag or demote docs that should no longer be first-class:

- `FileStructure.md`
- manual route maps
- manual dependency maps
- broad structural snapshots in `OVERVIEW.md`
- hard-coded counts of prompts, skills, or hooks in prose when a generated inventory should be used

### 1.6 DAL Alignment

- Run `node .ava/dal.mjs status`
- If brain.db has 0 identity entries and 0 sessions: **FAIL** — DAL deployed but never populated
- Flag legacy `architecture`, `agent_actions`, `agent_metrics`, and `agent_feedback` tables being treated as first-class continuity surfaces
- Flag continuity gaps: no useful handoff, no open-note hygiene, no active decisions when constraints clearly exist

---

## DOMAIN 2: TEMPLATE DEPLOYMENT

Run this after deploying `.claude/` to a new project, or periodically to check drift.

### 2.1 Prompt Protocols

Verify expected prompt files exist in `.claude/.prompts/`.

This is transitional: v7 intends to move toward per-skill `protocol.md`, but the current template still deploys `.claude/.prompts/`.

Flag:

- missing lifecycle prompts
- legacy `documentation/.prompts/` or root `.prompts/`
- prompt references that no longer match real skills

### 2.2 Skills Directory

- `.claude/skills/` exists with skill directories containing `SKILL.md`
- no orphan skill directories
- `documentation-awareness` remains non-invocable

### 2.3 Hooks

Verify expected hook scripts exist and match `settings.json`.

Cross-check:

- hook scripts present on disk
- `settings.json` wiring matches the shipped hooks
- hook docs do not claim protections or behavior the code does not implement

### 2.4 Settings

- `.claude/settings.json` exists and parses as valid JSON
- no machine-specific permissions are committed accidentally

### 2.5 Agents

`.claude/agents/` is now demoted from the core lifecycle story.

- presence is informational, not a hard requirement for the memory system
- only fail if shipped references require an agent surface that is missing

### 2.6 CLAUDE.md Placement

- `CLAUDE.md` exists at project root

### 2.7 DAL State (if `.ava/` exists)

- `.ava/dal.mjs` and `.ava/brain.db` exist
- `node .ava/dal.mjs status` returns integrity ok
- `node .ava/dal.mjs verify` returns 0 FAIL
- if DAL is deployed but empty or obviously bloated, flag it

### 2.8 Retired Files Check

Flag:

- `PROJECT_ROADMAP.md`
- `IMPLEMENTATION_PLAN.md`
- `documentation/` folder
- root `archive/`
- `.claude/plans/` (plans moved to project root `plans/` in v7)
- Obsidian vault folder for this project (vault layer retired in v7)

---

## DOMAIN 3: CLAUDE.md & DOC COVERAGE

### 3.1 CLAUDE.md Audit

- project root must have `CLAUDE.md`
- sub-projects with their own meaningful scope should have their own `CLAUDE.md`
- `CLAUDE.md` should stay focused on rules, commands, and constraints

### 3.2 Staleness Check

- compare `CLAUDE.md` version against brain.db `project.version` when identity rows are used
- flag stale references to removed features, old skill names, or old storage doctrine
- flag stale references to `.claude/plans/`, Obsidian vault, or other v7-retired surfaces

### 3.3 Content Boundary Check

- `CLAUDE.md` should not contain task queues, broad architecture narratives, or large structural maps
- `.claude/` must not contain `plans/` or `sessions/` (both belong at project root)
- `OVERVIEW.md` should not be treated as a live file-tree registry

### 3.4 END-GOAL.md Freshness

If `END-GOAL.md` exists at the project root:

- check for obvious version drift against current project version
- confirm content still reflects the active north star

### 3.5 Sessions Coverage

- report the gap between curated session notes in `sessions/` and DAL session count
- large gaps indicate `session-export` is not running at closeout — closeout discipline issue, not a validation failure

### 3.6 README.md

READMEs are human-facing secondary docs. They should stay factual and concise.

---

## DOMAIN 4: SKILL COMPLIANCE

### 4.1 SKILL.md Existence & Frontmatter

For each directory in `.claude/skills/`:

- must contain `SKILL.md`
- valid YAML frontmatter
- required keys: `name`, `description`, `allowed-tools`

### 4.2 Name Consistency

- frontmatter `name` matches the directory name exactly

### 4.3 Prompt Linkage

- each skill references the correct `.claude/.prompts/{name}.md` file
- that file exists and is non-empty
- exempt reference/support docs: `METRICS.md`, `system-reference.md`

### 4.4 Required Sections

Each `SKILL.md` must contain:

- a top-level heading
- `## Instructions`
- a useful inline protocol or clear prompt linkage

### 4.5 Invocation Rules

- no skill may use `disable-model-invocation: true`
- only `documentation-awareness` may have `user-invocable: false`

### 4.6 Transitional Inventory Accuracy

Flag stale hard-coded counts or structure assumptions in docs:

- skill counts
- prompt counts
- hook counts
- claims that manual structural docs are first-class

---

## OUTPUT FORMAT

```text
## Validation Report
**Date:** {date}
**Mode:** {Full / Docs / Setup / CLAUDE.md} {+ Auto-Fix if applicable}
**Status:** PASS / FAIL ({n} issues)

### Domain 1: Documentation Consistency
1. [PASS/FAIL] Version Consistency — {details}
2. [PASS/FAIL] Routing Compliance — {details}
3. [PASS/FAIL] No Duplication — {details}
4. [PASS/FAIL] Completeness — {details}
5. [PASS/FAIL] Structural Doc Drift — {details}
6. [PASS/FAIL] DAL Alignment — {details, or SKIP if no .ava/}

### Domain 2: Template Deployment
1. [PASS/FAIL] Prompts — {details}
2. [PASS/FAIL] Skills — {details}
3. [PASS/FAIL] Hooks — {details}
4. [PASS/FAIL] Settings — {details}
5. [PASS/FAIL] Agents — {details}
6. [PASS/FAIL] CLAUDE.md — {details}
7. [PASS/FAIL] DAL State — {details, or SKIP}
8. [PASS/FAIL] Retired Files — {details}

### Domain 3: CLAUDE.md & Doc Coverage
- {n} CLAUDE.md files checked, {m} current, {k} issues identified
- [PASS/FAIL/WARN/SKIP] END-GOAL.md version — {details}
- [PASS/FAIL/WARN/SKIP] Sessions coverage — {details}

### Domain 4: Skill Compliance
1. [PASS/FAIL] SKILL.md Existence — {details}
2. [PASS/FAIL] Name Consistency — {details}
3. [PASS/FAIL] Prompt Linkage — {details}
4. [PASS/FAIL] Required Sections — {details}
5. [PASS/FAIL] Invocation Rules — {details}
6. [PASS/FAIL] Transitional Inventory Accuracy — {details}

### Auto-Fixed (if --fix)
- {what changed}

### Requires Manual Fix
- {specific issue, recommended action}
```
