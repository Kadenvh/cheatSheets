-- DAL Schema v4 — Render pipeline data gaps
-- Expands notes categories (adds 'handoff') and decisions rationale_long

-- 1. Rebuild notes table with expanded category CHECK constraint
--    SQLite cannot ALTER CHECK constraints — must rebuild
CREATE TABLE notes_new (
    id          TEXT PRIMARY KEY,
    tab_key     TEXT NOT NULL,
    category    TEXT NOT NULL
                CHECK (category IN ('improvement', 'issue', 'bug', 'idea', 'handoff')),
    text        TEXT NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO notes_new SELECT * FROM notes;
DROP TABLE notes;
ALTER TABLE notes_new RENAME TO notes;

CREATE INDEX idx_notes_tab ON notes(tab_key);
CREATE INDEX idx_notes_category ON notes(tab_key, category);
CREATE INDEX idx_notes_completed ON notes(completed);

CREATE TRIGGER trg_notes_updated
    AFTER UPDATE ON notes
    FOR EACH ROW
BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- 2. Add rationale_long to decisions for full AD-N narrative rendering
ALTER TABLE decisions ADD COLUMN rationale_long TEXT;

INSERT INTO schema_version (version, description) VALUES (4, 'Render pipeline: handoff notes category, decision rationale_long');
