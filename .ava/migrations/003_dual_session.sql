-- DAL Schema v3 — Dual-session support
-- Adds permanence tiers, agent role tracking, and explorations table

-- Permanence column on facts: controls injection behavior and pruning lifecycle
ALTER TABLE facts ADD COLUMN permanence TEXT NOT NULL DEFAULT 'standard'
    CHECK (permanence IN ('immutable', 'persistent', 'standard', 'ephemeral'));

CREATE INDEX IF NOT EXISTS idx_facts_permanence ON facts(permanence);

-- Agent role column on sessions: tracks which cognitive mode ran the session
ALTER TABLE sessions ADD COLUMN agent_role TEXT;

-- Explorations table: the general agent's domain for open-ended proposals
CREATE TABLE IF NOT EXISTS explorations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    type        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'proposed', 'accepted', 'rejected')),
    description TEXT,
    session_id  TEXT REFERENCES sessions(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_explorations_status ON explorations(status);
CREATE INDEX IF NOT EXISTS idx_explorations_session ON explorations(session_id);

INSERT INTO schema_version (version, description) VALUES (3, 'Dual-session support: permanence tiers, agent roles, explorations');
