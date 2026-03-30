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

// Git context
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

// Closeout reminder
const closeoutPaths = [
  path.join(projectDir, "documentation", ".prompts", "closeout.md"),
  path.join(projectDir, ".prompts", "closeout.md"),
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

// DAL context injection (role-aware)
// Uses dalDir — prefers spoke workspace brain.db over project root when available
const brainDbPath = path.join(dalDir, ".ava", "brain.db");
if (fs.existsSync(brainDbPath)) {
  const isSpoke = dalDir !== projectDir;
  const dalLabel = isSpoke
    ? `## DAL State (spoke: ${path.basename(dalDir)})\n\n`
    : "## DAL State (auto-injected from brain.db)\n\n";
  try {
    const role = process.env.CLAUDE_AGENT_ROLE || "general";
    const roleFlag = ` --role ${role}`;

    // Agent identity injection — if role matches an agent-definitions/ directory, inject SOUL.md
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

    const dalContext = execSync(
      `node "${path.join(dalDir, ".ava", "dal.mjs")}" context${roleFlag}`,
      { cwd: dalDir, encoding: "utf8", timeout: 10000 }
    ).trim();
    if (dalContext) {
      context.push(dalLabel + dalContext);

      // Detect empty brain.db — deployed but never populated
      const statusOutput = execSync(
        `node "${path.join(dalDir, ".ava", "dal.mjs")}" status`,
        { cwd: dalDir, encoding: "utf8", timeout: 5000 }
      ).trim();
      const identityMatch = statusOutput && statusOutput.match(/Identity:\s+(\d+)\s+entr/);
      const sessionsMatch = statusOutput && statusOutput.match(/Sessions:\s+(\d+)\s+total/);
      const identityCount = identityMatch ? parseInt(identityMatch[1]) : -1;
      const sessionCount = sessionsMatch ? parseInt(sessionsMatch[1]) : -1;

      if (identityCount === 0 && sessionCount === 0) {
        context.push(
          "WARNING: brain.db is deployed but EMPTY (0 identity entries, 0 sessions). " +
          "The DAL provides no session continuity until populated. " +
          "Run /cleanup to hydrate brain.db from existing project documentation."
        );
      } else if (identityCount > 0 && identityCount < 3) {
        context.push(
          "WARNING: brain.db has only " + identityCount + " identity entries — likely incomplete. " +
          "If the context above doesn't give you enough to work without reading all docs, " +
          "run /cleanup to reconcile brain.db against project documentation."
        );
      } else {
        context.push(
          "NOTE: DAL state loaded from brain.db. " +
          "CLAUDE.md (auto-loaded) contains the prescriptive rules you still need. " +
          "All other project state (decisions, architecture, handoff) is in the brain.db context above."
        );
      }
    }
  } catch {
    context.push(
      "DAL: brain.db exists but context query failed. " +
      "Run: node .ava/dal.mjs status — to diagnose."
    );
  }
}

// Handoff injection — read most recent YAML handoff for session continuity
const handoffDir = path.join(dalDir, ".ava", "handoffs");
if (fs.existsSync(handoffDir)) {
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
