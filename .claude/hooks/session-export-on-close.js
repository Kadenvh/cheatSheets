// session-export-on-close.js
// Stop-event hook that auto-fires `dal.mjs session-export` after the user has
// run /session-closeout. Scoped to closed-with-summary sessions so the hook
// can fire harmlessly on every agent turn — session-export itself no-ops via
// the identity.session-export.lastRun check when nothing new needs exporting.
//
// Non-blocking: failures log to stderr but never interrupt the agent.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { logHook } = require("./log-util");

logHook("session-export-on-close");

const projectDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
const dalPath = path.join(projectDir, ".ava", "dal.mjs");
const brainDbPath = path.join(projectDir, ".ava", "brain.db");

// If the project doesn't have a DAL runtime, there's nothing to export.
if (!fs.existsSync(brainDbPath) || !fs.existsSync(dalPath)) {
  process.exit(0);
}

try {
  execSync(`node "${dalPath}" session-export session --auto-on-close`, {
    cwd: projectDir,
    encoding: "utf8",
    timeout: 15000,
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (err) {
  // Non-blocking: record the failure but don't stop the agent.
  process.stderr.write(
    `session-export auto-fire failed (non-blocking): ${err.message.split("\n")[0]}\n`
  );
}

process.exit(0);
