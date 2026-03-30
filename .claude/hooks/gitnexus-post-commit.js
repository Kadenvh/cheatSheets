const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { logHook } = require("./log-util");
logHook("gitnexus-post-commit");

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const cmd = (input.tool_input?.command || "").trim();

// Only trigger on git commit or git merge commands
if (!/git\s+(commit|merge)\b/.test(cmd)) {
  process.exit(0);
}

const projectDir =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");
const gitnexusDir = path.join(projectDir, ".gitnexus");

// No .gitnexus/ directory — not a GitNexus project, exit silently
if (!fs.existsSync(gitnexusDir)) {
  process.exit(0);
}

// Check meta.json for existing embeddings
let useEmbeddings = false;
try {
  const metaPath = path.join(gitnexusDir, "meta.json");
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    if (meta.stats?.embeddings > 0) {
      useEmbeddings = true;
    }
  }
} catch {
  // meta.json unreadable — run without embeddings
}

// Run npx gitnexus analyze in background (detached, non-blocking)
const args = ["gitnexus", "analyze"];
if (useEmbeddings) {
  args.push("--embeddings");
}

const child = spawn("npx", args, {
  cwd: projectDir,
  detached: true,
  stdio: "ignore",
});
child.unref();

process.exit(0);
