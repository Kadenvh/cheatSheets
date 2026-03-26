// vault-sync.mjs — Bridge between Obsidian vault (Layer 2) and ChromaDB (Layer 3)
// Reads vault .md files, parses YAML frontmatter, chunks by H2 sections,
// upserts to embedding-service via /batch-upsert endpoint.

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, basename } from "path";
import { createHash } from "crypto";

const EMBEDDING_URL = "http://127.0.0.1:8001";
const COLLECTION = "vault";
const VAULT_PATH = "/home/ava/Obsidian/Ava";
const BATCH_SIZE = 50;

// Skip these directories
const SKIP_DIRS = new Set([".obsidian", ".stfolder", "_templates", "_inbox", ".trash"]);

// ─── YAML FRONTMATTER PARSER ────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w[\w.]*)\s*:\s*(.+)$/);
    if (kv) {
      let val = kv[2].trim();
      // Parse arrays like [tag1, tag2]
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map(s => s.trim()).join(", ");
      }
      // Strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      meta[kv[1]] = val;
    }
  }
  return { meta, body: match[2] };
}

// ─── H2 SECTION CHUNKER ────────────────────────────────────────────

function chunkByH2(body, title) {
  const sections = [];
  const lines = body.split("\n");
  let currentSection = title || "Overview";
  let currentContent = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      // Flush previous section
      const text = currentContent.join("\n").trim();
      if (text.length > 20) {
        sections.push({ section: currentSection, content: text });
      }
      currentSection = h2Match[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Flush final section
  const text = currentContent.join("\n").trim();
  if (text.length > 20) {
    sections.push({ section: currentSection, content: text });
  }

  // If no H2 sections found, return entire body as one chunk
  if (sections.length === 0 && body.trim().length > 20) {
    sections.push({ section: title || "Content", content: body.trim() });
  }

  return sections;
}

// ─── DETERMINISTIC ID ───────────────────────────────────────────────

function docId(project, filePath, section) {
  const raw = `${project}/${filePath}/${section}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

// ─── FILE DISCOVERY ─────────────────────────────────────────────────

function discoverVaultFiles(vaultPath, project) {
  const files = [];
  const searchDir = project ? join(vaultPath, project) : vaultPath;

  if (!existsSync(searchDir)) return files;

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);

      if (stat.isDirectory()) {
        if (!SKIP_DIRS.has(entry)) walk(full);
      } else if (entry.endsWith(".md") && entry !== "VAULT_GUIDE.md") {
        files.push(full);
      }
    }
  }

  walk(searchDir);
  return files;
}

// ─── PARSE VAULT FILE → DOCUMENTS ──────────────────────────────────

function parseVaultFile(filePath, vaultPath) {
  const content = readFileSync(filePath, "utf8");
  const { meta, body } = parseFrontmatter(content);

  const relPath = relative(vaultPath, filePath);
  const project = relPath.split("/")[0] || "unknown";
  const fileName = basename(filePath, ".md");

  // Extract title from first H1 or filename
  const h1Match = body.match(/^# (.+)$/m);
  const title = h1Match ? h1Match[1].trim() : fileName;

  const sections = chunkByH2(body, title);

  return sections.map(({ section, content: sectionContent }) => ({
    id: docId(project, relPath, section),
    content: sectionContent,
    metadata: {
      source_file: relPath,
      project,
      title,
      section,
      type: meta.type || "note",
      tags: meta.tags || "",
      status: meta.status || "active",
      created: meta.date || meta.created || "",
      domain: "vault",
      category: meta.type ? meta.type.charAt(0).toUpperCase() + meta.type.slice(1) : "Note",
    },
  }));
}

// ─── API CALLS ──────────────────────────────────────────────────────

async function checkHealth() {
  try {
    const res = await fetch(`${EMBEDDING_URL}/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function batchUpsert(documents, collection = COLLECTION) {
  const res = await fetch(`${EMBEDDING_URL}/batch-upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection, documents }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`batch-upsert failed (${res.status}): ${text}`);
  }
  return await res.json();
}

async function deleteByProject(project, collection = COLLECTION) {
  const res = await fetch(`${EMBEDDING_URL}/collection-delete-by-metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection, where: { project } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`delete-by-metadata failed (${res.status}): ${text}`);
  }
  return await res.json();
}

async function queryVault(queryText, { topK = 5, project = null, collection = COLLECTION } = {}) {
  const body = { query: queryText, top_k: topK, collection };
  if (project) body.domain = project; // Use domain filter for project scoping

  const res = await fetch(`${EMBEDDING_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`query failed (${res.status}): ${text}`);
  }
  return await res.json();
}

async function getCollectionStats(collection = COLLECTION) {
  const res = await fetch(`${EMBEDDING_URL}/documents?limit=0&collection=${collection}`);
  if (!res.ok) return null;
  return await res.json();
}

// ─── SYNC ORCHESTRATOR ──────────────────────────────────────────────

export async function syncVault({ project = null, collection = COLLECTION, clean = false, vaultPath = VAULT_PATH } = {}) {
  // 1. Health check
  const health = await checkHealth();
  if (!health) {
    throw new Error("Embedding service not reachable at " + EMBEDDING_URL);
  }

  // 2. Discover files
  const files = discoverVaultFiles(vaultPath, project);
  if (files.length === 0) {
    return { files: 0, documents: 0, upserted: 0, message: "No vault files found" };
  }

  // 3. Parse all files into documents
  const allDocs = [];
  const errors = [];
  for (const file of files) {
    try {
      const docs = parseVaultFile(file, vaultPath);
      allDocs.push(...docs);
    } catch (err) {
      errors.push({ file: relative(vaultPath, file), error: err.message });
    }
  }

  // 4. Optional: clean old docs for this project before upserting
  let deleted = 0;
  if (clean && project) {
    const result = await deleteByProject(project, collection);
    deleted = result.deleted || 0;
  }

  // 5. Batch upsert
  let totalUpserted = 0;
  for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
    const batch = allDocs.slice(i, i + BATCH_SIZE);
    const result = await batchUpsert(batch, collection);
    totalUpserted += result.upserted || 0;
  }

  // 6. Get final count
  const stats = await getCollectionStats(collection);

  return {
    files: files.length,
    documents: allDocs.length,
    upserted: totalUpserted,
    deleted,
    errors: errors.length > 0 ? errors : undefined,
    collection: {
      name: collection,
      total: stats?.total || "unknown",
    },
  };
}

// ─── QUERY ──────────────────────────────────────────────────────────

export async function searchVault(queryText, options = {}) {
  const health = await checkHealth();
  if (!health) {
    throw new Error("Embedding service not reachable at " + EMBEDDING_URL);
  }
  return await queryVault(queryText, options);
}

// ─── EXPORTS ────────────────────────────────────────────────────────

export { checkHealth, VAULT_PATH, COLLECTION };
