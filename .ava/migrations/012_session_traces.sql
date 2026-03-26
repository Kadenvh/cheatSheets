-- Migration 012: Session traces - structured episodic memory
-- Replaces prose-only session summaries with queryable trace data

CREATE TABLE IF NOT EXISTS session_traces (
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

CREATE INDEX IF NOT EXISTS idx_traces_session ON session_traces(session_id);
CREATE INDEX IF NOT EXISTS idx_traces_type ON session_traces(trace_type);
CREATE INDEX IF NOT EXISTS idx_traces_time ON session_traces(created_at);

INSERT INTO schema_version (version, applied_at) VALUES (12, datetime('now'));
