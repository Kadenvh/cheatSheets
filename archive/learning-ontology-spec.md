# Learning System — Canonical Ontology Specification

**Author:** PE / Scribe
**Version:** 1.0.0 (draft)
**Date:** 2026-03-16
**Status:** Design — awaiting Ava review before implementation
**Implements:** Ava Session 69 Decisions #69, #70, #72
**Target:** Ava_Main brain.db migration (PE specs, Ava implements)

---

## Purpose

Define the entity model, table schemas, relationships, and constraints for the Learning system. This spec is the authoritative reference Ava reads when building the brain.db migration. It supersedes any ad-hoc table creation from earlier sessions.

The Learning system transforms the knowledge base from passive retrieval ("find what I saved") into active learning ("understand what I need to know, practice it, track mastery"). It sits on top of the collection split (Decision #69): `knowledge-learning` holds the source material, brain.db holds the scheduling and progress state.

---

## Entity Model Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEARNING SYSTEM                          │
│                                                                 │
│  ┌──────────┐    prerequisites    ┌──────────┐                  │
│  │ Concept  │◄──────────────────►│ Concept  │                  │
│  └────┬─────┘                    └──────────┘                  │
│       │                                                         │
│       ├──── belongs to ────► ┌───────┐                          │
│       │                      │ Skill │ (grouping)               │
│       │                      └───────┘                          │
│       │                                                         │
│       ├──── has ────► ┌──────────────┐                          │
│       │               │ MasteryState │ (FSRS scheduling)        │
│       │               └──────────────┘                          │
│       │                                                         │
│       ├──── generates ────► ┌────────┐ ──── contains ──► ┌─────────┐
│       │                     │ Lesson │                   │Exercise │
│       │                     └────────┘                   └─────────┘
│       │                                                         │
│       ├──── produces ────► ┌───────────────┐                    │
│       │                    │ LearningEvent │ (append-only)       │
│       │                    └───────────────┘                    │
│       │                                                         │
│       └──── scheduled via ──► ┌──────────┐                      │
│                               │ PlanItem │ (draft → confirmed)  │
│                               └──────────┘                      │
│                                                                 │
│  ┌─────────────────┐                                            │
│  │ LearningSession │ ──── groups ──► LearningEvents             │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

**External relationships:**
- Concept ↔ ChromaDB `knowledge-learning` collection (via `chroma_doc_id`)
- Concept source ↔ cheatsheet files, `scan-work` git analysis, `scan-errors` log analysis
- PlanItem source ↔ FSRS scheduling, git scans, error scans, prerequisite gaps

---

## Entities

### 1. Concept

The atomic unit of learning. A concept has identity, difficulty, and is the scheduling target for FSRS. One concept maps to one ChromaDB document in `knowledge-learning`.

**Rationale:** Concepts already exist in Ava's brain.db (35 as of Session 69). This schema evolves the existing table — it does not replace it. The key changes: explicit domain field, source tracking, and separation of FSRS state into MasteryState (see below).

```sql
CREATE TABLE concepts (
    id              TEXT PRIMARY KEY,           -- slug: 'docker-networking', 'python-list-comprehensions'
    name            TEXT NOT NULL,              -- human-readable: 'Docker Networking'
    domain          TEXT,                       -- 'linux', 'python', 'docker', 'ml', 'git', 'tools'
    difficulty      INTEGER DEFAULT 5
                    CHECK (difficulty BETWEEN 1 AND 10),
    description     TEXT,                       -- one-line summary
    chroma_doc_id   TEXT,                       -- FK to knowledge-learning collection (nullable for concepts without source material)
    source          TEXT DEFAULT 'manual',      -- 'cheatsheet', 'scan-work', 'scan-errors', 'manual', 'prerequisite-infer'
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_concepts_domain ON concepts(domain);
CREATE INDEX idx_concepts_source ON concepts(source);
```

**Migration note:** The existing `concepts` table has FSRS fields inline (`fsrs_stability`, `fsrs_difficulty`, `fsrs_due_date`, etc.) and a `mastery_level` column. This spec separates those into the `mastery_state` table. Migration should:
1. Create `mastery_state` table
2. Copy FSRS fields from `concepts` into `mastery_state`
3. Drop FSRS columns from `concepts`
4. Add new columns (`domain`, `description`, `chroma_doc_id`, `source`)

### 2. Prerequisite

Directed edge between concepts. Forms a DAG (directed acyclic graph). Used for unlock gating, difficulty inference, and study plan ordering.

**Rationale:** Already exists in Ava's brain.db (30 links as of Session 69). This schema adds `source` tracking and `strength` weighting. Strength enables soft prerequisites ("helps to know") vs hard prerequisites ("must know first").

```sql
CREATE TABLE prerequisites (
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    prerequisite_id TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    strength        REAL DEFAULT 1.0
                    CHECK (strength BETWEEN 0.0 AND 1.0),  -- 1.0 = hard, <1.0 = soft
    source          TEXT DEFAULT 'manual',                  -- 'cheatsheet', 'seed-pattern', 'manual', 'inferred'
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (concept_id, prerequisite_id),
    CHECK (concept_id != prerequisite_id)                   -- no self-loops
);

CREATE INDEX idx_prereqs_target ON prerequisites(prerequisite_id);
```

**DAG enforcement:** SQLite cannot enforce acyclicity at the schema level. The application layer (learning-engine.mjs) must validate no cycles on INSERT. Recommendation: topological sort validation before committing new edges.

### 3. Skill

Resume-worthy capability grouping. A skill maps to multiple concepts. "Docker Proficiency" = [docker-basics, dockerfile, docker-compose, docker-networking, ...].

**Rationale:** Concepts are too granular for progress reporting. Users want to know "how good am I at Docker?" not "have I reviewed docker-volume-mounts today?" Skills aggregate concept mastery into a meaningful signal.

```sql
CREATE TABLE skills (
    id              TEXT PRIMARY KEY,           -- slug: 'docker-proficiency'
    name            TEXT NOT NULL,              -- 'Docker Proficiency'
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE skill_concepts (
    skill_id        TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    weight          REAL DEFAULT 1.0,           -- relative importance within the skill
    PRIMARY KEY (skill_id, concept_id)
);
```

**Derived mastery:** A skill's mastery level is computed, not stored — weighted average of its constituent concept mastery levels. No separate FSRS state for skills.

### 4. MasteryState

Current mastery level + FSRS scheduling state for each concept. Separated from Concept to keep identity stable while scheduling state churns.

**Rationale:** FSRS fields update on every review. Concept identity (name, domain, difficulty) changes rarely. Mixing them in one table creates unnecessary write amplification and makes it harder to reason about concept identity vs learning progress.

```sql
CREATE TABLE mastery_state (
    concept_id      TEXT PRIMARY KEY REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_level   TEXT NOT NULL DEFAULT 'novice'
                    CHECK (mastery_level IN ('novice', 'familiar', 'proficient', 'expert')),
    -- FSRS scheduling fields
    stability       REAL DEFAULT 0.0,
    difficulty      REAL DEFAULT 5.0,           -- FSRS difficulty (distinct from concept difficulty)
    due_date        TEXT,                        -- ISO 8601 datetime
    last_review     TEXT,                        -- ISO 8601 datetime
    reps            INTEGER DEFAULT 0,
    lapses          INTEGER DEFAULT 0,
    -- metadata
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Level transitions:** Mastery level changes are event-driven, not computed. The application emits a `level_up` or `level_down` LearningEvent and updates this table in the same transaction.

**Level definitions:**

| Level | Meaning | Typical FSRS State |
|-------|---------|-------------------|
| novice | Never reviewed or consistently failing | reps < 3, stability < 1.0 |
| familiar | Can recall with effort, some lapses | reps 3-10, stability 1-5 |
| proficient | Reliable recall, rare lapses | reps 10+, stability 5-20 |
| expert | Automatic recall, extended intervals | reps 20+, stability 20+ |

These thresholds are guidelines for the level transition algorithm, not hard cutoffs. The algorithm should consider recent performance trends, not just cumulative stats.

### 5. Lesson

Generated content for a (concept, mastery_level) pair. Cached to avoid regenerating identical lessons. Contains explanation, examples, and exercises.

**Rationale:** Lesson content is expensive to generate (LLM call). Caching by (concept, mastery_level) means a novice lesson for "Docker Networking" is generated once and reused until the user levels up. At that point, a new lesson is generated for the `familiar` level with deeper content.

```sql
CREATE TABLE lessons (
    id              TEXT PRIMARY KEY,           -- UUID
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_level   TEXT NOT NULL
                    CHECK (mastery_level IN ('novice', 'familiar', 'proficient', 'expert')),
    content_json    TEXT NOT NULL,              -- see Content Schema below
    generated_by    TEXT,                       -- model/agent that generated (e.g., 'spark-agent/claude-sonnet-4-6')
    generated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT,                       -- cache TTL (nullable = no expiry)
    UNIQUE (concept_id, mastery_level)
);
```

**Content schema** (`content_json`):
```json
{
  "explanation": "Markdown string — concept explanation at this mastery level",
  "examples": [
    {"code": "...", "language": "python", "annotation": "..."}
  ],
  "exercises": [
    {
      "id": "ex-001",
      "type": "recall | understanding | application | analysis",
      "prompt": "...",
      "expected": "...",
      "hints": ["..."],
      "difficulty": 3
    }
  ],
  "meta": {
    "token_count": 1200,
    "generation_time_ms": 3400
  }
}
```

**Exercise types:**

| Type | Description | Example |
|------|-------------|---------|
| recall | Key syntax/command recall | "What flag makes `docker run` detached?" |
| understanding | When/why to use, compare alternatives | "When would you use a bridge network vs host network?" |
| application | Real-world scenario, write code | "Write a docker-compose.yml that connects two services" |
| analysis | Predict output, spot errors | "What's wrong with this Dockerfile? What will happen?" |

### 6. LearningEvent

Append-only evidence log. Every interaction with the learning system produces an event. Supports replay, debugging, and analytics.

**Rationale:** Mutable state (MasteryState) tells you where you are. Immutable events tell you how you got there. If mastery calibration drifts, events enable recalculation. If a bug corrupts scheduling state, events enable recovery. This is the same principle as event sourcing — state is derived, events are truth.

```sql
CREATE TABLE learning_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,  -- monotonic, ordered
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    session_id      TEXT REFERENCES learning_sessions(id),  -- nullable for out-of-session events
    event_type      TEXT NOT NULL
                    CHECK (event_type IN (
                        'attempted',        -- started an exercise
                        'passed',           -- answered correctly
                        'failed',           -- answered incorrectly
                        'skipped',          -- chose to skip
                        'reviewed',         -- read lesson material (no exercise)
                        'implicit_fire',    -- FIRe: concept encountered in real work (git scan, error scan)
                        'level_up',         -- mastery level increased
                        'level_down'        -- mastery level decreased
                    )),
    source          TEXT,                   -- 'lesson', 'exercise', 'scan-work', 'scan-errors', 'manual'
    metadata_json   TEXT,                   -- event-specific payload (see below)
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    -- NO updated_at — events are immutable
);

