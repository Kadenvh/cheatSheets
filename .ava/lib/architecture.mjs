// architecture.mjs — System design knowledge with scoped injection
import { requireDb } from "./db.mjs";

export function getArch(key) {
  const db = requireDb();
  return db.prepare("SELECT key, value, scope, confidence, updated_at FROM architecture WHERE key = ?").get(key);
}

export function setArch(key, value, { scope = "project", confidence = 1.0, sessionId = null } = {}) {
  const db = requireDb();
  db.prepare(
    `INSERT INTO architecture (key, value, scope, confidence, source_session_id)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       scope = excluded.scope,
       confidence = excluded.confidence,
       source_session_id = excluded.source_session_id`
  ).run(key, value, scope, confidence, sessionId);
}

export function listArch({ scope = null } = {}) {
  const db = requireDb();
  if (scope) {
    return db.prepare(
      "SELECT key, value, scope, confidence, updated_at FROM architecture WHERE scope = ? ORDER BY key"
    ).all(scope);
  }
  return db.prepare(
    "SELECT key, value, scope, confidence, updated_at FROM architecture ORDER BY scope, key"
  ).all();
}

export function removeArch(key) {
  const db = requireDb();
  return db.prepare("DELETE FROM architecture WHERE key = ?").run(key);
}
