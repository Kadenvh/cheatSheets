# Learning System Plan (Canonical)

**Version:** 2.1
**Updated:** 2026-03-30
**Status:** Active — Phase 3 (content expansion)  
**Supersedes:** `knowledge-learning-plan.md`, `CHEATSHEETS_PLAN.md`, legacy split-plan docs

---

## 1) Goal

Obsidian-first personal learning system:
- **Authoring:** Obsidian vault (`vault/Concepts/*.md`)
- **Scheduling:** brain.db (FSRS mastery/reviews)
- **Search:** ChromaDB (single `knowledge` collection)

The system should make learning durable, reviewable, and searchable with minimal friction.

---

## 2) Current Architecture (source of truth)

### Content layer
- Vault path: `vault/` (project root: `/home/ava/cheatSheets/`)
- Concept identity: filename slug (e.g. `git-branching.md` → `git-branching`)
- Prerequisites: parsed from `[[wiki-links]]` in note content

### System layer
- brain.db tracks concepts, prerequisites, events, and review scheduling state
- FSRS review workflow active in Learn tab

### Search layer
- ChromaDB on `:8001`
- Single collection: `knowledge`
- Metadata typing: `type: cheatsheet` (learning), `type: reference` (future)

### App/UI layer (CheatSheets tab)
- Sub-tabs: Insert (hidden), Explorer, Q&A, Learn, Health
- Learn includes session-based flow + reviews
- Health includes manual sync trigger for vault ingest

---

## 3) Data Flow

1. Author/edit note in Obsidian (`vault/Concepts/*.md`)
2. Trigger sync (`POST /api/learning/vault-sync`)
3. Sync pipeline:
   - Parse frontmatter + wiki-links
   - Upsert concept/prerequisites in brain.db
   - Chunk/embed content into ChromaDB `knowledge`
4. Learn/Review surfaces consume updated concept + scheduling state

---

## 4) Agent Roles (revised)

- **Curator:** optional enrichment assistant (not mandatory ingestion gateway)
- **Compass (learning):** coverage analysis + next-topic suggestions
- **Tutor:** session teaching/orchestration
- **Spark (demo):** generated lesson/demo content
- **QA / Verifier / Architect:** retrieval, validation, planning support

---

## 5) Delivery Status

### Completed
- Phase 0: cleanup + vault foundation
- Phase 1: vault-sync pipeline established
- Phase 2: UI integration (health sync, learning UI alignment)
- Session 3 restoration (2026-03-30):
  - Migrated 61 concepts + 1935 reviews from Ava_Main brain.db
  - Restored learning backend (45 endpoints, FSRS engine) with spoke DB routing
  - Restored Learn tab UI (6 components recovered from git)
  - Vault-sync validated: 61 concepts, 117 prerequisite edges, 283 ChromaDB docs

- Session 5 content batch (2026-03-30):
  - Batch 1: 6 learning methods notes (spaced-repetition, active-recall, etc.)
  - Vault-sync validated: 67 concepts, 141 prerequisite edges, 309 ChromaDB docs
- Session 7 Linux expansion + UI fixes (2026-03-30):
  - Batch 2: 6 Linux notes (file-system, process-management, permissions, text-processing, networking, packages)
  - UI audit: fixed version display, domain coverage, Q&A OOM, added vault-sync button
  - Current state: 73 concepts, 152 prerequisite edges, 338 ChromaDB docs

### Remaining (Phase 3)
- Author 10+ more concept notes (Automation category empty, Python expansion, hardware track)
- Compass suggestion quality pass
- Streak visualization polish
- Q&A response parsing fix (raw JSON wrapper visible)

---

## 6) Execution Plan (next)

1. **Content batching:** ship concept sets in small validated batches (5–8 notes each)
2. **Validation loop per batch:** run sync → verify prereq edges → smoke Q&A retrieval
3. **Compass tuning:** compare suggestions to prerequisite frontier + mastery gaps
4. **Streak UX pass:** align streak metrics with practical daily review behavior

---

## 7) Success Criteria

- New concepts are authored directly in Obsidian without process overhead
- Vault sync reliably updates brain.db + ChromaDB with correct prerequisite edges
- Learn/Review experience reflects actual mastered/due state
- Compass suggestions are relevant and actionable
- Streak visualization supports sustained daily review habit

---

## 8) Notes

- This is the **single canonical plan** for CheatSheets learning-system work.
- Historical rationale and implementation detail should live in decisions/architecture/session records, not in parallel competing plan files.
