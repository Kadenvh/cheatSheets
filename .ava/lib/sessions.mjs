// sessions.mjs — Session management (start, close, list)
import { requireDb } from "./db.mjs";
import crypto from "crypto";

/**
 * Start a new session.
 * Returns the session ID.
 */
export function startSession({ id, model } = {}) {
  const db = requireDb();
  const sessionId = id || crypto.randomUUID();
  db.prepare(
    "INSERT INTO sessions (id, agent_model) VALUES (?, ?)"
  ).run(sessionId, model || null);
  return sessionId;
}

/**
 * Close the most recent open session.
 * If no open session exists, creates and closes a minimal record.
 * Returns the closed session ID.
 */
export function closeSession({
  summary,
  exitReason = "normal",
  version,
} = {}) {
  const db = requireDb();

  // Find the open session
  let session = db
    .prepare("SELECT id FROM sessions WHERE end_time IS NULL ORDER BY start_time DESC LIMIT 1")
    .get();

  if (!session) {
    // No open session — create a minimal one
    process.stderr.write("No open session found. Created minimal session record.\n");
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO sessions (id) VALUES (?)").run(id);
    session = { id };
  }

  db.prepare(`
    UPDATE sessions SET
      end_time = datetime('now'),
      exit_reason = ?,
      summary = ?,
      version_bump = ?
    WHERE id = ?
  `).run(
    exitReason,
    summary || null,
    version || null,
    session.id
  );

  return session.id;
}

/**
 * Get the current open session (if any).
 */
export function getOpenSession() {
  const db = requireDb();
  return db
    .prepare("SELECT * FROM sessions WHERE end_time IS NULL ORDER BY start_time DESC LIMIT 1")
    .get() || null;
}

/**
 * List recent sessions.
 */
export function listSessions({ limit = 10 } = {}) {
  const db = requireDb();
  return db
    .prepare("SELECT * FROM sessions ORDER BY start_time DESC LIMIT ?")
    .all(limit);
}

/**
 * Get a session by ID.
 */
export function getSession(id) {
  const db = requireDb();
  return db.prepare("SELECT * FROM sessions WHERE id = ?").get(id) || null;
}

/**
 * Count sessions by exit reason.
 */
export function sessionCounts() {
  const db = requireDb();
  const rows = db
    .prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN end_time IS NULL THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN exit_reason = 'normal' THEN 1 ELSE 0 END) as normal,
        SUM(CASE WHEN exit_reason = 'interrupted' THEN 1 ELSE 0 END) as interrupted,
        SUM(CASE WHEN exit_reason = 'crashed' THEN 1 ELSE 0 END) as crashed,
        SUM(CASE WHEN exit_reason = 'context_limit' THEN 1 ELSE 0 END) as context_limit
      FROM sessions
    `)
    .get();
  return rows;
}
