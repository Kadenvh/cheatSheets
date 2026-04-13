// consolidate.mjs — Archive plan files with receipt generation
// Automates the plan-consolidation pattern established session 125:
//   1. Create plans/archive/<event-slug>/
//   2. Move superseded plans into it (git mv preserves rename history)
//   3. Generate ARCHIVE_RECEIPT.md skeleton with frontmatter placeholders
// Agents fill in the narrative (why_kept, extracted_to list) after the tool
// handles the mechanical filesystem work.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const PROJECT_DIR = path.resolve(AVA_DIR, "..");

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export function consolidatePlans({
  eventSlug,
  keepPlan,
  archiveSources,
  reason = "superseded",
  dryRun = false,
  sessionId = null,
  projectRoot = PROJECT_DIR,
} = {}) {
  if (!eventSlug) {
    return { error: "Missing event slug. Usage: consolidate <event-slug> --keep <path> --archive <path1,path2,...>" };
  }
  if (!SLUG_PATTERN.test(eventSlug)) {
    return { error: `Invalid event slug "${eventSlug}". Must be lowercase alphanumeric + hyphens, starting and ending with alphanumeric.` };
  }
  if (!keepPlan) {
    return { error: "Missing --keep <path> (the plan that survives consolidation)." };
  }
  if (!Array.isArray(archiveSources) || archiveSources.length === 0) {
    return { error: "Missing --archive <path1,path2,...> (at least one plan to archive)." };
  }

  const plansDir = path.join(projectRoot, "plans");
  const archiveDir = path.join(plansDir, "archive", eventSlug);
  const receiptPath = path.join(archiveDir, "ARCHIVE_RECEIPT.md");

  // Resolve + validate paths
  const keepAbs = path.resolve(projectRoot, keepPlan);
  if (!fs.existsSync(keepAbs)) {
    return { error: `--keep target does not exist: ${keepPlan}` };
  }
  if (!keepAbs.startsWith(plansDir + path.sep)) {
    return { error: `--keep target must live under plans/: ${keepPlan}` };
  }

  const resolvedSources = [];
  for (const src of archiveSources) {
    const srcAbs = path.resolve(projectRoot, src);
    if (!fs.existsSync(srcAbs)) {
      return { error: `--archive source does not exist: ${src}` };
    }
    if (!srcAbs.startsWith(plansDir + path.sep)) {
      return { error: `--archive source must live under plans/: ${src}` };
    }
    if (srcAbs === keepAbs) {
      return { error: `--archive source cannot equal --keep target: ${src}` };
    }
    if (srcAbs.startsWith(path.join(plansDir, "archive") + path.sep)) {
      return { error: `--archive source is already in plans/archive/: ${src}` };
    }
    resolvedSources.push({ original: src, abs: srcAbs });
  }

  if (fs.existsSync(archiveDir)) {
    return { error: `Archive directory already exists: plans/archive/${eventSlug}/. Pick a different event slug or remove the existing dir.` };
  }

  // Build receipt skeleton
  const keepRel = path.relative(projectRoot, keepAbs);
  const timestamp = new Date().toISOString();
  const extractedPlaceholder = [
    "  - kind: plan",
    `    target: "${keepRel}"`,
    "  # Add more extraction pointers here — decision IDs, note IDs, brain.db references",
    "  # Format:",
    "  #   - kind: decision",
    "  #     target: \"brain.db:decisions:#<id>\"",
    "  #   - kind: note",
    "  #     target: \"brain.db:notes:<id>\"",
  ].join("\n");

  const receiptBody = [
    "---",
    `archive_reason: ${reason}`,
    `reviewed_at: ${timestamp}`,
    "why_kept: \"TODO — explain why these plans are archived rather than deleted.\"",
    `superseded_by: "${keepRel}"`,
    "extracted_to:",
    extractedPlaceholder,
    ...(sessionId ? [`session: ${sessionId}`] : []),
    "---",
    "",
    `# ${eventSlug} — Archive Receipt`,
    "",
    "## Scope",
    "",
    `The following plans were archived during consolidation into \`${keepRel}\`:`,
    "",
    ...resolvedSources.map(({ original }) => `- \`${original}\``),
    "",
    "## Why Archived (Not Deleted)",
    "",
    "TODO — describe the historical value of keeping these plans.",
    "",
    "## Extraction Complete",
    "",
    `The live value from these plans has been extracted to \`${keepRel}\` and/or brain.db.`,
    "",
    "TODO — enumerate what landed where.",
    "",
    "## Surviving Items",
    "",
    "TODO — list any items from the archived plans that are tracked elsewhere (brain.db notes, open decisions, etc).",
    "",
  ].join("\n");

  if (dryRun) {
    return {
      dryRun: true,
      eventSlug,
      archiveDir: path.relative(projectRoot, archiveDir),
      keepPlan: keepRel,
      moves: resolvedSources.map(({ original }) => ({
        from: original,
        to: path.relative(projectRoot, path.join(archiveDir, path.basename(original))),
      })),
      receiptPath: path.relative(projectRoot, receiptPath),
      receiptPreview: receiptBody,
    };
  }

  // Execute: create dir, move files, write receipt
  fs.mkdirSync(archiveDir, { recursive: true });

  const gitAvailable = isGitRepo(projectRoot);
  const moves = [];
  for (const { original, abs } of resolvedSources) {
    const dest = path.join(archiveDir, path.basename(abs));
    try {
      if (gitAvailable && isTracked(abs, projectRoot)) {
        execSync(`git mv "${abs}" "${dest}"`, { cwd: projectRoot, stdio: "pipe" });
      } else {
        fs.renameSync(abs, dest);
      }
    } catch (err) {
      return { error: `Failed to move ${original}: ${err.message.split("\n")[0]}` };
    }
    moves.push({ from: original, to: path.relative(projectRoot, dest) });
  }

  fs.writeFileSync(receiptPath, receiptBody, "utf8");

  return {
    eventSlug,
    archiveDir: path.relative(projectRoot, archiveDir),
    keepPlan: keepRel,
    moves,
    receiptPath: path.relative(projectRoot, receiptPath),
    next_steps: [
      "Fill in the TODO placeholders in ARCHIVE_RECEIPT.md",
      `Sweep stale refs inside ${keepRel} if any consolidated content needs integrating`,
      "Commit with a descriptive message referencing this archive event",
    ],
  };
}

