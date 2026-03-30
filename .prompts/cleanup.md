# Cleanup — DAL Reconciliation & Knowledge Hygiene

You are performing a comprehensive reconciliation of the project's persistent state (brain.db) against its documentation and codebase. Whether brain.db is empty (first run / hydration) or full (ongoing maintenance), the job is the same: **brain.db must accurately reflect project reality.**

brain.db is the primary context source for every future session. The session-context hook injects brain.db contents at startup — if brain.db is incomplete, the next agent starts blind. **Every cleanup must leave brain.db in a state where the next agent can be productive without reading any docs.**

---

## 1. PREREQUISITES

Verify the DAL is available:

```bash
node .ava/dal.mjs status
```

If brain.db doesn't exist or status fails, stop and report. Cleanup requires an active DAL.

Check current state:

```bash
node .ava/dal.mjs identity list
node .ava/dal.mjs arch list
node .ava/dal.mjs decision list
node .ava/dal.mjs session list
```

**Detect mode:** If identity = 0 AND sessions = 0, this is a **first-run hydration** — brain.db is deployed but unpopulated. Be comprehensive — extract everything. If identity > 0, this is **ongoing maintenance** — focus on drift, gaps, and completeness.

---

## 2. REQUIRED FACT EXTRACTION

Every project's brain.db MUST have these entries. Extract them from the sources listed. If an entry exists but is wrong, update it. If missing, insert it.

### From CLAUDE.md (read the entire file):

| Key | What to Extract | Table | Scope |
|-----|----------------|-------|-------|
| `project.name` | Project name from header | `identity` | — |
| `project.identity` | First paragraph — what the project IS | `identity` | — |
| `project.vision` | Vision/goals — why this project exists | `identity` | — |
| `project.version` | Version from header | `architecture` | project |
| `project.status` | Status line from header | `architecture` | project |
| `tech.stack` | Primary language/framework/runtime | `architecture` | project |
| `tech.build` | Build/run commands | `architecture` | project |
| `tech.test` | Test commands and framework | `architecture` | project |
| `project.structure` | Key directories and their purposes | `architecture` | project |
| `rules.critical` | DO NOT rules (summarized) | `architecture` | convention |

### From PROJECT_ROADMAP.md:

| Key | What to Extract | Table | Scope |
|-----|----------------|-------|-------|
| `arch.*` | Each architectural decision (AD-*) → record as **decision**, not architecture | — | — |
| `tech.architecture` | High-level architecture description | `architecture` | project |

### From IMPLEMENTATION_PLAN.md:

Current phase, blockers, and handoff context should be recorded as **notes** (the task queue), not as architecture or identity rows. Use:

```bash
node .ava/dal.mjs note add "Current phase: ..." --category handoff
node .ava/dal.mjs note add "Blocker: ..." --category issue
```

### From other docs (SETUP.md, BUILD_SPEC.md, README.md, etc.):

| Key | What to Extract | Table | Scope |
|-----|----------------|-------|-------|
| `env.*` | Environment setup, dependencies, prerequisites | `architecture` | infrastructure |
| `deploy.*` | Deployment targets, procedures | `architecture` | infrastructure |

### Architecture Decisions → Decision Records

Every AD-* entry in PROJECT_ROADMAP.md and every significant architectural choice should be a decision record:

```bash
node .ava/dal.mjs decision add "Decision title" --context "Why it came up" --chosen "What was chosen" --rationale "Why"
```

**Do not skip this.** Decisions are the most valuable brain.db content — they prevent the next agent from relitigating settled questions.

---

## 3. COMPARE AND RECONCILE

After extraction, compare systematically:

### 3a. brain.db → docs (is brain.db accurate?)
For every entry in brain.db, verify it matches current documentation:
- Version entries match CLAUDE.md header
- Tech stack entries match actual dependencies
- Architecture entries match ROADMAP
- Identity rows are still accurate

