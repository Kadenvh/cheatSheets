// log-analytics.mjs — Hook-log analytics across ecosystem projects
// Reads hook-log.jsonl from local + replica paths, aggregates by hook, computes frequencies.
import fs from "fs";
import path from "path";
import { PROJECTS } from "./ecosystem.mjs";

/**
 * Read and parse a single project's hook-log.jsonl.
 * @param {string} projectPath - Path to the project root
 * @returns {{ entries: Array, parseErrors: number, path: string }}
 */
export function readHookLog(projectPath) {
  const logPath = path.join(projectPath, ".claude", "hooks", "hook-log.jsonl");
  if (!fs.existsSync(logPath)) {
    return { entries: [], parseErrors: 0, path: logPath, missing: true };
  }

  const raw = fs.readFileSync(logPath, "utf8");
  const lines = raw.split("\n").filter(l => l.trim());
  const entries = [];
  let parseErrors = 0;

  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch {
      parseErrors++;
    }
  }

  return { entries, parseErrors, path: logPath, missing: false };
}

/**
 * Group entries by tool_name, compute counts and frequencies.
 * @param {Array} entries - Parsed JSONL entries
 * @returns {Array<{ tool_name, count, first_seen, last_seen, fires_per_day }>}
 */
export function aggregateByHook(entries) {
  const groups = {};
  for (const e of entries) {
    const name = e.tool_name || "unknown";
    if (!groups[name]) {
      groups[name] = { tool_name: name, count: 0, first_seen: e.timestamp, last_seen: e.timestamp };
    }
    groups[name].count++;
    if (e.timestamp < groups[name].first_seen) groups[name].first_seen = e.timestamp;
    if (e.timestamp > groups[name].last_seen) groups[name].last_seen = e.timestamp;
  }

  const result = Object.values(groups);
  for (const g of result) {
    const span = (new Date(g.last_seen) - new Date(g.first_seen)) / (1000 * 60 * 60 * 24);
    g.fires_per_day = span > 0 ? +(g.count / span).toFixed(1) : g.count;
  }
  return result.sort((a, b) => b.count - a.count);
}

/**
 * Filter entries to a time window, then aggregate.
 * @param {Array} entries
 * @param {{ days: number }} options
 * @returns {Array} Same shape as aggregateByHook
 */
export function analyzeTimeWindow(entries, { days }) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const filtered = entries.filter(e => e.timestamp >= cutoff);
  return aggregateByHook(filtered);
}

/**
 * Aggregate hook logs across all reachable projects.
 * @param {{ days?: number }} options
 * @returns {{ projects: Array, combined: Array, total_entries: number }}
 */
export function crossProjectAnalytics({ days } = {}) {
  const projects = [];
  let allEntries = [];

  for (const proj of PROJECTS) {
    const result = readHookLog(proj.path);
    const stats = days && !result.missing
      ? analyzeTimeWindow(result.entries, { days })
      : aggregateByHook(result.entries);

    const stale = !result.missing && result.entries.length > 0
      ? isStale(result.entries, proj.remote)
      : false;

    projects.push({
      project: proj.name,
      remote: proj.remote || null,
      entries: result.entries.length,
      parseErrors: result.parseErrors,
      missing: result.missing,
      stale,
      hooks: stats,
    });

    if (!result.missing) {
      allEntries = allEntries.concat(result.entries);
    }
  }

  const combined = days
    ? analyzeTimeWindow(allEntries, { days })
    : aggregateByHook(allEntries);

  return {
    projects,
    combined,
    total_entries: allEntries.length,
  };
}

/**
 * Check if a log file is stale (last entry >24h old for remote projects, >7d for local).
 */
function isStale(entries, remote) {
  if (entries.length === 0) return false;
  const lastTs = entries.reduce((max, e) => e.timestamp > max ? e.timestamp : max, entries[0].timestamp);
  const age = Date.now() - new Date(lastTs).getTime();
  const threshold = remote ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  return age > threshold;
}

/**
 * Format analytics as pretty-printed text or JSON.
 * @param {object} analytics - Output from crossProjectAnalytics or single-project
 * @param {{ json?: boolean, mode?: string }} options
 */
export function formatReport(analytics, { json, mode } = {}) {
  if (json) {
    console.log(JSON.stringify(analytics, null, 2));
    return;
  }

  if (mode === "dead") {
    formatDeadReport(analytics);
    return;
  }

  // Pretty-print
  console.log("Hook Log Analytics");
  console.log("═".repeat(50));

  for (const p of analytics.projects) {
    if (p.missing) {
      console.log(`\n  ${p.project}: no hook-log.jsonl`);
      continue;
    }
    const staleTag = p.stale ? " [STALE]" : "";
    const errTag = p.parseErrors > 0 ? ` (${p.parseErrors} parse errors)` : "";
    console.log(`\n  ${p.project}: ${p.entries} entries${staleTag}${errTag}`);
    for (const h of p.hooks.slice(0, 10)) {
      const pct = analytics.total_entries > 0
        ? ` (${((h.count / p.entries) * 100).toFixed(0)}%)`
        : "";
      console.log(`    ${h.tool_name.padEnd(30)} ${String(h.count).padStart(6)}  ${h.fires_per_day}/day${pct}`);
    }
  }

  if (analytics.combined && analytics.combined.length > 0) {
    console.log(`\n  Combined (${analytics.total_entries} total entries):`);
    for (const h of analytics.combined) {
      console.log(`    ${h.tool_name.padEnd(30)} ${String(h.count).padStart(6)}  ${h.fires_per_day}/day`);
    }
  }
}

function formatDeadReport(analytics) {
  console.log("Dead Hook Detection");
  console.log("═".repeat(50));

  const allHookNames = new Set();
  for (const p of analytics.projects) {
    for (const h of p.hooks) {
      allHookNames.add(h.tool_name);
    }
  }

  // For each project, find hooks that fire in other projects but not this one
  for (const p of analytics.projects) {
    if (p.missing) continue;
    const projectHooks = new Set(p.hooks.map(h => h.tool_name));
    const absent = [...allHookNames].filter(h => !projectHooks.has(h));
    if (absent.length > 0) {
      console.log(`\n  ${p.project}: ${absent.length} hooks never fired`);
      for (const h of absent) {
        console.log(`    - ${h}`);
      }
    } else {
      console.log(`\n  ${p.project}: all known hooks active`);
    }
  }
}
