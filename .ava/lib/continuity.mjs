// continuity.mjs — Synthesized continuity brief for session-init and resume flows
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DB_PATH, getDb } from "./db.mjs";
import { loadLatestHandoff } from "./handoff.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const PROJECT_DIR = path.resolve(AVA_DIR, "..");

export function generateContinuityBrief(options = {}) {
  const inputs = normalizeOptions(options);
  const db = getDb({ create: false });
  const hasBrainDb = fs.existsSync(DB_PATH) && !!db;

  const projectName = readIdentityValue(db, "project.name") || path.basename(PROJECT_DIR);
  const projectVersion = readIdentityValue(db, "project.version");

  const brief = {
    version: 1,
    generated_at: new Date().toISOString(),
    inputs: {
      role: inputs.role,
      scope: inputs.scope,
      max_notes: inputs.maxNotes,
      max_actions: inputs.maxActions,
      max_decisions: inputs.maxDecisions,
      max_plans: inputs.maxPlans,
      include_handoff: inputs.includeHandoff,
      include_contradictions: inputs.includeContradictions,
    },
    project: {
      cwd: process.cwd(),
      name: projectName || null,
      version: projectVersion || null,
      dal_version: inputs.dalVersion,
      schema_version: db ? readSchemaVersion(db) : null,
      has_brain_db: hasBrainDb,
    },
    open_session: db ? getOpenSession(db) : null,
    last_closed_session: db ? getLastClosedSession(db) : null,
    latest_handoff: inputs.includeHandoff ? getLatestHandoffSummary() : null,
    open_notes: db ? getOpenNotes(db, inputs.maxNotes) : [],
    partial_actions: db ? getPartialActions(db, inputs.maxActions) : [],
    active_plans: getActivePlans({
      plansDir: path.join(PROJECT_DIR, "plans"),
      maxPlans: inputs.maxPlans,
    }),
    recent_decisions: db ? getRecentDecisions(db, inputs.maxDecisions) : [],
    contradictions: inputs.includeContradictions
      ? detectContradictions({ projectRoot: PROJECT_DIR })
      : [],
    required_confirmations: [],
    recommended_next_step: {
      mode: "start-fresh",
      summary: "No prior continuity signals found. Start a fresh session.",
    },
  };

  brief.required_confirmations = getRequiredConfirmations(brief);
  brief.recommended_next_step = getRecommendedNextStep(brief);

  return brief;
}

export function formatContinuityBrief(brief) {
  const lines = [];
  const projectName = brief.project.name || path.basename(brief.project.cwd);
  const projectVersion = brief.project.version ? ` v${brief.project.version}` : "";
  const schemaVersion = brief.project.schema_version ?? "unknown";

  lines.push(`${projectName}${projectVersion}`);
  lines.push(`cwd: ${brief.project.cwd}`);
  lines.push(`DAL ${brief.project.dal_version} | schema ${schemaVersion} | brain.db: ${brief.project.has_brain_db ? "yes" : "no"}`);
  lines.push("");

  lines.push("Open Session");
  if (brief.open_session) {
    lines.push(`- ${brief.open_session.id}`);
    lines.push(`- started: ${brief.open_session.start_time || "unknown"}`);
    lines.push(`- model: ${brief.open_session.agent_model || "unknown"}`);
  } else {
    lines.push("- none");
  }
  lines.push("");

  lines.push("Last Closed Session");
  if (brief.last_closed_session) {
    lines.push(`- ${brief.last_closed_session.id}`);
    lines.push(`- start: ${brief.last_closed_session.start_time || "unknown"}`);
    lines.push(`- end: ${brief.last_closed_session.end_time || "unknown"}`);
    lines.push(`- exit: ${brief.last_closed_session.exit_reason || "unknown"}`);
    lines.push(`- summary: ${brief.last_closed_session.summary || "none"}`);
    if (brief.last_closed_session.version_bump) {
      lines.push(`- version bump: ${brief.last_closed_session.version_bump}`);
    }
  } else {
    lines.push("- none");
  }
  lines.push("");

  lines.push("Latest Handoff");
  if (brief.latest_handoff) {
    lines.push(`- file: ${brief.latest_handoff.filename}`);
    lines.push(`- timestamp: ${brief.latest_handoff.timestamp || "unknown"}`);
    lines.push(`- summary: ${brief.latest_handoff.summary || "none"}`);
    lines.push(renderStringList("blockers", brief.latest_handoff.blockers));
    lines.push(renderStringList("next actions", brief.latest_handoff.next_actions));
    lines.push(renderStringList("errors", brief.latest_handoff.errors));
  } else {
    lines.push("- none");
  }
  lines.push("");

  lines.push("Open Notes");
  lines.push(...renderNotes(brief.open_notes));
  lines.push("");

  lines.push("Partial Actions");
  lines.push(...renderActions(brief.partial_actions));
  lines.push("");

  lines.push("Active Plans");
  lines.push(...renderPlans(brief.active_plans));
  lines.push("");

  lines.push("Recent Decisions");
  lines.push(...renderDecisions(brief.recent_decisions));
  lines.push("");

  lines.push("Contradictions");
  lines.push(...renderContradictions(brief.contradictions));
  lines.push("");

  lines.push("Required Confirmations");
  lines.push(...renderConfirmations(brief.required_confirmations));
  lines.push("");

  lines.push("Recommended Next Step");
  lines.push(`- mode: ${brief.recommended_next_step.mode}`);
  lines.push(`- ${brief.recommended_next_step.summary}`);

  return lines.join("\n");
}

