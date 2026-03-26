// documents.mjs — Document CRUD (prompts, plans, rendered docs, references)
// Content is lazy-loaded — never auto-injected by session-context hook.
import { requireDb } from "./db.mjs";

const VALID_TYPES = ["prompt", "plan", "reference", "rendered"];

/**
 * Get a document by key. Returns the full content.
 */
export function getDocument(key) {
  const db = requireDb();
  return db.prepare("SELECT * FROM documents WHERE key = ?").get(key) || null;
}

/**
 * Set (upsert) a document.
 */
export function setDocument(key, { type, title, content, loadedBy }) {
  const db = requireDb();
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid type: ${type}. Must be one of: ${VALID_TYPES.join(", ")}`);
  }
  const existing = db.prepare("SELECT id FROM documents WHERE key = ?").get(key);
  if (existing) {
    db.prepare(
      "UPDATE documents SET type = ?, title = ?, content = ?, loaded_by = ? WHERE key = ?"
    ).run(type, title || null, content, loadedBy || null, key);
    return "updated";
  } else {
    db.prepare(
      "INSERT INTO documents (key, type, title, content, loaded_by) VALUES (?, ?, ?, ?, ?)"
    ).run(key, type, title || null, content, loadedBy || null);
    return "inserted";
  }
}

/**
 * Delete a document by key.
 */
export function deleteDocument(key) {
  const db = requireDb();
  const result = db.prepare("DELETE FROM documents WHERE key = ?").run(key);
  return result.changes > 0;
}

/**
 * List documents, optionally filtered by type.
 * Returns key, type, title, loaded_by, version, updated_at (NOT content — too large).
 */
export function listDocuments(type) {
  const db = requireDb();
  if (type) {
    return db.prepare(
      "SELECT key, type, title, loaded_by, version, length(content) as size, updated_at FROM documents WHERE type = ? ORDER BY key"
    ).all(type);
  }
  return db.prepare(
    "SELECT key, type, title, loaded_by, version, length(content) as size, updated_at FROM documents ORDER BY type, key"
  ).all();
}

/**
 * Count documents by type.
 */
export function documentCounts() {
  const db = requireDb();
  return db.prepare(
    "SELECT type, COUNT(*) as count FROM documents GROUP BY type"
  ).all();
}
