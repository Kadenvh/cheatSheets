const fs = require("fs");
const { logHook } = require("./log-util");
logHook("block-protected-files");

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const filePath = (input.tool_input?.file_path || "")
  .replace(/\\/g, "/")
  .toLowerCase();

const BLOCKED = [
  /\.env($|\.)/,                    // .env, .env.local, .env.production
  /\.git\//,                        // .git internals
  /(^|\/)\.ava\/brain\.db$/,        // DAL active memory
  /credentials\.(json|yaml|yml)$/,  // credential files
  /secrets?\.(json|yaml|yml)$/,     // secret files
  /package-lock\.json$/,            // npm lock
  /pnpm-lock\.yaml$/,               // pnpm lock
  /yarn\.lock$/,                    // yarn lock
  /\.pem$/,                         // TLS certs
  /\.key$/,                         // private keys
  /id_(rsa|ed25519|ecdsa)/,         // SSH keys
  /\.sqlite$/,                      // SQLite databases
  /\.pfx$/,                         // certificate bundles (PKCS#12)
  /\.p12$/,                         // certificate bundles (PKCS#12)
  /authorized_keys$/,               // SSH trust
  /\.npmrc$/,                       // npm auth tokens
  /\.htpasswd$/,                    // HTTP auth credentials
];

// OpenClaw orchestrator files — belong to the orchestrating agent, not Claude Code
// Only applied outside .claude/ paths (Claude Code's own auto-memory lives there)
const OPENCLAW_BLOCKED = [
  /agents\.md$/i,                   // OpenClaw agent config
  /heartbeat\.md$/i,                // OpenClaw heartbeat config
  /identity\.md$/i,                 // OpenClaw agent identity
  /soul\.md$/i,                     // OpenClaw agent soul/personality
  /tools\.md$/i,                    // OpenClaw tool notes
  /user\.md$/i,                     // OpenClaw user profile
  /\/memory\//,                     // OpenClaw memory/ directory (daily logs)
];

const isClaudePath = filePath.includes("/.claude/") || filePath.startsWith(".claude/");
const blocked = BLOCKED.some((p) => p.test(filePath)) ||
  (!isClaudePath && OPENCLAW_BLOCKED.some((p) => p.test(filePath)));

if (blocked) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "PROTECTED FILE — direct edit blocked: " +
          filePath +
          " | OVERRIDE: explain your justification to the user; they can edit this file directly or approve the action.",
      },
    })
  );
}

process.exit(0);
