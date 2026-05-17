// ─── learning-db.mjs — Curriculum database access ──────────────
// Separate from brain.db to avoid PE template/migration conflicts.
// Auto-creates learning.db and runs schema on first access.
// ────────────────────────────────────────────────────────────────
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _db = null;

export function getLearningDb() {
  if (_db) return _db;

  const dbPath = join(__dirname, "learning.db");
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("synchronous = NORMAL");
  _db.pragma("busy_timeout = 5000");

  // Auto-init: run schema + seed if tables don't exist
  const hasSchema = _db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='curricula'"
  ).get();

  if (!hasSchema) {
    const schemaPath = join(__dirname, "learning-schema.sql");
    const schema = readFileSync(schemaPath, "utf8");
    _db.exec(schema);
  } else {
    runMigrations(_db);
  }

  return _db;
}

function runMigrations(db) {
  // Pre-schema_info legacy: bare ALTER ADD COLUMN
  const lessonCols = db.pragma("table_info(curriculum_lessons)").map(c => c.name);
  if (!lessonCols.includes("doc_pages")) {
    db.exec("ALTER TABLE curriculum_lessons ADD COLUMN doc_pages TEXT");
  }

  // Detect schema_info presence (very old DBs may not have it)
  const hasSchemaInfo = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_info'"
  ).get();
  if (!hasSchemaInfo) {
    db.exec(`CREATE TABLE schema_info (
      version INTEGER NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    db.prepare("INSERT INTO schema_info (version) VALUES (1)").run();
  }

  const currentVersion = db.prepare(
    "SELECT COALESCE(MAX(version), 0) AS v FROM schema_info"
  ).get().v;

  // v1 → v2: EdX course structure (additive)
  if (currentVersion < 2) {
    const curriculaCols = db.pragma("table_info(curricula)").map(c => c.name);
    if (!curriculaCols.includes("kind")) {
      db.exec(`ALTER TABLE curricula ADD COLUMN kind TEXT NOT NULL DEFAULT 'flat'`);
    }
    if (!curriculaCols.includes("external_id")) {
      db.exec(`ALTER TABLE curricula ADD COLUMN external_id TEXT`);
    }
    if (!curriculaCols.includes("provider")) {
      db.exec(`ALTER TABLE curricula ADD COLUMN provider TEXT`);
    }
    if (!curriculaCols.includes("course_url")) {
      db.exec(`ALTER TABLE curricula ADD COLUMN course_url TEXT`);
    }
    if (!curriculaCols.includes("vault_ref")) {
      db.exec(`ALTER TABLE curricula ADD COLUMN vault_ref TEXT`);
    }

    db.exec(`CREATE TABLE IF NOT EXISTS curriculum_sections (
      id              TEXT PRIMARY KEY,
      curriculum_id   TEXT NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
      sort_order      INTEGER NOT NULL DEFAULT 0,
      title           TEXT NOT NULL,
      overview        TEXT,
      slides_ref      TEXT,
      doc_pages       TEXT,
      has_pre_test    INTEGER NOT NULL DEFAULT 0,
      has_post_test   INTEGER NOT NULL DEFAULT 0,
      status          TEXT NOT NULL DEFAULT 'locked'
                      CHECK (status IN ('locked','available','in_progress','complete','skipped')),
      vault_ref       TEXT,
      completed_at    TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_cs_curriculum ON curriculum_sections(curriculum_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_cs_sort ON curriculum_sections(curriculum_id, sort_order)`);

    const lessonColsAfter = db.pragma("table_info(curriculum_lessons)").map(c => c.name);
    if (!lessonColsAfter.includes("section_id")) {
      db.exec(`ALTER TABLE curriculum_lessons ADD COLUMN section_id TEXT REFERENCES curriculum_sections(id)`);
    }
    if (!lessonColsAfter.includes("lecture_kind")) {
      db.exec(`ALTER TABLE curriculum_lessons ADD COLUMN lecture_kind TEXT NOT NULL DEFAULT 'lesson'`);
    }
    if (!lessonColsAfter.includes("transcript_ref")) {
      db.exec(`ALTER TABLE curriculum_lessons ADD COLUMN transcript_ref TEXT`);
    }
    if (!lessonColsAfter.includes("vault_ref")) {
      db.exec(`ALTER TABLE curriculum_lessons ADD COLUMN vault_ref TEXT`);
    }
    db.exec(`CREATE INDEX IF NOT EXISTS idx_cl_section ON curriculum_lessons(section_id)`);

    db.exec(`CREATE TABLE IF NOT EXISTS curriculum_tests (
      id              TEXT PRIMARY KEY,
      parent_type     TEXT NOT NULL CHECK (parent_type IN ('curriculum','section')),
      parent_id       TEXT NOT NULL,
      kind            TEXT NOT NULL CHECK (kind IN ('pre','post','final','checkpoint')),
      title           TEXT NOT NULL,
      max_score       REAL,
      score           REAL,
      attempts        INTEGER NOT NULL DEFAULT 0,
      last_attempt_at TEXT,
      completed_at    TEXT,
      notes           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_ct_parent ON curriculum_tests(parent_type, parent_id)`);

    db.prepare("INSERT INTO schema_info (version) VALUES (2)").run();
  }
}

export function closeLearningDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
