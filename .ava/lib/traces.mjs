// traces.mjs — Session trace management (structured episodic memory)
import { getDb } from "./db.mjs";

/**
 * Add a trace to the current or specified session.
 */
export function addTrace({ sessionId, traceType, target, detail, outcome, tokensUsed }) {
  const db = getDb();
  if (!db) return null;

  // If no sessionId, find the most recent open session
  if (!sessionId) {
    const row = db.prepare("SELECT id FROM sessions WHERE end_time IS NULL ORDER BY start_time DESC LIMIT 1").get();
    sessionId = row?.id || null;
  }

  const stmt = db.prepare(`
    INSERT INTO session_traces (session_id, trace_type, target, detail, outcome, tokens_used)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(sessionId, traceType, target || null, detail || null, outcome || null, tokensUsed || null);
  return result.lastInsertRowid;
}

/**
 * List traces for a session, or recent traces across sessions.
 */
export function listTraces({ sessionId, traceType, limit = 50 } = {}) {
  const db = getDb();
  if (!db) return [];

  let sql = "SELECT * FROM session_traces WHERE 1=1";
  const params = [];

  if (sessionId) {
    sql += " AND session_id = ?";
    params.push(sessionId);
  }
  if (traceType) {
    sql += " AND trace_type = ?";
    params.push(traceType);
  }

  sql += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);

  return db.prepare(sql).all(...params);
}

/**
 * Get trace summary for a session (counts by type, error list).
 */
export function traceSummary(sessionId) {
  const db = getDb();
  if (!db) return null;

  const counts = db.prepare(`
    SELECT trace_type, COUNT(*) as count,
           SUM(CASE WHEN outcome = 'failure' THEN 1 ELSE 0 END) as failures
    FROM session_traces
    WHERE session_id = ?
    GROUP BY trace_type
  `).all(sessionId);

  const errors = db.prepare(`
    SELECT target, detail, created_at
    FROM session_traces
    WHERE session_id = ? AND outcome = 'failure'
    ORDER BY created_at
  `).all(sessionId);

  const totalTokens = db.prepare(`
    SELECT SUM(tokens_used) as total FROM session_traces WHERE session_id = ?
  `).get(sessionId);

  return { counts, errors, totalTokens: totalTokens?.total || 0 };
}

/**
 * CLI handler for traces subcommand.
 */
export function handleTraceCommand(args) {
  const sub = args[0];

  if (sub === "add") {
    const traceType = args[1];
    const detail = args.slice(2).join(" ") || null;
    const target = args.find(a => a.startsWith("--target="))?.split("=")[1] || null;
    const outcome = args.find(a => a.startsWith("--outcome="))?.split("=")[1] || null;

    if (!traceType) {
      console.error("Usage: dal.mjs trace add <type> [detail] [--target=X] [--outcome=success|failure]");
      process.exit(1);
    }

    const id = addTrace({ traceType, target, detail, outcome });
    console.log(`Trace #${id} recorded: [${traceType}] ${detail || ""}`);
    return;
  }

  if (sub === "list") {
    const sessionId = args.find(a => a.startsWith("--session="))?.split("=")[1] || null;
    const traceType = args.find(a => a.startsWith("--type="))?.split("=")[1] || null;
    const limit = parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "20");

    const traces = listTraces({ sessionId, traceType, limit });
    if (traces.length === 0) {
      console.log("No traces found.");
      return;
    }
    for (const t of traces) {
      const session = t.session_id ? t.session_id.slice(0, 8) : "none";
      const outcomeTag = t.outcome ? ` [${t.outcome}]` : "";
      console.log(`  ${t.created_at} [${session}] ${t.trace_type}: ${t.target || ""} ${t.detail || ""}${outcomeTag}`);
    }
    return;
  }

  if (sub === "summary") {
    const sessionId = args[1];
    if (!sessionId) {
      console.error("Usage: dal.mjs trace summary <session_id>");
      process.exit(1);
    }
    const summary = traceSummary(sessionId);
    if (!summary) {
      console.log("No traces for this session.");
      return;
    }
    console.log("Trace summary:");
    for (const c of summary.counts) {
      console.log(`  ${c.trace_type}: ${c.count} (${c.failures} failures)`);
    }
    if (summary.totalTokens > 0) {
      console.log(`  Total tokens: ${summary.totalTokens}`);
    }
    if (summary.errors.length > 0) {
      console.log("\nErrors:");
      for (const e of summary.errors) {
        console.log(`  ${e.created_at} ${e.target}: ${e.detail}`);
      }
    }
    return;
  }

  console.log("Usage: dal.mjs trace <add|list|summary>");
}