function isGitRepo(dir) {
  try {
    execSync("git rev-parse --is-inside-work-tree", { cwd: dir, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isTracked(absPath, projectRoot) {
  try {
    execSync(`git ls-files --error-unmatch "${absPath}"`, { cwd: projectRoot, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function handleConsolidateCommand(flags, positional) {
  const archiveList = flags.archive
    ? String(flags.archive).split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const result = consolidatePlans({
    eventSlug: positional || flags.event || null,
    keepPlan: flags.keep || null,
    archiveSources: archiveList,
    reason: flags.reason || "superseded",
    dryRun: flags["dry-run"] === "true" || flags.dryRun === "true",
    sessionId: flags.session || null,
  });

  if (result.error) {
    process.stderr.write(`Error: ${result.error}\n`);
    process.exit(1);
  }

  if (result.dryRun) {
    console.log(`[dry-run] Would consolidate into plans/archive/${result.eventSlug}/`);
    console.log(`  keep: ${result.keepPlan}`);
    for (const m of result.moves) {
      console.log(`  move: ${m.from} -> ${m.to}`);
    }
    console.log(`  receipt: ${result.receiptPath}`);
    console.log("");
    console.log("--- receipt preview ---");
    console.log(result.receiptPreview);
    return;
  }

  console.log(`Consolidated into ${result.archiveDir}/`);
  console.log(`  keep: ${result.keepPlan}`);
  for (const m of result.moves) {
    console.log(`  move: ${m.from} -> ${m.to}`);
  }
  console.log(`  receipt: ${result.receiptPath}`);
  console.log("");
  console.log("Next steps:");
  for (const step of result.next_steps) {
    console.log(`  - ${step}`);
  }
}
