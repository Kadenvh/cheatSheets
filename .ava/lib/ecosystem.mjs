// ecosystem.mjs — Cross-project ecosystem awareness
// Reads brain.db from multiple local projects for aggregated views.
import fs from "fs";
import path from "path";
import os from "os";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Known project paths — mirrors Ava_Main's BRAIN_DB_PATHS
export const PROJECTS = [
  { name: "Prompt_Engineering", path: "/home/ava/Prompt_Engineering" },
  { name: "Ava_Main", path: "/home/ava/Ava_Main" },
  { name: "McQueenyML", path: "/home/ava/McQueenyML", remote: "frank" },
  { name: "CloudBooks", path: "/home/ava/CloudBooks" },
  { name: "seatwise", path: "/home/ava/seatwise" },
  { name: "tradeSignal", path: "/home/ava/tradeSignal" },
  { name: "WATTS", path: "/home/ava/WATTS" },
  { name: "adze-cad", path: "/home/ava/adze-cad", remote: "zoe" },
  { name: "cheatSheets", path: "/home/ava/cheatSheets" },
  { name: "3D_Printing", path: "/home/ava/3D_Printing" },
];

function openDb(dbPath) {
  if (!fs.existsSync(dbPath)) return null;
  try {
    const Database = require("better-sqlite3");
    return new Database(dbPath, { readonly: true });
  } catch { return null; }
}

/**
 * Read open notes from all local projects.
 * @returns {Array<{ project, notes }>}
 */
export function ecosystemNotes() {
  const results = [];
  for (const proj of PROJECTS) {
    if (proj.remote) {
      results.push({ project: proj.name, remote: proj.remote, notes: [] });
      continue;
    }
    const dbPath = path.join(proj.path, ".ava", "brain.db");
    const db = openDb(dbPath);
    if (!db) {
      results.push({ project: proj.name, notes: [], error: "no brain.db" });
      continue;
    }
    try {
      const notes = db.prepare(
        "SELECT id, category, substr(text, 1, 120) as text, created_at FROM notes WHERE completed = 0 ORDER BY created_at DESC"
      ).all();
      results.push({ project: proj.name, notes });
    } catch (e) {
      results.push({ project: proj.name, notes: [], error: e.message });
    } finally {
      db.close();
    }
  }
  return results;
}

/**
 * Read ecosystem status from health beacons + brain.db.
 * @returns {object} Aggregated ecosystem status
 */
export function ecosystemStatus() {
  const beaconDir = path.join(os.homedir(), ".pe-health");
  const beacons = {};

  // Read health beacons
  if (fs.existsSync(beaconDir)) {
    for (const f of fs.readdirSync(beaconDir).filter(f => f.endsWith(".json"))) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(beaconDir, f), "utf8"));
        beacons[data.project || f.replace(".json", "")] = data;
      } catch { /* skip bad beacons */ }
    }
  }

  // Supplement with live brain.db reads for projects without beacons
  const projects = [];
  for (const proj of PROJECTS) {
    const entry = { name: proj.name, remote: proj.remote || null };

    // Use beacon if available
    if (beacons[proj.name]) {
      const b = beacons[proj.name];
      entry.version = b.template_version;
      entry.schema = b.schema_version;
      entry.beacon_age = b.generated_at;
      entry.verify = b.verify_summary;
      entry.stats = b.stats;
      entry.drift = b.drift;
      entry.source = "beacon";
    } else if (!proj.remote) {
      // Live read
      const dbPath = path.join(proj.path, ".ava", "brain.db");
      const db = openDb(dbPath);
      if (db) {
        try {
          const version = db.prepare("SELECT value FROM identity WHERE key = 'project.version'").get();
          const schema = db.prepare("SELECT MAX(version) as v FROM schema_version").get();
          const sessions = db.prepare("SELECT COUNT(*) as c FROM sessions").get();
          const openNotes = db.prepare("SELECT COUNT(*) as c FROM notes WHERE completed = 0").get();
          const lastSession = db.prepare("SELECT start_time, substr(summary, 1, 80) as summary FROM sessions ORDER BY start_time DESC LIMIT 1").get();
          entry.version = version?.value || null;
          entry.schema = schema?.v || null;
          entry.stats = {
            sessions: sessions?.c || 0,
            open_notes: openNotes?.c || 0,
            last_session: lastSession?.start_time || null,
            last_summary: lastSession?.summary || null,
          };
          entry.source = "live";
        } catch (e) {
          entry.error = e.message;
          entry.source = "error";
        } finally {
          db.close();
        }
      } else {
        entry.source = "missing";
      }
    } else {
      entry.source = "remote";
    }

    projects.push(entry);
  }

  return { generated_at: new Date().toISOString(), projects, beacon_count: Object.keys(beacons).length };
}

/**
 * Print open notes from all projects.
 */
export function printEcosystemNotes(results) {
  let totalOpen = 0;
  for (const proj of results) {
    if (proj.remote) {
      console.log(`\n${proj.project} (remote: ${proj.remote}) — skipped`);
      continue;
    }
    if (proj.error) {
      console.log(`\n${proj.project} — ${proj.error}`);
      continue;
    }
    if (proj.notes.length === 0) {
      console.log(`\n${proj.project} — 0 open notes`);
      continue;
    }
    console.log(`\n${proj.project} — ${proj.notes.length} open:`);
    for (const n of proj.notes) {
      console.log(`  [${n.category}] ${n.text}`);
    }
    totalOpen += proj.notes.length;
  }
  console.log(`\n${totalOpen} open notes across ecosystem`);
}

/**
 * Print ecosystem status summary.
 */
export function printEcosystemStatus(status) {
  console.log(`Ecosystem Status (${status.generated_at})`);
  console.log(`Beacons: ${status.beacon_count} available\n`);

  for (const p of status.projects) {
    const version = p.version || "?";
    const schema = p.schema || "?";
    let line = `  ${p.name}: v${version} (schema ${schema})`;

    if (p.remote) {
      line += ` [remote: ${p.remote}]`;
    } else if (p.stats) {
      const notes = p.stats.open_notes ?? "?";
      const sessions = p.stats.sessions ?? "?";
      line += ` — ${sessions} sessions, ${notes} open notes`;
      if (p.stats.last_session) {
        line += ` — last: ${p.stats.last_session}`;
      }
    } else if (p.source === "missing") {
      line += " [no brain.db]";
    }

    if (p.verify) {
      const v = p.verify;
      line += ` [verify: ${v.pass}P/${v.warn || 0}W/${v.fail || 0}F]`;
    }

    console.log(line);
  }
}
