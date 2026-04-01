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
    // Migrations for existing DBs
    const cols = _db.pragma("table_info(curriculum_lessons)").map(c => c.name);
    if (!cols.includes("doc_pages")) {
      _db.exec("ALTER TABLE curriculum_lessons ADD COLUMN doc_pages TEXT");
    }
  }

  return _db;
}

export function closeLearningDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
