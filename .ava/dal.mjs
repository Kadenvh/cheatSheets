#!/usr/bin/env node
// dal.mjs v5.1.0 — Durable Agentic Layer CLI (Active Memory + Session Continuity)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAL_VERSION = "5.1.0";

// Parse args: node dal.mjs <command> <subcommand> [positional] [--flags]
const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

function parseFlags(startIdx = 2) {
  const flags = {};
  let positional = null;
  for (let i = startIdx; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "true";
      flags[key] = val;
      if (val !== "true") i++;
    } else if (!positional) {
      positional = args[i];
    }
  }
  return { flags, positional };
}

async function main() {
  try {
    switch (command) {
      case "bootstrap":
        return await cmdBootstrap();
      case "session":
        return await cmdSession();
      case "identity":
        return await cmdIdentity();
      case "arch":
        return await cmdArch();
      case "decision":
        return await cmdDecision();
      case "note":
        return await cmdNote();
      // v5: prompt, plan, kb, pipeline removed (clean category pattern)
      case "action":
        return await cmdAction();
      case "metric":
        return await cmdMetric();
      case "feedback":
        return await cmdFeedback();
      case "loop":
        return await cmdLoop();
      case "context":
        return await cmdContext();
      case "verify":
        return await cmdVerify();
      case "status":
        return await cmdStatus();
      case "version":
        return await cmdVersion();
      case "migrate":
        return await cmdMigrate();
      case "trace":
        return await cmdTrace();
      case "handoff":
        return await cmdHandoff();
      case "template":
        return await cmdTemplate();
      case "health":
        return await cmdHealth();
      case "vault":
        return await cmdVault();
      case "vault-export":
        return await cmdVaultExport();
      case "ecosystem":
        return await cmdEcosystem();
      case "logs":
        return await cmdLogs();
      default:
        printUsage();
        process.exit(command ? 1 : 0);
    }
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function cmdBootstrap() {
  const { getDb, schemaVersion } = await import("./lib/db.mjs");
  const db = getDb({ create: true });
  const sv = schemaVersion();
  console.log(`Created .ava/brain.db (schema v${sv})`);

  // Insert delimiters if --delimiters flag is set
  const { flags } = parseFlags(1);
  if (flags.delimiters === "true") {
    const { bootstrapDelimiters } = await import("./lib/renderer.mjs");
    const results = bootstrapDelimiters();
    for (const r of results) {
      if (r.inserted.length > 0) {
        console.log(`Inserted delimiters into ${r.file}: ${r.inserted.join(", ")}`);
      } else if (r.error) {
        console.log(`  ${r.file}: ${r.error}`);
      } else {
        console.log(`  ${r.file}: all delimiters already present`);
      }
    }
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────

async function cmdSession() {
  const { startSession, closeSession, listSessions } = await import("./lib/sessions.mjs");
  const { flags } = parseFlags(2);

  switch (subcommand) {
    case "start": {
      const id = startSession({ id: flags.id, model: flags.model });
      console.log(id);
      break;
    }
    case "close": {
      const id = closeSession({
        summary: flags.summary,
        exitReason: flags["exit-reason"],
        version: flags.version,
      });
      console.log(`Session closed: ${id}`);
      break;
    }
    case "list": {
      const sessions = listSessions({ limit: parseInt(flags.limit || "10", 10) });
      if (sessions.length === 0) {
        console.log("No sessions found.");
        return;
      }
      console.log(
        padRight("ID", 38) +
          padRight("Start", 22) +
          padRight("Exit", 14) +
          "Summary"
      );
      for (const s of sessions) {
        const summary = s.summary ? s.summary.slice(0, 60) : "-";
        console.log(
          padRight(s.id.slice(0, 36), 38) +
            padRight(s.start_time || "-", 22) +
            padRight(s.exit_reason || "open", 14) +
            summary
        );
      }
      break;
    }
    default:
      console.log("Usage: dal.mjs session <start|close|list> [--flags]");
      process.exit(1);
  }
}

// ─── Identity ─────────────────────────────────────────────────────────────────

async function cmdIdentity() {
  const { getIdentity, setIdentity, listIdentity } = await import("./lib/identity.mjs");
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "set": {
      const key = positional;
      if (!key || !flags.value) {
        console.log("Usage: dal.mjs identity set <key> --value <value>");
        process.exit(1);
      }
      setIdentity(key, flags.value);
      console.log(`Identity set: ${key}`);
      break;
    }
    case "get": {
      const key = positional;
      if (!key) { console.log("Usage: dal.mjs identity get <key>"); process.exit(1); }
      const row = getIdentity(key);
      if (!row) { console.log(`Identity "${key}" not found.`); process.exit(1); }
      console.log(row.value);
      break;
    }
    case "list": {
      const rows = listIdentity();
      if (rows.length === 0) { console.log("No identity entries."); return; }
      for (const r of rows) {
        console.log(`  ${padRight(r.key, 24)} ${r.value}`);
      }
      break;
    }
    default:
      console.log("Usage: dal.mjs identity <set|get|list>");
      process.exit(1);
  }
}

// ─── Architecture ─────────────────────────────────────────────────────────────

async function cmdArch() {
  const { getArch, setArch, listArch, removeArch } = await import("./lib/architecture.mjs");
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "set": {
      const key = positional;
      if (!key || !flags.value) {
        console.log("Usage: dal.mjs arch set <key> --value <value> [--scope project|ecosystem|infrastructure|convention] [--confidence N]");
        process.exit(1);
      }
      setArch(key, flags.value, {
        scope: flags.scope,
        confidence: parseFloat(flags.confidence || "1.0"),
      });
      console.log(`Architecture set: ${key} (${flags.scope || "project"})`);
      break;
    }
    case "get": {
      const key = positional;
      if (!key) { console.log("Usage: dal.mjs arch get <key>"); process.exit(1); }
      const row = getArch(key);
      if (!row) { console.log(`Architecture "${key}" not found.`); process.exit(1); }
      console.log(`${row.key} [${row.scope}] (${row.confidence}): ${row.value}`);
      break;
    }
    case "list": {
      const rows = listArch({ scope: flags.scope });
      if (rows.length === 0) { console.log("No architecture entries."); return; }
      console.log(
        padRight("Key", 36) + padRight("Scope", 16) + padRight("Conf", 6) + "Value"
      );
      for (const r of rows) {
        console.log(
          padRight(r.key.slice(0, 34), 36) +
            padRight(r.scope, 16) +
            padRight(String(r.confidence), 6) +
            r.value.slice(0, 80)
        );
      }
      break;
    }
    case "remove": {
      const key = positional;
      if (!key) { console.log("Usage: dal.mjs arch remove <key>"); process.exit(1); }
      removeArch(key);
      console.log(`Architecture removed: ${key}`);
      break;
    }
    default:
      console.log("Usage: dal.mjs arch <set|get|list|remove> [--scope S] [--confidence N]");
      process.exit(1);
  }
}

// ─── Decision ─────────────────────────────────────────────────────────────────

async function cmdDecision() {
  const { addDecision, listDecisions, supersedeDecision } = await import(
    "./lib/decisions.mjs"
  );
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "add": {
      if (!flags.title || !flags.context || !flags.chosen || !flags.rationale) {
        console.log(
          "Usage: dal.mjs decision add --title T --context C --chosen O --rationale R [--rationale-long RL] [--alternatives JSON] [--component C]"
        );
        process.exit(1);
      }
      const id = addDecision({
        title: flags.title,
        context: flags.context,
        chosen: flags.chosen,
        rationale: flags.rationale,
        rationaleLong: flags["rationale-long"],
        alternatives: flags.alternatives,
        component: flags.component,
      });
      console.log(`Decision added: #${id}`);
      break;
    }
    case "list": {
      const format = flags.format || "table";
      const decisions = listDecisions({
        component: flags.component,
        status: flags.status || "active",
      });
      if (format === "json") {
        console.log(JSON.stringify(decisions, null, 2));
      } else {
        if (decisions.length === 0) {
          console.log("No decisions found.");
          return;
        }
        console.log(
          padRight("ID", 6) +
            padRight("Status", 12) +
            padRight("Component", 14) +
            padRight("Chosen", 30) +
            "Title"
        );
        for (const d of decisions) {
          console.log(
            padRight(String(d.id), 6) +
              padRight(d.status, 12) +
              padRight(d.component || "-", 14) +
              padRight(d.chosen.slice(0, 28), 30) +
              d.title.slice(0, 50)
          );
        }
      }
      break;
    }
    case "supersede": {
      const oldId = positional ? parseInt(positional, 10) : null;
      const newId = flags.by ? parseInt(flags.by, 10) : null;
      if (!oldId || !newId) {
        console.log("Usage: dal.mjs decision supersede <id> --by <new-id>");
        process.exit(1);
      }
      supersedeDecision(oldId, newId);
      console.log(`Decision #${oldId} superseded by #${newId}`);
      break;
    }
    default:
      console.log("Usage: dal.mjs decision <add|list|supersede> [--flags]");
      process.exit(1);
  }
}

// ─── Note ────────────────────────────────────────────────────────────────────

async function cmdNote() {
  const { requireDb } = await import("./lib/db.mjs");
  const db = requireDb();
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "list": {
      const category = flags.category;
      let notes;
      if (category) {
        notes = db.prepare("SELECT id, category, text, completed FROM notes WHERE category = ? ORDER BY completed, created_at").all(category);
      } else {
        notes = db.prepare("SELECT id, category, text, completed FROM notes WHERE completed = 0 ORDER BY category, created_at").all();
      }
      if (notes.length === 0) { console.log("No open notes."); return; }
      for (const n of notes) {
        const status = n.completed ? "✓" : "○";
        console.log(`  ${status} ${padRight(n.id.slice(0, 12), 14)} [${n.category}] ${n.text.slice(0, 90)}`);
      }
      break;
    }
    case "add": {
      const category = flags.category || "improvement";
      const text = positional;
      if (!text) {
        console.log("Usage: dal.mjs note add \"text\" [--category C]");
        console.log("Categories: improvement, issue, bug, idea, handoff, feedback");
        process.exit(1);
      }
      const id = Math.random().toString(36).slice(2, 15);
      db.prepare("INSERT INTO notes (id, category, text) VALUES (?, ?, ?)").run(id, category, text);
      console.log(`Note added: [${category}] ${text.slice(0, 80)}`);
      break;
    }
    case "complete": {
      const id = positional;
      if (!id) { console.log("Usage: dal.mjs note complete <id>"); process.exit(1); }
      const result = db.prepare("UPDATE notes SET completed = 1 WHERE id = ? OR id LIKE ?").run(id, `${id}%`);
      console.log(result.changes > 0 ? `Note completed.` : `Note not found.`);
      break;
    }
    case "remove": {
      const id = positional;
      if (!id) { console.log("Usage: dal.mjs note remove <id>"); process.exit(1); }
      const result = db.prepare("DELETE FROM notes WHERE id = ? OR id LIKE ?").run(id, `${id}%`);
      console.log(result.changes > 0 ? `Note removed.` : `Note not found.`);
      break;
    }
    case "counts": {
      const rows = db.prepare(
        "SELECT category, SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as open, COUNT(*) as total FROM notes GROUP BY category ORDER BY category"
      ).all();
      if (rows.length === 0) { console.log("No notes."); return; }
      for (const r of rows) {
        console.log(`  ${padRight(r.category, 16)} ${r.open} open / ${r.total} total`);
      }
      break;
    }
    default:
      console.log("Usage: dal.mjs note <list|add|complete|remove|counts> [--category C]");
      process.exit(1);
  }
}

