-- Migration: v4-v6 → v4.0 (schema version 10)
-- Reshuffles existing data into purpose-built tables.
-- Works on any pre-v10 schema (v4, v5, v6, or empty databases).
-- Safe for projects with or without documents/agent_* tables.
--
-- Run: sqlite3 .ava/brain.db < .ava/migrations/migrate_v6_to_v4.sql
-- BACKUP FIRST: cp .ava/brain.db .ava/brain.db.pre-v4.bak

PRAGMA foreign_keys = OFF;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. CREATE NEW TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Identity
CREATE TABLE IF NOT EXISTS identity (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS trg_identity_updated
    AFTER UPDATE ON identity
    FOR EACH ROW
BEGIN
    UPDATE identity SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- Architecture
CREATE TABLE IF NOT EXISTS architecture (
    key                 TEXT PRIMARY KEY,
    value               TEXT NOT NULL,
    scope               TEXT NOT NULL DEFAULT 'project'
                        CHECK (scope IN ('project', 'ecosystem', 'infrastructure', 'convention')),
    confidence          REAL NOT NULL DEFAULT 1.0
                        CHECK (confidence >= 0.0 AND confidence <= 1.0),
    source_session_id   TEXT REFERENCES sessions(id),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_arch_scope ON architecture(scope);
CREATE INDEX IF NOT EXISTS idx_arch_confidence ON architecture(confidence);

CREATE TRIGGER IF NOT EXISTS trg_arch_updated
    AFTER UPDATE ON architecture
    FOR EACH ROW
BEGIN
    UPDATE architecture SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- Prompts
CREATE TABLE IF NOT EXISTS prompts (
    key         TEXT PRIMARY KEY,
    content     TEXT NOT NULL,
    loaded_by   TEXT,
    version     INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS trg_prompts_updated
    AFTER UPDATE ON prompts
    FOR EACH ROW
BEGIN
    UPDATE prompts SET updated_at = datetime('now'), version = OLD.version + 1 WHERE key = NEW.key;
END;

-- Plans
CREATE TABLE IF NOT EXISTS plans (
    key         TEXT PRIMARY KEY,
    title       TEXT,
    content     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'proposed'
                CHECK (status IN ('proposed', 'active', 'completed', 'abandoned')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS trg_plans_updated
    AFTER UPDATE ON plans
    FOR EACH ROW
BEGIN
    UPDATE plans SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base (
    key         TEXT PRIMARY KEY,
    title       TEXT,
    content     TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'guide'
                CHECK (category IN ('guide', 'archive', 'visualization', 'changelog', 'runbook')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);

CREATE TRIGGER IF NOT EXISTS trg_kb_updated
    AFTER UPDATE ON knowledge_base
    FOR EACH ROW
BEGIN
    UPDATE knowledge_base SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- Knowledge Base FTS
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_base_fts USING fts5(
    key, title, content, category,
    content='knowledge_base',
    content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS trg_kb_fts_ai AFTER INSERT ON knowledge_base BEGIN
    INSERT INTO knowledge_base_fts(rowid, key, title, content, category)
    VALUES (new.rowid, new.key, new.title, new.content, new.category);
END;
CREATE TRIGGER IF NOT EXISTS trg_kb_fts_ad AFTER DELETE ON knowledge_base BEGIN
    INSERT INTO knowledge_base_fts(knowledge_base_fts, rowid, key, title, content, category)
    VALUES ('delete', old.rowid, old.key, old.title, old.content, old.category);
END;
CREATE TRIGGER IF NOT EXISTS trg_kb_fts_au AFTER UPDATE ON knowledge_base BEGIN
    INSERT INTO knowledge_base_fts(knowledge_base_fts, rowid, key, title, content, category)
    VALUES ('delete', old.rowid, old.key, old.title, old.content, old.category);
    INSERT INTO knowledge_base_fts(rowid, key, title, content, category)
    VALUES (new.rowid, new.key, new.title, new.content, new.category);
END;

-- Pipeline
CREATE TABLE IF NOT EXISTS pipeline (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    category    TEXT NOT NULL
                CHECK (category IN ('flow', 'skill', 'hook', 'agent', 'config')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pipeline_category ON pipeline(category);

CREATE TRIGGER IF NOT EXISTS trg_pipeline_updated
    AFTER UPDATE ON pipeline
    FOR EACH ROW
BEGIN
    UPDATE pipeline SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. MIGRATE DATA: facts → identity + architecture
-- ═══════════════════════════════════════════════════════════════════════════════

-- Identity (core project facts)
INSERT OR REPLACE INTO identity (key, value, updated_at)
    SELECT key, value, last_confirmed_at FROM facts
    WHERE key IN ('project.name', 'project.version', 'project.vision', 'tech.stack', 'tech.build');

-- Architecture — ecosystem scope
INSERT OR REPLACE INTO architecture (key, value, scope, confidence, source_session_id, updated_at)
    SELECT key, value, 'ecosystem', confidence, source_session_id, last_confirmed_at FROM facts
    WHERE key LIKE 'ecosystem.%'
       OR key LIKE 'ava.%'
       OR key LIKE 'ava_main.%'
       OR key LIKE 'echelon.%'
       OR key LIKE 'adze-cad.%'
       OR key LIKE 'tradeSignal.%'
       OR key IN ('dal-doctor.location', 'notes.two_systems', 'numbered-folders-refactored');

-- Architecture — infrastructure scope
INSERT OR REPLACE INTO architecture (key, value, scope, confidence, source_session_id, updated_at)
    SELECT key, value, 'infrastructure', confidence, source_session_id, last_confirmed_at FROM facts
    WHERE key IN ('ssh.config', 'mermaid.mcp', 'dal-doctor.sandbox_fix');

-- Architecture — convention scope
INSERT OR REPLACE INTO architecture (key, value, scope, confidence, source_session_id, updated_at)
    SELECT key, value, 'convention', confidence, source_session_id, last_confirmed_at FROM facts
    WHERE key IN ('scribe.agent', 'graceful-dal-degradation');

-- Architecture — project scope (everything else that isn't identity)
INSERT OR REPLACE INTO architecture (key, value, scope, confidence, source_session_id, updated_at)
    SELECT key, value, 'project', confidence, source_session_id, last_confirmed_at FROM facts
    WHERE key NOT IN (SELECT key FROM identity)
      AND key NOT IN (SELECT key FROM architecture);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. MIGRATE DATA: documents → prompts + plans + knowledge_base
--    Create empty stub if documents table doesn't exist (v4/v5 projects).
--    INSERTs will be no-ops on empty stubs.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documents (
    key TEXT PRIMARY KEY, type TEXT, title TEXT, content TEXT,
    loaded_by TEXT, version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
);

-- Prompts
INSERT OR REPLACE INTO prompts (key, content, loaded_by, version, updated_at)
    SELECT
        REPLACE(key, 'prompt.', ''),
        content, loaded_by, version, updated_at
    FROM documents WHERE type = 'prompt';

-- Plans
INSERT OR REPLACE INTO plans (key, title, content, status, created_at, updated_at)
    SELECT
        REPLACE(key, 'plan.', ''),
        title, content, 'active', created_at, updated_at
    FROM documents WHERE type = 'plan';

-- Knowledge Base — references
INSERT OR REPLACE INTO knowledge_base (key, title, content, category, created_at, updated_at)
    SELECT
        REPLACE(key, 'reference.', ''),
        title, content,
        CASE
            WHEN key LIKE '%archive%' THEN 'archive'
            WHEN key LIKE '%viz%' THEN 'visualization'
            WHEN key LIKE '%process_manual%' THEN 'guide'
            ELSE 'guide'
        END,
        created_at, updated_at
    FROM documents WHERE type = 'reference';

-- Knowledge Base — rendered content
INSERT OR REPLACE INTO knowledge_base (key, title, content, category, created_at, updated_at)
    SELECT
        REPLACE(key, 'rendered.', ''),
        title, content, 'changelog', created_at, updated_at
    FROM documents WHERE type = 'rendered';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. MIGRATE DATA: notes (drop tab_key, add session_id)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create new notes table
CREATE TABLE notes_v4 (
    id          TEXT PRIMARY KEY,
    category    TEXT NOT NULL
                CHECK (category IN ('improvement', 'issue', 'bug', 'idea', 'handoff', 'feedback')),
    text        TEXT NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0,
    session_id  TEXT REFERENCES sessions(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO notes_v4 (id, category, text, completed, created_at, updated_at)
    SELECT id, category, text, completed, created_at, updated_at FROM notes;

DROP TABLE notes;
ALTER TABLE notes_v4 RENAME TO notes;

CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_completed ON notes(completed);

CREATE TRIGGER trg_notes_updated
    AFTER UPDATE ON notes
    FOR EACH ROW
BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TRIM sessions (remove unused JSON columns)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sessions_v4 (
    id              TEXT PRIMARY KEY,
    start_time      TEXT NOT NULL DEFAULT (datetime('now')),
    end_time        TEXT,
    exit_reason     TEXT CHECK (exit_reason IN ('normal', 'interrupted', 'crashed', 'context_limit')),
    summary         TEXT,
    version_bump    TEXT,
    agent_model     TEXT,
    agent_role      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO sessions_v4 (id, start_time, end_time, exit_reason, summary, version_bump, agent_model, agent_role, created_at)
    SELECT id, start_time, end_time, exit_reason, summary, version_bump, agent_model, agent_role, created_at FROM sessions;

DROP TABLE sessions;
ALTER TABLE sessions_v4 RENAME TO sessions;

CREATE INDEX idx_sessions_start ON sessions(start_time);
CREATE INDEX idx_sessions_exit ON sessions(exit_reason);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. POPULATE PIPELINE (OS defaults)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Lifecycle flows
INSERT OR REPLACE INTO pipeline (key, value, category) VALUES
    ('flow.lifecycle', 'session-context hook → CLAUDE.md auto-read → documentation-awareness → /session-init → work → /session-closeout', 'flow'),
    ('flow.first_run', '/cleanup hydrates brain.db from codebase → /session-init orients', 'flow');

-- Skills (25) with tiers
INSERT OR REPLACE INTO pipeline (key, value, category) VALUES
    ('skill.session-init', 'core', 'skill'),
    ('skill.session-closeout', 'core', 'skill'),
    ('skill.documentation-awareness', 'core', 'skill'),
    ('skill.cleanup', 'frequent', 'skill'),
    ('skill.validate-docs', 'frequent', 'skill'),
    ('skill.validate-setup', 'frequent', 'skill'),
    ('skill.deploy', 'frequent', 'skill'),
    ('skill.dal-setup', 'frequent', 'skill'),
    ('skill.bootstrap', 'frequent', 'skill'),
    ('skill.code-review', 'on-demand', 'skill'),
    ('skill.testing', 'on-demand', 'skill'),
    ('skill.debugging', 'on-demand', 'skill'),
    ('skill.refactor', 'on-demand', 'skill'),
    ('skill.architecture', 'on-demand', 'skill'),
    ('skill.requirements', 'on-demand', 'skill'),
    ('skill.frontend-design', 'on-demand', 'skill'),
    ('skill.release', 'situational', 'skill'),
    ('skill.migration', 'situational', 'skill'),
    ('skill.incident', 'situational', 'skill'),
    ('skill.dependency-audit', 'situational', 'skill'),
    ('skill.discovery', 'situational', 'skill'),
    ('skill.explore', 'situational', 'skill'),
    ('skill.together', 'situational', 'skill'),
    ('skill.visual-intelligence', 'situational', 'skill'),
    ('skill.readme', 'situational', 'skill');

-- Hooks (7)
INSERT OR REPLACE INTO pipeline (key, value, category) VALUES
    ('hook.session-context', 'Injects brain.db state + git context at session start/resume', 'hook'),
    ('hook.stop-closeout-check', 'Warns if docs stale >120min at session end', 'hook'),
    ('hook.block-protected-files', 'Blocks writes to .env, credentials, lock files', 'hook'),
    ('hook.block-dangerous-commands', 'Blocks rm -rf, force push, chmod 777, curl|sh', 'hook'),
    ('hook.typecheck-on-edit', 'Runs tsc --noEmit after TS/TSX edits', 'hook'),
    ('hook.lint-on-edit', 'Runs eslint after file edits', 'hook'),
    ('hook.log-util', 'Shared logging utility for hooks', 'hook');

-- Agents (3)
INSERT OR REPLACE INTO pipeline (key, value, category) VALUES
    ('agent.closeout-worker', 'Autonomous session closeout execution', 'agent'),
    ('agent.doc-validator', 'Read-only documentation consistency auditor', 'agent'),
    ('agent.security-reviewer', 'Security-focused code review', 'agent');

-- Config
INSERT OR REPLACE INTO pipeline (key, value, category) VALUES
    ('config.default_model', 'sonnet', 'config'),
    ('config.context_scope', 'project', 'config'),
    ('config.closeout_threshold', '120', 'config'),
    ('config.verify_tier', 'core,frequent', 'config'),
    ('config.session_reminder', 'true', 'config'),
    ('config.brain_db_first', 'true', 'config');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. CREATE AGENT LOOP TABLES (if not present — v4/v5 projects lack these)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_actions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      TEXT REFERENCES sessions(id),
    action_type     TEXT NOT NULL,
    target          TEXT,
    description     TEXT NOT NULL,
    outcome         TEXT CHECK (outcome IN ('success', 'failure', 'partial', 'pending')),
    outcome_detail  TEXT,
    note_id         TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_actions_type ON agent_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_actions_outcome ON agent_actions(outcome);
CREATE INDEX IF NOT EXISTS idx_actions_session ON agent_actions(session_id);

CREATE TABLE IF NOT EXISTS agent_metrics (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    key             TEXT NOT NULL,
    value           REAL NOT NULL,
    context         TEXT,
    session_id      TEXT REFERENCES sessions(id),
    measured_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_metrics_key ON agent_metrics(key);
CREATE INDEX IF NOT EXISTS idx_metrics_time ON agent_metrics(measured_at);

CREATE TABLE IF NOT EXISTS agent_feedback (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id       INTEGER REFERENCES agent_actions(id),
    rating          TEXT NOT NULL CHECK (rating IN ('helpful', 'neutral', 'harmful')),
    source          TEXT NOT NULL CHECK (source IN ('human', 'metric', 'self')),
    detail          TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_feedback_action ON agent_feedback(action_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON agent_feedback(rating);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. DROP OLD TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop FTS tables first (they depend on base tables)
DROP TABLE IF EXISTS facts_fts;
DROP TABLE IF EXISTS explorations_fts;

-- Drop old tables
DROP TABLE IF EXISTS facts;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS snapshots;
DROP TABLE IF EXISTS explorations;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. UPDATE SCHEMA VERSION
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO schema_version (version, description) VALUES
    (10, 'v4.0 — Purpose-built tables, brain.db-first paradigm');

PRAGMA foreign_keys = ON;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY: Run after migration to confirm
--   SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
--   Expected: agent_actions, agent_feedback, agent_metrics, architecture,
--     decisions, identity, knowledge_base, knowledge_base_fts, notes,
--     pipeline, plans, prompts, schema_version, sessions
-- ═══════════════════════════════════════════════════════════════════════════════
