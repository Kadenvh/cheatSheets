// decisions.mjs — Decision CRUD
import { requireDb } from "./db.mjs";
import { getOpenSession } from "./sessions.mjs";

/**
 * Add a decision.
 */
export function addDecision({ title, context, chosen, rationale, rationaleLong, alternatives, component }) {
  const db = requireDb();
  const session = getOpenSession();

  const result = db.prepare(`
    INSERT INTO decisions (title, context, alternatives, chosen, rationale, rationale_long, component, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    context,
    alternatives || "[]",
    chosen,
    rationale,
    rationaleLong || null,
    component || null,
    session?.id || null
  );

  return result.lastInsertRowid;
}

/**
 * List decisions with optional filters.
 */
export function listDecisions({ component, status = "active" } = {}) {
  const db = requireDb();
  let sql = "SELECT * FROM decisions WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (component) {
    sql += " AND component = ?";
    params.push(component);
  }

  sql += " ORDER BY created_at DESC";
  return db.prepare(sql).all(...params);
}

/**
 * Supersede a decision.
 */
export function supersedeDecision(oldId, newId) {
  const db = requireDb();

  const old = db.prepare("SELECT id FROM decisions WHERE id = ?").get(oldId);
  if (!old) throw new Error(`Decision ${oldId} not found.`);

  const next = db.prepare("SELECT id FROM decisions WHERE id = ?").get(newId);
  if (!next) throw new Error(`Decision ${newId} not found.`);

  db.prepare("UPDATE decisions SET status = 'superseded', superseded_by = ? WHERE id = ?").run(
    newId,
    oldId
  );

  return oldId;
}

/**
 * Get decision counts.
 */
export function decisionCounts() {
  const db = requireDb();
  const rows = db
    .prepare("SELECT status, COUNT(*) as count FROM decisions GROUP BY status")
    .all();

  const counts = { total: 0 };
  for (const row of rows) {
    counts[row.status] = row.count;
    counts.total += row.count;
  }
  return counts;
}
