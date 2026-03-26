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

- Should contain 5-7 core rows (project name, vision, mission, identity, etc.)
- If more than 7, some rows likely belong in the architecture table instead
- If fewer than 3, critical identity is missing — extract from docs

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

## 8. COVERAGE REPORT

This is the critical output. Not just "is brain.db healthy" but "is brain.db COMPLETE enough to be useful."

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

## 9. RULES

- **Always dry-run first.** Never delete without showing the user what will be affected.
- **Present recommendations, don't auto-apply.** User confirms inserts, classifications, and deletions.
- **Docs are truth, brain.db is the cache.** When they contradict, docs win.
- **Don't invent entries.** Only insert knowledge explicitly stated in docs or verifiable in codebase.
- **Coverage is mandatory.** A brain.db without the required entries is not "clean" — it's incomplete.
- **Be honest.** If the brain.db is a mess, say so. "Clean bill of health" requires actual coverage.
