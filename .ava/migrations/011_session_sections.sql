-- Migration 011: Learning Session Sections (Session 78)
-- Columns already exist on learning_sessions (added via schema.sql getDb auto-migration)
-- This migration only creates the session_sections table + indexes + records version

-- session_sections table for per-section progress tracking
CREATE TABLE IF NOT EXISTS session_sections (
    id              TEXT PRIMARY KEY,
    session_id      TEXT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'unexplored'
                    CHECK (status IN ('unexplored', 'in-progress', 'complete')),
    sort_order      INTEGER DEFAULT 0,
    content_md      TEXT,
    concept_id      TEXT,
    started_at      TEXT,
    completed_at    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_session_sections_session ON session_sections(session_id);
CREATE INDEX IF NOT EXISTS idx_session_sections_status ON session_sections(status);

INSERT OR REPLACE INTO schema_version (version, applied_at, description)
VALUES (11, datetime('now'), 'Session sections table + learning_sessions extensions');
