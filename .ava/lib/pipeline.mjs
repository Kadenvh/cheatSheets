// pipeline.mjs — System self-description: skills, hooks, agents, flows, config
import { requireDb } from "./db.mjs";

export function getPipeline(key) {
  const db = requireDb();
  return db.prepare("SELECT key, value, category, updated_at FROM pipeline WHERE key = ?").get(key);
}

export function setPipeline(key, value, category) {
  const db = requireDb();
  db.prepare(
    `INSERT INTO pipeline (key, value, category)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, category = excluded.category`
  ).run(key, value, category);
}

export function listPipeline({ category = null } = {}) {
  const db = requireDb();
  if (category) {
    return db.prepare(
      "SELECT key, value, category FROM pipeline WHERE category = ? ORDER BY key"
    ).all(category);
  }
  return db.prepare("SELECT key, value, category FROM pipeline ORDER BY category, key").all();
}

export function getConfig(key) {
  const db = requireDb();
  const row = db.prepare(
    "SELECT value FROM pipeline WHERE key = ? AND category = 'config'"
  ).get(`config.${key.replace(/^config\./, "")}`);
  return row?.value || null;
}

export function getSkillsByTier(tier) {
  const db = requireDb();
  return db.prepare(
    "SELECT key, value FROM pipeline WHERE category = 'skill' AND value = ? ORDER BY key"
  ).all(tier);
}
