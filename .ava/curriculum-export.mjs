#!/usr/bin/env node
// ─── curriculum-export.mjs — Export curriculum for external agents ───
// Generates a self-contained markdown file with full curriculum state,
// lesson details, reference content, and progress tracking.
//
// Usage:
//   node .ava/curriculum-export.mjs <curriculum-id> [--output path] [--include-refs]
//
// Examples:
//   node .ava/curriculum-export.mjs cu-spdrbot-quadruped
//   node .ava/curriculum-export.mjs cu-spdrbot-quadruped --include-refs
//   node .ava/curriculum-export.mjs cu-spdrbot-quadruped --output ~/Desktop/spdrbot-plan.md
// ─────────────────────────────────────────────────────────────────────
import Database from "better-sqlite3";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "learning.db");

// ─── Parse args ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith("--")));
const positional = args.filter(a => !a.startsWith("--"));

const curriculumId = positional[0];
const includeRefs = flags.has("--include-refs");
let outputPath = null;

const outputIdx = args.indexOf("--output");
if (outputIdx !== -1 && args[outputIdx + 1]) {
  outputPath = args[outputIdx + 1];
}

if (!curriculumId) {
  // List available curricula
  if (!existsSync(dbPath)) {
    console.error("learning.db not found at", dbPath);
    process.exit(1);
  }
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare("SELECT id, title, lesson_count FROM curricula").all();
  db.close();

  console.log("\nAvailable curricula:\n");
  for (const r of rows) {
    console.log(`  ${r.id}  (${r.title}, ${r.lesson_count} lessons)`);
  }
  console.log("\nUsage: node .ava/curriculum-export.mjs <curriculum-id> [--include-refs] [--output path]\n");
  process.exit(0);
}

// ─── Load data ──────────────────────────────────────────────────
if (!existsSync(dbPath)) {
  console.error("learning.db not found at", dbPath);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });

const curriculum = db.prepare("SELECT * FROM curricula WHERE id = ?").get(curriculumId);
if (!curriculum) {
  console.error(`Curriculum "${curriculumId}" not found.`);
  const all = db.prepare("SELECT id, title FROM curricula").all();
  console.error("Available:", all.map(r => r.id).join(", "));
  db.close();
  process.exit(1);
}

const lessons = db.prepare(`
  SELECT * FROM curriculum_lessons
  WHERE curriculum_id = ?
  ORDER BY tier, sort_order
`).all(curriculumId);

const enrollment = db.prepare(`
  SELECT * FROM curriculum_enrollments
  WHERE curriculum_id = ?
  ORDER BY enrolled_at DESC LIMIT 1
`).get(curriculumId);

db.close();

// ─── Group lessons by tier ──────────────────────────────────────
const tiers = new Map();
for (const l of lessons) {
  const key = `${l.tier}|${l.tier_name}`;
  if (!tiers.has(key)) tiers.set(key, []);
  tiers.get(key).push(l);
}

// ─── Status helpers ─────────────────────────────────────────────
const STATUS_ICON = {
  locked: "[ ]",
  available: "[>]",
  in_progress: "[~]",
  complete: "[x]",
  skipped: "[-]",
};

function statusLabel(s) {
  return STATUS_ICON[s] || `[${s}]`;
}

const completed = lessons.filter(l => l.status === "complete").length;
const inProgress = lessons.filter(l => l.status === "in_progress").length;
const available = lessons.filter(l => l.status === "available").length;
const skipped = lessons.filter(l => l.status === "skipped").length;

// ─── Build markdown ─────────────────────────────────────────────
const lines = [];
const now = new Date().toISOString().split("T")[0];

lines.push(`# ${curriculum.title}`);
lines.push("");
lines.push(`**Exported:** ${now} | **Domain:** ${curriculum.domain} | **Lessons:** ${curriculum.lesson_count}`);
lines.push(`**Progress:** ${completed}/${lessons.length} complete, ${inProgress} in progress, ${available} available, ${skipped} skipped`);
lines.push("");
lines.push(curriculum.description);
lines.push("");

// Status key
lines.push("### Status Key");
lines.push("```");
lines.push("[x] complete   [~] in progress   [>] available   [ ] locked   [-] skipped");
lines.push("```");
lines.push("");

// ─── Tier-by-tier lesson listing ────────────────────────────────
lines.push("---");
lines.push("");

