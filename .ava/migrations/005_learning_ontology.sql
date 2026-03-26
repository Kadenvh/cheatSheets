-- DAL Schema v5 — Learning Ontology (from PE spec v1.0.0)
-- Implements: Ava Session 69 Decisions #69, #70, #72
-- Evolves existing learning tables + creates new ontology tables
--
-- Current state (schema v4):
--   concepts:               35 rows (id, title, domain, chromadb_id, description, difficulty, created_at, updated_at)
--   concept_prerequisites:  30 rows (concept_id, prerequisite_id, weight, created_at)
--   mastery:                35 rows (concept_id, level, stability, difficulty, elapsed_days, scheduled_days,
--                                    reps, lapses, learning_steps, state, last_review, next_review,
--                                    review_count, correct_count, streak, implicit_reps, last_implicit, updated_at)
--   reviews:                0 rows  (id, concept_id, grade, source, context, duration_ms, created_at)
--   learning_sessions:      0 rows  (id, topic, started_at, completed_at, notes, source, concepts_json, stats_json)
--   streaks:                0 rows  (date, reviews, concepts, duration_ms, frozen)

-- ============================================================================
-- 1. EVOLVE CONCEPTS TABLE
--    Rename: title -> name, chromadb_id -> chroma_doc_id
--    Add:    source column
--    Keep:   domain, description (already exist)
-- ============================================================================

-- Rename columns (SQLite >= 3.25.0)
ALTER TABLE concepts RENAME COLUMN title TO name;
ALTER TABLE concepts RENAME COLUMN chromadb_id TO chroma_doc_id;

-- Add source column
ALTER TABLE concepts ADD COLUMN source TEXT DEFAULT 'manual';

-- Drop the old index on chromadb_id and create new one on chroma_doc_id
DROP INDEX IF EXISTS idx_concepts_chromadb;
CREATE INDEX idx_concepts_chroma_doc ON concepts(chroma_doc_id);

-- Add source index per spec
CREATE INDEX idx_concepts_source ON concepts(source);

-- ============================================================================
-- 2. CREATE mastery_state TABLE AND MIGRATE DATA FROM mastery
--    The mastery table has many fields; spec wants a cleaner subset.
--    Migrate matching columns, preserve data.
-- ============================================================================

