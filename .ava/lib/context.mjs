// context.mjs — Selective context injection for session init
// v4: queries purpose-built tables instead of dumping all facts
import { requireDb } from "./db.mjs";

/**
 * Generate a compact context payload for session init.
 * Roles: "general" (default — full architecture + pipeline) or "dev" (task-focused).
 * Scope: controls which architecture entries are injected.
 */
export function generateContext({ role = "general", scope = null } = {}) {
  const db = requireDb();
  const lines = [];

  // ─── Identity (always injected, both roles) ───────────────────────────
  const identity = db.prepare("SELECT key, value FROM identity ORDER BY key").all();
  if (identity.length > 0) {
    lines.push("**Identity:**");
    for (const row of identity) {
      lines.push(`- \`${row.key}\`: ${row.value}`);
    }
    lines.push("");
  }

  // ─── Role-specific context ─────────────────────────────────────────────
  if (role === "dev") {
    return lines.join("\n") + _devContext(db, scope);
  }
  return lines.join("\n") + _generalContext(db, scope);
}

function _generalContext(db, requestedScope) {
  const lines = [];

  // Architecture — project + convention scopes always, ecosystem/infrastructure on request
  const scopes = ["project", "convention"];
  if (requestedScope === "ecosystem" || requestedScope === "full") scopes.push("ecosystem");
  if (requestedScope === "infrastructure" || requestedScope === "full") scopes.push("infrastructure");

  const placeholders = scopes.map(() => "?").join(",");
  const archRows = db.prepare(
    `SELECT key, value, scope FROM architecture WHERE scope IN (${placeholders}) ORDER BY scope, key`
  ).all(...scopes);

  if (archRows.length > 0) {
    // Group by scope for readability
    const grouped = {};
    for (const row of archRows) {
      if (!grouped[row.scope]) grouped[row.scope] = [];
      grouped[row.scope].push(row);
    }

    for (const [scopeName, rows] of Object.entries(grouped)) {
      lines.push(`**Architecture (${scopeName}, ${rows.length}):**`);
      for (const row of rows) {
        lines.push(`- \`${row.key}\`: ${row.value}`);
      }
      lines.push("");
    }
  }

  // Recent decisions
  const decisions = db.prepare(
    "SELECT title, chosen, rationale, status FROM decisions WHERE status = 'active' ORDER BY created_at DESC LIMIT 5"
  ).all();

  if (decisions.length > 0) {
    lines.push(`**Recent Decisions (${decisions.length}):**`);
    for (const d of decisions) lines.push(`- "${d.title}" — ${d.chosen} [${d.status}]`);
    lines.push("");
  }

  // Open notes (task queue)
  const notes = db.prepare(
    "SELECT id, category, text FROM notes WHERE completed = 0 ORDER BY category, created_at"
  ).all();

  if (notes.length > 0) {
    lines.push(`**Open Notes (${notes.length}):**`);
    for (const n of notes) {
      lines.push(`- [${n.category}] ${n.text}`);
    }
    lines.push("");
  }

  // Last session
  const lastSession = db.prepare(
    "SELECT start_time, summary, version_bump, exit_reason FROM sessions ORDER BY start_time DESC LIMIT 1"
  ).get();

  if (lastSession) {
    const ver = lastSession.version_bump ? ` — v${lastSession.version_bump}` : "";
    const reason = lastSession.exit_reason || "open";
    lines.push(`**Last Session:** ${lastSession.start_time}${ver} — "${lastSession.summary || "No summary"}" (${reason} exit)`);
    lines.push("");
  }

  // Learning loop summary
  lines.push(_loopSummary(db));

  return lines.join("\n");
}