function normalizeOptions(options) {
  return {
    role: options.role || "dev",
    scope: options.scope || "project",
    maxNotes: toInt(options.maxNotes, 5),
    maxActions: toInt(options.maxActions, 5),
    maxDecisions: toInt(options.maxDecisions, 5),
    maxPlans: toInt(options.maxPlans, 5),
    includeHandoff: toBool(options.includeHandoff, true),
    includeContradictions: toBool(options.includeContradictions, true),
    dalVersion: options.dalVersion || "unknown",
  };
}

function toBool(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() !== "false";
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readIdentityValue(db, key) {
  if (!db) return null;
  const row = db.prepare("SELECT value FROM identity WHERE key = ?").get(key);
  return row?.value || null;
}

function readSchemaVersion(db) {
  const row = db.prepare("SELECT MAX(version) as v FROM schema_version").get();
  return row?.v || null;
}

function getOpenSession(db) {
  const row = db.prepare(`
    SELECT id, start_time, agent_model
    FROM sessions
    WHERE end_time IS NULL
    ORDER BY start_time DESC
    LIMIT 1
  `).get();
  return row || null;
}

function getLastClosedSession(db) {
  const row = db.prepare(`
    SELECT id, start_time, end_time, exit_reason, summary, version_bump
    FROM sessions
    WHERE end_time IS NOT NULL
    ORDER BY end_time DESC, start_time DESC
    LIMIT 1
  `).get();
  return row || null;
}

function getLatestHandoffSummary() {
  const latest = loadLatestHandoff();
  if (!latest) return null;

  const parsed = parseYamlLike(latest.content);
  return {
    filename: latest.filename,
    timestamp: toNullableString(parsed.timestamp),
    summary: toNullableString(parsed.summary),
    blockers: toStringArray(parsed.blockers),
    next_actions: toStringArray(parsed.next_actions),
    errors: toStringArray(parsed.errors),
    open_notes: toStringArray(parsed.open_notes),
    traces: toTraceArray(parsed.traces),
  };
}

function parseYamlLike(content) {
  const lines = content.split(/\r?\n/);
  const result = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^([a-z_]+):(?:\s*(.*))?$/);
    if (!match) {
      i++;
      continue;
    }

    const key = match[1];
    const raw = match[2] ?? "";

    if (raw === "|") {
      const block = [];
      i++;
      while (i < lines.length && lines[i].startsWith("  ")) {
        block.push(lines[i].slice(2));
        i++;
      }
      result[key] = block.join("\n").trimEnd();
      continue;
    }

    if (raw === "[]") {
      result[key] = [];
      i++;
      continue;
    }

    if (raw === "null") {
      result[key] = null;
      i++;
      continue;
    }

    if (raw) {
      result[key] = parseScalar(raw);
      i++;
      continue;
    }

    i++;
    const block = [];
    while (i < lines.length && (lines[i].startsWith("  ") || lines[i].trim() === "")) {
      block.push(lines[i]);
      i++;
    }
    result[key] = parseIndentedBlock(block);
  }

  return result;
}

