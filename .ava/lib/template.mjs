// template.mjs — Template bundle manifest, diff, sync, and pull
// No brain.db dependency — pure filesystem + crypto operations.
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const PROJECT_DIR = path.resolve(AVA_DIR, "..");
const DEFAULT_TEMPLATE_DIR = path.join(PROJECT_DIR, "template");

/**
 * Resolve the template source directory.
 * Priority: explicit arg > env PE_TEMPLATE_DIR > default (sibling template/).
 * For pull(), the caller resolves from identity first, then passes here.
 */
function resolveTemplateDir(explicitDir) {
  if (explicitDir && fs.existsSync(explicitDir)) return path.resolve(explicitDir);
  if (process.env.PE_TEMPLATE_DIR && fs.existsSync(process.env.PE_TEMPLATE_DIR)) {
    return path.resolve(process.env.PE_TEMPLATE_DIR);
  }
  return DEFAULT_TEMPLATE_DIR;
}

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

function categorize(relativePath) {
  if (relativePath.startsWith(".claude/skills/")) return "skill";
  if (relativePath.startsWith(".claude/hooks/")) return "hook";
  if (relativePath.startsWith(".claude/agents/")) return "agent";
  if (relativePath.startsWith(".prompts/")) return "prompt";
  return "config";
}

function walkDir(dir, base = dir) {
  const entries = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      entries.push(...walkDir(fullPath, base));
    } else {
      entries.push(path.relative(base, fullPath));
    }
  }
  return entries;
}

// Files/dirs to skip in manifest (not deployable)
const SKIP_PATTERNS = [
  /^CLAUDE\.md$/,
  /^README\.md$/,
  /^VERSION$/,
  /^PROJECT_ROADMAP\.md$/,
  /^IMPLEMENTATION_PLAN\.md$/,
  /^archive\//,
  /^plans\//,
  /^visualization\//,
  /^spoke-agent\//,
  /^\.stfolder\//,
  /^\.stignore$/,
];

function shouldSkip(relativePath) {
  // Normalize to forward slashes for cross-platform pattern matching (Windows uses backslashes)
  const normalized = relativePath.replace(/\\/g, "/");
  return SKIP_PATTERNS.some(p => p.test(normalized));
}

// ─── manifest ────────────────────────────────────────────────────────────────

