#!/usr/bin/env node
// ─── course-import.mjs — Seed learning.db from a course manifest ──
// Reads a JSON course manifest and INSERTs/UPDATEs the curricula row,
// curriculum_sections rows, optional curriculum_tests rows, and
// optional curriculum_lessons stubs. Idempotent — safe to re-run as
// the user fills in section/lecture detail in the manifest over time.
//
// Usage:
//   node .ava/course-import.mjs <manifest.json>
//   node .ava/course-import.mjs vault/Courses/<slug>/manifest.json
//
// Manifest schema (JSON):
//   {
//     "course": {
//       "id": "<slug>",           required
//       "title": "...",           required
//       "kind": "edx-course",     default: "edx-course"
//       "provider": "EdX",
//       "external_id": "CU.OC.AI002",
//       "course_url": "https://...",
//       "domain": "computer-science",
//       "vault_ref": "vault/Courses/<slug>/",
//       "description": "..."
//     },
//     "sections": [
//       { "id": "<slug>", "sort_order": 1, "title": "...",
//         "overview": "...", "slides_ref": "_assets/slides/s1.pdf",
//         "doc_pages": "1-24", "has_pre_test": false,
//         "has_post_test": true, "vault_ref": "section-1-intro/" }
//     ],
//     "tests": [
//       { "id": "test-...", "parent_type": "section", "parent_id": "<slug>",
//         "kind": "post", "title": "...", "max_score": 100 }
//     ],
//     "lectures": [   // optional stubs; can be added later
//       { "id": "<slug>", "section_id": "<slug>", "sort_order": 1,
//         "title": "...", "topic": "...", "lecture_kind": "video",
//         "transcript_ref": "_assets/transcripts/...", "vault_ref": "section-1/lecture-1.md" }
//     ]
//   }
// ────────────────────────────────────────────────────────────────────
import { readFileSync } from "fs";
import { resolve } from "path";
import { getLearningDb, closeLearningDb } from "./learning-db.mjs";

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error("usage: node .ava/course-import.mjs <manifest.json>");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(resolve(manifestPath), "utf8"));
const db = getLearningDb();

const courseRow = (m) => ({
  id: m.id,
  title: m.title,
  description: m.description ?? null,
  domain: m.domain ?? "general",
  tier_count: m.tier_count ?? null,
  lesson_count: m.lesson_count ?? 0,
  source_ref: m.source_ref ?? null,
  kind: m.kind ?? "edx-course",
  external_id: m.external_id ?? null,
  provider: m.provider ?? null,
  course_url: m.course_url ?? null,
  vault_ref: m.vault_ref ?? null,
});

const upsertCourse = db.prepare(`
  INSERT INTO curricula
    (id, title, description, domain, tier_count, lesson_count, source_ref,
     kind, external_id, provider, course_url, vault_ref, updated_at)
  VALUES
    (@id, @title, @description, @domain, @tier_count, @lesson_count, @source_ref,
     @kind, @external_id, @provider, @course_url, @vault_ref, datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    title=excluded.title,
    description=excluded.description,
    domain=excluded.domain,
    tier_count=excluded.tier_count,
    lesson_count=excluded.lesson_count,
    source_ref=excluded.source_ref,
    kind=excluded.kind,
    external_id=excluded.external_id,
    provider=excluded.provider,
    course_url=excluded.course_url,
    vault_ref=excluded.vault_ref,
    updated_at=datetime('now')
`);

const upsertSection = db.prepare(`
  INSERT INTO curriculum_sections
    (id, curriculum_id, sort_order, title, overview, slides_ref, doc_pages,
     has_pre_test, has_post_test, status, vault_ref)
  VALUES
    (@id, @curriculum_id, @sort_order, @title, @overview, @slides_ref, @doc_pages,
     @has_pre_test, @has_post_test, @status, @vault_ref)
  ON CONFLICT(id) DO UPDATE SET
    sort_order=excluded.sort_order,
    title=excluded.title,
    overview=excluded.overview,
    slides_ref=excluded.slides_ref,
    doc_pages=excluded.doc_pages,
    has_pre_test=excluded.has_pre_test,
    has_post_test=excluded.has_post_test,
    vault_ref=excluded.vault_ref
`);

const upsertTest = db.prepare(`
  INSERT INTO curriculum_tests
    (id, parent_type, parent_id, kind, title, max_score)
  VALUES
    (@id, @parent_type, @parent_id, @kind, @title, @max_score)
  ON CONFLICT(id) DO UPDATE SET
    title=excluded.title,
    max_score=excluded.max_score
`);

const upsertLecture = db.prepare(`
  INSERT INTO curriculum_lessons
    (id, curriculum_id, section_id, tier, tier_name, sort_order, title,
     description, topic, status, code_ref, doc_ref, doc_pages,
     lecture_kind, transcript_ref, vault_ref)
  VALUES
    (@id, @curriculum_id, @section_id, @tier, @tier_name, @sort_order, @title,
     @description, @topic, @status, @code_ref, @doc_ref, @doc_pages,
     @lecture_kind, @transcript_ref, @vault_ref)
  ON CONFLICT(id) DO UPDATE SET
    section_id=excluded.section_id,
    sort_order=excluded.sort_order,
    title=excluded.title,
    description=excluded.description,
    topic=excluded.topic,
    code_ref=excluded.code_ref,
    doc_ref=excluded.doc_ref,
    doc_pages=excluded.doc_pages,
    lecture_kind=excluded.lecture_kind,
    transcript_ref=excluded.transcript_ref,
    vault_ref=excluded.vault_ref
`);

const tx = db.transaction(() => {
  upsertCourse.run(courseRow(manifest.course));
  let secs = 0, tests = 0, lectures = 0;
  for (const s of (manifest.sections ?? [])) {
    upsertSection.run({
      id: s.id,
      curriculum_id: manifest.course.id,
      sort_order: s.sort_order ?? 0,
      title: s.title,
      overview: s.overview ?? null,
      slides_ref: s.slides_ref ?? null,
      doc_pages: s.doc_pages ?? null,
      has_pre_test: s.has_pre_test ? 1 : 0,
      has_post_test: s.has_post_test ? 1 : 0,
      status: s.status ?? "available",
      vault_ref: s.vault_ref ?? null,
    });
    secs++;
  }
  for (const t of (manifest.tests ?? [])) {
    upsertTest.run({
      id: t.id,
      parent_type: t.parent_type,
      parent_id: t.parent_id,
      kind: t.kind,
      title: t.title,
      max_score: t.max_score ?? null,
    });
    tests++;
  }
  for (const l of (manifest.lectures ?? [])) {
    upsertLecture.run({
      id: l.id,
      curriculum_id: manifest.course.id,
      section_id: l.section_id ?? null,
      tier: l.tier ?? 1,
      tier_name: l.tier_name ?? null,
      sort_order: l.sort_order ?? 0,
      title: l.title,
      description: l.description ?? null,
      topic: l.topic ?? l.title,
      status: l.status ?? "available",
      code_ref: l.code_ref ?? null,
      doc_ref: l.doc_ref ?? null,
      doc_pages: l.doc_pages ?? null,
      lecture_kind: l.lecture_kind ?? "lesson",
      transcript_ref: l.transcript_ref ?? null,
      vault_ref: l.vault_ref ?? null,
    });
    lectures++;
  }
  return { secs, tests, lectures };
});

const result = tx();
console.log(`Imported course ${manifest.course.id}:`);
console.log(`  sections:  ${result.secs}`);
console.log(`  tests:     ${result.tests}`);
console.log(`  lectures:  ${result.lectures}`);
closeLearningDb();
