// plans.mjs — Design briefs, proposals, phased work plans
import { requireDb } from "./db.mjs";

export function getPlan(key, { contentOnly = false } = {}) {
  const db = requireDb();
  const row = db.prepare("SELECT key, title, content, status, created_at, updated_at FROM plans WHERE key = ?").get(key);
  if (contentOnly && row) return row.content;
  return row;
}

export function setPlan(key, content, { title = null, status = "active" } = {}) {
  const db = requireDb();
  db.prepare(
    `INSERT INTO plans (key, title, content, status)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET title = excluded.title, content = excluded.content, status = excluded.status`
  ).run(key, title, content, status);
}

export function listPlans({ status = null } = {}) {
  const db = requireDb();
  if (status) {
    return db.prepare(
      "SELECT key, title, status, length(content) as size, updated_at FROM plans WHERE status = ? ORDER BY key"
    ).all(status);
  }
  return db.prepare(
    "SELECT key, title, status, length(content) as size, updated_at FROM plans ORDER BY status, key"
  ).all();
}