export function manifest(sourceDir) {
  const templateDir = resolveTemplateDir(sourceDir);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const files = walkDir(templateDir);
  return files
    .filter(f => !shouldSkip(f))
    .map(relativePath => ({
      relativePath,
      category: categorize(relativePath),
      checksum: sha256(path.join(templateDir, relativePath)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.relativePath.localeCompare(b.relativePath));
}

// ─── diff ────────────────────────────────────────────────────────────────────

function isEsmProject(targetPath) {
  const pkgPath = path.join(targetPath, "package.json");
  if (!fs.existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return pkg.type === "module";
  } catch {
    return false;
  }
}

function hookTargetPath(relativePath, esm) {
  if (!esm || !relativePath.startsWith(".claude/hooks/") || !relativePath.endsWith(".js")) {
    return relativePath;
  }
  return relativePath.replace(/\.js$/, ".cjs");
}

export function diff(targetPath, { sourceDir } = {}) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Target project not found: ${targetPath}`);
  }

  const entries = manifest(sourceDir);
  const esm = isEsmProject(targetPath);
  const results = [];

  for (const entry of entries) {
    const mappedPath = hookTargetPath(entry.relativePath, esm);
    const targetFile = path.join(targetPath, mappedPath);

    if (!fs.existsSync(targetFile)) {
      results.push({ ...entry, mappedPath, status: "MISSING" });
    } else {
      const targetChecksum = sha256(targetFile);
      results.push({
        ...entry,
        mappedPath,
        status: targetChecksum === entry.checksum ? "MATCH" : "STALE",
        targetChecksum,
      });
    }
  }

  // Detect custom skills/agents (in target but not in template)
  const templateSkills = entries
    .filter(e => e.category === "skill")
    .map(e => e.relativePath.split("/")[2]);
  const uniqueTemplateSkills = [...new Set(templateSkills)];

  const targetSkillsDir = path.join(targetPath, ".claude", "skills");
  if (fs.existsSync(targetSkillsDir)) {
    const targetSkills = fs.readdirSync(targetSkillsDir).filter(d => {
      try { return fs.statSync(path.join(targetSkillsDir, d)).isDirectory(); } catch { return false; }
    });
    for (const s of targetSkills) {
      if (!uniqueTemplateSkills.includes(s)) {
        results.push({
          relativePath: `.claude/skills/${s}/`,
          mappedPath: `.claude/skills/${s}/`,
          category: "skill",
          status: "EXTRA",
          checksum: null,
        });
      }
    }
  }

  return { esm, results };
}

// ─── sync ────────────────────────────────────────────────────────────────────

const PROTECTED = ["brain.db", "CLAUDE.md", "settings.local.json"];

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function sync(targetPath, { dal = false, sourceDir } = {}) {
  const templateDir = resolveTemplateDir(sourceDir);
  const { esm, results } = diff(targetPath, { sourceDir });
  const actions = [];

  // Sync MISSING and STALE template files
  for (const entry of results) {
    if (entry.status !== "MISSING" && entry.status !== "STALE") continue;

    // Safety: never overwrite protected files
    const basename = path.basename(entry.mappedPath);
    if (PROTECTED.includes(basename)) continue;

    const src = path.join(templateDir, entry.relativePath);
    const dst = path.join(targetPath, entry.mappedPath);

    ensureDir(dst);

    if (fs.statSync(src).isDirectory()) {
      // Copy directory recursively
      copyDirSync(src, dst);
    } else {
      fs.copyFileSync(src, dst);
    }

    actions.push({ action: entry.status === "MISSING" ? "added" : "updated", path: entry.mappedPath, category: entry.category });
  }

  // Sync DAL runtime if requested
  if (dal) {
    const dalFiles = [
      { src: path.join(AVA_DIR, "dal.mjs"), rel: ".ava/dal.mjs" },
      { src: path.join(AVA_DIR, "package.json"), rel: ".ava/package.json" },
    ];

    // lib/*.mjs
    const libDir = path.join(AVA_DIR, "lib");
    if (fs.existsSync(libDir)) {
      for (const f of fs.readdirSync(libDir).filter(f => f.endsWith(".mjs"))) {
        dalFiles.push({ src: path.join(libDir, f), rel: `.ava/lib/${f}` });
      }
    }

    // migrations/*.sql
    const migrDir = path.join(AVA_DIR, "migrations");
    if (fs.existsSync(migrDir)) {
      for (const f of fs.readdirSync(migrDir).filter(f => f.endsWith(".sql"))) {
        dalFiles.push({ src: path.join(migrDir, f), rel: `.ava/migrations/${f}` });
      }
    }

    for (const { src, rel } of dalFiles) {
      if (!fs.existsSync(src)) continue;
      const dst = path.join(targetPath, rel);
      ensureDir(dst);

      // Skip if checksums match
      if (fs.existsSync(dst) && sha256(src) === sha256(dst)) continue;

      fs.copyFileSync(src, dst);
      actions.push({ action: fs.existsSync(dst) ? "updated" : "added", path: rel, category: "dal-runtime" });
    }
  }

  return { esm, actions };
}

// ─── pull ─────────────────────────────────────────────────────────────────────

/**
 * Pull template updates from a source directory into the current project.
 * Reverse of sync: source is the canonical template, target is this project.
 * @param {string} sourceDir - Path to the template source (PE/template/ or Syncthing mirror)
 * @param {object} opts - { dal: boolean, dryRun: boolean }
 * @returns {{ esm: boolean, actions: Array, version: string|null }}
 */
export function pull(sourceDir, { dal = false, dryRun = false } = {}) {
  const resolvedSource = resolveTemplateDir(sourceDir);
  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Template source not found: ${resolvedSource}`);
  }

  // Read VERSION from source
  const versionFile = path.join(resolvedSource, "VERSION");
  const version = fs.existsSync(versionFile)
    ? fs.readFileSync(versionFile, "utf8").trim()
    : null;

  // Build manifest from the source, diff against current project
  const sourceEntries = manifest(resolvedSource);
  const esm = isEsmProject(PROJECT_DIR);
  const actions = [];

  for (const entry of sourceEntries) {
    const mappedPath = hookTargetPath(entry.relativePath, esm);
    const localFile = path.join(PROJECT_DIR, mappedPath);

    let status;
    if (!fs.existsSync(localFile)) {
      status = "MISSING";
    } else {
      const localChecksum = sha256(localFile);
      status = localChecksum === entry.checksum ? "MATCH" : "STALE";
    }

    if (status !== "MISSING" && status !== "STALE") continue;

    // Safety: never overwrite protected files
    const basename = path.basename(mappedPath);
    if (PROTECTED.includes(basename)) continue;

    if (!dryRun) {
      const src = path.join(resolvedSource, entry.relativePath);
      const dst = path.join(PROJECT_DIR, mappedPath);
      ensureDir(dst);

      if (fs.statSync(src).isDirectory()) {
        copyDirSync(src, dst);
      } else {
        fs.copyFileSync(src, dst);
      }
    }

    actions.push({
      action: status === "MISSING" ? "added" : "updated",
      path: mappedPath,
      category: entry.category,
    });
  }

  // Pull DAL runtime if requested
  if (dal && !dryRun) {
    const sourceAva = path.join(path.resolve(resolvedSource, ".."), ".ava");
    if (fs.existsSync(sourceAva)) {
      const dalFiles = [
        { src: path.join(sourceAva, "dal.mjs"), rel: ".ava/dal.mjs" },
        { src: path.join(sourceAva, "package.json"), rel: ".ava/package.json" },
      ];

      const libDir = path.join(sourceAva, "lib");
      if (fs.existsSync(libDir)) {
        for (const f of fs.readdirSync(libDir).filter(f => f.endsWith(".mjs"))) {
          dalFiles.push({ src: path.join(libDir, f), rel: `.ava/lib/${f}` });
        }
      }

      const migrDir = path.join(sourceAva, "migrations");
      if (fs.existsSync(migrDir)) {
        for (const f of fs.readdirSync(migrDir).filter(f => f.endsWith(".sql"))) {
          dalFiles.push({ src: path.join(migrDir, f), rel: `.ava/migrations/${f}` });
        }
      }

      for (const { src, rel } of dalFiles) {
        if (!fs.existsSync(src)) continue;
        const dst = path.join(PROJECT_DIR, rel);
        if (fs.existsSync(dst) && sha256(src) === sha256(dst)) continue;
        ensureDir(dst);
        fs.copyFileSync(src, dst);
        actions.push({ action: "updated", path: rel, category: "dal-runtime" });
      }
    }
  }

  return { esm, actions, version };
}

function copyDirSync(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const item of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, item.name);
    const dstPath = path.join(dst, item.name);
    if (item.isDirectory()) {
      copyDirSync(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}
