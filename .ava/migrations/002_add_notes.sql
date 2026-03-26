-- DAL Schema v2 — Notes table
-- Migrates per-tab notes from .tab-notes.json to brain.db

CREATE TABLE IF NOT EXISTS notes (
    id          TEXT PRIMARY KEY,
    tab_key     TEXT NOT NULL,
    category    TEXT NOT NULL
                CHECK (category IN ('improvement', 'issue', 'bug', 'idea')),
    text        TEXT NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notes_tab ON notes(tab_key);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(tab_key, category);
CREATE INDEX IF NOT EXISTS idx_notes_completed ON notes(completed);

CREATE TRIGGER IF NOT EXISTS trg_notes_updated
    AFTER UPDATE ON notes
    FOR EACH ROW
BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

INSERT INTO schema_version (version, description) VALUES (2, 'Add notes table');
