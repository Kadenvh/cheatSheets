// session-export.mjs — Generate structured session notes in project-local sessions/
// Writes markdown files to {PROJECT_DIR}/sessions/ using a schema optimized for
// GitNexus indexing: consistent ## headers, concrete file paths, IDs as grep targets.
// Replaces the retired vault-export.mjs (Obsidian Layer 2 → retired 2026-04-11).
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const PROJECT_DIR = path.resolve(AVA_DIR, "..");
const require = createRequire(import.meta.url);

function getDb({ readonly = false } = {}) {
  const dbPath = path.join(AVA_DIR, "brain.db");
  if (!fs.existsSync(dbPath)) return null;
  const Database = require("better-sqlite3");
  return new Database(dbPath, { readonly });
}

function getIdentity(db, key) {
  try {
    const row = db.prepare("SELECT value FROM identity WHERE key = ?").get(key);
    return row ? row.value : null;
  } catch { return null; }
}

function setIdentity(db, key, value) {
  try {
    db.prepare(
      "INSERT INTO identity (key, value) VALUES (?, ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run(key, value);
    return true;
  } catch { return false; }
}

/**
 * Load the latest closed session with a non-empty summary. Used by
 * --auto-on-close mode to avoid exporting open/in-progress sessions.
 */
function loadLatestClosedWithSummary(db) {
  return db.prepare(
    "SELECT * FROM sessions WHERE end_time IS NOT NULL AND summary IS NOT NULL AND summary != '' " +
    "ORDER BY end_time DESC, start_time DESC LIMIT 1"
  ).get();
}

/**
 * Scan existing session-*.md files for frontmatter session_ids. Used to
 * avoid duplicate exports when identity.session-export.lastRun is stale or
 * missing (e.g. projects that had manual session notes pre-auto-export, or
 * a first bootstrap after this feature lands).
 */
function getExportedSessionIds(sessionsDir) {
  if (!fs.existsSync(sessionsDir)) return new Set();
  const ids = new Set();
  let files;
  try {
    files = fs.readdirSync(sessionsDir).filter(f => f.endsWith(".md"));
  } catch { return ids; }
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(sessionsDir, file), "utf8");
      const head = content.split(/\r?\n/).slice(0, 10).join("\n");
      const match = head.match(/session_id:\*\*\s*([a-zA-Z0-9-]+)/);
      if (match) ids.add(match[1]);
    } catch { /* skip unreadable files */ }
  }
  return ids;
}

/**
 * Resolve the sessions directory for the project (PE/sessions/).
 * Always project-local. No vault fallback — vault is retired.
 */
function resolveSessionsDir() {
  return path.join(PROJECT_DIR, "sessions");
}

/**
 * Determine the next session number by scanning existing session files.
 * Files named session-{N}.md or legacy "{Slug} — Session {N}.md".
 */
