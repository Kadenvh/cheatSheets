// knowledge_base.mjs — Guides, archives, visualizations, changelogs, runbooks
import { requireDb } from "./db.mjs";

export function getKb(key, { contentOnly = false } = {}) {
  const db = requireDb();
  const row = db.prepare(
    "SELECT key, title, content, category, created_at, updated_at FROM knowledge_base WHERE key = ?"
  ).get(key);
  if (contentOnly && row) return row.content;
  return row;
}

export function setKb(key, content, { title = null, category = "guide" } = {}) {
  const db = requireDb();
  db.prepare(
    `INSERT INTO knowledge_base (key, title, content, category)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       title = excluded.title, content = excluded.content, category = excluded.category`
  ).run(key, title, content, category);
}

export function listKb({ category = null } = {}) {
  const db = requireDb();
  if (category) {
    return db.prepare(
      "SELECT key, title, category, length(content) as size, updated_at FROM knowledge_base WHERE category = ? ORDER BY key"
    ).all(category);
  }
  return db.prepare(
    "SELECT key, title, category, length(content) as size, updated_at FROM knowledge_base ORDER BY category, key"
  ).all();
}

export function searchKb(query) {
  const db = requireDb();
  return db.prepare(
    `SELECT key, title, category, snippet(knowledge_base_fts, 2, '**', '**', '...', 40) as snippet
     FROM knowledge_base_fts WHERE knowledge_base_fts MATCH ? ORDER BY rank LIMIT 10`
  ).all(query);
}