### 3b. docs → brain.db (is brain.db complete?)
For every required entry in the schema above, verify brain.db has it:
- Missing required entries = **FAIL** (insert them)
- All required entries present = PASS

### 3c. Codebase validation (lightweight)
Spot-check that entries match reality:
- File structure in `project.structure` entry matches actual directories
- Tech stack matches package.json / Cargo.toml / *.csproj / etc.
- Build commands in `tech.build` actually work

### 3d. Archive check
Read `documentation/archive/` if it exists. Historical context worth preserving as architecture entries should be extracted. Archive content is valid — it was moved for size management, not because it stopped being true.

**Present all proposed inserts, updates, and removals as a table. Wait for user confirmation before applying.**

---

## 4. KNOWLEDGE HEALTH

### 4a. Review identity table

```bash
node .ava/dal.mjs identity list
```

- Should contain 5-10 core rows (project name, vision, mission, identity, plus portfolio entries)
- If fewer than 3, critical identity is missing — extract from docs

**Portfolio identity entries** — these are consumed by downstream portfolio sync endpoints and must be present for external-facing projects:

| Key | What to Extract | Guidance |
|-----|----------------|----------|
| `product.summary` | 2-3 sentence external-facing project description | What this project IS and what it does, written for someone outside the team |
| `product.key-metrics` | Structured metrics suitable for portfolio display | e.g., "308 API endpoints", "10-table schema v12" — quantifiable achievements |
| `product.tech-highlights` | Curated tech stack for external presentation | Not the full internal stack — just what's impressive or relevant to showcase |

These are identity rows (not architecture) because they describe *what the project is* to the outside world. If missing, extract from CLAUDE.md, README.md, and codebase inspection. If present, verify they reflect current reality — stale metrics are worse than missing ones.

### Ecosystem Identity Entries

Every project in the ecosystem should have these identity entries populated. If missing, extract from project docs, README, or ask the user:

| Key | Purpose | Example |
|-----|---------|---------|
| `project.name` | Human-readable name | "Project Ava" |
| `project.version` | Current version | "0.95.0" |
| `project.vision` | One-sentence north star | "Personal AI ecosystem with graduated autonomy" |
| `tech.stack` | Primary technologies | "Node.js, React 19, SQLite, ChromaDB" |
| `tech.build` | How to build/run | "npm start, npx vite" |
| `product.summary` | 2-3 sentence external description | "AI assistant platform with..." |
| `product.key-metrics` | Portfolio-ready metrics | "308 endpoints, 92 sessions" |
| `product.tech-highlights` | Curated external tech list | "React 19, Express 5, SQLite WAL" |

### 4b. Review architecture table

```bash
node .ava/dal.mjs arch list
```

- Verify every entry has a correct scope (project/ecosystem/infrastructure/convention)
- Remove entries that are no longer accurate or relevant
- Check for entries that should be in identity instead (core mission/vision/name)

### 4c. Scope classification

| Content Pattern | Table | Scope |
|----------------|-------|-------|
| Mission, vision, identity, project name | `identity` | — |
| Tech stack, build commands, project-specific architecture | `architecture` | project |
| Cross-project patterns, shared infrastructure | `architecture` | ecosystem |
| Servers, ports, deployment targets, environment | `architecture` | infrastructure |
| Naming conventions, coding standards, patterns | `architecture` | convention |

### 4d. Verify

```bash
node .ava/dal.mjs identity list
node .ava/dal.mjs arch list
```

Target: identity has 5-7 core rows, architecture entries all have appropriate scopes, no stale or contradictory entries.

### 4e. Vault Maintenance (if Obsidian vault exists)

Resolve vault path:
1. brain.db: `node .ava/dal.mjs identity get vault.path`
2. Environment: `$OBSIDIAN_VAULT`
3. Default: `~/Obsidian/Ava/{ProjectName}/`

If the project has a folder in the Obsidian vault, perform ALL of the following checks. **Do not skip any step. Do not treat existence as freshness. Read the files, compare the content.**