CREATE TABLE mastery_state (
    concept_id      TEXT PRIMARY KEY REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_level   TEXT NOT NULL DEFAULT 'novice'
                    CHECK (mastery_level IN ('novice', 'familiar', 'proficient', 'expert')),
    -- FSRS scheduling fields
    stability       REAL DEFAULT 0.0,
    difficulty      REAL DEFAULT 5.0,
    due_date        TEXT,
    last_review     TEXT,
    reps            INTEGER DEFAULT 0,
    lapses          INTEGER DEFAULT 0,
    -- metadata
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Migrate data from mastery -> mastery_state
-- Map old level values: 'mastered' -> 'expert', 'legendary' -> 'expert' (spec has 4 levels)
-- Map next_review -> due_date
INSERT INTO mastery_state (concept_id, mastery_level, stability, difficulty,
                           due_date, last_review, reps, lapses, updated_at)
SELECT
    concept_id,
    CASE level
        WHEN 'novice'     THEN 'novice'
        WHEN 'familiar'   THEN 'familiar'
        WHEN 'proficient' THEN 'proficient'
        WHEN 'mastered'   THEN 'expert'
        WHEN 'legendary'  THEN 'expert'
        ELSE 'novice'
    END,
    stability,
    difficulty,
    next_review,
    last_review,
    reps,
    lapses,
    updated_at
FROM mastery;

-- Drop old mastery table (data is migrated)
DROP TABLE IF EXISTS mastery;

-- ============================================================================
-- 3. EVOLVE PREREQUISITES TABLE
--    Current table: concept_prerequisites (weight, no source/strength)
--    Spec wants:    prerequisites (strength, source)
--    Approach: rename weight -> strength, add source, rename table
-- ============================================================================

-- Rename weight -> strength per spec semantics
ALTER TABLE concept_prerequisites RENAME COLUMN weight TO strength;

-- Add source column
ALTER TABLE concept_prerequisites ADD COLUMN source TEXT DEFAULT 'manual';

-- Rename the table to match spec
ALTER TABLE concept_prerequisites RENAME TO prerequisites;

-- Add index on prerequisite_id per spec
CREATE INDEX idx_prereqs_target ON prerequisites(prerequisite_id);

-- ============================================================================
-- 4. CREATE NEW TABLES: skills, skill_concepts, lessons, learning_events, plan_items
-- ============================================================================

-- 4a. Skills — resume-worthy capability groupings
CREATE TABLE skills (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4b. Skill-Concept junction table
CREATE TABLE skill_concepts (
    skill_id        TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    weight          REAL DEFAULT 1.0,
    PRIMARY KEY (skill_id, concept_id)
);

-- 4c. Lessons — cached generated content per (concept, mastery_level)
CREATE TABLE lessons (
    id              TEXT PRIMARY KEY,
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_level   TEXT NOT NULL
                    CHECK (mastery_level IN ('novice', 'familiar', 'proficient', 'expert')),
    content_json    TEXT NOT NULL,
    generated_by    TEXT,
    generated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT,
    UNIQUE (concept_id, mastery_level)
);

-- 4d. Learning Events — append-only evidence log
CREATE TABLE learning_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    session_id      TEXT REFERENCES learning_sessions(id),
    event_type      TEXT NOT NULL
                    CHECK (event_type IN (
                        'attempted',
                        'passed',
                        'failed',
                        'skipped',
                        'reviewed',
                        'implicit_fire',
                        'level_up',
                        'level_down'
                    )),
    source          TEXT,
    metadata_json   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_concept ON learning_events(concept_id);
CREATE INDEX idx_events_session ON learning_events(session_id);
CREATE INDEX idx_events_type ON learning_events(event_type);
CREATE INDEX idx_events_date ON learning_events(created_at);

-- 4e. Plan Items — assistive study plan (always starts as draft)
CREATE TABLE plan_items (
    id              TEXT PRIMARY KEY,
    concept_id      TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    plan_date       TEXT NOT NULL,
    reason          TEXT NOT NULL,
    source          TEXT NOT NULL,
    confidence      REAL DEFAULT 0.5
                    CHECK (confidence BETWEEN 0.0 AND 1.0),
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'confirmed', 'completed', 'skipped', 'deferred')),
    deferred_to     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_plan_date ON plan_items(plan_date);
CREATE INDEX idx_plan_status ON plan_items(status);
CREATE INDEX idx_plan_concept ON plan_items(concept_id);

-- ============================================================================
-- 5. EVOLVE learning_sessions TABLE
--    Current: id, topic, started_at, completed_at, notes, source, concepts_json, stats_json
--    Spec:    id, started_at, ended_at, concepts_count, events_count, summary, source
--    Approach: rebuild since we need to rename columns and change CHECK constraint
--    Table has 0 rows so data loss is not a concern.
-- ============================================================================

-- Rebuild learning_sessions to match spec
CREATE TABLE learning_sessions_new (
    id              TEXT PRIMARY KEY,
    started_at      TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at        TEXT,
    concepts_count  INTEGER DEFAULT 0,
    events_count    INTEGER DEFAULT 0,
    summary         TEXT,
    source          TEXT DEFAULT 'interactive'
                    CHECK (source IN ('interactive', 'scan', 'scheduled'))
);

-- Migrate any existing rows (0 as of migration time, but safe pattern)
INSERT INTO learning_sessions_new (id, started_at, ended_at, summary, source)
SELECT
    id,
    started_at,
    completed_at,
    notes,
    CASE source
        WHEN 'manual'          THEN 'interactive'
        WHEN 'scheduled'       THEN 'scheduled'
        WHEN 'error-driven'    THEN 'scan'
        WHEN 'codebase-driven' THEN 'scan'
        ELSE 'interactive'
    END
FROM learning_sessions;

DROP TABLE learning_sessions;
ALTER TABLE learning_sessions_new RENAME TO learning_sessions;

-- ============================================================================
-- 6. UPDATE SCHEMA VERSION
-- ============================================================================

INSERT INTO schema_version (version, description)
VALUES (5, 'Learning Ontology: mastery_state, prerequisites, skills, lessons, learning_events, plan_items (PE spec v1.0.0)');

PRAGMA user_version = 5;
