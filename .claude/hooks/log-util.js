// log-util.js — usage logging for hooks with file fallback
// Usage: const { logHook } = require("./log-util"); logHook("hook-name");

const path = require("path");
const fs = require("fs");

function logHook(hookName) {
  const entry = {
    tool_name: hookName,
    tool_type: "hook",
    action: "hook_fire",
    timestamp: new Date().toISOString(),
  };

  // Try HTTP logging first
  const http = require("http");
  const data = JSON.stringify(entry);
  const req = http.request({
    hostname: "localhost",
    port: 4173,
    path: "/api/prompt-log",
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
  });
  req.on("error", () => {
    // HTTP failed — write to local file as fallback
    try {
      const logDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");
      const logFile = path.join(logDir, ".claude", "hooks", "hook-log.jsonl");
      fs.appendFileSync(logFile, data + "\n");
    } catch {
      // Both failed — silently drop (hooks must never block)
    }
  });
  req.end(data);
}

module.exports = { logHook };