for (const [key, tierLessons] of tiers) {
  const [tierNum, tierName] = key.split("|");
  lines.push(`## Tier ${tierNum}: ${tierName}`);
  lines.push("");

  for (const l of tierLessons) {
    lines.push(`### ${statusLabel(l.status)} Lesson ${l.sort_order}: ${l.title}`);
    lines.push("");
    lines.push(`**Topic:** ${l.topic}`);
    lines.push("");
    lines.push(l.description);
    lines.push("");

    // References
    const refs = [];
    if (l.code_ref) refs.push(`Code: \`${l.code_ref}\``);
    if (l.doc_ref) refs.push(`Docs: \`${l.doc_ref}\``);
    if (l.doc_pages) refs.push(`Pages: ${l.doc_pages}`);
    if (refs.length) {
      lines.push(`> ${refs.join(" | ")}`);
      lines.push("");
    }

    // Session link if in progress or complete
    if (l.session_id) {
      lines.push(`*Session: ${l.session_id}*`);
      lines.push("");
    }
  }
}

// ─── Progress summary table ─────────────────────────────────────
lines.push("---");
lines.push("");
lines.push("## Progress Summary");
lines.push("");
lines.push("| Tier | Name | Lessons | Complete | Status |");
lines.push("|------|------|---------|----------|--------|");

for (const [key, tierLessons] of tiers) {
  const [tierNum, tierName] = key.split("|");
  const tc = tierLessons.filter(l => l.status === "complete").length;
  const total = tierLessons.length;
  let tierStatus = "Locked";
  if (tc === total) tierStatus = "Complete";
  else if (tierLessons.some(l => l.status === "in_progress")) tierStatus = "In Progress";
  else if (tierLessons.some(l => l.status === "available")) tierStatus = "Available";
  lines.push(`| ${tierNum} | ${tierName} | ${total} | ${tc}/${total} | ${tierStatus} |`);
}

lines.push("");

// ─── Sync instructions ──────────────────────────────────────────
lines.push("---");
lines.push("");
lines.push("## Syncing Progress Back");
lines.push("");
lines.push("After working through lessons externally, update the learning system:");
lines.push("");
lines.push("```bash");
lines.push("# Mark a lesson complete (by lesson number)");
lines.push(`sqlite3 .ava/learning.db "UPDATE curriculum_lessons SET status='complete' WHERE curriculum_id='${curriculumId}' AND sort_order=<N>;"`);
lines.push("");
lines.push("# Mark a lesson in progress");
lines.push(`sqlite3 .ava/learning.db "UPDATE curriculum_lessons SET status='in_progress' WHERE curriculum_id='${curriculumId}' AND sort_order=<N>;"`);
lines.push("");
lines.push("# Unlock next tier (set all lessons in tier N to available)");
lines.push(`sqlite3 .ava/learning.db "UPDATE curriculum_lessons SET status='available' WHERE curriculum_id='${curriculumId}' AND tier=<N> AND status='locked';"`);
lines.push("");
lines.push("# Update enrollment progress count");
lines.push(`sqlite3 .ava/learning.db "UPDATE curriculum_enrollments SET lessons_complete=(SELECT COUNT(*) FROM curriculum_lessons WHERE curriculum_id='${curriculumId}' AND status='complete'), last_activity=datetime('now') WHERE curriculum_id='${curriculumId}';"`);
lines.push("```");
lines.push("");

// ─── Include reference docs ─────────────────────────────────────
if (includeRefs) {
  const docRefs = [...new Set(lessons.map(l => l.doc_ref).filter(Boolean))];
  const codeRefs = [...new Set(lessons.map(l => l.code_ref).filter(Boolean))];

  if (docRefs.length || codeRefs.length) {
    lines.push("---");
    lines.push("");
    lines.push("## Reference Materials");
    lines.push("");

    for (const ref of [...docRefs, ...codeRefs]) {
      if (existsSync(ref)) {
        const content = readFileSync(ref, "utf8");
        const name = basename(ref);
        lines.push(`### ${name}`);
        lines.push("");
        lines.push(`<details><summary>Full content of ${ref}</summary>`);
        lines.push("");
        lines.push("````markdown");
        lines.push(content);
        lines.push("````");
        lines.push("");
        lines.push("</details>");
        lines.push("");
      } else {
        lines.push(`> **${basename(ref)}** — file not found at \`${ref}\``);
        lines.push("");
      }
    }
  }
}

// ─── Output ─────────────────────────────────────────────────────
const output = lines.join("\n");

if (outputPath) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, output, "utf8");
  console.log(`Exported ${curriculum.title} → ${outputPath}`);
  console.log(`  ${lessons.length} lessons, ${completed} complete, ${includeRefs ? "with" : "without"} reference docs`);
} else {
  process.stdout.write(output);
}