function getNextSessionNumber(sessionsDir) {
  if (!fs.existsSync(sessionsDir)) return 1;
  const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith(".md"));
  let max = 0;
  for (const f of files) {
    const match = f.match(/session[-\s]+(\d+)/i) || f.match(/Session\s+(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return max + 1;
}

/**
 * Load session row (by id, or most-recent-by-start_time).
 *
 * Rationale: old behavior filtered on `summary IS NOT NULL`, which silently
 * picked the PRIOR closed session when the current session hadn't been closed
 * yet. The caller is expected to either close the session first (normal
 * closeout flow) or pass --summary explicitly. Picking the most recent row
 * matches operator intent in both cases. Fix for note r2n8amy38f.
 */
function loadSession(db, sessionId) {
  if (sessionId) {
    return db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
  }
  return db.prepare(
    "SELECT * FROM sessions ORDER BY start_time DESC LIMIT 1"
  ).get();
}

/**
 * Get the end boundary for a session (next session's start, or now).
 */
function getSessionEnd(db, sessionData) {
  if (!sessionData) return new Date().toISOString();
  try {
    const next = db.prepare(
      "SELECT start_time FROM sessions WHERE start_time > ? ORDER BY start_time ASC LIMIT 1"
    ).get(sessionData.start_time);
    return next ? next.start_time : (sessionData.end_time || new Date().toISOString());
  } catch {
    return sessionData.end_time || new Date().toISOString();
  }
}

/**
 * Get decisions created during the session window.
 */
function getSessionDecisions(db, sessionData, sessionEnd) {
  if (!sessionData) return [];
  try {
    return db.prepare(
      "SELECT id, title, chosen, rationale FROM decisions WHERE created_at >= ? AND created_at < ? ORDER BY id ASC"
    ).all(sessionData.start_time, sessionEnd);
  } catch { return []; }
}

/**
 * Get files changed from session_traces (file_write type).
 */
function getSessionFilesChanged(db, sessionData, sessionEnd) {
  if (!sessionData) return [];
  try {
    const rows = db.prepare(
      `SELECT DISTINCT target, detail FROM session_traces
       WHERE trace_type = 'file_write' AND created_at >= ? AND created_at < ?
       ORDER BY created_at ASC`
    ).all(sessionData.start_time, sessionEnd);
    return rows.filter(r => r.target);
  } catch { return []; }
}

/**
 * Get notes opened/closed during the session window.
 */
function getSessionNotes(db, sessionData, sessionEnd) {
  if (!sessionData) return { opened: [], closed: [] };
  let opened = [];
  let closed = [];
  try {
    opened = db.prepare(
      "SELECT id, category, text FROM notes WHERE created_at >= ? AND created_at < ? ORDER BY id ASC"
    ).all(sessionData.start_time, sessionEnd);
  } catch { /* schema may differ */ }
  try {
    closed = db.prepare(
      "SELECT id, category, text FROM notes WHERE completed = 1 AND updated_at >= ? AND updated_at < ? ORDER BY id ASC"
    ).all(sessionData.start_time, sessionEnd);
  } catch { /* schema may differ */ }
  return { opened, closed };
}

/**
 * Get the latest handoff file path (relative to PROJECT_DIR).
 */
function getLatestHandoffRelPath() {
  const handoffDir = path.join(AVA_DIR, "handoffs");
  if (!fs.existsSync(handoffDir)) return null;
  const files = fs.readdirSync(handoffDir)
    .filter(f => f.startsWith("handoff-") && f.endsWith(".yaml"))
    .sort();
  if (files.length === 0) return null;
  return path.join(".ava", "handoffs", files[files.length - 1]);
}

/**
 * Get active plans (.md files under plans/, excluding archive/).
 */
function getActivePlansList() {
  const plansDir = path.join(PROJECT_DIR, "plans");
  if (!fs.existsSync(plansDir)) return [];
  try {
    return fs.readdirSync(plansDir)
      .filter(f => f.endsWith(".md"))
      .map(f => path.join("plans", f));
  } catch { return []; }
}

/**
 * Truncate a string to a max length, preserving word boundaries.
 */
function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.substring(0, max).replace(/\s+\S*$/, "") + "...";
}

/**
 * Generate and write a structured session note to PE/sessions/.
 * @param {object} opts - { summary, sessionId, version }
 * @returns {object} { filepath, sessionNumber } or { error }
 */
export function generateSessionNote({ summary, sessionId, version, number, autoOnClose = false } = {}) {
  // Auto-on-close mode (fired from the Stop hook after /session-closeout) needs
  // read-write access to update identity.session-export.lastRun. Manual invocations
  // also benefit from updating lastRun so the hook doesn't double-export afterward.
  const db = getDb({ readonly: false });
  if (!db) return { error: "No brain.db found" };

  try {
    const sessionsDir = resolveSessionsDir();
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    // Auto-on-close: only export the latest closed-with-summary session, and
    // only if we haven't already exported it. Silent no-op otherwise so the
    // Stop hook can fire harmlessly on every agent session end.
    let sessionData;
    if (autoOnClose) {
      sessionData = loadLatestClosedWithSummary(db);
      if (!sessionData) return { skipped: true, reason: "no closed session with summary" };
      const lastRun = getIdentity(db, "session-export.lastRun");
      if (lastRun === sessionData.id) {
        return { skipped: true, reason: "already exported", sessionId: sessionData.id };
      }
      // Belt-and-suspenders: scan existing session-*.md frontmatter for this
      // session_id. Handles the bootstrap case where lastRun is null but a
      // note for this session already exists (e.g. manual pre-feature exports).
      const existingIds = getExportedSessionIds(sessionsDir);
      if (existingIds.has(sessionData.id)) {
        setIdentity(db, "session-export.lastRun", sessionData.id);
        return { skipped: true, reason: "file already exists", sessionId: sessionData.id };
      }
    } else {
      sessionData = loadSession(db, sessionId);
    }

    if (!sessionData) {
      return { error: "No session found to export. Pass --session <id> or start a session first." };
    }

    const sessionSummary = summary || sessionData.summary || "No summary provided";
    const projectVersion = version || getIdentity(db, "project.version") || "unknown";
    const sessionEnd = getSessionEnd(db, sessionData);

    // Session number: explicit --number wins, otherwise scan existing files for max+1.
    // Old behavior regex-scanned the full summary body for /Session \d+/i, which
    // matched narrative prose ("first Session 1 under the new protocol") and wrote
    // to the wrong filename. Fix for note 5kivtz5zfvc.
    let sessionNumber;
    if (number !== undefined && number !== null && number !== "") {
      const parsed = parseInt(number, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return { error: `Invalid --number: ${number}. Must be a positive integer.` };
      }
      sessionNumber = parsed;
    } else {
      sessionNumber = getNextSessionNumber(sessionsDir);
    }

    const decisions = getSessionDecisions(db, sessionData, sessionEnd);
    const filesChanged = getSessionFilesChanged(db, sessionData, sessionEnd);
    const { opened, closed } = getSessionNotes(db, sessionData, sessionEnd);
    const handoffPath = getLatestHandoffRelPath();
    const activePlans = getActivePlansList();

    // Build title (first clause of summary, truncated)
    const titleCandidate = sessionSummary.split(/[.:;]/)[0].trim();
    const title = truncate(titleCandidate, 60) || `Session ${sessionNumber}`;

    // Build the structured body
    const lines = [];
    lines.push(`# Session ${sessionNumber} — ${title}`);
    lines.push("");

    // Metadata header (single line, grep-friendly)
    const date = (sessionData.start_time || new Date().toISOString()).split("T")[0];
    const exitReason = sessionData.exit_reason || "normal";
    lines.push(`**date:** ${date}  **version:** ${projectVersion}  **session_id:** ${sessionData.id}  **exit:** ${exitReason}`);
    lines.push("");

    // Summary
    lines.push("## Summary");
    lines.push("");
    lines.push(sessionSummary);
    lines.push("");

    // Decisions
    lines.push("## Decisions");
    lines.push("");
    if (decisions.length === 0) {
      lines.push("_none_");
    } else {
      for (const d of decisions) {
        const rationale = truncate(d.rationale || d.chosen || "", 120);
        lines.push(`- #${d.id}: ${d.title}${rationale ? " — " + rationale : ""}`);
      }
    }
    lines.push("");

    // Files Changed
    lines.push("## Files Changed");
    lines.push("");
    if (filesChanged.length === 0) {
      lines.push("_none recorded_");
    } else {
      for (const f of filesChanged) {
        const detail = f.detail ? ` — ${truncate(f.detail, 80)}` : "";
        lines.push(`- \`${f.target}\`${detail}`);
      }
    }
    lines.push("");

    // Notes Opened / Closed
    lines.push("## Notes Opened / Closed");
    lines.push("");
    if (opened.length === 0 && closed.length === 0) {
      lines.push("_none_");
    } else {
      for (const n of opened) {
        lines.push(`- opened ${n.id} [${n.category}]: ${truncate(n.text, 100)}`);
      }
      for (const n of closed) {
        lines.push(`- closed ${n.id} [${n.category}]: ${truncate(n.text, 100)}`);
      }
    }
    lines.push("");

    // Continuity → Next Session (pull from handoff if available)
    lines.push("## Continuity → Next Session");
    lines.push("");
    lines.push("_see latest handoff for structured next actions_");
    lines.push("");

    // Cross-Refs
    lines.push("## Cross-Refs");
    lines.push("");
    if (activePlans.length > 0) {
      for (const p of activePlans) lines.push(`- \`${p}\``);
    }
    if (decisions.length > 0) {
      const ids = decisions.map(d => `#${d.id}`).join(", ");
      lines.push(`- brain.db:decisions ${ids}`);
    }
    if (handoffPath) {
      lines.push(`- \`${handoffPath}\``);
    }
    lines.push("");

    const content = lines.join("\n");
    const filename = `session-${sessionNumber}.md`;
    const filepath = path.join(sessionsDir, filename);

    fs.writeFileSync(filepath, content, "utf8");

    // Track lastRun so the Stop hook (and any future tooling) can tell what's
    // already been exported. Both manual and auto-on-close paths update this.
    setIdentity(db, "session-export.lastRun", sessionData.id);

    return {
      filepath,
      sessionNumber,
      sessionId: sessionData.id,
      decisionsCount: decisions.length,
      filesChangedCount: filesChanged.length,
      notesOpenedCount: opened.length,
      notesClosedCount: closed.length,
    };
  } finally {
    db.close();
  }
}

/**
 * CLI handler for session-export commands.
 */
export function handleSessionExportCommand(subcommand, flags, positional) {
  switch (subcommand) {
    case "session": {
      const summary = positional || flags.summary || null;
      const sessionId = flags.session || null;
      const version = flags.version || null;
      const number = flags.number || null;
      const autoOnClose = flags["auto-on-close"] === "true" || flags.autoOnClose === "true";

      const result = generateSessionNote({ summary, sessionId, version, number, autoOnClose });

      if (result.error) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      if (result.skipped) {
        // Silent no-op so the Stop hook doesn't spam output on every agent turn.
        process.exit(0);
      }

      console.log(`Session note created: ${result.filepath}`);
      console.log(`  Session #${result.sessionNumber}`);
      console.log(`  ${result.decisionsCount} decisions, ${result.filesChangedCount} files changed`);
      console.log(`  ${result.notesOpenedCount} notes opened, ${result.notesClosedCount} notes closed`);
      break;
    }
    default:
      console.error("Usage: dal.mjs session-export session [summary] [--session <id>] [--version <v>] [--number <n>] [--auto-on-close]");
      process.exit(1);
  }
}
