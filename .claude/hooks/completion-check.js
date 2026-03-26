const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { logHook } = require("./log-util");
logHook("completion-check");

const projectDir =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");

const brainDbPath = path.join(projectDir, ".ava", "brain.db");
if (!fs.existsSync(brainDbPath)) {
  process.exit(0); // No DAL, nothing to check
}

// Query for partial-outcome actions from the last 7 days
try {
  const result = execSync(
    `sqlite3 "${brainDbPath}" "SELECT COUNT(*) FROM agent_actions WHERE outcome = 'partial' AND created_at > datetime('now', '-7 days')"`,
    { cwd: projectDir, encoding: "utf8", timeout: 5000 }
  ).trim();

  const count = parseInt(result, 10);
  if (count > 0) {
    process.stderr.write(
      `${count} partial-outcome action${count > 1 ? "s" : ""} from the last 7 days. ` +
      `These represent unfinished features. Run: node .ava/dal.mjs action list --outcome partial`
    );
  }
} catch {
  // sqlite3 not available or query failed — skip silently
}

process.exit(0);