function _devContext(db, requestedScope) {
  const lines = [];

  // Last session
  const lastSession = db.prepare(
    "SELECT id, start_time, end_time, exit_reason, summary, version_bump FROM sessions ORDER BY start_time DESC LIMIT 1"
  ).get();

  if (lastSession) {
    const ver = lastSession.version_bump ? ` — v${lastSession.version_bump}` : "";
    const reason = lastSession.exit_reason || "open";
    lines.push(`**Last Session:** ${lastSession.start_time}${ver} — "${lastSession.summary || "No summary"}" (${reason} exit)`);
    lines.push("");
  }

  // Interrupted session recovery
  const interrupted = db.prepare(
    `SELECT id, start_time, summary FROM sessions
     WHERE exit_reason IN ('interrupted', 'crashed') AND end_time > datetime('now', '-24 hours')
     ORDER BY end_time DESC LIMIT 1`
  ).get();

  if (interrupted) {
    lines.push("**⚠ INTERRUPTED SESSION DETECTED:**");
    lines.push(`Session ${interrupted.start_time} ended without closeout.`);
    if (interrupted.summary) lines.push(`Last known state: ${interrupted.summary}`);
    lines.push("Review and decide whether to resume or start fresh.");
    lines.push("");
  }

  // Open notes (task queue, full detail)
  const notes = db.prepare(
    "SELECT id, category, text FROM notes WHERE completed = 0 ORDER BY category, created_at"
  ).all();

  if (notes.length > 0) {
    lines.push(`**Open Notes (${notes.length}):**`);
    for (const n of notes) {
      lines.push(`- [${n.category}] ${n.text}`);
    }
    lines.push("");
  }

  // Architecture — project scope only for dev, plus convention
  const archRows = db.prepare(
    "SELECT key, value FROM architecture WHERE scope IN ('project', 'convention') ORDER BY key"
  ).all();

  if (archRows.length > 0) {
    lines.push(`**Architecture (${archRows.length}):**`);
    for (const row of archRows) {
      lines.push(`- \`${row.key}\`: ${row.value}`);
    }
    lines.push("");
  }

  // Recent decisions (3 for dev, less than general's 5)
  const decisions = db.prepare(
    "SELECT title, chosen, rationale, status FROM decisions WHERE status = 'active' ORDER BY created_at DESC LIMIT 3"
  ).all();

  if (decisions.length > 0) {
    lines.push(`**Recent Decisions (${decisions.length}):**`);
    for (const d of decisions) lines.push(`- "${d.title}" — ${d.chosen} [${d.status}]`);
    lines.push("");
  }

  // Learning loop summary
  lines.push(_loopSummary(db));

  return lines.join("\n");
}

/**
 * Generate a compact learning loop summary from agent_actions, agent_metrics, agent_feedback.
 */
function _loopSummary(db) {
  try {
    const hasLoop = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='agent_actions'"
    ).get();
    if (!hasLoop) return "";

    const lines = [];

    // Action success rates by type
    const rates = db.prepare(`
      SELECT action_type,
        COUNT(*) as total,
        SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN outcome = 'failure' THEN 1 ELSE 0 END) as fails
      FROM agent_actions GROUP BY action_type ORDER BY total DESC
    `).all();

    if (rates.length > 0) {
      lines.push("**Agent Performance (learning loop):**");
      for (const r of rates) {
        const pct = r.total > 0 ? Math.round((r.wins / r.total) * 100) : 0;
        const warn = r.fails > 0 ? ` ⚠ ${r.fails} failed` : "";
        lines.push(`- ${r.action_type}: ${r.wins}/${r.total} success (${pct}%)${warn}`);
      }
    }

    // Recent failures
    const failures = db.prepare(`
      SELECT action_type, description, outcome_detail, created_at
      FROM agent_actions WHERE outcome = 'failure'
      ORDER BY created_at DESC LIMIT 3
    `).all();

    if (failures.length > 0) {
      lines.push("");
      lines.push("**Recent Failures (learn from these):**");
      for (const f of failures) {
        const detail = f.outcome_detail ? ` — ${f.outcome_detail}` : "";
        lines.push(`- [${f.action_type}] ${f.description}${detail}`);
      }
    }

    // Key metric trends
    const metricKeys = db.prepare(
      "SELECT key, COUNT(*) as cnt FROM agent_metrics GROUP BY key HAVING cnt >= 2 ORDER BY key"
    ).all();

    if (metricKeys.length > 0) {
      const trends = [];
      for (const mk of metricKeys) {
        const vals = db.prepare(
          "SELECT value FROM agent_metrics WHERE key = ? ORDER BY measured_at DESC LIMIT 2"
        ).all(mk.key);
        if (vals.length === 2) {
          const delta = vals[0].value - vals[1].value;
          if (delta !== 0) {
            const arrow = delta > 0 ? "↑" : "↓";
            trends.push(`${mk.key}: ${vals[1].value}→${vals[0].value} ${arrow}`);
          }
        }
      }
      if (trends.length > 0) {
        lines.push("");
        lines.push("**Metric Trends:** " + trends.join(" | "));
      }
    }

    if (lines.length > 0) lines.push("");
    return lines.join("\n");
  } catch {
    return "";
  }
}
