const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { logHook } = require("./log-util");
logHook("session-context");

const projectDir =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");

// Workspace-aware brain.db resolution: if CWD has its own .ava/brain.db,
// this is a domain spoke agent — use the spoke's brain, not the project root's.
const cwd = process.cwd();
const cwdBrainDb = path.join(cwd, ".ava", "brain.db");
const workspaceDir =
  cwd !== projectDir && fs.existsSync(cwdBrainDb) ? cwd : null;
const dalDir = workspaceDir || projectDir;

const context = [];

function run(cmd, options = {}) {
  try {
    return execSync(cmd, {
      cwd: options.cwd || projectDir,
      encoding: "utf8",
      timeout: options.timeout || 5000,
    }).trim();
  } catch {
    return null;
  }
}

// Git context
const branch = run("git branch --show-current");
if (branch) context.push("Branch: " + branch);

const statusLines = (run("git status --short") || "")
  .split("\n")
  .filter(Boolean);
if (statusLines.length > 0) {
  const shown = statusLines.slice(0, 8).join("\n");
  const more = statusLines.length > 8 ? `\n... +${statusLines.length - 8} more` : "";
  context.push(`Working tree: ${statusLines.length} changed path(s)\n${shown}${more}`);
}

const log = run("git log --oneline -3");
if (log) context.push("Recent commits:\n" + log);

const unpushedCount = run("git rev-list --count origin/" + (branch || "main") + "..HEAD 2>/dev/null");
if (unpushedCount && parseInt(unpushedCount, 10) > 0) {
  context.push("Unpushed commits: " + unpushedCount.trim());
}

const stashCount = run("git stash list | wc -l");
if (stashCount && parseInt(stashCount) > 0) context.push("Stashes: " + stashCount.trim());

// Closeout reminder
const closeoutPaths = [
  path.join(projectDir, ".claude", ".prompts", "closeout.md"),
];
for (const p of closeoutPaths) {
  if (fs.existsSync(p)) {
    context.push(
      "REMINDER: Run /session-closeout at end of significant sessions. " +
        "Closeout prompt located at: " + path.relative(projectDir, p)
    );
    break;
  }
}

// System overview reminder — ensures agents know the full toolbox exists
const sysOverviewPath = path.join(projectDir, "SYSTEM-OVERVIEW.md");
if (fs.existsSync(sysOverviewPath)) {
  context.push(
    "SYSTEM-OVERVIEW.md exists at project root. " +
    "Read it to understand your full toolbox: skills, hooks, brain.db commands, " +
    "knowledge layers, session lifecycle, and file layout. " +
    "CLAUDE.md tells you what to do. SYSTEM-OVERVIEW.md tells you what exists and how to use it."
  );
}

// Engagement principles (minimal -- CLAUDE.md already covers rules)
context.push(
  "## Working With the User\n\n" +
  "State your understanding before acting. Surface judgment calls as you go. " +
  "Be confident, think independently, have opinions. " +
  "Record corrections as traces so future sessions benefit."
);

