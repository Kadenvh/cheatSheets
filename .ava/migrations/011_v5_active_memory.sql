-- Migration 007: v10 → v5.0 (Active Memory Only)
-- Removes content and system-description tables per clean category pattern.
-- brain.db scoped to: identity, architecture, sessions, decisions, notes, agent loop.
--
-- Removed tables:
--   prompts        → physical files are truth (.prompts/*.md)
--   plans          → execution tracking (GitHub Projects / Ava_Main local extension)
--   knowledge_base → narrative knowledge (repo docs / Obsidian)
--   pipeline       → self-description (derivable from filesystem)
--
-- IMPORTANT: Run data export BEFORE this migration if you need to preserve
-- plans or knowledge_base content. See documentation/archive/brain-v4-exports/

-- ─── Drop content tables ────────────────────────────────────────────────────

-- Prompts (dead — skills read from .prompts/ files)
DROP TRIGGER IF EXISTS trg_prompts_updated;
DROP TABLE IF EXISTS prompts;

-- Plans (execution tracking — not active memory)
DROP TRIGGER IF EXISTS trg_plans_updated;
DROP TABLE IF EXISTS plans;

-- Knowledge Base + FTS (narrative knowledge — belongs in docs)
DROP TRIGGER IF EXISTS trg_kb_fts_ai;
DROP TRIGGER IF EXISTS trg_kb_fts_ad;
DROP TRIGGER IF EXISTS trg_kb_fts_au;
DROP TRIGGER IF EXISTS trg_kb_updated;
DROP TABLE IF EXISTS knowledge_base_fts;
DROP TABLE IF EXISTS knowledge_base;

-- Pipeline (self-description — derivable from filesystem)
DROP TRIGGER IF EXISTS trg_pipeline_updated;
DROP INDEX IF EXISTS idx_pipeline_category;
DROP TABLE IF EXISTS pipeline;

-- ─── Clean up Ava_Main extensions if present (no-op on template projects) ───

-- These are Ava_Main local extensions, not part of the template.
-- They stay in Ava_Main but are explicitly NOT part of v5 template schema.
-- Uncomment below ONLY if migrating a project that copied these tables by mistake.
--
-- DROP TABLE IF EXISTS plan_items;
-- DROP TABLE IF EXISTS entity_links;
-- DROP TABLE IF EXISTS memory_triggers;
-- DROP TABLE IF EXISTS session_sections;
-- DROP TABLE IF EXISTS learning_events;
-- DROP TABLE IF EXISTS learning_sessions;
-- DROP TABLE IF EXISTS lessons;
-- DROP TABLE IF EXISTS mastery_state;
-- DROP TABLE IF EXISTS reviews;
-- DROP TABLE IF EXISTS streaks;
-- DROP TABLE IF EXISTS learning_preferences;
-- DROP TABLE IF EXISTS prerequisites;
-- DROP TABLE IF EXISTS concepts;

-- ─── Record migration ──────────────────────────────────────────────────────

INSERT INTO schema_version (version, description) VALUES
    (11, 'v5.0 — Active memory only (clean category pattern)');