// ─── Agent Loop ──────────────────────────────────────────────────────────────

async function cmdAction() {
  const { recordAction, updateActionOutcome, listActions, actionSuccessRate } = await import("./lib/agent-loop.mjs");
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "record": {
      const desc = positional;
      if (!desc || !flags.type) {
        console.log("Usage: dal.mjs action record \"description\" --type <type> [--target T] [--outcome success|failure|partial|pending] [--note-id N]");
        process.exit(1);
      }
      const id = recordAction({
        actionType: flags.type,
        target: flags.target,
        description: desc,
        outcome: flags.outcome,
        outcomeDetail: flags.detail,
        noteId: flags["note-id"],
      });
      console.log(`Action #${id} recorded: [${flags.type}] ${desc.slice(0, 80)}`);
      break;
    }
    case "update": {
      const id = positional;
      if (!id || !flags.outcome) {
        console.log("Usage: dal.mjs action update <id> --outcome success|failure|partial [--detail D]");
        process.exit(1);
      }
      const ok = updateActionOutcome(parseInt(id), flags.outcome, flags.detail);
      console.log(ok ? `Action #${id} → ${flags.outcome}` : `Action #${id} not found.`);
      break;
    }
    case "list": {
      const actions = listActions({ actionType: flags.type, outcome: flags.outcome, limit: parseInt(flags.limit) || 20 });
      if (actions.length === 0) { console.log("No actions."); return; }
      for (const a of actions) {
        console.log(`  #${a.id} [${a.action_type}] ${a.outcome || "pending"} — ${a.description.slice(0, 70)}`);
      }
      break;
    }
    case "rate": {
      const type = positional;
      if (!type) { console.log("Usage: dal.mjs action rate <action_type>"); process.exit(1); }
      const { total, rate, successes, failures } = actionSuccessRate(type);
      if (total === 0) { console.log(`No actions of type "${type}".`); return; }
      console.log(`${type}: ${successes}/${total} success (${Math.round(rate * 100)}%), ${failures} failures`);
      break;
    }
    default:
      console.log("Usage: dal.mjs action <record|update|list|rate>");
      process.exit(1);
  }
}