function parseIndentedBlock(lines) {
  const nonEmpty = lines.filter((line) => line.trim() !== "");
  if (nonEmpty.length === 0) return [];

  if (nonEmpty[0].startsWith("  - ")) {
    if (/^  - [a-z_]+:\s*/.test(nonEmpty[0])) {
      return parseObjectArray(nonEmpty);
    }
    return nonEmpty.map((line) => parseScalar(line.replace(/^  - /, "")));
  }

  return nonEmpty.map((line) => line.trim()).join("\n");
}

function parseObjectArray(lines) {
  const items = [];
  let current = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    const head = line.match(/^  - ([a-z_]+):\s*(.*)$/);
    if (head) {
      if (current) items.push(current);
      current = { [head[1]]: parseScalar(head[2]) };
      continue;
    }

    const prop = line.match(/^    ([a-z_]+):\s*(.*)$/);
    if (prop && current) {
      current[prop[1]] = parseScalar(prop[2]);
    }
  }

  if (current) items.push(current);
  return items;
}

function parseScalar(raw) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1).replace(/\\"/g, "\"");
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function getOpenNotes(db, limit) {
  const rows = db.prepare(`
    SELECT id, category, text, created_at
    FROM notes
    WHERE completed = 0
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);

  return rows.map((row) => ({
    id: normalizeId(row.id),
    category: row.category,
    text: row.text,
    created_at: row.created_at || null,
  }));
}

function getPartialActions(db, limit) {
  const rows = db.prepare(`
    SELECT id, session_id, action_type, target, description, outcome, outcome_detail, note_id, created_at
    FROM agent_actions
    WHERE outcome IN ('pending', 'partial')
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);

  return rows.map((row) => ({
    id: row.id,
    session_id: row.session_id || null,
    action_type: row.action_type,
    target: row.target || null,
    description: row.description,
    outcome: row.outcome,
    outcome_detail: row.outcome_detail || null,
    note_id: normalizeId(row.note_id),
    created_at: row.created_at || null,
  }));
}

