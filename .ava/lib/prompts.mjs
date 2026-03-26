// prompts.mjs — Skill prompt content (loaded on demand, never bulk-injected)
import { requireDb } from "./db.mjs";

export function getPrompt(key, { contentOnly = false } = {}) {
  const db = requireDb();
  const row = db.prepare("SELECT key, content, loaded_by, version, updated_at FROM prompts WHERE key = ?").get(key);
  if (contentOnly && row) return row.content;
  return row;
}

export function setPrompt(key, content, { loadedBy = null } = {}) {
  const db = requireDb();
  db.prepare(
    `INSERT INTO prompts (key, content, loaded_by)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET content = excluded.content, loaded_by = excluded.loaded_by`
  ).run(key, content, loadedBy);
}

export function listPrompts() {
  const db = requireDb();
  return db.prepare(
    "SELECT key, loaded_by, version, length(content) as size, updated_at FROM prompts ORDER BY key"
  ).all();
}