async function cmdMetric() {
  const { recordMetric, latestMetric, metricTrend, listMetricKeys } = await import("./lib/agent-loop.mjs");
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "record": {
      const key = positional;
      const value = parseFloat(flags.value);
      if (!key || isNaN(value)) {
        console.log("Usage: dal.mjs metric record <key> --value <number> [--context C]");
        process.exit(1);
      }
      recordMetric(key, value, { context: flags.context });
      console.log(`Metric recorded: ${key} = ${value}`);
      break;
    }
    case "latest": {
      const key = positional;
      if (!key) { console.log("Usage: dal.mjs metric latest <key>"); process.exit(1); }
      const m = latestMetric(key);
      if (!m) { console.log(`No measurements for "${key}".`); return; }
      console.log(`${key} = ${m.value} (${m.measured_at})`);
      break;
    }
    case "trend": {
      const key = positional;
      if (!key) { console.log("Usage: dal.mjs metric trend <key> [--limit N]"); process.exit(1); }
      const trend = metricTrend(key, parseInt(flags.limit) || 10);
      if (trend.length === 0) { console.log(`No measurements for "${key}".`); return; }
      for (const m of trend.reverse()) {
        console.log(`  ${m.measured_at}  ${m.value}${m.context ? "  (" + m.context + ")" : ""}`);
      }
      break;
    }
    case "list": {
      const keys = listMetricKeys();
      if (keys.length === 0) { console.log("No metrics tracked."); return; }
      for (const m of keys) {
        console.log(`  ${padRight(m.key, 30)} ${m.value}  (${m.measured_at})`);
      }
      break;
    }
    default:
      console.log("Usage: dal.mjs metric <record|latest|trend|list>");
      process.exit(1);
  }
}