CREATE INDEX idx_events_concept ON learning_events(concept_id);
CREATE INDEX idx_events_session ON learning_events(session_id);
CREATE INDEX idx_events_type ON learning_events(event_type);
CREATE INDEX idx_events_date ON learning_events(created_at);
```

**Metadata schemas by event type:**
```
attempted:      {"exercise_id": "ex-001", "exercise_type": "recall"}
passed:         {"exercise_id": "ex-001", "time_spent_ms": 12000, "score": 1.0}
failed:         {"exercise_id": "ex-001", "time_spent_ms": 8000, "user_answer": "...", "score": 0.0}
skipped:        {"exercise_id": "ex-001", "reason": "too easy | don't know | not now"}
reviewed:       {"lesson_id": "...", "time_spent_ms": 45000}
implicit_fire:  {"source_file": "server.mjs", "change_type": "modified", "pattern": "docker-compose"}
level_up:       {"from": "novice", "to": "familiar", "trigger": "3 consecutive passes"}
level_down:     {"from": "familiar", "to": "novice", "trigger": "3 consecutive lapses"}
```

**Immutability contract:** No UPDATE or DELETE on this table. If an event was recorded in error, add a corrective event (e.g., a `level_down` to reverse an incorrect `level_up`). Application code must not include UPDATE/DELETE statements for this table.

### 7. LearningSession

Groups a set of learning interactions into a coherent session. Provides structure for "I studied for 20 minutes" reporting.

**Rationale:** Without sessions, events are an undifferentiated stream. Sessions enable: "show me what I studied today," "how long was my last session," "what's my streak."

```sql
CREATE TABLE learning_sessions (
    id              TEXT PRIMARY KEY,           -- UUID
    started_at      TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at        TEXT,
    concepts_count  INTEGER DEFAULT 0,          -- distinct concepts touched
    events_count    INTEGER DEFAULT 0,          -- total events in session
    summary         TEXT,                       -- auto-generated or user-provided
    source          TEXT DEFAULT 'interactive'  -- 'interactive', 'scan', 'scheduled'
);
```

**Note:** These are *learning* sessions, not DAL sessions. A DAL session tracks a Claude Code development session. A learning session tracks a focused study period. They may overlap (studying during a dev session) but are independent entities.

### 8. PlanItem

"Study Docker Networking today because you used it in server.mjs and got a compose error."

Generated by the planner. Always starts as `draft`. User confirms, completes, skips, or defers.

**Rationale:** The learning system is **assistive, not prescriptive** (Decision #72). It suggests what to study and why, but never auto-schedules without consent. Confidence scores let the user gauge how strongly the system recommends each item. Rationale text explains the "why" — transparency builds trust.

```sql
CREATE TABLE plan_items (
    id              TEXT PRIMARY KEY,           -- UUID
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    plan_date       TEXT NOT NULL,              -- ISO 8601 date (YYYY-MM-DD)
    reason          TEXT NOT NULL,              -- human-readable "why this lesson now"
    source          TEXT NOT NULL,              -- 'fsrs_due', 'git_scan', 'error_scan', 'prerequisite_gap', 'user_request'
    confidence      REAL DEFAULT 0.5
                    CHECK (confidence BETWEEN 0.0 AND 1.0),
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'confirmed', 'completed', 'skipped', 'deferred')),
    deferred_to     TEXT,                       -- ISO 8601 date if status = 'deferred'
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_plan_date ON plan_items(plan_date);
CREATE INDEX idx_plan_status ON plan_items(status);
CREATE INDEX idx_plan_concept ON plan_items(concept_id);
```

**Confidence calibration:**

| Range | Meaning | Typical Source |
|-------|---------|---------------|
| 0.8-1.0 | Strong recommendation | FSRS overdue + recent failure |
| 0.5-0.8 | Moderate recommendation | Prerequisite gap, scheduled review |
| 0.2-0.5 | Suggestion | Git scan detected related work |
| 0.0-0.2 | Weak signal | Tangential connection, exploratory |

**Deferred items:** When a user defers a plan item, `deferred_to` records the new target date. The planner re-surfaces it on that date. Repeated deferrals (3+) should trigger a "should we drop this?" prompt, not infinite re-scheduling.

---

## Design Constraints

These constraints were identified during Scribe's architectural review and must be honored in implementation.

### C-1: Score Calibration Across Collections

When Q&A searches both `knowledge-reference` and `knowledge-learning`, relevance scores may not be comparable between collections (different document densities, embedding distributions).

**Requirement:** Use per-collection top-k retrieval + cross-collection reranking. Do NOT merge raw similarity scores. Retrieve top-k from each collection independently, then rerank the combined set using a secondary relevance model or heuristic.

**Implementation note:** This is Ava-side plumbing (curator routing). The ontology does not constrain the search strategy, but the separation into two collections makes this a mandatory design consideration.

### C-2: Assistive, Not Prescriptive

PlanItems are **always drafts until user-confirmed**. No auto-scheduling, no "you must study X today" without consent.

**Requirements:**
- PlanItems start as `draft`, never `confirmed`
- Confidence scores are transparent (user sees them)
- Reason text explains "why this lesson now" in plain language
- User can defer indefinitely (with gentle nudging after 3+ deferrals)
- No punitive mechanics (streaks are informational, not guilt-driven)

### C-3: Append-Only Events

`learning_events` is an append-only table. No UPDATE, no DELETE.

**Requirements:**
- Application code must not contain UPDATE/DELETE statements for this table
- Corrections use compensating events (e.g., `level_down` to reverse incorrect `level_up`)
- Events support full state reconstruction: given events 1..N, you can derive the current MasteryState
- Retention policy: events older than 1 year MAY be archived to a separate table, never deleted

### C-4: Data Governance — PII Boundaries

The learning system scans git history and error logs to generate `implicit_fire` events and plan items. This introduces PII risk.

**Requirements:**
- **Git scan (`scan-work`):** Extract file paths + change types only. Do NOT store commit messages (may contain issue numbers, names, sensitive context). Do NOT store diffs.
- **Error scan (`scan-errors`):** Extract error types + stack trace patterns only. Do NOT store full error messages (may contain user data, API keys, file contents).
- **Stored metadata** is patterns and types, never raw content
- **ChromaDB documents** in `knowledge-learning` contain only user-curated content (cheatsheets, notes). No auto-ingested raw data.
- **Deletion right:** User can delete all learning data (`concepts`, `mastery_state`, `learning_events`, `plan_items`) without affecting `knowledge-reference` collection or brain.db facts/decisions

---

## Migration Strategy

### Ordering

This spec requires one migration file executed in order:

```
migrations/
  005_learning_ontology.sql    -- all tables in this spec
