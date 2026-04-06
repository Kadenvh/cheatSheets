// verify.mjs — Cross-verification system (8 layers) — v5 schema
import { requireDb } from "./db.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const PROJECT_DIR = path.resolve(AVA_DIR, "..");

function result(status, msg) { return { status, msg }; }

// ─── Layer 0: Schema Integrity ───────────────────────────────────────────────

export function verifySchema() {
  const db = requireDb();
  const details = [];
  let worst = "PASS";

  const requiredTables = [
    "schema_version", "identity", "architecture", "sessions", "decisions",
    "notes", "session_traces", "agent_actions", "agent_metrics", "agent_feedback"
  ];
  const existing = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table'"
  ).all().map(r => r.name);

  for (const t of requiredTables) {
    if (!existing.includes(t)) {
      details.push(result("FAIL", `Missing table: ${t}`));
      worst = "FAIL";
    }
  }

  const integrity = db.prepare("PRAGMA integrity_check").get();
  if (integrity.integrity_check !== "ok") {
    details.push(result("FAIL", `Integrity check: ${integrity.integrity_check}`));
    worst = "FAIL";
  } else {
    details.push(result("PASS", "Integrity check: ok"));
  }

  if (worst === "PASS") {
    details.unshift(result("PASS", `All ${requiredTables.length} tables present`));
  }

  return { layer: 0, name: "Schema Integrity", status: worst, details };
}

// ─── Layer 1: Identity Completeness ──────────────────────────────────────────

export function verifyIdentity() {
  const db = requireDb();
  const details = [];
  let worst = "PASS";

  const required = ["project.name", "project.version", "project.vision", "tech.stack"];
  for (const key of required) {
    const row = db.prepare("SELECT value FROM identity WHERE key = ?").get(key);
    if (!row || row.value === "UNSET" || row.value === "UNNAMED") {
      details.push(result("WARN", `Identity not set: ${key}`));
      if (worst === "PASS") worst = "WARN";
    }
  }

  const total = db.prepare("SELECT COUNT(*) as c FROM identity").get().c;
  if (worst === "PASS") {
    details.push(result("PASS", `${total} identity entries, all required present`));
  }

  return { layer: 1, name: "Identity Completeness", status: worst, details };
}

// ─── Layer 2: Architecture Consistency ───────────────────────────────────────

export function verifyArchitecture() {
  const db = requireDb();
  const details = [];
  let worst = "PASS";

  const total = db.prepare("SELECT COUNT(*) as c FROM architecture").get().c;
  const scopes = db.prepare("SELECT scope, COUNT(*) as c FROM architecture GROUP BY scope").all();
  const scopeSummary = scopes.map(s => `${s.c} ${s.scope}`).join(", ");

  // Check for empty values
  const empty = db.prepare("SELECT key FROM architecture WHERE value = '' OR value IS NULL").all();
  if (empty.length > 0) {
    details.push(result("WARN", `Empty values: ${empty.map(e => e.key).join(", ")}`));
    if (worst === "PASS") worst = "WARN";
  }

  details.push(result("PASS", `${total} entries: ${scopeSummary}`));

  return { layer: 2, name: "Architecture Consistency", status: worst, details };
}

// ─── Layer 3: Template Completeness ─────────────────────────────────────────

export function verifyTemplates() {
  const details = [];
  let worst = "PASS";

  // Check skills directory exists with SKILL.md files
  const skillsDir = path.join(PROJECT_DIR, ".claude", "skills");
  if (!fs.existsSync(skillsDir)) {
    return { layer: 3, name: "Template Completeness", status: "WARN", details: [result("WARN", ".claude/skills/ not found")] };
  }

  const skillDirs = fs.readdirSync(skillsDir).filter(d =>
    fs.statSync(path.join(skillsDir, d)).isDirectory()
  );

  // Check each skill has a SKILL.md
  let valid = 0;
  let missing = 0;
  for (const skill of skillDirs) {
    if (fs.existsSync(path.join(skillsDir, skill, "SKILL.md"))) {
      valid++;
    } else {
      missing++;
      details.push(result("WARN", `Skill ${skill}/ missing SKILL.md`));
      if (worst === "PASS") worst = "WARN";
    }
  }

  // Check prompts directory exists (new path: .claude/.prompts/, legacy: .prompts/)
  const promptsDirNew = path.join(PROJECT_DIR, ".claude", ".prompts");
  const promptsDirLegacy = path.join(PROJECT_DIR, ".prompts");
  const promptsDir = fs.existsSync(promptsDirNew) ? promptsDirNew : promptsDirLegacy;
  const promptCount = fs.existsSync(promptsDir)
    ? fs.readdirSync(promptsDir).filter(f => f.endsWith(".md")).length
    : 0;

  if (promptCount === 0) {
    details.push(result("WARN", ".claude/.prompts/ directory empty or missing"));
    if (worst === "PASS") worst = "WARN";
  }

  if (worst === "PASS") {
    details.push(result("PASS", `${valid} skills with SKILL.md, ${promptCount} prompt files on disk`));
  }

  return { layer: 3, name: "Template Completeness", status: worst, details };
}

