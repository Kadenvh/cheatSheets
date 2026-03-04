const fs = require("fs");
const path = require("path");
const { logHook } = require("./log-util");
logHook("stop-closeout-check");

const projectDir =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");

// Documentation files to check
const DOC_FILES = [
  "CLAUDE.md",
  path.join("documentation", "PROJECT_ROADMAP.md"),
  path.join("documentation", "IMPLEMENTATION_PLAN.md"),
];

const STALE_THRESHOLD_MS = parseInt(process.env.CLOSEOUT_STALE_MINUTES || "30", 10) * 60 * 1000;
const now = Date.now();
let mostRecentMod = 0;
let anyDocExists = false;

for (const relPath of DOC_FILES) {
  const fullPath = path.join(projectDir, relPath);
  try {
    const stat = fs.statSync(fullPath);
    anyDocExists = true;
    if (stat.mtimeMs > mostRecentMod) {
      mostRecentMod = stat.mtimeMs;
    }
  } catch {
    // File doesn't exist, skip
  }
}

// If no docs exist, nothing to warn about
if (!anyDocExists) {
  process.exit(0);
}

const timeSinceLastEdit = now - mostRecentMod;

// If docs were edited more than 30 minutes ago, they may be stale
if (timeSinceLastEdit > STALE_THRESHOLD_MS) {
  // Check if there are uncommitted changes (suggests active work happened)
  const { execSync } = require("child_process");
  let hasChanges = false;
  try {
    const status = execSync("git status --porcelain", {
      cwd: projectDir,
      encoding: "utf8",
      timeout: 5000,
    }).trim();
    hasChanges = status.length > 0;
  } catch {
    // Git not available or not a repo, skip
    process.exit(0);
  }

  if (hasChanges) {
    const minutes = Math.round(timeSinceLastEdit / 60000);
    process.stderr.write(
      `Documentation files haven't been updated in ${minutes} minutes and there are uncommitted changes. ` +
      `Run /session-closeout to persist state for the next session.`
    );
    process.exit(2); // Block stop, feed message to Claude
  }
}

process.exit(0);