```

**Why 005:** Ava's brain.db currently has migrations 001-004. This is the next sequential migration.

### Migration Script Outline

```sql
-- Migration 005: Learning Ontology (from PE spec v1.0.0)

-- 1. Evolve concepts table
ALTER TABLE concepts ADD COLUMN domain TEXT;
ALTER TABLE concepts ADD COLUMN description TEXT;
ALTER TABLE concepts ADD COLUMN chroma_doc_id TEXT;
ALTER TABLE concepts ADD COLUMN source TEXT DEFAULT 'manual';

-- 2. Create mastery_state from existing FSRS columns
CREATE TABLE mastery_state ( ... );  -- full schema above

INSERT INTO mastery_state (concept_id, mastery_level, stability, difficulty,
                           due_date, last_review, reps, lapses)
SELECT id, mastery_level, fsrs_stability, fsrs_difficulty,
       fsrs_due_date, fsrs_last_review, fsrs_reps, fsrs_lapses
FROM concepts;

-- 3. Drop FSRS columns from concepts
-- NOTE: SQLite < 3.35.0 does not support DROP COLUMN.
-- Use table-rebuild pattern if needed:
--   CREATE TABLE concepts_new (...without FSRS columns...);
--   INSERT INTO concepts_new SELECT <non-FSRS columns> FROM concepts;
--   DROP TABLE concepts;
--   ALTER TABLE concepts_new RENAME TO concepts;

