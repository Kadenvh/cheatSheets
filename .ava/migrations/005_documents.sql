-- DAL Schema v5 — Documents table
-- Stores prompts, plans, rendered docs, and reference content in brain.db.
-- Content is lazy-loaded (never auto-injected by session-context hook).

CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    key         TEXT NOT NULL UNIQUE,
    type        TEXT NOT NULL
                CHECK (type IN ('prompt', 'plan', 'reference', 'rendered')),
    title       TEXT,
    content     TEXT NOT NULL,
    loaded_by   TEXT,
    version     INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

CREATE TRIGGER IF NOT EXISTS trg_documents_updated
    AFTER UPDATE ON documents
    FOR EACH ROW
BEGIN
    UPDATE documents SET updated_at = datetime('now'), version = OLD.version + 1 WHERE id = NEW.id;
END;

INSERT INTO schema_version (version, description) VALUES (5, 'Documents table for prompts, plans, and rendered content');
