const fs = require("fs");
const { logHook } = require("./log-util");
logHook("block-dangerous-commands");

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const cmd = (input.tool_input?.command || "").trim();

// EXPLICITLY PERMITTED (not blocked by any pattern below):
// - Service management: nssm, systemctl, service, pm2, supervisorctl
//   All nssm commands (install, start, stop, restart, remove, set) pass through unconditionally.
// - Package managers: npm, pip, apt, brew (except when piped to shell — see SOFT_BLOCK)
// - Standard build/run/test commands

// HARD_BLOCK: catastrophic or irreversible — never permit, no override path.
const HARD_BLOCK = [
  /rm\s+(-rf|-fr)\s+\//,                                      // rm -rf /
  /rm\s+(-rf|-fr)\s+~/,                                       // rm -rf ~ (home dir)
  /sudo\s+rm\s+(-rf|-fr)\s/,                                  // sudo rm -rf anything
  />\s*\/dev\/sd/,                                            // write to block devices
  /mkfs\./,                                                   // format filesystems
  /dd\s+if=/,                                                 // dd command
  /:()\s*\{\s*:\|\:&\s*\}\s*;/,                              // fork bomb
  /git\s+push\s+(-f|--force)\s+(origin\s+)?(main|master)/,  // force push main
];

// SOFT_BLOCK: risky but sometimes legitimate — deny with override guidance.
// Override path: stop, explain justification to user, have them run it directly in terminal.
const SOFT_BLOCK = [
  /chmod\s+(-R\s+)?777\s/,           // world-writable permissions
  /git\s+reset\s+--hard/,            // hard reset (discards commits)
  /git\s+clean\s+-[fd]/,             // clean untracked files
  /git\s+checkout\s+\.\s*$/,         // discard all working changes
  /git\s+restore\s+\.\s*$/,          // discard all working changes
  /curl\s.*\s?\|\s*(ba)?sh/,         // pipe curl to shell
  /wget\s.*\s?\|\s*(ba)?sh/,         // pipe wget to shell
];

if (HARD_BLOCK.some((p) => p.test(cmd))) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "HARD BLOCK — catastrophic command, no override: " + cmd,
      },
    })
  );
} else if (SOFT_BLOCK.some((p) => p.test(cmd))) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "SOFT BLOCK — risky command requires human confirmation: " +
          cmd +
          " | OVERRIDE: explain your justification to the user and have them run this command directly in their terminal.",
      },
    })
  );
}

process.exit(0);
