# Learning System Plan (Canonical)

**Version:** 2.0  
**Updated:** 2026-03-24  
**Status:** Active — Phase 3 remaining  
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
- Vault path: `0 - cheatSheets/vault/`
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

### Remaining (Phase 3)
- Author 20+ high-quality concept notes/content expansion
- Obsidian plugin polish/config hardening
- Compass suggestion quality pass
- Streak visualization polish in Obsidian-facing workflow

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
