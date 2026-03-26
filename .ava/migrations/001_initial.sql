-- DAL Schema v1 — Initial tables
-- Applied by: dal.mjs bootstrap / dal.mjs migrate

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_version (
    version     INTEGER NOT NULL,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now')),
    description TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'blocked', 'done', 'cancelled')),
    parent_task_id  TEXT REFERENCES tasks(id),
    blocked_by      TEXT DEFAULT '[]',
    priority        INTEGER DEFAULT 0,
    assigned_agent  TEXT,
    component       TEXT,
    session_created TEXT,
    session_closed  TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_component ON tasks(component);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority DESC);

-- NOTE: This trigger's UPDATE does not re-fire because SQLite's recursive_triggers
-- is OFF by default. Do NOT enable PRAGMA recursive_triggers or this will loop.
CREATE TRIGGER IF NOT EXISTS trg_tasks_updated
    AFTER UPDATE ON tasks
    FOR EACH ROW
BEGIN
    UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT PRIMARY KEY,
    start_time      TEXT NOT NULL DEFAULT (datetime('now')),
    end_time        TEXT,
    exit_reason     TEXT CHECK (exit_reason IN ('normal', 'interrupted', 'crashed', 'context_limit')),
    summary         TEXT,
    version_bump    TEXT,
    agent_model     TEXT,
    tasks_completed TEXT DEFAULT '[]',
    tasks_created   TEXT DEFAULT '[]',
    files_modified  TEXT DEFAULT '[]',
    decisions_made  TEXT DEFAULT '[]',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_exit ON sessions(exit_reason);

CREATE TABLE IF NOT EXISTS facts (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    key                 TEXT NOT NULL UNIQUE,
    value               TEXT NOT NULL,
    confidence          REAL NOT NULL DEFAULT 1.0
                        CHECK (confidence >= 0.0 AND confidence <= 1.0),
    domain              TEXT,
    source_session_id   TEXT REFERENCES sessions(id),
    tags                TEXT DEFAULT '[]',
    supersedes          INTEGER REFERENCES facts(id),
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    last_confirmed_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_facts_domain ON facts(domain);
CREATE INDEX IF NOT EXISTS idx_facts_confidence ON facts(confidence);
CREATE INDEX IF NOT EXISTS idx_facts_confirmed ON facts(last_confirmed_at);

CREATE VIRTUAL TABLE IF NOT EXISTS facts_fts USING fts5(
    key, value, tags,
    content='facts',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS trg_facts_ai AFTER INSERT ON facts BEGIN
    INSERT INTO facts_fts(rowid, key, value, tags)
    VALUES (new.id, new.key, new.value, new.tags);
END;
CREATE TRIGGER IF NOT EXISTS trg_facts_ad AFTER DELETE ON facts BEGIN
    INSERT INTO facts_fts(facts_fts, rowid, key, value, tags)
    VALUES ('delete', old.id, old.key, old.value, old.tags);
END;
CREATE TRIGGER IF NOT EXISTS trg_facts_au AFTER UPDATE ON facts BEGIN
    INSERT INTO facts_fts(facts_fts, rowid, key, value, tags)
    VALUES ('delete', old.id, old.key, old.value, old.tags);
    INSERT INTO facts_fts(rowid, key, value, tags)
    VALUES (new.id, new.key, new.value, new.tags);
END;

CREATE TABLE IF NOT EXISTS snapshots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      TEXT NOT NULL REFERENCES sessions(id),
    timestamp       TEXT NOT NULL DEFAULT (datetime('now')),
    current_task_id TEXT,
    modified_files  TEXT DEFAULT '[]',
    git_diff_stat   TEXT,
    agent_plan      TEXT,
    state_blob      TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_snapshots_session ON snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_time ON snapshots(timestamp);

CREATE TABLE IF NOT EXISTS decisions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    context         TEXT NOT NULL,
    alternatives    TEXT DEFAULT '[]',
    chosen          TEXT NOT NULL,
    rationale       TEXT NOT NULL,
    component       TEXT,
    session_id      TEXT REFERENCES sessions(id),
    status          TEXT DEFAULT 'active'
                    CHECK (status IN ('active', 'superseded', 'revisit')),
    superseded_by   INTEGER REFERENCES decisions(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_decisions_component ON decisions(component);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);

INSERT INTO schema_version (version, description) VALUES (1, 'Initial DAL schema');
