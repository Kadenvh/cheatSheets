-- DAL Schema v4.0 — Purpose-built tables, brain.db-first paradigm
-- Fresh install schema. Replaces v6 incremental design with holistic architecture.
-- Applied by: db.mjs when no schema_version table exists.
--
-- 13 tables, 3 groups:
--   Core memory:  identity, architecture, sessions, decisions, notes
--   Content:      prompts, plans, knowledge_base
--   System:       pipeline, agent_actions, agent_metrics, agent_feedback, schema_version

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

-- ─── Schema Version ──────────────────────────────────────────────────────────

CREATE TABLE schema_version (
    version     INTEGER NOT NULL,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now')),
    description TEXT
);

-- ─── Identity ────────────────────────────────────────────────────────────────
-- Who is this project? Small, stable, always injected.
-- Expected: 5-7 rows per project.

CREATE TABLE identity (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER trg_identity_updated
    AFTER UPDATE ON identity
    FOR EACH ROW
BEGIN
    UPDATE identity SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- ─── Architecture ────────────────────────────────────────────────────────────
-- How is this project built? Scoped for selective injection.
--   project:        always injected (system design, patterns, conventions)
--   ecosystem:      injected for cross-project work
--   infrastructure: injected for deployment/ops
--   convention:     always injected (working preferences, coding style)

CREATE TABLE architecture (
    key                 TEXT PRIMARY KEY,
    value               TEXT NOT NULL,
    scope               TEXT NOT NULL DEFAULT 'project'
                        CHECK (scope IN ('project', 'ecosystem', 'infrastructure', 'convention')),
    confidence          REAL NOT NULL DEFAULT 1.0
                        CHECK (confidence >= 0.0 AND confidence <= 1.0),
    source_session_id   TEXT REFERENCES sessions(id),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_arch_scope ON architecture(scope);
CREATE INDEX idx_arch_confidence ON architecture(confidence);

CREATE TRIGGER trg_arch_updated
    AFTER UPDATE ON architecture
    FOR EACH ROW
BEGIN
    UPDATE architecture SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- ─── Sessions ────────────────────────────────────────────────────────────────
-- Episodic memory. What happened, when, and why it ended.

CREATE TABLE sessions (
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

CREATE INDEX idx_sessions_start ON sessions(start_time);
CREATE INDEX idx_sessions_exit ON sessions(exit_reason);

-- ─── Decisions ───────────────────────────────────────────────────────────────
-- Long-term reasoning. Why is it this way? Replaces ROADMAP decision sections.

CREATE TABLE decisions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    context         TEXT NOT NULL,
    alternatives    TEXT DEFAULT '[]',
    chosen          TEXT NOT NULL,
    rationale       TEXT NOT NULL,
    rationale_long  TEXT,
    component       TEXT,
    session_id      TEXT REFERENCES sessions(id),
    status          TEXT DEFAULT 'active'
                    CHECK (status IN ('active', 'superseded', 'revisit')),
    superseded_by   INTEGER REFERENCES decisions(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_decisions_component ON decisions(component);
CREATE INDEX idx_decisions_status ON decisions(status);

-- ─── Notes ───────────────────────────────────────────────────────────────────
-- Task queue. Replaces IMPL_PLAN checklists. The primary "what's next" system.

CREATE TABLE notes (
    id          TEXT PRIMARY KEY,
    category    TEXT NOT NULL
                CHECK (category IN ('improvement', 'issue', 'bug', 'idea', 'handoff', 'feedback')),
    text        TEXT NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0,
    session_id  TEXT REFERENCES sessions(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_completed ON notes(completed);

CREATE TRIGGER trg_notes_updated
    AFTER UPDATE ON notes
    FOR EACH ROW
BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ─── Prompts ─────────────────────────────────────────────────────────────────
-- Skill prompt content. Loaded on demand when a skill fires. Never bulk-injected.

CREATE TABLE prompts (
    key         TEXT PRIMARY KEY,
    content     TEXT NOT NULL,
    loaded_by   TEXT,
    version     INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER trg_prompts_updated
    AFTER UPDATE ON prompts
    FOR EACH ROW
BEGIN
    UPDATE prompts SET updated_at = datetime('now'), version = OLD.version + 1 WHERE key = NEW.key;
END;

-- ─── Plans ───────────────────────────────────────────────────────────────────
-- Design briefs, proposals, phased work plans. Longer-form than notes.

CREATE TABLE plans (
    key         TEXT PRIMARY KEY,
    title       TEXT,
    content     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'proposed'
                CHECK (status IN ('proposed', 'active', 'completed', 'abandoned')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER trg_plans_updated
    AFTER UPDATE ON plans
    FOR EACH ROW
BEGIN
    UPDATE plans SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- ─── Knowledge Base ──────────────────────────────────────────────────────────
-- Guides, archives, visualizations, changelogs, runbooks.
-- Loaded on demand. Searchable via FTS.

CREATE TABLE knowledge_base (
    key         TEXT PRIMARY KEY,
    title       TEXT,
    content     TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'guide'
                CHECK (category IN ('guide', 'archive', 'visualization', 'changelog', 'runbook')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_kb_category ON knowledge_base(category);

CREATE TRIGGER trg_kb_updated
    AFTER UPDATE ON knowledge_base
    FOR EACH ROW
BEGIN
    UPDATE knowledge_base SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- FTS for knowledge base content search
CREATE VIRTUAL TABLE knowledge_base_fts USING fts5(
    key, title, content, category,
    content='knowledge_base',
    content_rowid='rowid'
);

CREATE TRIGGER trg_kb_fts_ai AFTER INSERT ON knowledge_base BEGIN
    INSERT INTO knowledge_base_fts(rowid, key, title, content, category)
    VALUES (new.rowid, new.key, new.title, new.content, new.category);
END;
CREATE TRIGGER trg_kb_fts_ad AFTER DELETE ON knowledge_base BEGIN
    INSERT INTO knowledge_base_fts(knowledge_base_fts, rowid, key, title, content, category)
    VALUES ('delete', old.rowid, old.key, old.title, old.content, old.category);
END;
CREATE TRIGGER trg_kb_fts_au AFTER UPDATE ON knowledge_base BEGIN
    INSERT INTO knowledge_base_fts(knowledge_base_fts, rowid, key, title, content, category)
    VALUES ('delete', old.rowid, old.key, old.title, old.content, old.category);
    INSERT INTO knowledge_base_fts(rowid, key, title, content, category)
    VALUES (new.rowid, new.key, new.title, new.content, new.category);
END;

-- ─── Pipeline ────────────────────────────────────────────────────────────────
-- System self-description. What skills exist, their tiers, lifecycle flow, config.

CREATE TABLE pipeline (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    category    TEXT NOT NULL
                CHECK (category IN ('flow', 'skill', 'hook', 'agent', 'config')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_pipeline_category ON pipeline(category);

CREATE TRIGGER trg_pipeline_updated
    AFTER UPDATE ON pipeline
    FOR EACH ROW
BEGIN
    UPDATE pipeline SET updated_at = datetime('now') WHERE key = NEW.key;
END;

-- ─── Agent Loop ──────────────────────────────────────────────────────────────
-- Learning loop: track what was attempted, measure outcomes, collect feedback.

CREATE TABLE agent_actions (
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

CREATE INDEX idx_actions_type ON agent_actions(action_type);
CREATE INDEX idx_actions_outcome ON agent_actions(outcome);
CREATE INDEX idx_actions_session ON agent_actions(session_id);

CREATE TABLE agent_metrics (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    key             TEXT NOT NULL,
    value           REAL NOT NULL,
    context         TEXT,
    session_id      TEXT REFERENCES sessions(id),
    measured_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_metrics_key ON agent_metrics(key);
CREATE INDEX idx_metrics_time ON agent_metrics(measured_at);

CREATE TABLE agent_feedback (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id       INTEGER REFERENCES agent_actions(id),
    rating          TEXT NOT NULL CHECK (rating IN ('helpful', 'neutral', 'harmful')),
    source          TEXT NOT NULL CHECK (source IN ('human', 'metric', 'self')),
    detail          TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_feedback_action ON agent_feedback(action_id);
CREATE INDEX idx_feedback_rating ON agent_feedback(rating);

-- ═══════════════════════════════════════════════════════════════════════════════
-- OS DEFAULTS — Every fresh install starts with a functioning system
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Version ─────────────────────────────────────────────────────────────────

INSERT INTO schema_version (version, description) VALUES
    (10, 'v4.0 — Purpose-built tables, brain.db-first paradigm');

-- ─── Identity Stubs ──────────────────────────────────────────────────────────

INSERT INTO identity (key, value) VALUES
    ('project.name', 'UNNAMED'),
    ('project.version', '0.0.0'),
    ('project.vision', 'UNSET'),
    ('tech.stack', 'UNSET'),
    ('tech.build', 'UNSET');

-- ─── Pipeline Definition ─────────────────────────────────────────────────────

-- Lifecycle flows
INSERT INTO pipeline (key, value, category) VALUES
    ('flow.lifecycle', 'session-context hook → CLAUDE.md auto-read → documentation-awareness → /session-init → work → /session-closeout', 'flow'),
    ('flow.first_run', '/cleanup hydrates brain.db from codebase → /session-init orients', 'flow');

-- Skills (25) with tiers
INSERT INTO pipeline (key, value, category) VALUES
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

-- Hooks (7) with descriptions
INSERT INTO pipeline (key, value, category) VALUES
    ('hook.session-context', 'Injects brain.db state + git context at session start/resume', 'hook'),
    ('hook.stop-closeout-check', 'Warns if docs stale >120min at session end', 'hook'),
    ('hook.block-protected-files', 'Blocks writes to .env, credentials, lock files', 'hook'),
    ('hook.block-dangerous-commands', 'Blocks rm -rf, force push, chmod 777, curl|sh', 'hook'),
    ('hook.typecheck-on-edit', 'Runs tsc --noEmit after TS/TSX edits', 'hook'),
    ('hook.lint-on-edit', 'Runs eslint after file edits', 'hook'),
    ('hook.log-util', 'Shared logging utility for hooks', 'hook');

-- Agents (3) with descriptions
INSERT INTO pipeline (key, value, category) VALUES
    ('agent.closeout-worker', 'Autonomous session closeout execution', 'agent'),
    ('agent.doc-validator', 'Read-only documentation consistency auditor', 'agent'),
    ('agent.security-reviewer', 'Security-focused code review', 'agent');

-- Config defaults
INSERT INTO pipeline (key, value, category) VALUES
    ('config.default_model', 'sonnet', 'config'),
    ('config.context_scope', 'project', 'config'),
    ('config.closeout_threshold', '120', 'config'),
    ('config.verify_tier', 'core,frequent', 'config'),
    ('config.session_reminder', 'true', 'config'),
    ('config.brain_db_first', 'true', 'config');

-- ─── Setup Notes ─────────────────────────────────────────────────────────────

INSERT INTO notes (id, category, text) VALUES
    ('setup_001', 'improvement', 'Run /cleanup to hydrate brain.db from project codebase'),
    ('setup_002', 'improvement', 'Populate identity table: project.name, project.version, project.vision, tech.stack'),
    ('setup_003', 'improvement', 'Review pipeline skill tiers and adjust for this project');
