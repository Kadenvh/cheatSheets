// db.mjs — Database connection, auto-migration, integrity check
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVA_DIR = path.resolve(__dirname, "..");
const DB_PATH = path.join(AVA_DIR, "brain.db");
const MIGRATIONS_DIR = path.join(AVA_DIR, "migrations");

let _db = null;

/**
 * Get or create the database connection.
 * Auto-migrates on first access.
 * Returns null if brain.db doesn't exist and create=false.
 */
export function getDb({ create = false } = {}) {
  if (_db) return _db;

  if (!create && !fs.existsSync(DB_PATH)) {
    return null;
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("busy_timeout = 5000");
  _db.pragma("synchronous = NORMAL");
  _db.pragma("foreign_keys = ON");

  // Auto-migrate
  runMigrations(_db);

  return _db;
}

/**
 * Get DB or exit gracefully if not found.
 * Used by CLI commands that require an existing DB.
 */
export function requireDb() {
  const db = getDb();
  if (!db) {
    process.stderr.write("Warning: .ava/brain.db not found. Skipping DAL operation.\n");
    process.exit(0);
  }
  return db;
}

/**
 * Run pending migrations.
 * Fresh installs use schema.sql (single atomic operation).
 * Existing databases use numbered migration files for upgrade path.
 */
function runMigrations(db) {
  // Ensure schema_version table exists (bootstrap case)
  const hasSchemaTable = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
    )
    .get();

  // Fresh install: use consolidated schema.sql if available
  if (!hasSchemaTable) {
    const schemaPath = path.join(MIGRATIONS_DIR, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf8");
      _execSql(db, sql);
      return;
    }
  }

  let currentVersion = 0;
  if (hasSchemaTable) {
    const row = db.prepare("SELECT MAX(version) as v FROM schema_version").get();
    currentVersion = row?.v || 0;
  }

  // Find numbered migration files (NNN_*.sql pattern)
  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && /^\d+_/.test(f))
    .sort();

  const pending = files.filter((f) => {
    const num = parseInt(f.split("_")[0], 10);
    return num > currentVersion;
  });

  if (pending.length === 0) return;

  // Auto-backup before migration
  if (currentVersion > 0) {
    backup();
  }

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    _execSql(db, sql);
  }
}

/**
 * Execute a SQL file, separating PRAGMAs from the rest.
 */
function _execSql(db, sql) {
  const lines = sql.split("\n");
  const pragmaLines = [];
  const otherLines = [];
  for (const line of lines) {
    if (/^\s*PRAGMA\b/i.test(line)) {
      pragmaLines.push(line);
    } else {
      otherLines.push(line);
    }
  }

  for (const pragma of pragmaLines) {
    db.exec(pragma);
  }

  const remaining = otherLines.join("\n").trim();
  if (remaining) {
    db.exec(remaining);
  }
}

/**
 * Create a backup of brain.db.
 */
export function backup() {
  if (!fs.existsSync(DB_PATH)) return null;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const bakPath = `${DB_PATH}.bak-${timestamp}`;
  fs.copyFileSync(DB_PATH, bakPath);
  return bakPath;
}

/**
 * Run integrity check.
 * Returns { ok: boolean, result: string }
 */
export function integrityCheck() {
  const db = requireDb();
  const row = db.prepare("PRAGMA integrity_check").get();
  const result = row?.integrity_check || "unknown";
  return { ok: result === "ok", result };
}

/**
 * Get current schema version.
 */
export function schemaVersion() {
  const db = requireDb();
  const row = db.prepare("SELECT MAX(version) as v FROM schema_version").get();
  return row?.v || 0;
}

/**
 * Get DB file size in bytes.
 */
export function dbSize() {
  if (!fs.existsSync(DB_PATH)) return 0;
  return fs.statSync(DB_PATH).size;
}

/**
 * Close the DB connection (for clean shutdown).
 */
export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

export { DB_PATH, AVA_DIR };
