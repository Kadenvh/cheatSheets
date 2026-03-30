---
name: cleanup
description: "Reconcile brain.db against docs, ingest documentation into brain.db/vault, archive originals. Use --full-ingest to read EVERY doc file and ensure brain.db captures all project knowledge."
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - Agent
---

# Cleanup — DAL Reconciliation & Document Ingestion

Comprehensive reconciliation of brain.db against project documentation, plus ingestion of scattered docs into the right knowledge systems. Handles first-run hydration (empty brain.db), ongoing maintenance (drift/gaps), coverage enforcement, and document archival.

**Two modes:**
- **Default** (`/cleanup`) — reconcile brain.db against known docs + scan for orphans
- **Full ingest** (`/cleanup --full-ingest`) — read EVERY .md/.txt in the project, compare against brain.db, ingest all missing knowledge, push to vault. Use when brain.db is out of sync with documentation.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/cleanup.md`.

### Default Protocol
   - Verify DAL prerequisites and detect mode (first-run vs ongoing)
   - Required identity extraction (project.name, version, vision, stack, build)
   - Required architecture extraction (system design patterns from codebase/docs)
   - Compare and reconcile (brain.db ↔ docs ↔ codebase)
   - Architecture, decision, session, and note health checks
   - Scan for orphaned docs → classify → ingest → archive
   - Coverage report (PASS/FAIL)

### Full Ingest Protocol (`--full-ingest`)
   - Discover ALL .md/.txt files in the project (exclude node_modules, .git, dist, vendor)
   - Read current brain.db state (identity, architecture, decisions, notes)
   - Read each document → extract knowledge → compare against brain.db
   - Classify each knowledge item: COVERED (already in brain.db), STALE (needs update), MISSING (needs insertion)
   - Present full ingestion plan with proposed brain.db inserts/updates + vault notes + archives
   - Wait for confirmation → execute → verify with "blind agent" test
   - Use sub-agents for parallel file reading when >10 files

## Key Rules

- **Coverage is mandatory.** brain.db identity MUST have: project.name, project.version, project.vision, tech.stack. "Clean" with missing identity = FAIL.
- **Docs are truth, brain.db is the cache.** When they contradict, docs win.
- **Don't invent knowledge.** Only insert what's explicitly in docs or verifiable in codebase.
- **Dry-run first.** User confirms inserts, deletions, and file moves.
- **Decisions matter most.** Architecture decisions prevent the next agent from relitigating settled questions.
- **Clean folders, precise context.** Orphaned documentation fragments context. Ingest the knowledge, archive the file.
- **Blind agent test.** After full ingest, a new agent with only brain.db context should be productive without reading any docs. If not, the ingest is incomplete.

## Full Protocol

Detailed steps:

1. **Check DAL.** `node .ava/dal.mjs status`. If fails, stop.

2. **Detect mode.** If `--full-ingest` flag: go to Section 8F in the prompt. Otherwise continue below.

3. **Extract identity.** Read CLAUDE.md → extract: `project.name`, `project.version`, `tech.stack`, `tech.build`. Read ROADMAP or brain.db decisions → extract: `project.vision`.
   ```bash
   node .ava/dal.mjs identity set "project.name" --value "..."
   ```

4. **Extract architecture.** Read codebase for system patterns, conventions, deployment topology.
   ```bash
   node .ava/dal.mjs arch set "key" --value "..." --scope project
   ```
   Scopes: `project` (system design), `ecosystem` (cross-project), `infrastructure` (ops), `convention` (working style).

5. **Extract decisions.** Every architectural choice → `node .ava/dal.mjs decision add ...`.

6. **Scan for orphaned docs.** Find .md files outside expected locations (documentation/, .prompts/, .claude/). Classify: brain.db candidate, vault candidate, redundant, or legitimate. Ingest distilled knowledge, archive originals to `documentation/archive/cleanup-{date}/`.

7. **Coverage report.** List each required identity entry as present/MISSING. Count architecture entries by scope. Report decisions. Include document ingestion results. VERDICT: PASS only if all required identity present AND no unprocessed orphans.