async function cmdFeedback() {
  const { recordFeedback, feedbackSummary } = await import("./lib/agent-loop.mjs");
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "record": {
      const actionId = parseInt(positional);
      if (!actionId || !flags.rating || !flags.source) {
        console.log("Usage: dal.mjs feedback record <action_id> --rating helpful|neutral|harmful --source human|metric|self [--detail D]");
        process.exit(1);
      }
      recordFeedback(actionId, { rating: flags.rating, source: flags.source, detail: flags.detail });
      console.log(`Feedback recorded: action #${actionId} → ${flags.rating} (${flags.source})`);
      break;
    }
    case "summary": {
      const type = positional;
      if (!type) { console.log("Usage: dal.mjs feedback summary <action_type>"); process.exit(1); }
      const rows = feedbackSummary(type);
      if (rows.length === 0) { console.log(`No feedback for "${type}".`); return; }
      for (const r of rows) {
        console.log(`  ${padRight(r.rating, 10)} ${r.count}`);
      }
      break;
    }
    default:
      console.log("Usage: dal.mjs feedback <record|summary>");
      process.exit(1);
  }
}

async function cmdLoop() {
  const { performanceSummary } = await import("./lib/agent-loop.mjs");
  // `loop summary` — overall agent performance
  if (subcommand === "summary" || !subcommand) {
    const { actions, feedback, metrics } = performanceSummary();
    console.log("Agent Performance Summary");
    console.log("─".repeat(40));
    if (actions.length > 0) {
      console.log("\nActions:");
      for (const a of actions) {
        console.log(`  ${padRight(a.action_type, 20)} ${padRight(a.outcome || "pending", 10)} ${a.count}`);
      }
    }
    if (feedback.length > 0) {
      console.log("\nFeedback:");
      for (const f of feedback) {
        console.log(`  ${padRight(f.rating, 10)} ${padRight(f.source, 8)} ${f.count}`);
      }
    }
    if (metrics.length > 0) {
      console.log("\nLatest Metrics:");
      for (const m of metrics) {
        console.log(`  ${padRight(m.key, 30)} ${m.value}`);
      }
    }
    if (actions.length === 0 && feedback.length === 0 && metrics.length === 0) {
      console.log("\nNo agent loop data yet. Start with:");
      console.log("  dal.mjs action record \"description\" --type <type>");
      console.log("  dal.mjs metric record <key> --value <number>");
    }
  } else {
    console.log("Usage: dal.mjs loop [summary]");
    process.exit(1);
  }
}

// ─── Verify ──────────────────────────────────────────────────────────────────

async function cmdVerify() {
  const { runAll } = await import("./lib/verify.mjs");
  const { flags } = parseFlags(1);
  const layer = flags.layer !== undefined ? parseInt(flags.layer) : undefined;
  const json = flags.json === "true";

  const results = runAll({ layer });

  if (json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log(`\nCross-Verification Report (${new Date().toISOString().slice(0, 10)})`);
  console.log("═".repeat(55));

  let passes = 0, warns = 0, fails = 0;

  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : r.status === "WARN" ? "⚠" : "✗";
    const pad = ".".repeat(Math.max(1, 40 - r.name.length));
    console.log(`\n${icon} Layer ${r.layer}: ${r.name} ${pad} ${r.status}`);

    for (const d of r.details) {
      const dIcon = d.status === "PASS" ? "  ✓" : d.status === "WARN" ? "  ⚠" : "  ✗";
      console.log(`${dIcon} ${d.msg}`);
    }

    if (r.status === "PASS") passes++;
    else if (r.status === "WARN") warns++;
    else fails++;
  }

  console.log(`\n${"═".repeat(55)}`);
  console.log(`Overall: ${passes} PASS, ${warns} WARN, ${fails} FAIL`);

  if (fails > 0) process.exit(1);
}

// ─── Context ──────────────────────────────────────────────────────────────────

async function cmdContext() {
  const { generateContext } = await import("./lib/context.mjs");
  const { flags } = parseFlags(1);
  const role = flags.role || "general";
  const scope = flags.scope || null;
  console.log(generateContext({ role, scope }));
}

// ─── Status ───────────────────────────────────────────────────────────────────