function getRecentDecisions(db, limit) {
  const rows = db.prepare(`
    SELECT id, title, chosen, rationale, component, status, created_at
    FROM decisions
    WHERE status = 'active'
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    chosen: row.chosen,
    rationale: row.rationale || null,
    component: row.component || null,
    status: row.status,
    created_at: row.created_at || null,
  }));
}

function getActivePlans({ plansDir, maxPlans }) {
  if (!fs.existsSync(plansDir)) return [];

  const files = walkPlans(plansDir)
    .map((filePath) => {
      const content = fs.readFileSync(filePath, "utf8");
      const stat = fs.statSync(filePath);
      return {
        path: path.relative(PROJECT_DIR, filePath),
        title: readPlanTitle(content) || path.basename(filePath),
        status: readPlanStatus(content),
        updated_at: new Date(stat.mtimeMs).toISOString().slice(0, 10),
        why_relevant: null,
      };
    })
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));

  return files.slice(0, maxPlans);
}

function walkPlans(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "archive") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPlans(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function readPlanTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function readPlanStatus(content) {
  const patterns = [
    /^\*\*Status:\*\*\s*(.+)$/mi,
    /^Status:\s*(.+)$/mi,
    /^status:\s*(.+)$/mi,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function detectContradictions({ projectRoot }) {
  const contradictions = [];
  const plansDir = path.join(projectRoot, "plans");
  const rootArchive = path.join(projectRoot, "archive");

  if (!fs.existsSync(plansDir)) {
    contradictions.push({
      severity: "fail",
      code: "project_plans_missing",
      message: "Project-local plans/ is missing.",
      source: plansDir,
      suggested_fix: "Create plans/ at the project root and keep active plans there.",
    });
  }

  if (fs.existsSync(rootArchive)) {
    contradictions.push({
      severity: "warn",
      code: "root_archive_present",
      message: "Root archive/ exists. Archive should be extraction-first and intentional.",
      source: rootArchive,
      suggested_fix: "Keep active work in project-local surfaces and retain only curated extracted artifacts.",
    });
  }

  contradictions.push(...detectRetiredStorage({ projectRoot }));
  contradictions.push(...detectOrphanPrompts({ projectRoot }));
  contradictions.push(...detectDuplicatePlans({ projectRoot }));
  contradictions.push(...detectBrainDbCopies({ projectRoot }));
  contradictions.push(...detectScaffoldsAsDeployable({ projectRoot }));
  contradictions.push(...detectHookProtectionClaims({ projectRoot }));

  return contradictions;
}

// Retired-storage check (Phase 4 validator seed, session 125).
// Flags the presence of paths that were canonical in earlier versions but
// have been explicitly retired by doctrine. These are `warn`, not `fail`,
// because they may hold unextracted content that still needs consolidation.
const RETIRED_PROJECT_PATHS = [
  {
    path: ".claude/plans",
    reason: "Plans moved to project-root plans/ in v7 (decision #69)",
    fix: "Move contents to plans/ at project root; delete .claude/plans/ after extraction.",
  },
  {
    path: "PROJECT_ROADMAP.md",
    reason: "Retired in v5.14.0; use brain.db decisions + plans/ at project root",
    fix: "Extract live content into brain.db or plans/, then delete.",
  },
  {
    path: "IMPLEMENTATION_PLAN.md",
    reason: "Retired in v5.14.0; use brain.db decisions + plans/ at project root",
    fix: "Extract live content into brain.db or plans/, then delete.",
  },
  {
    path: "documentation",
    reason: "Retired in v5.14.0; use CLAUDE.md + SYSTEM-OVERVIEW.md + plans/",
    fix: "Extract content into canonical surfaces, then delete.",
  },
];

function detectRetiredStorage({ projectRoot }) {
  const out = [];
  for (const entry of RETIRED_PROJECT_PATHS) {
    const full = path.join(projectRoot, entry.path);
    if (fs.existsSync(full)) {
      out.push({
        severity: "warn",
        code: "retired_storage_present",
        message: `${entry.path} exists but is retired by doctrine. ${entry.reason}.`,
        source: full,
        suggested_fix: entry.fix,
      });
    }
  }
  return out;
}

// Prompt→skill mismatch check (Phase 4 validator seed, session 125).
// Walks .claude/skills/*/SKILL.md and extracts referenced prompt basenames,
// then walks .claude/.prompts/*.md and flags any file that is not referenced
// by any skill AND not in the known-library exception list. Catches the
// portfolio-generation orphan and any future orphans of the same shape.
const LIBRARY_PROMPTS = new Set([
  // Imported as reference material by other skills/prompts, no wrapping skill.
  "system-reference.md",
  // Auto-generated metrics report, not a protocol file.
  "METRICS.md",
]);

function detectOrphanPrompts({ projectRoot }) {
  const out = [];
  const claudeDir = path.join(projectRoot, ".claude");
  const skillsDir = path.join(claudeDir, "skills");
  const promptsDir = path.join(claudeDir, ".prompts");

  // If either directory is missing, the check can't run meaningfully — return
  // empty. This keeps downstream projects that bootstrap via /dal-doctor from
  // getting noisy false warnings before their .claude/ is fully staged.
  if (!fs.existsSync(skillsDir) || !fs.existsSync(promptsDir)) {
    return out;
  }

  const referenced = scanSkillPromptReferences(skillsDir);

  let promptFiles;
  try {
    promptFiles = fs.readdirSync(promptsDir).filter((f) => f.endsWith(".md"));
  } catch {
    return out;
  }

  for (const file of promptFiles) {
    if (LIBRARY_PROMPTS.has(file)) continue;
    if (referenced.has(file)) continue;

    // Check for explicit `library: true` frontmatter before flagging.
    const full = path.join(promptsDir, file);
    if (hasLibraryFrontmatter(full)) continue;

    out.push({
      severity: "warn",
      code: "orphan_prompt",
      message: `${file} has no matching skill and no library marker.`,
      source: full,
      suggested_fix: `Wrap it in a skill at .claude/skills/${file.replace(/\.md$/, "")}/SKILL.md, add 'library: true' frontmatter, or delete the prompt.`,
    });
  }

  return out;
}

function scanSkillPromptReferences(skillsDir) {
  const referenced = new Set();
  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return referenced;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;
    let content;
    try {
      content = fs.readFileSync(skillFile, "utf8");
    } catch {
      continue;
    }
    // Match `.claude/.prompts/foo.md` anywhere in the SKILL.md body.
    const matches = content.matchAll(/\.claude\/\.prompts\/([a-zA-Z0-9_-]+\.md)/g);
    for (const m of matches) {
      referenced.add(m[1]);
    }
  }

  return referenced;
}

// Duplicate-plan check (Phase 4 validator, session 126).
// Counts active plan files in plans/ (archive/ excluded by walkPlans). Session
// 125's consolidation collapsed 4 plans to 1. Heuristic tiers: 1 plan is the
// target, 2-3 warns as "possible consolidation", 4+ fails as "must consolidate
// or archive". Matches pe-v7 Phase 4 acceptance: "fail if >N plans".
const DUPLICATE_PLAN_WARN_AT = 2;
const DUPLICATE_PLAN_FAIL_AT = 4;

function detectDuplicatePlans({ projectRoot }) {
  const plansDir = path.join(projectRoot, "plans");
  if (!fs.existsSync(plansDir)) return [];

  let plans;
  try {
    plans = walkPlans(plansDir);
  } catch {
    return [];
  }

  if (plans.length < DUPLICATE_PLAN_WARN_AT) return [];

  const severity = plans.length >= DUPLICATE_PLAN_FAIL_AT ? "fail" : "warn";
  const planList = plans
    .map((p) => path.relative(projectRoot, p))
    .sort()
    .join(", ");

  return [{
    severity,
    code: "duplicate_active_plans",
    message: `${plans.length} active plans in plans/ (${planList}). Consolidate to a single canonical plan or archive superseded ones with receipts.`,
    source: plansDir,
    suggested_fix: "Run dal.mjs consolidate <target> to merge, or move superseded plans to plans/archive/<event>/ with ARCHIVE_RECEIPT.md.",
  }];
}

// brain.db-copies check (Phase 4 validator, session 126).
// Walks the project (bounded) looking for brain.db files outside .ava/. Fail
// severity — duplicate brain.db breaks continuity by letting two sources of
// truth exist. Skips node_modules, .git, and .ava/ itself.
const WALK_SKIP_DIRS = new Set([
  "node_modules", ".git", ".ava", ".gitnexus", "dist", "build",
  ".next", ".cache", ".claude", "archive",
]);
const WALK_MAX_DEPTH = 6;

function detectBrainDbCopies({ projectRoot }) {
  const out = [];
  const found = [];

  function walk(dir, depth) {
    if (depth > WALK_MAX_DEPTH) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "brain.db" && entry.isFile()) {
        found.push(path.join(dir, entry.name));
        continue;
      }
      if (!entry.isDirectory()) continue;
      if (WALK_SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      walk(path.join(dir, entry.name), depth + 1);
    }
  }

  walk(projectRoot, 0);

  for (const filepath of found) {
    out.push({
      severity: "fail",
      code: "brain_db_outside_ava",
      message: `brain.db found outside .ava/: ${path.relative(projectRoot, filepath)}. Duplicate continuity stores break single-source-of-truth.`,
      source: filepath,
      suggested_fix: "Delete or move this brain.db. The canonical location is .ava/brain.db at the project root.",
    });
  }

  return out;
}

// Scaffolds-as-deployable check (Phase 4 validator, session 126).
// Some .claude/ content is scaffolded into downstream projects by hooks (e.g.
// gitnexus-* skills are generated by gitnexus-post-commit.js based on the
// project's indexed state). These must NOT live in template/.claude/ or they
// overwrite the downstream-scaffolded versions. Decision #64 codified the
// gitnexus case. Warn if template/ contains any known-scaffolded asset.
// Only skills/ is checked — gitnexus *hooks* legitimately ship in template
// (shared infrastructure); the scaffolded content is the per-project
// gitnexus-* skills that gitnexus-post-commit.js generates based on the
// project's own indexed state.
const SCAFFOLD_SKILL_PATTERNS = [
  { glob: /^gitnexus(-|$)/, reason: "gitnexus-* skills are scaffolded by gitnexus-post-commit.js per decision #64; shipping them overwrites downstream-scaffolded versions." },
];

function detectScaffoldsAsDeployable({ projectRoot }) {
  const out = [];
  const skillsDir = path.join(projectRoot, "template", ".claude", "skills");
  if (!fs.existsSync(skillsDir)) return out;

  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    for (const pattern of SCAFFOLD_SKILL_PATTERNS) {
      if (pattern.glob.test(entry.name)) {
        const full = path.join(skillsDir, entry.name);
        out.push({
          severity: "warn",
          code: "scaffold_in_template",
          message: `template/.claude/skills/${entry.name} is scaffold content but lives in the deployable template. ${pattern.reason}`,
          source: full,
          suggested_fix: `Remove template/.claude/skills/${entry.name}/; it should only exist at the project root where the scaffolder generates it.`,
        });
      }
    }
  }

  return out;
}

// Hook-protection-claims check (Phase 4 validator, session 126).
// Scans CLAUDE.md for references to specific hook filenames (pattern foo.js
// mentioned near "hook", "block", "protect", or in a hook table). Verifies
// each referenced hook actually exists in template/.claude/hooks/. Warns on
// any hook named in docs but missing on disk — false-protection claims are
// worse than no claim because they give the agent false confidence.
function detectHookProtectionClaims({ projectRoot }) {
  const out = [];
  const claudeMd = path.join(projectRoot, "CLAUDE.md");
  if (!fs.existsSync(claudeMd)) return out;

  const hooksDir = path.join(projectRoot, "template", ".claude", "hooks");
  if (!fs.existsSync(hooksDir)) return out;

  let content;
  let existing;
  try {
    content = fs.readFileSync(claudeMd, "utf8");
    existing = new Set(fs.readdirSync(hooksDir).filter((f) => f.endsWith(".js")));
  } catch {
    return out;
  }

  // Match backtick-wrapped hook filenames: `foo-bar.js` — these are the load-
  // bearing protection claims in CLAUDE.md's hook tables and rules sections.
  const referenced = new Set();
  const matches = content.matchAll(/`([a-zA-Z0-9_-]+\.js)`/g);
  for (const m of matches) {
    referenced.add(m[1]);
  }

  // Cross-reference: any hook-named .js mentioned in doc but missing from
  // template/.claude/hooks/. Filter to names matching hook naming convention
  // to avoid flagging random .js references (e.g. dal.mjs is not .js).
  const HOOK_NAME_PATTERN = /^(block-|gitnexus-|session-|stop-|completion-|typecheck-|lint-|log-)/;
  for (const name of referenced) {
    if (!HOOK_NAME_PATTERN.test(name)) continue;
    if (existing.has(name)) continue;
    out.push({
      severity: "warn",
      code: "hook_protection_claim_unbacked",
      message: `CLAUDE.md references hook \`${name}\` but template/.claude/hooks/${name} does not exist.`,
      source: claudeMd,
      suggested_fix: `Either create ${name} in template/.claude/hooks/, or remove the reference from CLAUDE.md.`,
    });
  }

  return out;
}

function hasLibraryFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Only parse the top ~20 lines for frontmatter; prompts can be large.
    const head = content.split(/\r?\n/).slice(0, 20).join("\n");
    if (!head.startsWith("---")) return false;
    return /^library:\s*true\s*$/mi.test(head);
  } catch {
    return false;
  }
}

function getRequiredConfirmations(brief) {
  const confirmations = [];

  if (brief.open_session) {
    confirmations.push({
      code: "confirm_open_session",
      prompt: `Resume the open DAL session ${brief.open_session.id}?`,
      reason: "A session is still open and continuation should be explicit.",
    });
  }

  if (brief.active_plans.length > 1) {
    confirmations.push({
      code: "confirm_active_plan",
      prompt: "Multiple active plan files exist. Which one is the current execution source of truth?",
      reason: "Continuation is ambiguous when more than one active plan is present.",
    });
  }

  if (brief.latest_handoff && brief.latest_handoff.blockers.length > 0) {
    confirmations.push({
      code: "confirm_blockers",
      prompt: "Proceed with the current blockers still unresolved?",
      reason: "The latest handoff recorded open blockers.",
    });
  }

  return confirmations;
}

function getRecommendedNextStep(brief) {
  const hasFail = brief.contradictions.some((item) => item.severity === "fail");
  if (hasFail) {
    return {
      mode: "repair-topology",
      summary: "Resolve the failing topology contradiction before continuing normal work.",
    };
  }

  if (brief.required_confirmations.length > 0) {
    return {
      mode: "resume-with-confirmation",
      summary: "Review the continuity signals, resolve the open confirmation points, then resume work.",
    };
  }

  const hasContinuitySignals =
    !!brief.open_session ||
    !!brief.last_closed_session ||
    !!brief.latest_handoff ||
    brief.open_notes.length > 0 ||
    brief.partial_actions.length > 0 ||
    brief.active_plans.length > 0 ||
    brief.recent_decisions.length > 0;

  if (hasContinuitySignals) {
    return {
      mode: "resume",
      summary: "Resume from the latest handoff, open notes, and active plans.",
    };
  }

  return {
    mode: "start-fresh",
    summary: "No meaningful continuity signals were found. Start a fresh session.",
  };
}

