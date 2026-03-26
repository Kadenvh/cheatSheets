-- DAL Schema v6 — Agent autonomous loop tables
-- Actions, metrics, and feedback for learning loops.

-- What the agent did
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

-- Measurable values tracked over time
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

-- Did the action help?
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

INSERT INTO schema_version (version, description) VALUES (6, 'Agent loop: actions, metrics, feedback tables');