-- 4. Add source and strength to prerequisites
ALTER TABLE prerequisites ADD COLUMN source TEXT DEFAULT 'manual';
ALTER TABLE prerequisites ADD COLUMN strength REAL DEFAULT 1.0;

-- 5. Create new tables
CREATE TABLE skills ( ... );
CREATE TABLE skill_concepts ( ... );
CREATE TABLE lessons ( ... );
CREATE TABLE learning_events ( ... );
CREATE TABLE learning_sessions ( ... );
CREATE TABLE plan_items ( ... );

-- 6. Create indexes (all listed in entity sections above)

-- 7. Update schema version
INSERT OR REPLACE INTO schema_version (version, applied_at)
VALUES (5, datetime('now'));
PRAGMA user_version = 5;
```

### Rollback

If migration fails partway through, the transaction should roll back entirely. Wrap the full migration in `BEGIN; ... COMMIT;`. If manual rollback is needed:
1. Drop new tables (`skills`, `skill_concepts`, `lessons`, `learning_events`, `learning_sessions`, `plan_items`, `mastery_state`)
2. The `ALTER TABLE ADD COLUMN` changes to `concepts` and `prerequisites` are harder to reverse in SQLite < 3.35.0 — use the table-rebuild pattern if needed

---

## Open Questions

These do not block implementation but should be resolved before v2.0.0 of this spec:

1. **Concept ID format** — Currently slugs (`docker-networking`). Should we use UUIDs for consistency with other brain.db tables? Slugs are more human-readable but risk collisions across domains.

2. **Lesson cache invalidation** — When should cached lessons expire? Options: never (regenerate on mastery level change only), time-based TTL (30 days), manual ("regenerate lesson" command).

3. **Skill definition source** — Who creates skills? Options: manual only, auto-generated from domain groupings, inferred from prerequisite clusters.

4. **Cross-device learning** — If learning state lives in brain.db and brain.db is per-device (Frank, Zoe, Ava), how does learning sync? Current answer: it doesn't — learning is Ava-local. Future: Syncthing replication or API sync.

5. **FSRS algorithm version** — Which FSRS version? FSRS-4 is current. Pin the version in the implementation to avoid silent behavior changes on library updates.

---

## Relationship to Other Systems

| System | Relationship |
|--------|-------------|
| ChromaDB `knowledge-learning` | Source material for concepts. 1:1 mapping via `chroma_doc_id`. |
| ChromaDB `knowledge-reference` | Independent. Q&A searches both, but reference has no learning state. |
| brain.db facts/decisions | Independent. Learning tables do not read/write facts. |
| DAL sessions | Independent. Learning sessions != DAL sessions. |
| Cheatsheet pipeline | Input. Cheatsheets -> curator -> concepts + ChromaDB docs + prerequisites. |
| scan-work / scan-errors | Input. Git/error analysis -> implicit_fire events + plan items. |
| Spark agent | Consumer. Reads concepts + mastery state -> generates lessons + exercises. |

---

*This spec is a PE-managed design document. Ava implements the migration and application logic. Changes to this spec require PE review.*
