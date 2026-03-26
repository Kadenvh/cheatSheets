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

  const data = JSON.stringify(entry);
  const logEndpoint = process.env.HOOK_LOG_ENDPOINT;

  if (logEndpoint) {
    try {
      const url = new URL(logEndpoint);
      const http = require(url.protocol === "https:" ? "https" : "http");
      const req = http.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
      });
      req.on("error", () => { writeToFile(data); });
      req.end(data);
    } catch {
      writeToFile(data);
    }
  } else {
    writeToFile(data);
  }
}

function writeToFile(data) {
  try {
    const logDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");
    const logFile = path.join(logDir, ".claude", "hooks", "hook-log.jsonl");
    fs.appendFileSync(logFile, data + "\n");
  } catch {
    // Both failed — silently drop (hooks must never block)
  }
}

module.exports = { logHook };
