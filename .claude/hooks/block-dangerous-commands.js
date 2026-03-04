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

const DANGEROUS = [
  /rm\s+(-rf|-fr)\s+\//,                                // rm -rf /
  /rm\s+(-rf|-fr)\s+~/,                                 // rm -rf ~ (home dir)
  /sudo\s+rm\s+(-rf|-fr)\s/,                            // sudo rm -rf anything
  /chmod\s+(-R\s+)?777\s/,                              // world-writable permissions
  /git\s+push\s+(-f|--force)\s+(origin\s+)?(main|master)/,  // force push main (--force or -f)
  /git\s+reset\s+--hard/,                               // hard reset
  /git\s+clean\s+-[fd]/,                                // clean untracked
  /git\s+checkout\s+\.\s*$/,                            // discard all changes
  /git\s+restore\s+\.\s*$/,                             // discard all changes
  />\s*\/dev\/sd/,                                      // write to block devices
  /mkfs\./,                                             // format filesystems
  /dd\s+if=/,                                           // dd command
  /:()\s*\{\s*:\|\:&\s*\}\s*;/,                        // fork bomb
  /curl\s.*\s?\|\s*(ba)?sh/,                              // pipe curl to shell (flexible spacing)
  /wget\s.*\s?\|\s*(ba)?sh/,                              // pipe wget to shell (flexible spacing)
];

if (DANGEROUS.some((p) => p.test(cmd))) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Dangerous command blocked. Run manually if intended: " + cmd,
      },
    })
  );
}

process.exit(0);
