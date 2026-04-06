// agent-loop.mjs — Autonomous agent loop: actions, metrics, feedback
import { requireDb } from "./db.mjs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// DEPRECATED (pe-v6 honesty layer): self-feedback has zero information content.
// Agent grading its own work (128 "helpful" / 2 "neutral") is noise, not signal.
// Table retained for history; no new rows written. See pe-v6.md signal quality #2.
// const OUTCOME_TO_RATING = { success: "helpful", failure: "harmful", partial: "neutral" };
function insertImplicitFeedback(/* db, actionId, outcome */) { /* deprecated — noop */ }

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Record an action the agent took.
 * Returns the action ID.
 */
export function recordAction({ sessionId, actionType, target, description, outcome, outcomeDetail, noteId }) {
  const db = requireDb();
  const resolvedOutcome = outcome || "pending";
  const result = db.prepare(`
    INSERT INTO agent_actions (session_id, action_type, target, description, outcome, outcome_detail, note_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId || null, actionType, target || null, description, resolvedOutcome, outcomeDetail || null, noteId || null);
  const actionId = result.lastInsertRowid;
  if (resolvedOutcome !== "pending") {
    insertImplicitFeedback(db, actionId, resolvedOutcome);
  }
  return actionId;
}

/**
 * Update an action's outcome.
 */
export function updateActionOutcome(actionId, outcome, outcomeDetail) {
  const db = requireDb();
  const changed = db.prepare(
    "UPDATE agent_actions SET outcome = ?, outcome_detail = ? WHERE id = ?"
  ).run(outcome, outcomeDetail || null, actionId).changes > 0;
  if (changed) {
    insertImplicitFeedback(db, actionId, outcome);
  }
  return changed;
}

/**
 * List recent actions, optionally filtered by type or outcome.
 */
export function listActions({ actionType, outcome, limit } = {}) {
  const db = requireDb();
  let sql = "SELECT * FROM agent_actions WHERE 1=1";
  const params = [];
  if (actionType) { sql += " AND action_type = ?"; params.push(actionType); }
  if (outcome) { sql += " AND outcome = ?"; params.push(outcome); }
  sql += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit || 20);
  return db.prepare(sql).all(...params);
}

/**
 * Get success rate for an action type.
 */
export function actionSuccessRate(actionType) {
  const db = requireDb();
  const row = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END) as successes,
      SUM(CASE WHEN outcome = 'failure' THEN 1 ELSE 0 END) as failures
    FROM agent_actions WHERE action_type = ?
  `).get(actionType);
  if (!row || row.total === 0) return { total: 0, rate: null };
  return { total: row.total, successes: row.successes, failures: row.failures, rate: row.successes / row.total };
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

/**
 * Record a metric measurement.
 */
export function recordMetric(key, value, { context, sessionId } = {}) {
  const db = requireDb();
  db.prepare(
    "INSERT INTO agent_metrics (key, value, context, session_id) VALUES (?, ?, ?, ?)"
  ).run(key, value, context || null, sessionId || null);
}

/**
 * Get the latest value for a metric.
 */
export function latestMetric(key) {
  const db = requireDb();
  return db.prepare(
    "SELECT * FROM agent_metrics WHERE key = ? ORDER BY measured_at DESC LIMIT 1"
  ).get(key);
}

/**
 * Get metric trend (last N measurements).
 */
export function metricTrend(key, limit = 10) {
  const db = requireDb();
  return db.prepare(
    "SELECT value, context, measured_at FROM agent_metrics WHERE key = ? ORDER BY measured_at DESC LIMIT ?"
  ).all(key, limit);
}

/**
 * List all tracked metric keys with their latest values.
 */
export function listMetricKeys() {
  const db = requireDb();
  return db.prepare(`
    SELECT key, value, measured_at FROM agent_metrics
    WHERE id IN (SELECT MAX(id) FROM agent_metrics GROUP BY key)
    ORDER BY key
  `).all();
}

// ─── Feedback ────────────────────────────────────────────────────────────────

/**
 * Record feedback on an action.
 */
export function recordFeedback(actionId, { rating, source, detail }) {
  const db = requireDb();
  db.prepare(
    "INSERT INTO agent_feedback (action_id, rating, source, detail) VALUES (?, ?, ?, ?)"
  ).run(actionId, rating, source, detail || null);
}

/**
 * Get feedback summary for an action type.
 */
export function feedbackSummary(actionType) {
  const db = requireDb();
  return db.prepare(`
    SELECT f.rating, COUNT(*) as count
    FROM agent_feedback f
    JOIN agent_actions a ON f.action_id = a.id
    WHERE a.action_type = ?
    GROUP BY f.rating
  `).all(actionType);
}

/**
 * Get overall agent performance summary.
 */
export function performanceSummary() {
  const db = requireDb();
  const actions = db.prepare(`
    SELECT action_type, outcome, COUNT(*) as count
    FROM agent_actions GROUP BY action_type, outcome
  `).all();
  const feedback = db.prepare(`
    SELECT f.rating, f.source, COUNT(*) as count
    FROM agent_feedback f GROUP BY f.rating, f.source
  `).all();
  const metrics = listMetricKeys();
  return { actions, feedback, metrics };
}