async function cmdStatus() {
  const { integrityCheck, schemaVersion, dbSize, requireDb } = await import("./lib/db.mjs");
  const { sessionCounts } = await import("./lib/sessions.mjs");
  const { decisionCounts } = await import("./lib/decisions.mjs");

  const db = requireDb();

  const integrity = integrityCheck();
  const sv = schemaVersion();
  const size = dbSize();
  const sizeKB = Math.round(size / 1024);

  console.log("DAL Status (brain.db)");
  console.log(`  Schema version: ${sv}`);
  console.log(`  DB size: ${sizeKB} KB`);
  console.log(`  Integrity: ${integrity.ok ? "ok" : `FAILED — "${integrity.result}"`}`);

  if (!integrity.ok) {
    console.log("");
    console.log("  ⚠ Database corruption detected. Restore from most recent backup:");
    console.log("    cp .ava/brain.db.bak-<timestamp> .ava/brain.db");
    return;
  }

  console.log("");

  // Identity
  const idCount = db.prepare("SELECT COUNT(*) as c FROM identity").get().c;
  console.log(`  Identity: ${idCount} entries`);

  // Architecture
  const archRows = db.prepare("SELECT scope, COUNT(*) as c FROM architecture GROUP BY scope ORDER BY scope").all();
  const archTotal = archRows.reduce((s, r) => s + r.c, 0);
  const archParts = archRows.map(r => `${r.c} ${r.scope}`).join(", ");
  console.log(`  Architecture: ${archTotal} entries${archParts ? ` (${archParts})` : ""}`);

  // Sessions
  const sc = sessionCounts();
  const sParts = [];
  if (sc.open > 0) sParts.push(`${sc.open} open`);
  if (sc.normal > 0) sParts.push(`${sc.normal} normal`);
  if (sc.interrupted > 0) sParts.push(`${sc.interrupted} interrupted`);
  console.log(`  Sessions: ${sc.total} total${sParts.length ? ` (${sParts.join(", ")})` : ""}`);

  // Decisions
  const dc = decisionCounts();
  const dParts = [];
  for (const [k, v] of Object.entries(dc)) {
    if (k !== "total" && v > 0) dParts.push(`${v} ${k}`);
  }
  console.log(`  Decisions: ${dc.total} total${dParts.length ? ` (${dParts.join(", ")})` : ""}`);

  // Notes
  const noteOpen = db.prepare("SELECT COUNT(*) as c FROM notes WHERE completed = 0").get().c;
  const noteTotal = db.prepare("SELECT COUNT(*) as c FROM notes").get().c;
  console.log(`  Notes: ${noteOpen} open / ${noteTotal} total`);

  // Loop
  const actionCount = db.prepare("SELECT COUNT(*) as c FROM agent_actions").get().c;
  const metricCount = db.prepare("SELECT COUNT(*) as c FROM agent_metrics").get().c;
  console.log(`  Loop: ${actionCount} actions, ${metricCount} metrics`);
}

async function cmdVersion() {
  const dbExists = fs.existsSync(path.join(__dirname, "brain.db"));
  let sv = "unknown";
  if (dbExists) {
    try {
      const { schemaVersion } = await import("./lib/db.mjs");
      sv = schemaVersion();
    } catch {
      sv = "error";
    }
  }
  console.log(
    `dal.mjs v${DAL_VERSION} | schema v${sv} | brain.db exists: ${dbExists ? "yes" : "no"}`
  );
}

async function cmdMigrate() {
  const { getDb, schemaVersion } = await import("./lib/db.mjs");
  const db = getDb({ create: false });
  if (!db) {
    console.log("No brain.db found. Run 'dal.mjs bootstrap' first.");
    process.exit(1);
  }
  console.log(`Schema version: ${schemaVersion()}`);
  console.log("Migrations up to date.");
}

// ─── Template ────────────────────────────────────────────────────────────────