function normalizeId(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (/^\d+$/.test(String(value))) return Number(value);
  return String(value);
}

function toNullableString(value) {
  return value === null || value === undefined || value === "" ? null : String(value);
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function toTraceArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    type: toNullableString(item?.type),
    target: toNullableString(item?.target),
    detail: toNullableString(item?.detail),
    outcome: toNullableString(item?.outcome),
  }));
}

function renderStringList(label, items) {
  if (!items || items.length === 0) return `- ${label}: none`;
  return `- ${label}: ${items.join(" | ")}`;
}

function renderNotes(notes) {
  if (!notes.length) return ["- none"];
  return notes.map((note) => `- ${note.id} [${note.category}] ${note.text}`);
}

function renderActions(actions) {
  if (!actions.length) return ["- none"];
  return actions.map((action) => `- #${action.id} [${action.action_type}] ${action.outcome} — ${action.description}`);
}

function renderPlans(plans) {
  if (!plans.length) return ["- none"];
  return plans.map((plan) => `- ${plan.path} — ${plan.title}${plan.status ? ` [${plan.status}]` : ""}`);
}

function renderDecisions(decisions) {
  if (!decisions.length) return ["- none"];
  return decisions.map((decision) => `- #${decision.id} ${decision.title} — ${decision.chosen}`);
}

function renderContradictions(contradictions) {
  if (!contradictions.length) return ["- none"];
  return contradictions.map((item) => `- [${item.severity}] ${item.code}: ${item.message}`);
}

function renderConfirmations(confirmations) {
  if (!confirmations.length) return ["- none"];
  return confirmations.map((item) => `- ${item.code}: ${item.prompt}`);
}
