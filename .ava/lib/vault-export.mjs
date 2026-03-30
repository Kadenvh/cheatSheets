// vault-export.mjs — Generate Obsidian vault session notes from brain.db state
// Writes markdown files to the Obsidian vault for cross-project knowledge persistence.
import fs from "fs";
import path from "path";
import os from "os";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const PROJECT_DIR = path.resolve(AVA_DIR, "..");
const require = createRequire(import.meta.url);

/**
 * Resolve the Obsidian vault base path.
 * Priority: brain.db identity vault.path > env OBSIDIAN_VAULT > platform defaults.
 */
function resolveVaultBase(db) {
  // 1. Check brain.db identity
  if (db) {
    try {
      const row = db.prepare("SELECT value FROM identity WHERE key = 'vault.path'").get();
      if (row && row.value && fs.existsSync(row.value)) return row.value;
    } catch { /* identity table might not have it */ }
  }

  // 2. Check environment variable
  if (process.env.OBSIDIAN_VAULT && fs.existsSync(process.env.OBSIDIAN_VAULT)) {
    return process.env.OBSIDIAN_VAULT;
  }

  // 3. Platform defaults
  const candidates = [
    "/home/ava/Obsidian/Ava",                                    // Linux (Ava)
    path.join(os.homedir(), "Obsidian", "Ava"),                  // Linux/Mac generic
    path.join("C:", "Users", os.userInfo().username, "Obsidian", "Ava"),  // Windows
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  return null;
}

function getDb() {
  const dbPath = path.join(AVA_DIR, "brain.db");
  if (!fs.existsSync(dbPath)) return null;
  const Database = require("better-sqlite3");
  return new Database(dbPath, { readonly: true });
}

function getIdentity(db, key) {
  try {
    const row = db.prepare("SELECT value FROM identity WHERE key = ?").get(key);
    return row ? row.value : null;
  } catch { return null; }
}

/**
 * Get the project slug for vault directory naming.
 * Maps project.name to vault folder names.
 */
function getProjectSlug(db) {
  const name = getIdentity(db, "project.name");
  if (!name) return null;
  // Common mappings
  const slugMap = {
    "Prompt Engineering (PE)": "PE",
    "Prompt Engineering": "PE",
    "PE": "PE",
    "Ava_Main": "Ava_Main",
    "Project Ava": "Ava_Main",
    "McQueenyML": "McQueenyML",
    "CloudBooks": "CloudBooks",
    "seatwise": "Seatwise",
    "tradeSignal": "TradeSignal",
    "Oracle (TradeSignal)": "TradeSignal",
    "WATTS": "WATTS",
    "adze-cad": "Adze-CAD",
    "cheatSheets": "CheatSheets",
    "CheatSheets Knowledge System": "CheatSheets",
    "3D_Printing": "3D_Printing",
    "Slicer-Loop": "Slicer-Loop",
    "McQueeny Automation System": "McQueenyML",
    "adze-cad": "Adze-CAD",
  };
  // Also check brain.db for explicit vault.slug override
  const vaultSlug = getIdentity(db, "vault.slug");
  if (vaultSlug) return vaultSlug;
  return slugMap[name] || name;
}

/**
 * Determine the next session number by scanning existing session files.
 */
function getNextSessionNumber(sessionsDir) {
  if (!fs.existsSync(sessionsDir)) return 1;
  const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith(".md"));
  let max = 0;
  for (const f of files) {
    const match = f.match(/Session\s+(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return max + 1;
}

/**
 * Generate and write a session note to the Obsidian vault.
 * @param {object} opts - { summary, tags, sessionId }
 * @returns {object} { filepath, sessionNumber } or { error }
 */
export function generateSessionNote({ summary, tags, sessionId } = {}) {
  const db = getDb();
  if (!db) return { error: "No brain.db found" };

  try {
    const slug = getProjectSlug(db);
    if (!slug) return { error: "No project.name in identity" };

    const version = getIdentity(db, "project.version") || "unknown";
    const vaultBase = resolveVaultBase(db);

    if (!vaultBase) {
      return { error: "Obsidian vault not found. Set identity vault.path or env OBSIDIAN_VAULT." };
    }

    const sessionsDir = path.join(vaultBase, slug, "sessions");

    if (!fs.existsSync(path.join(vaultBase, slug))) {
      return { error: `Vault project folder not found: ${path.join(vaultBase, slug)}` };
    }

    // Ensure sessions directory exists
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    // Get session data from brain.db
    let sessionData = null;
    if (sessionId) {
      sessionData = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
    } else {
      // Get most recent completed session (has summary)
      sessionData = db.prepare(
        "SELECT * FROM sessions WHERE summary IS NOT NULL AND summary != '' ORDER BY start_time DESC LIMIT 1"
      ).get();
    }

    const sessionSummary = summary || sessionData?.summary || "No summary provided";

    // Try to extract session number from summary (e.g., "Session 109: ...")
    let sessionNumber = getNextSessionNumber(sessionsDir);
    if (sessionData?.summary) {
      const numMatch = sessionData.summary.match(/Session\s+(\d+)/i);
      if (numMatch) {
        const extracted = parseInt(numMatch[1], 10);
        // Use extracted number if the file doesn't already exist
        const testPath = path.join(sessionsDir, `${slug} — Session ${extracted}.md`);
        if (!fs.existsSync(testPath)) {
          sessionNumber = extracted;
        }
      }
    }

    // Get the end boundary for this session (next session's start_time, or now)
    let sessionEnd = null;
    if (sessionData) {
      try {
        const nextSession = db.prepare(
          "SELECT start_time FROM sessions WHERE start_time > ? ORDER BY start_time ASC LIMIT 1"
        ).get(sessionData.start_time);
        sessionEnd = nextSession ? nextSession.start_time : new Date().toISOString();
      } catch { sessionEnd = new Date().toISOString(); }
    }

    // Get decisions from this session (bounded by session timeframe)
    let decisions = [];
    if (sessionData && sessionEnd) {
      try {
        decisions = db.prepare(
          "SELECT * FROM decisions WHERE created_at >= ? AND created_at < ? ORDER BY created_at ASC"
        ).all(sessionData.start_time, sessionEnd);
      } catch { /* decisions table might differ */ }
    }

    // Get actions from this session (bounded by session timeframe)
    // Handle schema differences: v12 uses 'type', v13+ uses 'action_type'
    let actions = [];
    if (sessionData && sessionEnd) {
      // Detect column name
      let typeCol = "type";
      try {
        const cols = db.prepare("PRAGMA table_info(agent_actions)").all();
        if (cols.some(c => c.name === "action_type") && !cols.some(c => c.name === "type")) {
          typeCol = "action_type";
        }
      } catch { /* fallback to 'type' */ }
      try {
        actions = db.prepare(
          `SELECT ${typeCol} AS type, description, outcome FROM agent_actions WHERE created_at >= ? AND created_at < ? ORDER BY created_at ASC`
        ).all(sessionData.start_time, sessionEnd);
      } catch { /* actions table might differ */ }
    }

    // Build tags
    const tagList = tags
      ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()))
      : [];

    // Infer tags from actions
    const actionTypes = [...new Set(actions.map(a => a.type))];
    for (const t of actionTypes) {
      if (!tagList.includes(t)) tagList.push(t);
    }

    const date = sessionData?.start_time
      ? sessionData.start_time.split("T")[0]
      : new Date().toISOString().split("T")[0];
    const title = sessionSummary.length > 60
      ? sessionSummary.substring(0, 60).replace(/\s+\S*$/, "...")
      : sessionSummary;

    // Build frontmatter
    const frontmatter = [
      "---",
      "type: session",
      `project: ${slug.toLowerCase()}`,
      `version: ${version}`,
      `date: ${date}`,
      "status: completed",
      `tags: [${tagList.join(", ")}]`,
      "---",
    ].join("\n");

    // Build body
    const body = [];
    body.push(`# Session ${sessionNumber} — ${title}`);
    body.push("");
    body.push("## Summary");
    body.push("");
    body.push(sessionSummary);
    body.push("");

    // Actions as deliverables
    if (actions.length > 0) {
      body.push("## Key Deliverables");
      body.push("");
      for (const a of actions) {
        const icon = a.outcome === "success" ? "+" : a.outcome === "partial" ? "~" : "-";
        body.push(`- [${icon}] (${a.type}) ${a.description}`);
      }
      body.push("");
    }

    // Decisions
    if (decisions.length > 0) {
      body.push("## Decisions Made");
      body.push("");
      for (const d of decisions) {
        body.push(`### ${d.title}`);
        if (d.context) body.push(`**Context:** ${d.context}`);
        if (d.chosen) body.push(`**Chosen:** ${d.chosen}`);
        if (d.rationale) body.push(`**Rationale:** ${d.rationale}`);
        body.push("");
      }
    }

    // Related links
    body.push("## Related");
    body.push("");
    if (sessionNumber > 1) {
      body.push(`- [[${slug} — Session ${sessionNumber - 1}|Previous session]]`);
    }

    const content = frontmatter + "\n\n" + body.join("\n");
    const filename = `${slug} — Session ${sessionNumber}.md`;
    const filepath = path.join(sessionsDir, filename);

    fs.writeFileSync(filepath, content, "utf8");

    return { filepath, sessionNumber, slug, decisionsCount: decisions.length };
  } finally {
    db.close();
  }
}

/**
 * CLI handler for vault-export commands.
 */
export function handleVaultExportCommand(subcommand, flags, positional) {
  switch (subcommand) {
    case "session": {
      const summary = positional || flags.summary || null;
      const tags = flags.tags || null;
      const sessionId = flags.session || null;

      const result = generateSessionNote({ summary, tags, sessionId });

      if (result.error) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      console.log(`Session note created: ${result.filepath}`);
      console.log(`  Session #${result.sessionNumber} for ${result.slug}`);
      if (result.decisionsCount > 0) {
        console.log(`  ${result.decisionsCount} decisions included`);
      }
      break;
    }
    default:
      console.error("Usage: dal.mjs vault-export session [summary] [--tags t1,t2] [--session id]");
      process.exit(1);
  }
}