**Step 1 - Structure check:**
```bash
VAULT_PATH=$(node .ava/dal.mjs identity get vault.path 2>/dev/null || echo "${OBSIDIAN_VAULT:-$HOME/Obsidian/Ava}")
find "$VAULT_PATH/{ProjectName}/" -type f -name "*.md" | sort
```
Verify `VAULT_GUIDE.md` exists. If missing, flag as FAIL.

**Step 2 - END-GOAL.md freshness (MANDATORY - do not skip):**
- If END-GOAL.md is missing: flag as FAIL, recommend creating one.
- If END-GOAL.md exists: **read the first 30 lines**. Extract the version number or status references. Compare against brain.db `project.version`. If they differ, report:
  ```
  [FAIL] END-GOAL.md references v{X} but brain.db is at v{Y}
  ```
  Update the stale version/status references in END-GOAL.md.

**Step 3 - Session note coverage (MANDATORY):**
```bash
# Count vault session notes (VAULT_PATH resolved in Step 1 above)
ls "$VAULT_PATH/{ProjectName}/sessions/"*.md 2>/dev/null | wc -l
# Get latest vault session number
ls -t "$VAULT_PATH/{ProjectName}/sessions/"*.md 2>/dev/null | head -1
# Get latest brain.db session
node .ava/dal.mjs session list 2>&1 | head -3
```
Report the gap: "Vault has sessions up to N, brain.db has sessions up to M. Gap: {M-N} sessions."
If gap > 5 sessions on an active project, flag as WARN. Export missing significant sessions:
```bash
# For each significant missing session (has decisions, version change, or cross-project work):
node .ava/dal.mjs vault-export session --session {session-uuid}
```
After exporting, sync to ChromaDB:
```bash
node .ava/dal.mjs vault sync {ProjectSlug} 2>/dev/null || true
```

**Step 4 - ChromaDB sync:**
```bash
node .ava/dal.mjs vault status
```
If ChromaDB is not deployed or the vault command is unavailable, flag as SKIP (ChromaDB not deployed -- optional layer). If deployed but returning errors or 0 doc count, flag as WARN.

**Report vault checks as a block in the coverage report. "Vault: PASS/FAIL/SKIP" with details for each step.**

---

## 5. DECISION HEALTH

```bash
node .ava/dal.mjs decision list
```

- **Still relevant?** Superseded decisions should be marked.
- **Correctly scoped?** Too broad or too narrow → flag.
- **Missing?** Documentation has architectural choices without matching decisions → add them.

---

## 6. SESSION HEALTH

```bash
node .ava/dal.mjs session list
```

- Interrupted/crashed sessions in last 7 days → investigate
- Older interrupted sessions → note as historical
- Pattern of unclean exits → flag as systemic issue

---

## 7. NOTE HYGIENE

```bash
node .ava/dal.mjs note list
node .ava/dal.mjs note counts
```

- Completed notes → clear
- Notes older than 30 days → still relevant?
- Report by category

---

## 8. DOCUMENT INGESTION & ARCHIVAL

Scattered documentation clutters the project and fragments context. This step finds orphaned docs, extracts their knowledge into the right system, and archives the originals.

**Two modes:**
- **Default** — scan for orphaned docs in unexpected locations (Section 8a-8e)
- **`--full-ingest`** — comprehensively read EVERY .md/.txt in the project, compare against brain.db, ingest anything missing, push to vault (Section 8F)

If the user passes `--full-ingest`, skip 8a-8e and go directly to Section 8F.

### 8a. Scan for Orphaned Documentation

Look for markdown files outside expected locations:

```bash
# Find .md files in project root and unexpected directories
# Expected locations: documentation/, .prompts/, .claude/, agents/
# Unexpected: project root loose files, src/, lib/, random subdirectories
```