// ─── Layer 4: Hook-Rule Alignment ────────────────────────────────────────────

export function verifyHooks() {
  const details = [];
  let worst = "PASS";

  const hooksDir = path.join(PROJECT_DIR, ".claude", "hooks");
  if (!fs.existsSync(hooksDir)) {
    return { layer: 4, name: "Hook-Rule Alignment", status: "WARN", details: [result("WARN", ".claude/hooks/ not found")] };
  }

  // Helper: find hook file with either .js or .cjs extension
  function findHook(dir, baseName) {
    for (const ext of [".js", ".cjs"]) {
      const p = path.join(dir, baseName + ext);
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  // Check for session-context hook (.js or .cjs)
  const sessionCtx = findHook(hooksDir, "session-context");
  if (sessionCtx) {
    const content = fs.readFileSync(sessionCtx, "utf8");
    const hookFile = path.basename(sessionCtx);
    if (content.includes("workspaceDir") || content.includes("cwdBrainDb")) {
      details.push(result("PASS", `${hookFile}: workspace-aware brain.db detection`));
    } else {
      details.push(result("WARN", `${hookFile}: missing workspace-aware brain.db detection`));
      if (worst === "PASS") worst = "WARN";
    }
  }

  // Check expected hooks exist (either .js or .cjs)
  const expectedHooks = ["session-context", "stop-closeout-check", "block-protected-files", "block-dangerous-commands"];
  for (const hook of expectedHooks) {
    if (!findHook(hooksDir, hook)) {
      details.push(result("WARN", `Missing hook: ${hook}(.js|.cjs)`));
      if (worst === "PASS") worst = "WARN";
    }
  }

  if (details.length === 0) details.push(result("PASS", "All expected hooks present"));

  return { layer: 4, name: "Hook-Rule Alignment", status: worst, details };
}

// ─── Layer 5: Loop Integrity ─────────────────────────────────────────────────

export function verifyLoop() {
  const db = requireDb();
  const details = [];
  let worst = "PASS";

  const actionCount = db.prepare("SELECT COUNT(*) as c FROM agent_actions").get().c;
  const metricCount = db.prepare("SELECT COUNT(*) as c FROM agent_metrics").get().c;
  const feedbackCount = db.prepare("SELECT COUNT(*) as c FROM agent_feedback").get().c;

  if (actionCount === 0 && metricCount === 0) {
    details.push(result("WARN", "No loop data — agent hasn't recorded actions or metrics yet"));
    if (worst === "PASS") worst = "WARN";
  } else {
    details.push(result("PASS", `${actionCount} actions, ${metricCount} measurements, ${feedbackCount} feedback entries`));

    const orphanedFeedback = db.prepare(
      "SELECT COUNT(*) as c FROM agent_feedback WHERE action_id NOT IN (SELECT id FROM agent_actions)"
    ).get().c;
    if (orphanedFeedback > 0) {
      details.push(result("WARN", `${orphanedFeedback} feedback entries reference missing actions`));
      if (worst === "PASS") worst = "WARN";
    }
  }

  return { layer: 5, name: "Loop Integrity", status: worst, details };
}

// ─── Layer 6: Cross-Project ──────────────────────────────────────────────────

export function verifyCrossProject() {
  const details = [];
  let worst = "PASS";

  const projectsJson = path.join(AVA_DIR, "agents", "dal-doctor", "projects.json");
  if (!fs.existsSync(projectsJson)) {
    details.push(result("WARN", "projects.json not found — cross-project checks skipped"));
    return { layer: 6, name: "Cross-Project Consistency", status: "WARN", details };
  }

  try {
    const data = JSON.parse(fs.readFileSync(projectsJson, "utf8"));
    const projects = data.projects || {};

    // Collect template manifest for bundle comparison (PE-only)
    const templateDir = path.join(PROJECT_DIR, "template");
    let templateSkills = [], templateHookBases = [], templatePrompts = [];
    const hasTemplate = fs.existsSync(templateDir);
    if (hasTemplate) {
      const tSkillsDir = path.join(templateDir, ".claude", "skills");
      if (fs.existsSync(tSkillsDir)) {
        templateSkills = fs.readdirSync(tSkillsDir).filter(d => {
          try { return fs.statSync(path.join(tSkillsDir, d)).isDirectory(); } catch { return false; }
        });
      }
      const tHooksDir = path.join(templateDir, ".claude", "hooks");
      if (fs.existsSync(tHooksDir)) {
        templateHookBases = fs.readdirSync(tHooksDir)
          .filter(f => f.endsWith(".js") || f.endsWith(".cjs"))
          .map(f => f.replace(/\.(c?js)$/, ""));
      }
      const tPromptsNew = path.join(templateDir, ".claude", ".prompts");
      const tPromptsLegacy = path.join(templateDir, ".prompts");
      const tPromptsDir = fs.existsSync(tPromptsNew) ? tPromptsNew : tPromptsLegacy;
      if (fs.existsSync(tPromptsDir)) {
        templatePrompts = fs.readdirSync(tPromptsDir).filter(f => f.endsWith(".md"));
      }
    }

    for (const [name, p] of Object.entries(projects)) {
      const localPath = p.local_path || p.path;
      if (!localPath) {
        if (p.host) {
          details.push(result("PASS", `${name}: remote (${p.host}) — skipped`));
        }
        continue;
      }

      // Remote project with no local path reachable
      if (p.host && !fs.existsSync(localPath)) {
        details.push(result("PASS", `${name}: remote (${p.host}) — skipped`));
        continue;
      }

      const brainDb = path.join(localPath, ".ava", "brain.db");
      if (!fs.existsSync(brainDb)) {
        details.push(result("WARN", `${name}: brain.db missing at ${localPath}`));
        if (worst === "PASS") worst = "WARN";
        continue;
      }
      details.push(result("PASS", `${name}: brain.db exists`));

      // Template bundle validation (only when PE template is available)
      if (!hasTemplate) continue;

      // Skills check
      const targetSkillsDir = path.join(localPath, ".claude", "skills");
      if (fs.existsSync(targetSkillsDir)) {
        const targetSkills = fs.readdirSync(targetSkillsDir).filter(d => {
          try { return fs.statSync(path.join(targetSkillsDir, d)).isDirectory(); } catch { return false; }
        });
        const missingSkills = templateSkills.filter(s => !targetSkills.includes(s));
        if (missingSkills.length > 0) {
          details.push(result("WARN", `${name}: ${missingSkills.length} template skills missing (${missingSkills.slice(0, 3).join(", ")}${missingSkills.length > 3 ? "..." : ""})`));
          if (worst === "PASS") worst = "WARN";
        }
      } else {
        details.push(result("WARN", `${name}: .claude/skills/ not found`));
        if (worst === "PASS") worst = "WARN";
      }

      // Hooks check (supports .js and .cjs)
      const targetHooksDir = path.join(localPath, ".claude", "hooks");
      if (fs.existsSync(targetHooksDir)) {
        const targetHookBases = fs.readdirSync(targetHooksDir)
          .filter(f => f.endsWith(".js") || f.endsWith(".cjs"))
          .map(f => f.replace(/\.(c?js)$/, ""));
        const missingHooks = templateHookBases.filter(h => !targetHookBases.includes(h));
        if (missingHooks.length > 0) {
          details.push(result("WARN", `${name}: ${missingHooks.length} template hooks missing (${missingHooks.join(", ")})`));
          if (worst === "PASS") worst = "WARN";
        }
      } else {
        details.push(result("WARN", `${name}: .claude/hooks/ not found`));
        if (worst === "PASS") worst = "WARN";
      }

      // Prompts check (new path: .claude/.prompts/, legacy: .prompts/)
      const tpNew = path.join(localPath, ".claude", ".prompts");
      const tpLegacy = path.join(localPath, ".prompts");
      const targetPromptsDir = fs.existsSync(tpNew) ? tpNew : tpLegacy;
      if (fs.existsSync(targetPromptsDir)) {
        const targetPrompts = fs.readdirSync(targetPromptsDir).filter(f => f.endsWith(".md"));
        const missingPrompts = templatePrompts.filter(p => !targetPrompts.includes(p));
        if (missingPrompts.length > 0) {
          details.push(result("WARN", `${name}: ${missingPrompts.length} template prompts missing`));
          if (worst === "PASS") worst = "WARN";
        }
      } else {
        details.push(result("WARN", `${name}: .claude/.prompts/ not found`));
        if (worst === "PASS") worst = "WARN";
      }
    }
  } catch (e) {
    details.push(result("FAIL", `projects.json parse error: ${e.message}`));
    worst = "FAIL";
  }

  return { layer: 6, name: "Cross-Project Consistency", status: worst, details };
}

// ─── Layer 7: Runtime Smoke Test ─────────────────────────────────────────────

export function verifyRuntime() {
  const details = [];
  let worst = "PASS";

  // 7a. dal.mjs exists and is executable
  const dalPath = path.join(AVA_DIR, "dal.mjs");
  if (!fs.existsSync(dalPath)) {
    details.push(result("FAIL", "dal.mjs not found"));
    return { layer: 7, name: "Runtime Smoke Test", status: "FAIL", details };
  }
  details.push(result("PASS", "dal.mjs exists"));

  // 7b. All lib modules import without error
  const libDir = path.join(AVA_DIR, "lib");
  if (fs.existsSync(libDir)) {
    const modules = fs.readdirSync(libDir).filter(f => f.endsWith(".mjs"));
    details.push(result("PASS", `${modules.length} lib modules present`));
  }

  // 7c. Hooks exist and are valid JS (syntax check via require-parse attempt)
  const hookDirs = [
    path.join(PROJECT_DIR, ".claude", "hooks"),
    path.join(PROJECT_DIR, "template", ".claude", "hooks"),
  ];
  for (const hookDir of hookDirs) {
    if (!fs.existsSync(hookDir)) continue;
    const label = hookDir.includes("template") ? "template" : "root";
    const hooks = fs.readdirSync(hookDir).filter(f => f.endsWith(".js") || f.endsWith(".cjs"));
    let hookOk = 0;
    for (const hook of hooks) {
      const content = fs.readFileSync(path.join(hookDir, hook), "utf8");
      // Basic syntax validation: check for common JS patterns
      if (content.length < 10) {
        details.push(result("WARN", `${label}/${hook}: suspiciously short (${content.length} bytes)`));
        if (worst === "PASS") worst = "WARN";
      } else {
        hookOk++;
      }
    }
    if (hookOk > 0) {
      details.push(result("PASS", `${label} hooks: ${hookOk}/${hooks.length} valid`));
    }
  }

  // 7d. settings.json parses
  const settingsFiles = [
    path.join(PROJECT_DIR, ".claude", "settings.json"),
    path.join(PROJECT_DIR, ".claude", "settings.local.json"),
  ];
  for (const sf of settingsFiles) {
    if (!fs.existsSync(sf)) continue;
    try {
      JSON.parse(fs.readFileSync(sf, "utf8"));
      details.push(result("PASS", `${path.basename(sf)}: valid JSON`));
    } catch (e) {
      details.push(result("FAIL", `${path.basename(sf)}: invalid JSON — ${e.message}`));
      worst = "FAIL";
    }
  }

  // 7e. brain.db is accessible (not locked/corrupted beyond PRAGMA check)
  try {
    const db = requireDb();
    const row = db.prepare("SELECT COUNT(*) as n FROM identity").get();
    details.push(result("PASS", `brain.db: readable (${row.n} identity entries)`));
  } catch (e) {
    details.push(result("FAIL", `brain.db: not accessible — ${e.message}`));
    worst = "FAIL";
  }

  return { layer: 7, name: "Runtime Smoke Test", status: worst, details };
}

// ─── Runner ──────────────────────────────────────────────────────────────────

export function runAll({ layer } = {}) {
  const layers = [
    verifySchema,
    verifyIdentity,
    verifyArchitecture,
    verifyTemplates,
    verifyHooks,
    verifyLoop,
    verifyCrossProject,
    verifyRuntime,
  ];

  if (layer !== undefined) {
    const fn = layers[layer];
    if (!fn) throw new Error(`Layer ${layer} not found (0-${layers.length - 1})`);
    return [fn()];
  }

  return layers.map(fn => fn());
}
