// handoff.mjs — Structured YAML session handoffs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HANDOFFS_DIR = path.resolve(__dirname, "..", "handoffs");
const MAX_HANDOFFS = 20;

/**
 * Generate a structured handoff YAML from the current session state.
 * Called at closeout to persist exact session state.
 */
export function generateHandoff({ sessionId, summary, filesModified = [], decisionsMade = [], blockers = [], nextActions = [], errors = [] } = {}) {
  if (!fs.existsSync(HANDOFFS_DIR)) {
    fs.mkdirSync(HANDOFFS_DIR, { recursive: true });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const timestamp = now.replace(/[:.]/g, "-").slice(0, 19);

  // Auto-collect traces if sessionId provided
  let traces = [];
  if (db && sessionId) {
    try {
      traces = db.prepare(`
        SELECT trace_type, target, detail, outcome
        FROM session_traces
        WHERE session_id = ?
        ORDER BY created_at
      `).all(sessionId);
    } catch { /* table may not exist in older schemas */ }
  }

  // Auto-collect open notes
  let openNotes = [];
  if (db) {
    try {
      openNotes = db.prepare(`
        SELECT text, category FROM notes
        WHERE completed = 0
        ORDER BY created_at DESC LIMIT 10
      `).all();
    } catch { /* */ }
  }

  // Get version
  let version = "unknown";
  if (db) {
    try {
      const row = db.prepare("SELECT value FROM identity WHERE key = 'project.version'").get();
      version = row?.value || "unknown";
    } catch { /* */ }
  }

  const handoff = {
    session_id: sessionId || "unknown",
    timestamp: now,
    version,
    summary: summary || "",
    files_modified: filesModified,
    decisions_made: decisionsMade,
    blockers,
    next_actions: nextActions,
    errors,
    traces: traces.map(t => ({
      type: t.trace_type,
      target: t.target,
      detail: t.detail,
      outcome: t.outcome,
    })),
    open_notes: openNotes.map(n => `[${n.category}] ${n.text}`.slice(0, 120)),
  };

  // Write as YAML-like format (no external dependency)
  const yaml = toYaml(handoff);
  const filename = `handoff-${timestamp}.yaml`;
  const filepath = path.join(HANDOFFS_DIR, filename);
  fs.writeFileSync(filepath, yaml);

  // Prune old handoffs
  pruneHandoffs();

  return { filepath, handoff };
}

/**
 * Load the most recent handoff for session-context injection.
 */
export function loadLatestHandoff() {
  if (!fs.existsSync(HANDOFFS_DIR)) return null;

  const files = fs.readdirSync(HANDOFFS_DIR)
    .filter(f => f.startsWith("handoff-") && f.endsWith(".yaml"))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  const content = fs.readFileSync(path.join(HANDOFFS_DIR, files[0]), "utf8");
  return { filename: files[0], content };
}

/**
 * Keep only the most recent MAX_HANDOFFS files.
 */
function pruneHandoffs() {
  const files = fs.readdirSync(HANDOFFS_DIR)
    .filter(f => f.startsWith("handoff-") && f.endsWith(".yaml"))
    .sort();

  while (files.length > MAX_HANDOFFS) {
    const oldest = files.shift();
    fs.unlinkSync(path.join(HANDOFFS_DIR, oldest));
  }
}

/**
 * Simple YAML serializer (no dependency needed for flat/1-level structures).
 */
function toYaml(obj, indent = 0) {
  const pad = "  ".repeat(indent);
  let out = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      out += `${pad}${key}: null\n`;
    } else if (typeof value === "string") {
      if (value.includes("\n") || value.length > 80) {
        out += `${pad}${key}: |\n`;
        for (const line of value.split("\n")) {
          out += `${pad}  ${line}\n`;
        }
      } else {
        out += `${pad}${key}: "${value.replace(/"/g, '\\"')}"\n`;
      }
    } else if (typeof value === "number" || typeof value === "boolean") {
      out += `${pad}${key}: ${value}\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        out += `${pad}${key}: []\n`;
      } else if (typeof value[0] === "string") {
        out += `${pad}${key}:\n`;
        for (const item of value) {
          out += `${pad}  - "${item.replace(/"/g, '\\"')}"\n`;
        }
      } else if (typeof value[0] === "object") {
        out += `${pad}${key}:\n`;
        for (const item of value) {
          const entries = Object.entries(item);
          out += `${pad}  - ${entries[0][0]}: "${String(entries[0][1] || "").replace(/"/g, '\\"')}"\n`;
          for (let i = 1; i < entries.length; i++) {
            out += `${pad}    ${entries[i][0]}: "${String(entries[i][1] || "").replace(/"/g, '\\"')}"\n`;
          }
        }
      }
    } else if (typeof value === "object") {
      out += `${pad}${key}:\n${toYaml(value, indent + 1)}`;
    }
  }
  return out;
}

/**
 * CLI handler
 */
export function handleHandoffCommand(cmdArgs) {
  const sub = cmdArgs[0];

  if (sub === "generate") {
    const summary = cmdArgs.slice(1).join(" ") || "Manual handoff";
    const { filepath } = generateHandoff({ summary });
    console.log(`Handoff written: ${filepath}`);
    return;
  }

  if (sub === "latest") {
    const latest = loadLatestHandoff();
    if (!latest) {
      console.log("No handoffs found.");
      return;
    }
    console.log(`--- ${latest.filename} ---`);
    console.log(latest.content);
    return;
  }

  if (sub === "list") {
    if (!fs.existsSync(HANDOFFS_DIR)) {
      console.log("No handoffs directory.");
      return;
    }
    const files = fs.readdirSync(HANDOFFS_DIR)
      .filter(f => f.startsWith("handoff-"))
      .sort()
      .reverse();
    console.log(`${files.length} handoffs:`);
    for (const f of files) {
      const stat = fs.statSync(path.join(HANDOFFS_DIR, f));
      console.log(`  ${f} (${(stat.size / 1024).toFixed(1)}KB)`);
    }
    return;
  }

  console.log("Usage: dal.mjs handoff <generate|latest|list>");
}