// DAL context injection (slim: 4-question model)
// Injects only what answers: What is this? What are constraints? What was I doing? What's next?
// Architecture entries are queryable on demand: node .ava/dal.mjs arch list
const brainDbPath = path.join(dalDir, ".ava", "brain.db");
let continuityInjected = false;
if (fs.existsSync(brainDbPath)) {
  const isSpoke = dalDir !== projectDir;
  const dalLabel = isSpoke
    ? `## DAL State (spoke: ${path.basename(dalDir)})\n\n`
    : "## DAL State (auto-injected from brain.db)\n\n";
  try {
    const role = process.env.CLAUDE_AGENT_ROLE || "general";

    // Agent identity injection -- if role matches an agent-definitions/ directory, inject SOUL.md
    if (role !== "general") {
      const agentDir = path.join(projectDir, "agent-definitions", role);
      const soulPath = path.join(agentDir, "SOUL.md");
      if (fs.existsSync(soulPath)) {
        const soul = fs.readFileSync(soulPath, "utf8").trim();
        context.push(`## Agent Identity: ${role}\n\n${soul}`);
        const toolsPath = path.join(agentDir, "TOOLS.md");
        if (fs.existsSync(toolsPath)) {
          const tools = fs.readFileSync(toolsPath, "utf8").trim();
          context.push(`\n\n## Agent Tools: ${role}\n\n${tools}`);
        }
      }
    }

    const dalMjs = path.join(dalDir, ".ava", "dal.mjs");
    const dalRun = (cmd) => {
      try {
        return execSync(`node "${dalMjs}" ${cmd}`, {
          cwd: dalDir, encoding: "utf8", timeout: 8000,
        }).trim();
      } catch { return null; }
    };

    const continuityBrief = dalRun(
      "continuity brief --max-notes 5 --max-actions 5 --max-decisions 5 --max-plans 4"
    );
    if (continuityBrief) {
      context.push(dalLabel + continuityBrief);
      continuityInjected = true;
    } else {
      // Fallback for projects whose local .ava has not landed continuity brief yet.
      const coreKeys = ["project.name", "project.version", "project.vision",
        "product.priority-stack", "state.current"];
      const identityLines = [];
      for (const key of coreKeys) {
        const val = dalRun(`identity get "${key}"`);
        if (val && !val.includes("not found")) {
          identityLines.push(`- \`${key}\`: ${val}`);
        }
      }

      const notes = dalRun("note list");
      const decisions = dalRun("decision list");
      const statusOutput = dalRun("status");
      const slim = [];

      if (identityLines.length > 0) {
        slim.push("**Identity:**\n" + identityLines.join("\n"));
      }
      if (notes) {
        slim.push("**Open Notes:**\n" + notes);
      }
      if (decisions) {
        const decLines = decisions.split("\n").filter(l => l.trim());
        const header = decLines[0];
        const active = decLines.slice(1);
        const shown = active.slice(0, 5).join("\n");
        const remaining = active.length > 5 ? `\n... +${active.length - 5} more (run: dal.mjs decision list)` : "";
        slim.push(`**Recent Decisions (${active.length} active):**\n${header}\n${shown}${remaining}`);
      }
      if (statusOutput) {
        const lastMatch = statusOutput.match(/Sessions:\s+\d+.*/);
        if (lastMatch) slim.push("**" + lastMatch[0] + "**");
      }

      slim.push(
        "**On-demand queries** (not injected -- run when needed):\n" +
        "- `node .ava/dal.mjs arch list` -- architecture entries (conventions, project, ecosystem, infra)\n" +
        "- `node .ava/dal.mjs arch list --scope convention` -- coding conventions only\n" +
        "- `node .ava/dal.mjs decision list` -- all active decisions\n" +
        "- `node .ava/dal.mjs loop summary` -- agent performance history\n" +
        "- `node .ava/dal.mjs context` -- full 22KB context dump (old default)"
      );

      if (slim.length > 0) {
        context.push(dalLabel + slim.join("\n\n"));
      }
    }

    // Detect empty brain.db
    const statusOutput = dalRun("status");
    const identityMatch = statusOutput && statusOutput.match(/Identity:\s+(\d+)\s+entr/);
    const sessionsMatch = statusOutput && statusOutput.match(/Sessions:\s+(\d+)\s+total/);
    const identityCount = identityMatch ? parseInt(identityMatch[1]) : -1;
    const sessionCount = sessionsMatch ? parseInt(sessionsMatch[1]) : -1;

    if (identityCount === 0 && sessionCount === 0) {
      context.push(
        "WARNING: brain.db is deployed but EMPTY (0 identity entries, 0 sessions). " +
        "Run /cleanup to hydrate brain.db from existing documentation."
      );
    }
  } catch {
    context.push(
      "DAL: brain.db exists but context query failed. " +
      "Run: node .ava/dal.mjs status -- to diagnose."
    );
  }
}

// Handoff injection — only needed when continuity brief is unavailable
const handoffDir = path.join(dalDir, ".ava", "handoffs");
if (!continuityInjected && fs.existsSync(handoffDir)) {
  try {
    const files = fs.readdirSync(handoffDir)
      .filter(f => f.endsWith(".yaml"))
      .sort()
      .reverse();
    if (files.length > 0) {
      const latest = fs.readFileSync(path.join(handoffDir, files[0]), "utf8");
      const truncated = latest.length > 2000
        ? latest.slice(0, 2000) + "\n... (truncated, see full file)"
        : latest;
      context.push(`## Previous Session Handoff\n\n\`\`\`yaml\n${truncated}\n\`\`\``);
    }
  } catch {
    // Silent — handoff injection is best-effort
  }
}

