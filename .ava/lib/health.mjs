// health.mjs — Health beacon generator for ecosystem reporting
// Produces JSON health reports that downstream projects emit for PE visibility.
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const PROJECT_DIR = path.resolve(AVA_DIR, "..");

/**
 * Generate a health report for the current project.
 * Gracefully degrades — produces partial report if brain.db is missing.
 * @param {object} opts - { template: template.mjs module, verify: verify.mjs module }
 * @returns {object} Health beacon JSON
 */
export function generateHealth({ template, verify } = {}) {
  const report = {
    project: null,
    host: os.hostname(),
    generated_at: new Date().toISOString(),
    template_version: null,
    schema_version: null,
    dal_version: readDalVersion(),
    verify_summary: null,
    drift: null,
    stats: null,
  };

  const db = getDbSafe();

  // Project name: identity > directory name
  report.project = readIdentity(db, "project.name") || path.basename(PROJECT_DIR);

  // Template version: VERSION file is truth, brain.db is fallback
  report.template_version = readVersionFile() || readIdentity(db, "template.version");

  // Schema version
  if (db) {
    try {
      const row = db.prepare("SELECT MAX(version) as v FROM schema_version").get();
      report.schema_version = row ? row.v : null;
    } catch { /* table might not exist */ }
  }

  // Verify summary
  if (verify && db) {
    report.verify_summary = runVerify(verify);
  }

  // Stats from brain.db
  if (db) {
    report.stats = gatherStats(db);
  }

  // Drift measurement
  if (template) {
    report.drift = measureDrift(template, db);
  }

  return report;
}

/**
 * Write health beacon to ~/.pe-health/{project}.json
 * @param {object} report - Health report from generateHealth()
 * @returns {string} Path to emitted file
 */