Check these locations for documentation that doesn't belong:
- **Project root**: Any `.md` files besides CLAUDE.md, README.md, CHANGELOG.md, LICENSE.md
- **src/ or lib/**: Documentation mixed with code (not inline code comments — actual doc files)
- **Stale plan files**: `*PLAN*.md`, `*ROADMAP*.md`, `*SPEC*.md` outside `documentation/plans/`
- **Orphaned notes**: `TODO.md`, `NOTES.md`, `SCRATCH.md`, `IDEAS.md` at any level
- **Empty or near-empty docs**: Files with <5 lines of actual content

### 8b. Classify Each File

For each orphaned document, determine where its content belongs:

| Content Type | Destination | Example |
|---|---|---|
| Architecture decisions, system design | `brain.db` → architecture or decision | "We chose PostgreSQL because..." |
| Project facts, identity, stack info | `brain.db` → identity or architecture | "This project uses Next.js 14..." |
| Session notes, work logs, handoffs | Obsidian vault → `{project}/sessions/` | "Session 42: migrated auth..." |
| Plans, designs, specifications | Obsidian vault → `{project}/plans/` | "Phase 2 implementation plan..." |
| Already captured in brain.db/vault | Archive only (redundant) | Content that matches existing entries |
| Not documentation (code, config) | Leave in place | Shell scripts, config templates |

### 8c. Ingest

For each classified document:

1. **brain.db candidates**: Extract the key facts and insert as architecture entries, decisions, or notes. Don't copy the entire file — distill to the actionable knowledge.
   ```bash
   node .ava/dal.mjs arch set "key" --value "distilled fact" --scope project
   node .ava/dal.mjs decision add --title "..." --context "..." --chosen "..." --rationale "..."
   ```

2. **Vault candidates** (if Obsidian vault exists): Move the file to the appropriate vault folder with proper frontmatter. If the vault doesn't exist, archive the file and add a brain.db note referencing where it went.

3. **Redundant content**: If the knowledge is already captured, just archive.

### 8d. Archive

Move ingested files to `documentation/archive/cleanup-{date}/`:

```bash
mkdir -p documentation/archive/cleanup-YYYY-MM-DD
mv orphaned-file.md documentation/archive/cleanup-YYYY-MM-DD/
```

**Rules:**
- Never delete files outright — always archive first
- Archive preserves the original for reference if the ingestion missed something
- Log what was moved and why in the coverage report
- Present the full plan (scan results + classification + proposed actions) before executing

### 8e. Report

Add to the coverage report:

```
Document Ingestion:
  Files scanned:     {N} .md files outside expected locations
  Ingested to brain: {N} (architecture: {n}, decisions: {n}, notes: {n})
  Ingested to vault: {N}
  Archived:          {N} (to documentation/archive/cleanup-{date}/)
  Skipped:           {N} (legitimate files in place)
```

---

## 8F. FULL INGEST MODE (`--full-ingest`)

> **Triggered by:** `/cleanup --full-ingest`
>
> This mode goes beyond orphan scanning. It reads **every** documentation file in the project, compares against brain.db content, and ensures nothing is missing. Use this when brain.db and documentation are out of sync — especially after project migrations, major refactors, or when a project's brain.db was set up long after its docs were written.

### 8F-1. Discovery — Find ALL Documentation

Scan the entire project for documentation files:

```bash
# Find every .md and .txt file in the project
# Exclude: node_modules/, .git/, dist/, build/, .ava/migrations/, vendor/
```

Build a complete file inventory. For each file, record:
- Path (relative to project root)
- Size (lines)
- Category guess from location (root doc, documentation/, plans/, architecture/, sessions/, README, etc.)

**Expected yield:** Typically 10-100 files depending on project maturity.

### 8F-2. Read Current brain.db State

Dump everything brain.db knows:

```bash
node .ava/dal.mjs identity list
node .ava/dal.mjs arch list
node .ava/dal.mjs decision list
node .ava/dal.mjs note list
```

Build a knowledge inventory: what topics, facts, decisions, and context brain.db already has.

### 8F-3. Read Each Document & Compare

For each documentation file found in 8F-1, use sub-agents for parallel processing where the file count is large (>10 files):

**For each file:**

1. **Read the file.** Extract the key knowledge it contains:
   - Facts about the project (architecture, tech stack, conventions)
   - Decisions made (and their rationale)
   - Plans or specifications (current state, future direction)
   - Session history or work logs
   - Setup/deployment/infrastructure information
   - Gotchas, anti-patterns, constraints

2. **Compare against brain.db inventory.** For each piece of knowledge:
   - **Already captured?** → Mark as `COVERED` (no action needed)
   - **Partially captured?** → Mark as `STALE` (brain.db has it but it's outdated or incomplete)
   - **Not captured at all?** → Mark as `MISSING` (needs ingestion)

3. **Classify the missing knowledge** using the same table from 8b:

   | Knowledge Type | Destination | brain.db Table | Scope |
   |---|---|---|---|
   | Core project identity (name, vision, mission) | brain.db | `identity` | — |
   | Tech stack, build, architecture patterns | brain.db | `architecture` | `project` |
   | Cross-project conventions, shared patterns | brain.db | `architecture` | `convention` |
   | Infrastructure (servers, ports, deployment) | brain.db | `architecture` | `infrastructure` |
   | Ecosystem patterns (shared across projects) | brain.db | `architecture` | `ecosystem` |
   | Architectural decisions with rationale | brain.db | `decisions` | — |
   | Current blockers, handoffs, task items | brain.db | `notes` | category-based |
   | Session histories, work logs | Obsidian vault | `sessions/` | — |
   | Plans, specifications, designs | Obsidian vault | `plans/` | — |
   | Architecture deep-dives, ADRs | Obsidian vault | `architecture/` | — |

### 8F-4. Present Ingestion Plan

Before making any changes, present a complete plan:

```
Full Ingest Plan
================
Files discovered:    {N} documentation files
Knowledge items:     {N} extracted

Status:
  COVERED:  {N} — already in brain.db (no action)
  STALE:    {N} — in brain.db but needs updating
  MISSING:  {N} — not in brain.db, needs ingestion

Proposed brain.db changes:
  Identity inserts:      {N}
  Architecture inserts:  {N} (project: {n}, convention: {n}, infrastructure: {n}, ecosystem: {n})
  Architecture updates:  {N}
  Decision inserts:      {N}
  Note inserts:          {N}

Proposed vault actions:
  Session notes to create:    {N}
  Plan notes to create:       {N}
  Architecture notes to create: {N}

Files to archive after ingestion: {N}
  {list each file and why}

Files to leave in place: {N}
  {list each file — CLAUDE.md, README.md, etc. that stay}
```

**Wait for user confirmation before applying ANY changes.**

### 8F-5. Execute Ingestion

After confirmation:

1. **Insert brain.db entries** — identity, architecture (with correct scopes), decisions, notes
   ```bash
   node .ava/dal.mjs identity set "key" --value "..."
   node .ava/dal.mjs arch set "key" --value "..." --scope project
   node .ava/dal.mjs decision add --title "..." --context "..." --chosen "..." --rationale "..."
   node .ava/dal.mjs note add "..." --category handoff
   ```

2. **Update stale entries** — correct outdated values
   ```bash
   node .ava/dal.mjs arch set "existing.key" --value "updated value" --scope project
   ```

3. **Create vault notes** (if vault exists for this project):
   ```bash
   # Session notes — use vault-export (auto-generates frontmatter + enriches from brain.db):
   node .ava/dal.mjs vault-export session --session {session-uuid}
   # Then sync to ChromaDB:
   node .ava/dal.mjs vault sync {ProjectSlug} 2>/dev/null || true
   ```
   For non-session vault notes (plans, architecture), create manually with frontmatter (type, project, date, status, tags).

4. **Archive ingested files** — move files whose content is now fully captured:
   ```bash
   mkdir -p documentation/archive/full-ingest-YYYY-MM-DD
   mv ingested-file.md documentation/archive/full-ingest-YYYY-MM-DD/
   ```

   **Do NOT archive:**
   - CLAUDE.md, README.md, CHANGELOG.md, LICENSE.md (living documents)
   - .prompts/ files (skill protocols, not knowledge)
   - .claude/ files (tool configuration)
   - Files still serving as active references (if a doc is linked from README or CLAUDE.md, keep it)

5. **Vault export:** If the cleanup produced strategically significant knowledge, export vault notes for affected sessions:
   ```bash
   node .ava/dal.mjs vault-export session --session {session-uuid}
   node .ava/dal.mjs vault sync {ProjectSlug} 2>/dev/null || true
   ```

### 8F-6. Verification

After ingestion, verify completeness:

```bash
node .ava/dal.mjs identity list    # Should have 5-7 rows
node .ava/dal.mjs arch list        # Should reflect all project knowledge
node .ava/dal.mjs decision list    # Should have all architectural decisions
node .ava/dal.mjs note list        # Should have current blockers/handoffs
```

**Test the "blind agent" criterion:** If a new agent started a session with ONLY the brain.db context injection (no docs), would it have enough context to be productive? If not, what's still missing?

### 8F-7. Full Ingest Report

```
Full Ingest Report
==================
Files discovered:    {N}
Files read:          {N}
Knowledge extracted: {N} items

brain.db changes:
  Identity:      {inserted} inserted, {updated} updated
  Architecture:  {inserted} inserted, {updated} updated ({by-scope breakdown})
  Decisions:     {inserted} inserted
  Notes:         {inserted} inserted

Vault changes:
  Session notes:      {N} created
  Plan notes:         {N} created
  Architecture notes: {N} created

Files archived:      {N} (to documentation/archive/full-ingest-{date}/)
Files kept in place: {N}

Blind agent test:    {PASS — brain.db sufficient | FAIL — {what's missing}}

VERDICT: {PASS — project knowledge fully captured |
          PARTIAL — {N} items need manual review |
          FAIL — critical knowledge gaps remain}
```

---

## 9. COVERAGE REPORT

This is the critical output. Not just "is brain.db healthy" but "is brain.db COMPLETE enough to be useful." Include document ingestion results alongside the DAL reconciliation.

```
DAL Reconciliation Report
=========================
Mode:              {first-run hydration | ongoing maintenance}
Schema version:    v{N}
Integrity:         {ok|FAILED}

COVERAGE (required entries):
  project.name:      {present|MISSING}  (identity)
  project.identity:  {present|MISSING}  (identity)
  project.vision:    {present|MISSING}  (identity)
  project.version:   {present|MISSING}  (architecture)
  tech.stack:        {present|MISSING}  (architecture)
  tech.build:        {present|MISSING}  (architecture)
  Coverage:          {N}/{total} required entries present

Identity:          {total} rows
Architecture:      {total} entries
  - project:       {N}
  - ecosystem:     {N}
  - infrastructure:{N}
  - convention:    {N}

Decisions:         {total} ({active} active)
Sessions:          {total}
Notes:             {open} open

Reconciliation:
  - Identity inserted: {N}
  - Architecture inserted: {N}
  - Entries updated: {N}
  - Entries removed: {N}
  - Decisions added: {N}
  - Contradictions found: {N}
  - Gaps filled: {N}

VERDICT: {PASS — brain.db is complete and accurate |
          FAIL — {N} required entries missing, {N} contradictions}
```

**A cleanup that reports PASS with missing required entries is a failed cleanup.**

---

## 10. RULES

- **Always dry-run first.** Never delete without showing the user what will be affected.
- **Present recommendations, don't auto-apply.** User confirms inserts, classifications, and deletions.
- **Docs are truth, brain.db is the cache.** When they contradict, docs win.
- **Don't invent entries.** Only insert knowledge explicitly stated in docs or verifiable in codebase.
- **Coverage is mandatory.** A brain.db without the required entries is not "clean" — it's incomplete.
- **Be honest.** If the brain.db is a mess, say so. "Clean bill of health" requires actual coverage.
