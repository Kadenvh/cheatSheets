const { execSync } = require("child_process");
const path = require("path");
const { logHook } = require("./log-util");
logHook("session-context");

const projectDir =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");
const context = [];

function run(cmd) {
  try {
    return execSync(cmd, {
      cwd: projectDir,
      encoding: "utf8",
      timeout: 5000,
    }).trim();
  } catch {
    return null;
  }
}

const branch = run("git branch --show-current");
if (branch) context.push("Branch: " + branch);

const status = run("git status --short");
if (status) context.push("Uncommitted changes:\n" + status);

const log = run("git log --oneline -5");
if (log) context.push("Recent commits:\n" + log);

const unpushed = run("git log --oneline origin/" + (branch || "main") + "..HEAD 2>/dev/null");
if (unpushed) context.push("Unpushed commits:\n" + unpushed);

const stashCount = run("git stash list | wc -l");
if (stashCount && parseInt(stashCount) > 0) context.push("Stashes: " + stashCount.trim());

// Check for documentation system closeout prompt
const fs = require("fs");
const closeoutPaths = [
  path.join(projectDir, "documentation", ".prompts", "closeout.md"),
  path.join(projectDir, "ava_hub", "documentation", ".prompts", "closeout.md"),
];

for (const p of closeoutPaths) {
  if (fs.existsSync(p)) {
    context.push(
      "REMINDER: Run /closeout at end of significant sessions. " +
        "Closeout prompt located at: " + path.relative(projectDir, p)
    );
    break;
  }
}

if (context.length > 0) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: context.join("\n\n"),
      },
    })
  );
}