async function cmdTemplate() {
  const { manifest, diff, sync, pull } = await import("./lib/template.mjs");
  const { flags, positional } = parseFlags(2);
  const json = flags.json === "true";

  switch (subcommand) {
    case "manifest": {
      const entries = manifest();
      if (json) {
        console.log(JSON.stringify(entries, null, 2));
      } else {
        const cats = {};
        for (const e of entries) {
          (cats[e.category] ??= []).push(e);
        }
        for (const [cat, items] of Object.entries(cats).sort()) {
          console.log(`\n${cat} (${items.length}):`);
          for (const e of items) {
            console.log(`  ${e.checksum}  ${e.relativePath}`);
          }
        }
        console.log(`\n${entries.length} files total`);
      }
      break;
    }
    case "diff": {
      if (!positional) {
        console.error("Usage: dal.mjs template diff <project-path>");
        process.exit(1);
      }
      const { esm, results } = diff(positional);
      if (json) {
        console.log(JSON.stringify({ esm, results }, null, 2));
      } else {
        if (esm) console.log("(ESM project — hooks mapped to .cjs)\n");
        const missing = results.filter(r => r.status === "MISSING");
        const stale = results.filter(r => r.status === "STALE");
        const match = results.filter(r => r.status === "MATCH");
        const extra = results.filter(r => r.status === "EXTRA");
        if (missing.length > 0) {
          console.log(`MISSING (${missing.length}):`);
          for (const r of missing) console.log(`  ✗ ${r.mappedPath}`);
        }
        if (stale.length > 0) {
          console.log(`STALE (${stale.length}):`);
          for (const r of stale) console.log(`  ⚠ ${r.mappedPath}`);
        }
        if (extra.length > 0) {
          console.log(`EXTRA (${extra.length}) — custom, not in template:`);
          for (const r of extra) console.log(`  + ${r.mappedPath}`);
        }
        console.log(`\n${match.length} MATCH, ${missing.length} MISSING, ${stale.length} STALE, ${extra.length} EXTRA`);
      }
      break;
    }
    case "sync": {
      if (!positional) {
        console.error("Usage: dal.mjs template sync <project-path> [--dal] [--prune] [--dry-run]");
        process.exit(1);
      }
      const dryRunSync = flags["dry-run"] === "true";
      const pruneSync = flags.prune === "true";
      const { esm, actions } = sync(positional, { dal: flags.dal === "true", prune: pruneSync, dryRun: dryRunSync });

      if (dryRunSync) console.log("(dry run — no files changed)\n");

      if (actions.length === 0) {
        console.log("Already in sync — nothing to do.");
      } else {
        if (esm) console.log("(ESM project — hooks copied as .cjs)\n");
        for (const a of actions) {
          const icon = a.action === "added" ? "+" : a.action === "pruned" ? "✗" : "↻";
          console.log(`  ${icon} ${a.path} (${a.category})`);
        }
        const synced = actions.filter(a => a.action !== "pruned").length;
        const pruned = actions.filter(a => a.action === "pruned").length;
        const parts = [];
        if (synced > 0) parts.push(`${synced} synced`);
        if (pruned > 0) parts.push(`${pruned} pruned`);
        console.log(`\n${parts.join(", ")}.`);
      }
      break;
    }
    case "pull": {
      // Resolve source: --source flag > identity.template.source > env > error
      let source = flags.source || null;

      if (!source) {
        try {
          const { getIdentity } = await import("./lib/identity.mjs");
          const row = getIdentity("template.source");
          if (row) source = row.value;
        } catch {
          // No brain.db or identity table — that's fine, check env
        }
      }

      if (!source && process.env.PE_TEMPLATE_DIR) {
        source = process.env.PE_TEMPLATE_DIR;
      }

      if (!source) {
        console.error("No template source configured.");
        console.error("Set one with:  dal.mjs identity set template.source /path/to/template");
        console.error("Or pass:       dal.mjs template pull --source /path/to/template");
        process.exit(1);
      }

      const dryRun = flags["dry-run"] === "true";
      const prunePull = flags.prune === "true";
      const { esm, actions, version } = pull(source, { dal: flags.dal === "true", dryRun, prune: prunePull });

      if (dryRun) {
        console.log("(dry run — no files changed)\n");
      }

      if (actions.length === 0) {
        console.log("Already in sync — nothing to pull.");
      } else {
        if (esm) console.log("(ESM project — hooks pulled as .cjs)\n");
        for (const a of actions) {
          const icon = a.action === "added" ? "+" : a.action === "pruned" ? "✗" : "↻";
          console.log(`  ${icon} ${a.path} (${a.category})`);
        }
        const pulled = actions.filter(a => a.action !== "pruned").length;
        const prunedCount = actions.filter(a => a.action === "pruned").length;
        const pullParts = [];
        if (pulled > 0) pullParts.push(`${pulled} pulled`);
        if (prunedCount > 0) pullParts.push(`${prunedCount} pruned`);
        console.log(`\n${pullParts.join(", ")}.`);
      }

      if (version) {
        console.log(`Template version: ${version}`);
        // Record version in identity if brain.db exists
        if (!dryRun) {
          try {
            const { setIdentity } = await import("./lib/identity.mjs");
            setIdentity("template.version", version);
          } catch {
            // No brain.db — skip identity update
          }
        }
      }

      // Post-pull verification (layers 3+4: template completeness + hook alignment)
      if (!dryRun && actions.length > 0) {
        try {
          const verify = await import("./lib/verify.mjs");
          console.log("\nPost-pull verification:");
          const l3 = verify.verifyTemplates();
          const l4 = verify.verifyHooks();
          const icon3 = l3.status === "PASS" ? "✓" : l3.status === "WARN" ? "⚠" : "✗";
          const icon4 = l4.status === "PASS" ? "✓" : l4.status === "WARN" ? "⚠" : "✗";
          console.log(`  ${icon3} Layer 3: Template Completeness — ${l3.status}`);
          console.log(`  ${icon4} Layer 4: Hook-Rule Alignment — ${l4.status}`);
          if (l3.status === "FAIL" || l4.status === "FAIL") {
            console.log("  Run: dal.mjs verify — for full diagnostics");
          }
        } catch {
          // Verify not available — skip silently
        }
      }

      break;
    }
    default:
      console.error("Usage: dal.mjs template manifest|diff|sync|pull");
      process.exit(1);
  }
}

// ─── Traces ───────────────────────────────────────────────────────────────────

async function cmdTrace() {
  const { handleTraceCommand } = await import("./lib/traces.mjs");
  handleTraceCommand(args.slice(1));
}

// ─── Handoff ──────────────────────────────────────────────────────────────────

async function cmdHandoff() {
  const { handleHandoffCommand } = await import("./lib/handoff.mjs");
  handleHandoffCommand(args.slice(1));
}

