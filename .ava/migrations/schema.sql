-- DAL Schema v5.1 — Active Memory + Session Continuity
-- brain.db scoped to active memory per clean category pattern.
-- Removed: prompts (files are truth), plans (execution tracking),
--          knowledge_base (narrative knowledge), pipeline (filesystem-derivable).
-- Applied by: db.mjs when no schema_version table exists.
--
-- 10 tables, 3 groups:
--   Core memory:        identity, architecture, sessions, decisions, notes
--   Session continuity: session_traces
--   Learning loop:      agent_actions, agent_metrics, agent_feedback
--   Meta:               schema_version

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
-- Long-term reasoning. Why is it this way?

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
-- Task queue and handoff system. The primary "what's next" mechanism.

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

-- ─── Session Traces ─────────────────────────────────────────────────────────
-- Structured episodic memory. Queryable trace data per session.

CREATE TABLE session_traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT REFERENCES sessions(id),
    trace_type TEXT NOT NULL CHECK (trace_type IN (
        'file_read', 'file_write', 'decision_point',
        'tool_call', 'error', 'discovery', 'context_switch',
        'agent_dispatch', 'validation_fail'
    )),
    target TEXT,
    detail TEXT,
    outcome TEXT CHECK (outcome IS NULL OR outcome IN ('success', 'failure', 'skipped', 'partial')),
    tokens_used INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_traces_session ON session_traces(session_id);
CREATE INDEX idx_traces_type ON session_traces(trace_type);
CREATE INDEX idx_traces_time ON session_traces(created_at);

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
    (12, 'v5.1 — Active memory + session continuity (traces, handoffs)');

-- ─── Identity Stubs ──────────────────────────────────────────────────────────

INSERT INTO identity (key, value) VALUES
    ('project.name', 'UNNAMED'),
    ('project.version', '0.0.0'),
    ('project.vision', 'UNSET'),
    ('tech.stack', 'UNSET'),
    ('tech.build', 'UNSET');

-- ─── Setup Notes ─────────────────────────────────────────────────────────────

INSERT INTO notes (id, category, text) VALUES
    ('setup_001', 'improvement', 'Run /cleanup to hydrate brain.db from project codebase'),
    ('setup_002', 'improvement', 'Populate identity table: project.name, project.version, project.vision, tech.stack'),
    ('setup_003', 'improvement', 'Review closeout prompt Part A-1 (Completion Audit): features are done when the user can use them end-to-end. Backing store must exist with data. No endpoint counting.');
