// gitnexus-impact-check.js — PreToolUse hook for automatic impact analysis
// Mode 1: inject to stderr (context enrichment), never block
// Fail-open: gitnexus errors allow the edit, logged to hook-log.jsonl
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { logHook } = require("./log-util");
logHook("gitnexus-impact-check");

// Scope patterns
const SOURCE_EXT = /\.(js|mjs|cjs|ts|tsx|jsx|py|rs|go|java|rb|c|cpp|h|hpp|sh)$/;
const SCOPE_OUT = [
  /\.md$/, /\.json$/, /\.ya?ml$/, /\.toml$/, /\.lock$/,
  /\.claude\/plans\//, /\.claude\/memory\//, /\.claude\/\.prompts\//,
  /node_modules\//, /\.git\//
];

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0); // can't parse stdin — fail open
}

const filePath = input.tool_input?.file_path || "";
const relPath = filePath.replace(/^\//, "").replace(process.cwd().replace(/^\//, "") + "/", "");

// Skip if bypass env is set
if (process.env.PE_GITNEXUS_SKIP === "1") {
  process.exit(0);
}

// Skip non-source files
if (!SOURCE_EXT.test(filePath)) {
  process.exit(0);
}

// Skip scope-out patterns
if (SCOPE_OUT.some(p => p.test(filePath))) {
  process.exit(0);
}

// Resolve repo name from git
let repoName;
try {
  repoName = path.basename(
    execSync("git rev-parse --show-toplevel", { encoding: "utf8", timeout: 5000 }).trim()
  );
} catch {
  process.exit(0); // not in a git repo — fail open
}

// Check index freshness — if meta.json lastCommit != HEAD, index is stale
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const metaPath = path.join(projectDir, ".gitnexus", "meta.json");
let indexStale = false;
try {
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const head = execSync("git rev-parse HEAD", { encoding: "utf8", timeout: 5000 }).trim();
  if (meta.lastCommit !== head) {
    indexStale = true;
  }
} catch {
  // No meta.json or can't read — proceed anyway
}

// Query for symbols in this file
let symbols = [];
try {
  const cypher = `MATCH (f:File {filePath: '${relPath}'})-[]->(s) WHERE s:Function OR s:Class OR s:Method RETURN s.name AS name, labels(s) AS type`;
  const result = execSync(
    `npx gitnexus cypher "${cypher}" --repo ${repoName}`,
    { encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"] }
  );
  const parsed = JSON.parse(result);
  if (parsed.rows) {
    symbols = parsed.rows;
  } else if (Array.isArray(parsed)) {
    symbols = parsed;
  }
} catch {
  // cypher failed — fail open, emit warning
  process.stderr.write(`[gitnexus-impact] Could not query symbols for ${relPath} (index may be empty for this file type)\n`);
  process.exit(0);
}

if (symbols.length === 0) {
  // No symbols found — file not in index or no code nodes
  if (indexStale) {
    process.stderr.write(`[gitnexus-impact] ${relPath}: index is stale, no symbols available. Run \`npx gitnexus analyze\` to update.\n`);
  }
  process.exit(0);
}

// Run impact analysis for each symbol
const impacts = [];
for (const sym of symbols) {
  const symName = sym.name || sym[0];
  try {
    const result = execSync(
      `npx gitnexus impact "${symName}" --repo ${repoName} --direction upstream --depth 2`,
      { encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"] }
    );
    const parsed = JSON.parse(result);
    if (parsed.error && parsed.error.includes("not found")) continue;
    impacts.push({ symbol: symName, impact: parsed });
  } catch {
    // individual symbol failed — skip, don't block
  }
}

// Build output
if (impacts.length > 0) {
  const lines = [`[gitnexus-impact] ${relPath}: ${symbols.length} symbols, ${impacts.length} with upstream dependants`];
  for (const { symbol, impact } of impacts) {
    const deps = impact.upstream || impact.dependants || impact.results || [];
    const count = Array.isArray(deps) ? deps.length : 0;
    const risk = impact.risk || impact.riskLevel || "unknown";
    lines.push(`  ${symbol}: ${count} upstream deps, risk=${risk}`);
    if (Array.isArray(deps)) {
      for (const dep of deps.slice(0, 5)) {
        const depName = dep.name || dep.symbol || dep.filePath || JSON.stringify(dep);
        lines.push(`    → ${depName}`);
      }
      if (deps.length > 5) lines.push(`    ... and ${deps.length - 5} more`);
    }
  }
  lines.push(`  Run gitnexus_context({name: "<symbol>"}) for full details.`);
  process.stderr.write(lines.join("\n") + "\n");
} else if (indexStale) {
  process.stderr.write(`[gitnexus-impact] ${relPath}: index stale, impact analysis may be incomplete.\n`);
}

process.exit(0);
