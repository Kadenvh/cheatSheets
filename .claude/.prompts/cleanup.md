# Cleanup — Structural Hygiene & Lean Continuity Repair

You are enforcing the "one place per question" rule and repairing the system so the next session can resume cleanly without more storage sprawl.

This is TWO jobs:

1. **Structural enforcement** — content must live in the canonical location, not scattered across 3+ copies
2. **Lean DAL reconciliation** — brain.db must stay useful for continuity without turning into a second documentation tree

brain.db is the continuity layer, not the whole system. Every cleanup must leave both the filesystem and the DAL in a state where the next agent can answer:

1. What is this project?
2. What was happening recently?
3. What is still open?
4. What should happen next?

---

## 0. CANONICAL RULES

| Content Type | ONE Canonical Location | Notes |
|---|---|---|
| Active strategy/plans | `plans/` (project root) | Working strategy only |
| Superseded plans worth keeping | `plans/archive/` (project root) | Keep only after extraction + receipt |
| Curated session notes | `sessions/` (project root) | Written by `session-export` at closeout |
| Design intent / invariants | `OVERVIEW.md` if it exists | No live structure snapshots |
| Rules / commands / anti-patterns | `CLAUDE.md` | Auto-loaded rules only |
| Continuity state | brain.db (`sessions`, `notes`, `decisions`, minimal `identity`) + `.ava/handoffs/` | Recent work, open blockers, active constraints |
| Working observations | `.claude/memory/` only if still useful | Optional compatibility surface, never canon |
| Code structure | GitNexus or direct code reads | Do not duplicate into docs or DAL |
| System reference | `SYSTEM-OVERVIEW.md` | Operating manual, not task state |

### Deployable vs Non-Deployable

Root directory contents split into two classes:

- **Deployable (`.claude/`)** — skills, hooks, `.prompts/`, agents, settings. Synced from PE template via Sync All.
- **Non-deployable (project root)** — `plans/`, `sessions/`, `agent-definitions/`, README, CHANGELOG, CLAUDE.md. Project-specific; each project manages its own.

`plans/` and `sessions/` must NOT be under `.claude/`. They are project-specific working state, not meant to deploy to other projects.

### Violations To Flag

| Violation | What's Wrong | Fix |
|---|---|---|
| Plans or sessions under `.claude/` | Conflates deployable surface with project-local state | Move to project root `plans/` or `sessions/` |
| Root `archive/` directory | Legacy location | Extract durable value, then delete or re-home intentionally |
| `.claude/archive/` cleanup residue | Creates accumulating clutter | Extract anything unique, then delete |
| `project_*.md` or similar files mirroring DAL/docs | Duplicate state | Delete after verifying the canonical copy |
| Manual file-tree or route-map docs | GitNexus can answer structure on demand | Remove or reduce to human-added interpretation only |
| Broad `architecture` rows that restate code structure | DAL bloat | Move intent to docs if needed, otherwise delete |
| `PROJECT_ROADMAP.md` or `IMPLEMENTATION_PLAN.md` | Retired storage | Flag and recommend deletion |
| Obsidian vault folder for this project | Obsidian vault layer is retired | Move `sessions/` and `END-GOAL.md` to project root, delete the rest |

---

## 1. PREREQUISITES

Run:

```bash
node .ava/dal.mjs status
node .ava/dal.mjs identity list
node .ava/dal.mjs decision list
node .ava/dal.mjs note list
```

If brain.db is missing or status fails, stop and report. Run `/dal-doctor` first.

Detect mode:

- identity = 0 and sessions = 0 → first-run hydration
- otherwise → ongoing maintenance

---

## 2. PHASE 1 — STRUCTURAL ENFORCEMENT

Run this FIRST. Structural problems cause bad sources to be treated as canonical.

### 2a. Map All Storage Locations

Discover what exists:

```bash
ls plans/ 2>/dev/null
ls plans/archive/ 2>/dev/null
ls sessions/ 2>/dev/null
ls archive/ 2>/dev/null
ls .claude/plans/ 2>/dev/null  # should not exist post-v7 — flag if found
ls .claude/archive/ 2>/dev/null

ls .claude/memory/ 2>/dev/null | wc -l
find . -maxdepth 1 -name "*.md" ! -name "CLAUDE.md" ! -name "README.md" ! -name "CHANGELOG.md" ! -name "LICENSE.md" ! -name "SYSTEM-OVERVIEW.md" ! -name "OVERVIEW.md" ! -name "END-GOAL.md" -type f
```

### 2b. Plans Placement Check

`plans/` at the project root is the ONLY canonical location for active plans. If you find plans under `.claude/plans/`, they are in the wrong place — move them to `plans/`.

```bash
if [ -d .claude/plans ]; then
  echo "VIOLATION: .claude/plans/ exists. Plans should live at plans/ (project root)."
  ls .claude/plans/
fi
```

Present findings before acting.

### 2c. Archive Consolidation

The project has only ONE deliberate archive destination: `plans/archive/` (project root) for superseded plans still worth keeping, each with an extraction receipt.

Everything else should be extracted into canonical docs or DAL and then deleted.

End state:

- no root `archive/`
- no timestamped cleanup dirs
- no `.claude/archive/` cleanup residue
- no `.claude/plans/` (moved to `plans/`)
- superseded plans live only in `plans/archive/` with receipts

### 2d. Memory File Audit

`.claude/memory/` is optional compatibility space, not canon.

Audit each file:

| File Pattern | Likely Issue | Action |
|---|---|---|
| `project_*.md` | Often restates DAL, plans, or docs | Compare against canonical sources, then delete if covered |
| `feedback_*.md` | User corrections | Keep unless obsolete |
| `user_*.md` | Preferences / working style | Keep if still useful |
| `reference_*.md` | External pointers | Keep if still accurate |
| `knowledge-*.md` / `monitoring.md` | Often duplicate facts elsewhere | Extract durable value into the right canonical home, then delete |

Target:

- memory remains lean
- no file mirrors DAL, plans, or rules docs

### 2e. Root File Cleanup

Expected root docs:

- `CLAUDE.md`
- `SYSTEM-OVERVIEW.md`
- `README.md`
- optional `CHANGELOG.md`, `LICENSE.md`, `OVERVIEW.md`

Unexpected root docs should be classified and moved or deleted.

### 2f. Structural Report

Present a dry-run report before executing any changes:

```text
Structural Audit
================
Legacy vault folder:      {present|absent}
Archive residue:          {N}
Memory files to trim:     {N}
Root orphan docs:         {N}

Proposed moves:           {N}
Proposed deletes:         {N}
```

Wait for user confirmation before acting.

---

## 3. PHASE 2 — LEAN DAL RECONCILIATION

### 3a. Required Continuity Extraction

The DAL only needs enough state to restart work cleanly.

Required minimum surfaces:

| Surface | Requirement |
|---|---|
| `identity` | `project.name` and `project.version`; `project.vision` only if genuinely load-bearing |
| `decisions` | active decisions that constrain current work |
| `notes` | open blockers, follow-ups, next-session tasks |
| `sessions` | recent session history |
| `.ava/handoffs/` | latest handoff exists and is useful |

Sources, in priority order:

1. `CLAUDE.md`
2. active plans
3. latest handoff
4. current notes and decisions
5. codebase inspection

### 3b. Compare And Reconcile

brain.db → reality:

- version entries match `CLAUDE.md`
- identity rows are still accurate and minimal
- active decisions still constrain real work
- notes still describe real unfinished work
- legacy `architecture` rows, if any, do not duplicate code structure GitNexus can derive

reality → brain.db:

- missing minimum continuity surfaces = FAIL
- stale or redundant continuity surfaces = prune or demote

### 3c. DAL Budget & Legacy Table Audit

Measure the current continuity payload:

```bash
node .ava/dal.mjs context 2>&1 | wc -c
node .ava/dal.mjs context 2>&1 | wc -l
node .ava/dal.mjs decision list 2>&1 | wc -l
node .ava/dal.mjs note list 2>&1 | wc -l
```

Targets:

- context injection <25KB / <200 lines
- decisions and notes remain scannable
- legacy `architecture` rows trend downward over time

Pruning heuristic:

- if it is derivable from code or GitNexus, remove it
- if it belongs in `CLAUDE.md`, move it there
- if it belongs in a plan or `OVERVIEW.md`, move it there
- if it no longer matters for restart continuity, delete it

### 3d. Decision, Note, And Session Health

Run:

```bash
node .ava/dal.mjs decision list
node .ava/dal.mjs note list
node .ava/dal.mjs session list
```

Checks:

- superseded decisions should not dominate the active path
- duplicate or stale notes should be consolidated
- obviously abandoned open sessions should be flagged

---

## 4. SESSIONS/ HYGIENE

`sessions/` at the project root holds curated structured session notes written by `session-export` at closeout.

### 4a. END-GOAL.md Freshness

If `END-GOAL.md` exists at the project root, compare any version references against the current project version and flag drift.

### 4b. Session Note Coverage

Report the gap between curated session notes and DAL session count. This is informational, not a reason to stuff more state anywhere.

```bash
note_count=$(ls sessions/*.md 2>/dev/null | wc -l)
dal_sessions=$(node .ava/dal.mjs status 2>/dev/null | grep "Sessions:" | grep -oP '\d+' | head -1)
echo "Session notes: $note_count / DAL sessions: $dal_sessions"
```

If the gap is large, it means `session-export` is not being run at closeout — flag as a closeout discipline issue, not a cleanup target.

---

## 5. DOCUMENT INGESTION & ARCHIVAL

### Default Mode — Orphan Scan

Expected locations:

- `.claude/.prompts/`
- `plans/` (project root)
- `sessions/` (project root)
- `.claude/memory/`
- `.claude/skills/*/`

Unexpected:

- root docs beyond the expected set
- nested cleanup dirs
- stray archival copies

For each orphan:
1. route it to the right canonical home
2. extract durable value
3. delete the redundant source

### Full Ingest Mode (`--full-ingest`)

Use only for legacy migrations or first-run hydration when the project has lots of prose and little usable continuity state.

Discover candidate docs:

```bash
find . -type f \( -name "*.md" -o -name "*.txt" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" \
  ! -path "*/.ava/migrations/*" ! -path "*/vendor/*" | sort
```

For each file:
1. read it
2. classify whether its durable value is already covered
3. if missing, route the missing value into the right canonical home
4. present the proposed changes
5. wait for confirmation

After full ingest, run a continuity-first resume check:

1. read `node .ava/dal.mjs context`
2. read the latest handoff
3. confirm you can answer:
   - what is this project?
   - what was happening recently?
   - what is still open?
   - what should happen next?

If not, cleanup did not finish.

---

## 6. COVERAGE REPORT

```text
Cleanup Report
==============
Mode:              {structural + reconciliation | full-ingest}
Schema version:    v{N}
Integrity:         {ok|FAILED}

STRUCTURAL:
  .claude/plans/ violations: {N}
  Archive residue:           {N}
  Memory files trimmed:      {N}
  Root orphan docs:          {N}

DAL:
  Minimal identity:          {PASS|FAIL}
  Active decisions:          {count}
  Open notes:                {count}
  Sessions:                  {count}
  Handoff health:            {PASS|FAIL}
  Legacy arch rows:          {count}
  Context injection:         {size}KB / {lines} lines

VAULT:
  VAULT_GUIDE.md:            {present|missing}
  END-GOAL.md drift:         {PASS|WARN|SKIP}
  Working-state duplicates:  {count}

VERDICT: {PASS | PARTIAL | FAIL}
```

---

## 7. RULES

- **One place per question.** Content in the wrong location is a bug.
- **Extract first, archive second.** Archive is not a trash can.
- **Lean DAL wins.** Prefer sessions, notes, decisions, and handoffs over broad DAL accumulation.
- **GitNexus answers structure.** Do not maintain manual structural docs by default.
- **Dry-run first.** Present all changes before executing. User confirms.
- **Read before deleting.** Unique files must be read before removal.
