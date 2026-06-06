# EdX Course Subsystem

**Created:** 2026-05-17 (Session 16) | **Status:** Active | **Updated:** 2026-05-17
**Depends on:** `learning-system.md` (vault + FSRS + ChromaDB substrate)
**Supersedes:** Phase-3 "review card exercises" item in `learning-system.md` (folded in here as part of MVP)

## 1) Goal

Make the learning system actually usable for working through EdX courses end-to-end. The first concrete dogfood target is **ColumbiaX CU.OC.AI002 — Programming & Data Structures** (active enrollment).

Success looks like: open the Learn tab (or Smart Chat in Obsidian) → ask the tutor a question about lecture 4.2 → get an Explainer+Coach response grounded in the actual lecture transcript → progress tracker reflects which lectures and post-tests have been completed.

## 2) Why this shape

EdX courses have an explicit structure (Course → Section/Module → Lecture/Page, with optional pre-test and post-test) that maps cleanly onto a *subset* of the v0.1 Learning Memory Architecture spec:

- **Source** = the EdX course itself
- **Source Segment** = each lecture, transcript chunk, or slide page
- **Note** = personal lecture notes authored in Obsidian
- **Concept** (existing) = canonical concepts surfaced from across courses
- **Review Item** (existing brain.db FSRS) = retention cards built from concepts
- **Learning Session** = tutor conversation continuity (existing brain.db sessions)

The full v0.1 entity model (Pattern, Evidence Link, Project Knowledge Link, Concept Alias, Extraction, etc.) is **deferred**. We add those entities only when a concrete need surfaces, not pre-emptively.

## 3) Architecture

### Storage layering

| Concern | Layer | Why |
|---|---|---|
| Course / Section / Lecture structure + progress + test states | `learning.db` (extended) | Already holds curricula+lessons; minimal lift to add EdX shape |
| Course content (lectures, transcripts, slide refs) | `vault/Courses/<course>/<section>/<lecture>.md` | Plays to Obsidian strengths: markdown, wiki-links, dataview, latex-suite, pdf-plus |
| Canonical concepts | `vault/Concepts/` (existing) | Cross-course concepts live here; lectures wiki-link into them |
| Personal lecture notes | Same `<lecture>.md` (a `## Notes` section) | One file per lecture keeps authored notes adjacent to source content |
| Raw assets (PDFs, slides) | `vault/Courses/<course>/_assets/` | Indexed via `pdf-plus`, referenced from lecture frontmatter |
| Semantic retrieval (server-side, tutor backend) | ChromaDB | Existing vault-sync covers this once Courses/ is included |
| Semantic retrieval (in-Obsidian browsing) | `smart-connections` plugin | Already installed; works directly on vault |
| Concept FSRS scheduling | `brain.db` (existing) | Untouched; concept-level review is its job |
| Tutor conversation continuity | `brain.db` sessions | Reuses existing session ledger |
| Tutor identity | `knowledge-agents/tutor/` (existing) | Identity stays; TOOLS.md gets real tool defs |

### Where the tutor lives and what it does

- **Identity dir:** `knowledge-agents/tutor/` (existing; per IDENTITY.md the persona is already Explainer+Coach)
- **Workspace:** project root (the whole knowledge system is its operational scope)
- **UI surfaces:**
  - Primary: Ava_Main hub's Learn tab (per existing IDENTITY.md "conversational teaching interface")
  - Complementary: Smart Chat plugin inside Obsidian (already installed) for when authoring lecture notes
- **Backend access:** the tutor reads `learning.db` for progress context, ChromaDB + vault for content retrieval, `brain.db` for conversation continuity.

## 4) MVP Scope (Phase 1)

**In:**
- `learning.db` schema v2: courses, sections, lectures, tests tables; preserves existing curricula+lessons untouched
- `vault/Templates/{Course,Section,Lecture}.md` templater templates
- `vault/Courses/columbia-programming-data-structures/` scaffold (sections + section overview stubs, ready to fill)
- One small Node import script (`.ava/course-import.mjs`) that seeds `learning.db` from a YAML course manifest
- Tutor wiring: TOOLS.md with real tool defs (`query_course`, `get_lecture`, `semantic_search`, `record_progress`), USER.md filled in, MEMORY.md noting active course
- Documentation: CLAUDE.md architecture row added, README updated

**Out (deferred to later phases):**
- Auto-crawl from EdX (manual content paste for MVP)
- Auto-extraction of lectures into Concepts (manual wiki-linking for MVP)
- Auto-generation of FSRS cards from lectures (existing concept FSRS path stays manual)
- Pattern / Evidence Link / Project Knowledge Link entities from v0.1 spec
- Pre/post-test auto-grading (record_test_score takes user-supplied score; no test runner)
- Course completion certificate emission (mark course `complete` when all post-tests done; no PDF cert)

## 5) Phases

### Phase 1 — Substrate (this session, v7.8.0)
- Schema v2
- Templates
- Columbia course scaffold (structure only, no lecture content yet)
- Tutor wiring
- Doc alignment

### Phase 2 — First-course dogfood
- Author lecture notes for ColumbiaX CU.OC.AI002 Sections 1–N
- Run vault-sync after each section to push to ChromaDB
- Use the tutor in Learn tab as you study
- Track what tools/queries are missing, iterate

### Phase 3 — Concept extraction (when warranted)
- Wiki-link lectures into existing `vault/Concepts/` notes
- Create new concepts when lectures introduce them
- Surface concepts in tutor responses (cite both lecture source and concept canonical)

### Phase 4 — Test integration
- Record pre/post-test scores
- Use scores to weight tutor focus (revisit topics where post-test was weak)

### Phase 5 — Auto-crawl (if needed)
- EdX scraping tool, transcript ingestion, slide PDF download
- obsidian-importer hooks if Obsidian community has an EdX adapter by then

## 6) Open Questions

1. Should "completed" courses (like Basic Math for AI) be back-scaffolded for retrospective concept-linking, or only forward-track active enrollments? Lean: forward-only for MVP, backfill if useful for cross-domain pattern surfacing.
2. Smart Chat (Obsidian) vs Ava_Main Learn tab — do they share session continuity, or are they parallel conversations? Lean: parallel for MVP; unify later via brain.db session bridge.
3. Pre/post-test data model — single `tests` table polymorphic on parent (`course` for final, `section` for section tests, `lecture` for inline checks)? Lean: yes, one table with `parent_type` discriminator.
4. Course-level `domain` — does ColumbiaX CU.OC.AI002 get `computer-science` / `data-structures` / `algorithms`? Multi-tag or single-domain? Lean: multi-tag via separate `course_tags` table.

## 7) Sessions Contributing

| Session | Contribution |
|---|---|
| 16 (2026-05-17) | Plan created; Phase 1 substrate built |

## 8) Cross-References

- `plans/learning-system.md` — parent substrate plan (vault + FSRS + ChromaDB)
- `Learning_Memory_Architecture_v0.1.md` (project root) — the full v0.1 spec this is a strict subset of
- `memory_system_expansion.md` (project root) — theoretical framing for layered memory
- `knowledge-agents/tutor/` — tutor identity pack
- `.ava/learning-schema.sql` — current schema (curricula+lessons); v2 extends here
- brain.db decision #11 — EdX subset-of-v0.1 commitment (recorded with this plan)