// ─── Health ──────────────────────────────────────────────────────────────────

async function cmdHealth() {
  const { flags } = parseFlags(1);
  const { generateHealth, emitHealth, printHealth } = await import("./lib/health.mjs");

  // Pre-import modules that health needs for drift and verify
  let template = null;
  let verify = null;
  try { template = await import("./lib/template.mjs"); } catch { /* no template module */ }
  try { verify = await import("./lib/verify.mjs"); } catch { /* no verify module */ }

  const report = generateHealth({ template, verify });

  if (flags.json === "true") {
    console.log(JSON.stringify(report, null, 2));
  } else if (flags.emit === "true") {
    const filePath = emitHealth(report);
    printHealth(report);
    console.log(`\nEmitted to: ${filePath}`);
  } else if (flags.push) {
    const filePath = emitHealth(report);
    // POST to webhook
    try {
      const res = await fetch(flags.push, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      printHealth(report);
      console.log(`\nPushed to: ${flags.push} (${res.status})`);
    } catch (err) {
      printHealth(report);
      console.error(`\nPush failed: ${err.message}`);
      console.log(`Emitted locally to: ${filePath}`);
    }
  } else {
    printHealth(report);
  }
}

// ─── Vault (ChromaDB Layer 3) ─────────────────────────────────────────────────

async function cmdVault() {
  const { flags, positional } = parseFlags(2);

  switch (subcommand) {
    case "sync": {
      const { syncVault } = await import("./lib/vault-sync.mjs");
      const opts = {};
      if (positional) opts.project = positional;
      if (flags.project) opts.project = flags.project;
      if (flags.collection) opts.collection = flags.collection;
      if (flags.clean === "true") opts.clean = true;
      if (flags.path) opts.vaultPath = flags.path;

      console.log(`Syncing vault${opts.project ? ` (project: ${opts.project})` : " (all projects)"}...`);
      const result = await syncVault(opts);

      console.log(`\nVault Sync Complete`);
      console.log(`  Files scanned:  ${result.files}`);
      console.log(`  Documents:      ${result.documents}`);
      console.log(`  Upserted:       ${result.upserted}`);
      if (result.deleted) console.log(`  Cleaned:        ${result.deleted} old docs removed`);
      console.log(`  Collection:     ${result.collection.name} (${result.collection.total} total)`);
      if (result.errors) {
        console.log(`  Errors:         ${result.errors.length}`);
        for (const e of result.errors) {
          console.log(`    - ${e.file}: ${e.error}`);
        }
      }
      break;
    }
    case "query": {
      const { searchVault } = await import("./lib/vault-sync.mjs");
      const queryText = positional || flags.q;
      if (!queryText) {
        console.error("Usage: dal.mjs vault query <text> [--top_k N] [--project P]");
        process.exit(1);
      }
      const opts = {};
      if (flags.top_k) opts.topK = parseInt(flags.top_k);
      if (flags.project) opts.project = flags.project;
      if (flags.collection) opts.collection = flags.collection;

      const results = await searchVault(queryText, opts);
      if (!results.results || results.results.length === 0) {
        console.log("No results found.");
        return;
      }
      console.log(`Found ${results.results.length} results:\n`);
      for (const r of results.results) {
        const score = ((r.similarity ?? r.score ?? 0) * 100).toFixed(1);
        const src = r.metadata?.source_file || "unknown";
        const section = r.metadata?.section || "";
        console.log(`  [${score}%] ${src} — ${section}`);
        // Show first 120 chars of content
        const preview = (r.content || r.document || "").slice(0, 120).replace(/\n/g, " ");
        console.log(`         ${preview}...`);
        console.log();
      }
      break;
    }
    case "status": {
      const { checkHealth, COLLECTION } = await import("./lib/vault-sync.mjs");
      const health = await checkHealth();
      if (!health) {
        console.log("Embedding service not reachable at http://127.0.0.1:8001");
        return;
      }
      console.log(`Embedding Service: ${health.status}`);
      console.log(`  Model:     ${health.model}`);
      console.log(`  Device:    ${health.device} (GPU: ${health.gpu_available})`);
      console.log(`  Documents: ${health.documents} (default collection)`);

      // Check vault collection
      const coll = flags.collection || COLLECTION;
      try {
        const res = await fetch(`http://127.0.0.1:8001/documents?limit=0&collection=${coll}`);
        if (res.ok) {
          const data = await res.json();
          console.log(`  Vault:     ${data.total} docs (collection: ${coll})`);
        }
      } catch { /* vault collection may not exist yet */ }
      break;
    }
    default:
      console.log(`Usage: dal.mjs vault <sync|query|status>

  vault sync [project] [--clean] [--collection C]  Sync vault notes to ChromaDB
  vault query <text> [--top_k N] [--project P]     Semantic search vault
  vault status                                      Embedding service health`);
      process.exit(subcommand ? 1 : 0);
  }
}

// ─── Vault Export ────────────────────────────────────────────────────────────

async function cmdVaultExport() {
  const { handleVaultExportCommand } = await import("./lib/vault-export.mjs");
  const { flags, positional } = parseFlags(2);
  handleVaultExportCommand(subcommand, flags, positional);
}

// ─── Ecosystem ───────────────────────────────────────────────────────────────

async function cmdEcosystem() {
  const { flags, positional } = parseFlags(2);
  const json = flags.json === "true";

  switch (subcommand) {
    case "notes": {
      const { ecosystemNotes, printEcosystemNotes } = await import("./lib/ecosystem.mjs");
      const results = ecosystemNotes();
      if (json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        printEcosystemNotes(results);
      }
      break;
    }
    case "status": {
      const { ecosystemStatus, printEcosystemStatus } = await import("./lib/ecosystem.mjs");
      const status = ecosystemStatus();
      if (json) {
        console.log(JSON.stringify(status, null, 2));
      } else {
        printEcosystemStatus(status);
      }
      break;
    }
    default:
      console.log(`Usage: dal.mjs ecosystem <notes|status>

  ecosystem notes [--json]     Open notes across all local projects
  ecosystem status [--json]    Project health from beacons + brain.db`);
      process.exit(subcommand ? 1 : 0);
  }
}

// ─── Logs ────────────────────────────────────────────────────────────────────

async function cmdLogs() {
  const { flags } = parseFlags(2);
  const json = flags.json === "true";
  const days = flags.days ? parseInt(flags.days) : null;
  const all = flags.all === "true";

  const { readHookLog, aggregateByHook, analyzeTimeWindow, crossProjectAnalytics, formatReport } = await import("./lib/log-analytics.mjs");

  switch (subcommand) {
    case "summary": {
      if (all) {
        const analytics = crossProjectAnalytics(days ? { days } : {});
        formatReport(analytics, { json });
      } else {
        const projectPath = args[2] && !args[2].startsWith("--") ? args[2] : path.resolve(__dirname, "..");
        const result = readHookLog(projectPath);
        if (result.missing) {
          console.log(`No hook-log.jsonl found at ${result.path}`);
          process.exit(1);
        }
        const stats = days ? analyzeTimeWindow(result.entries, { days }) : aggregateByHook(result.entries);
        formatReport({
          projects: [{ project: path.basename(projectPath), entries: result.entries.length, parseErrors: result.parseErrors, missing: false, stale: false, hooks: stats }],
          combined: stats,
          total_entries: result.entries.length,
        }, { json });
      }
      break;
    }
    case "dead": {
      const analytics = crossProjectAnalytics(days ? { days } : { days: 30 });
      formatReport(analytics, { json, mode: "dead" });
      break;
    }
    default:
      console.log(`Usage: dal.mjs logs <summary|dead>

  logs summary [path] [--days N] [--json]   Hook firing stats for a project
  logs summary --all [--days N] [--json]     Aggregate across all reachable projects
  logs dead [--days N] [--json]              Detect hooks with zero activity`);
      process.exit(subcommand ? 1 : 0);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function padRight(str, len) {
  return (str || "").toString().padEnd(len);
}

function printUsage() {
  console.log(`dal.mjs v${DAL_VERSION} — Durable Agentic Layer CLI (Active Memory)

Core Memory:
  identity set|get|list           Project identity (name, version, vision, stack)
  arch set|get|list|remove        Architecture knowledge (--scope project|ecosystem|infrastructure|convention)
  session start|close|list        Session lifecycle
  decision add|list|supersede     Architectural decisions with rationale
  note list|add|complete|remove|counts  Task queue (improvement/issue/bug/idea/handoff/feedback)

Learning Loop:
  action record|update|list|rate   Agent action tracking
  metric record|latest|trend|list  Measurable values over time
  feedback record|summary          Rate action outcomes (helpful/neutral/harmful)
  loop [summary]                   Agent performance overview

Session Continuity:
  trace add|list|summary          Structured episodic memory (per-session traces)
  handoff generate|latest|list    YAML session handoffs for closeout/init bridge

Template:
  template manifest [--json]      List deployable files with checksums
  template diff <path>            Compare target project against template
  template sync <path> [--dal] [--prune] [--dry-run]  Sync files (--prune removes extras)
  template pull [--source P] [--prune] [--dry-run]     Pull updates (--prune removes extras)

Ecosystem:
  health [--json] [--emit] [--push <url>]  Project health beacon
  ecosystem notes [--json]          Open notes across all local projects
  ecosystem status [--json]         Project health from beacons + brain.db
  logs summary [path] [--days N] [--all] [--json]  Hook firing analytics
  logs dead [--days N] [--json]     Detect hooks with zero activity

Vault (ChromaDB Layer 3):
  vault sync [project] [--clean]    Sync vault notes to embedding service
  vault query <text> [--top_k N]    Semantic search across vault
  vault status                      Embedding service health
  vault-export session [summary]    Export session note to Obsidian vault

Operations:
  bootstrap                       Initialize brain.db
  context [--role general|dev] [--scope project|full|ecosystem]  Context payload
  verify [--layer N] [--json]     Cross-verify system integrity
  status                          DB health and counts
  version                         Version info
  migrate                         Run pending migrations`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