export function emitHealth(report) {
  const dir = path.join(os.homedir(), ".pe-health");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const safeName = report.project.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").toLowerCase();
  const filePath = path.join(dir, `${safeName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2) + "\n");
  return filePath;
}

/**
 * Pretty-print a health report to stdout.
 * @param {object} report - Health report from generateHealth()
 */
export function printHealth(report) {
  console.log(`Health: ${report.project} @ ${report.host}`);
  console.log(`  Generated:  ${report.generated_at}`);
  console.log(`  Template:   ${report.template_version || "unknown"}`);
  console.log(`  Schema:     ${report.schema_version || "unknown"}`);
  console.log(`  DAL:        ${report.dal_version || "unknown"}`);

  if (report.verify_summary) {
    const v = report.verify_summary;
    const parts = [];
    if (v.pass) parts.push(`${v.pass} pass`);
    if (v.warn) parts.push(`${v.warn} warn`);
    if (v.fail) parts.push(`${v.fail} fail`);
    console.log(`  Verify:     ${parts.join(", ")}`);
  }

  if (report.drift) {
    const d = report.drift;
    const driftStatus = (d.stale + d.missing) === 0 ? "in sync" : `${d.stale} stale, ${d.missing} missing`;
    console.log(`  Drift:      ${d.match} match, ${driftStatus}`);
  }

  if (report.stats) {
    const s = report.stats;
    console.log(`  Sessions:   ${s.sessions ?? "—"}`);
    console.log(`  Open notes: ${s.open_notes ?? "—"}`);
    const parts = [];
    if (s.actions_success) parts.push(`${s.actions_success} success`);
    if (s.actions_failure) parts.push(`${s.actions_failure} failure`);
    if (s.actions_pending) parts.push(`${s.actions_pending} pending`);
    if (s.actions_partial) parts.push(`${s.actions_partial} partial`);
    const breakdown = parts.length > 0 ? parts.join(", ") : "no data";
    console.log(`  Actions:    ${s.actions_total ?? "—"} (${breakdown})`);
    if (s.last_session) {
      console.log(`  Last session: ${s.last_session}`);
    }
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getDbSafe() {
  const dbPath = path.join(AVA_DIR, "brain.db");
  if (!fs.existsSync(dbPath)) return null;
  try {
    const { getDb } = require_db();
    return getDb();
  } catch { return null; }
}

// Use createRequire for better-sqlite3 (native module, sync access)
import { createRequire } from "module";
const require = createRequire(import.meta.url);

function require_db() {
  // Reuse db.mjs pattern but via direct require of better-sqlite3
  const dbPath = path.join(AVA_DIR, "brain.db");
  const Database = require("better-sqlite3");
  const db = new Database(dbPath, { readonly: true });
  return { getDb: () => db };
}

function readIdentity(db, key) {
  if (!db) return null;
  try {
    const row = db.prepare("SELECT value FROM identity WHERE key = ?").get(key);
    return row ? row.value : null;
  } catch { return null; }
}

function readDalVersion() {
  const dalPath = path.join(AVA_DIR, "dal.mjs");
  if (!fs.existsSync(dalPath)) return null;
  try {
    const content = fs.readFileSync(dalPath, "utf8");
    const match = content.match(/DAL_VERSION\s*=\s*"([^"]+)"/);
    return match ? match[1] : null;
  } catch { return null; }
}

function readVersionFile() {
  const versionFile = path.join(PROJECT_DIR, "template", "VERSION");
  if (fs.existsSync(versionFile)) {
    return fs.readFileSync(versionFile, "utf8").trim();
  }
  return null;
}

function runVerify(verifyModule) {
  try {
    const layers = [
      verifyModule.verifySchema,
      verifyModule.verifyIdentity,
      verifyModule.verifyArchitecture,
      verifyModule.verifyTemplates,
      verifyModule.verifyHooks,
      verifyModule.verifyLoop,
      verifyModule.verifyCrossProject,
    ];
    let pass = 0, warn = 0, fail = 0;
    for (const fn of layers) {
      if (!fn) continue;
      const result = fn();
      if (result.status === "PASS") pass++;
      else if (result.status === "WARN") warn++;
      else if (result.status === "FAIL") fail++;
    }
    return { pass, warn, fail };
  } catch { return null; }
}

function gatherStats(db) {
  const stats = {};
  try {
    stats.sessions = db.prepare("SELECT COUNT(*) as c FROM sessions").get().c;
  } catch { stats.sessions = null; }
  try {
    stats.open_notes = db.prepare("SELECT COUNT(*) as c FROM notes WHERE completed = 0").get().c;
  } catch { stats.open_notes = null; }
  try {
    const last = db.prepare("SELECT start_time FROM sessions ORDER BY start_time DESC LIMIT 1").get();
    stats.last_session = last ? last.start_time : null;
  } catch { stats.last_session = null; }
  try {
    stats.actions_total = db.prepare("SELECT COUNT(*) as c FROM agent_actions").get().c;
    stats.actions_success = db.prepare("SELECT COUNT(*) as c FROM agent_actions WHERE outcome = 'success'").get().c;
    stats.actions_failure = db.prepare("SELECT COUNT(*) as c FROM agent_actions WHERE outcome = 'failure'").get().c;
    stats.actions_partial = db.prepare("SELECT COUNT(*) as c FROM agent_actions WHERE outcome = 'partial'").get().c;
    stats.actions_pending = db.prepare("SELECT COUNT(*) as c FROM agent_actions WHERE outcome = 'pending'").get().c;
    // pe-v6 honesty layer: success_rate removed. Self-reported 100% success
    // is what you get when no one records failure, not when nothing fails.
  } catch { stats.actions_total = null; }
  return stats;
}

function measureDrift(templateModule, db) {
  try {
    let source = null;

    // Try identity first
    source = readIdentity(db, "template.source");

    // Env fallback
    if (!source) source = process.env.PE_TEMPLATE_DIR;

    // Sibling template/ fallback (PE itself)
    if (!source) {
      const sibling = path.join(PROJECT_DIR, "template");
      if (fs.existsSync(sibling)) source = sibling;
    }

    if (!source || !fs.existsSync(source)) {
      return { match: 0, stale: 0, missing: 0, source: null };
    }

    const { results } = templateModule.diff(PROJECT_DIR, { sourceDir: source });
    let match = 0, stale = 0, missing = 0;
    for (const r of results) {
      if (r.status === "MATCH") match++;
      else if (r.status === "STALE") stale++;
      else if (r.status === "MISSING") missing++;
    }
    return { match, stale, missing, source };
  } catch { return null; }
}
