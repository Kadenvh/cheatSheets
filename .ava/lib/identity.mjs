// identity.mjs — Project identity operations (always injected, small, stable)
import { requireDb } from "./db.mjs";

export function getIdentity(key) {
  const db = requireDb();
  return db.prepare("SELECT key, value, updated_at FROM identity WHERE key = ?").get(key);
}

export function setIdentity(key, value) {
  const db = requireDb();
  db.prepare(
    "INSERT INTO identity (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

export function listIdentity() {
  const db = requireDb();
  return db.prepare("SELECT key, value, updated_at FROM identity ORDER BY key").all();
}