// Sibling project context injection (always uses project root, not spoke workspace)
const siblingsPath = path.join(projectDir, ".ava", "siblings.json");
if (fs.existsSync(siblingsPath)) {
  try {
    const siblings = JSON.parse(fs.readFileSync(siblingsPath, "utf8"));
    const siblingLines = [];

    for (const sib of siblings.siblings || []) {
      if (!sib.path || !fs.existsSync(path.join(sib.path, ".ava", "dal.mjs"))) continue;
      try {
        const sibContext = execSync(
          `node "${path.join(sib.path, ".ava", "dal.mjs")}" context --brief`,
          { cwd: sib.path, encoding: "utf8", timeout: 5000 }
        ).trim();
        if (sibContext) {
          siblingLines.push(`**${sib.name}** (${sib.role || "sibling"}):\n${sibContext}`);
        }
      } catch {
        // Sibling DAL query failed — skip silently
      }
    }

    if (siblingLines.length > 0) {
      context.push("## Sibling Projects\n\n" + siblingLines.join("\n\n"));
    }
  } catch {
    // siblings.json parse error — skip silently
  }
}

// Health beacon auto-emission (non-blocking, silent on failure)
const dalMjsPath = path.join(dalDir, ".ava", "dal.mjs");
if (fs.existsSync(dalMjsPath)) {
  try {
    execSync(`node "${dalMjsPath}" health --emit`, {
      cwd: dalDir,
      encoding: "utf8",
      timeout: 8000,
      stdio: "ignore",
    });
  } catch {
    // Health emission failed — not blocking session start
  }
}

// Syncthing health check — warn if not running (cross-device sync to Frank/Zoe/remote spokes)
try {
  execSync("pgrep -x syncthing", { encoding: "utf8", timeout: 2000 });
} catch {
  context.push(
    "WARNING: Syncthing is NOT running. Cross-device template propagation to remote " +
    "projects and health beacons depend on it. Run: systemctl --user restart syncthing"
  );
}

// Template drift detection + auto-pull (Phase 7A+7B)
if (fs.existsSync(dalMjsPath)) {
  try {
    // Check if template.source is configured
    const sourceCheck = execSync(
      `node "${dalMjsPath}" identity get template.source`,
      { cwd: dalDir, encoding: "utf8", timeout: 5000 }
    ).trim();

    if (sourceCheck && !sourceCheck.includes("not found")) {
      // Check for auto-pull opt-in
      let autoPull = false;
      try {
        const apCheck = execSync(
          `node "${dalMjsPath}" identity get template.auto_pull`,
          { cwd: dalDir, encoding: "utf8", timeout: 5000 }
        ).trim();
        autoPull = apCheck && apCheck.includes("true");
      } catch { /* not configured — default false */ }

      // Run dry-run diff to detect drift
      const dryRun = execSync(
        `node "${dalMjsPath}" template pull --dry-run`,
        { cwd: dalDir, encoding: "utf8", timeout: 10000 }
      ).trim();

      const hasChanges = !dryRun.includes("Already in sync");

      if (hasChanges && autoPull) {
        // Auto-pull enabled — apply updates
        const pullResult = execSync(
          `node "${dalMjsPath}" template pull`,
          { cwd: dalDir, encoding: "utf8", timeout: 15000 }
        ).trim();
        context.push(
          "TEMPLATE AUTO-PULL: Updates applied automatically.\n" + pullResult
        );
      } else if (hasChanges) {
        // Drift detected but no auto-pull — warn
        context.push(
          "WARNING: Template drift detected. Your project has stale template files.\n" +
          "Run: dal.mjs template pull — to update.\n" +
          "Or enable auto-pull: dal.mjs identity set template.auto_pull --value true\n\n" +
          "Drift details:\n" + dryRun
        );
      }
    }
  } catch {
    // Drift check failed — not blocking session start
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
