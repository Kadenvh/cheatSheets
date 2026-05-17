# Knowledge System

**Version:** 7.8.0 | **Status:** EdX-Course Capable (Phase 1) — **Public** | **Updated:** 2026-05-17

## Parent Documentation

Spoke component of Project Ava. Hub docs at `Ava_Main/CLAUDE.md`.

| Document | Location |
|----------|----------|
| Learning System Plan | `plans/learning-system.md` |
| EdX Course Subsystem | `plans/edx-courses.md` |
| Resilience Plan | `plans/resilience.md` |
| Architectural Decisions | `DECISIONS.md` |
| Project-Wide Rules | `Ava_Main/CLAUDE.md` |
| Hub Roadmap | `Ava_Main/documentation/PROJECT_ROADMAP.md` § Knowledge System |

---

## Architecture

Five layers, clear boundaries:

| Layer | Tool | Owns |
|-------|------|------|
| **Concept Content** | Obsidian vault (`vault/Concepts/`) | Canonical concept notes, wiki-link graph, exercise hints |
| **Course Content** | Obsidian vault (`vault/Courses/`) | Per-course / section / lecture notes, transcripts, slide refs |
| **Scheduling** | brain.db (`.ava/brain.db`) | Concept mastery, FSRS state, reviews, streaks, prerequisites |
| **Search** | ChromaDB (`:8001`) + Smart Connections (in-Obsidian) | Embeddings, vector search, chunked content |
| **Curriculum** | learning.db (`.ava/learning.db`, schema v2) | Course / Section / Lecture / Test structure + progress |

### Data Flow

```
Obsidian note → POST /api/learning/vault-sync → ChromaDB + brain.db → ReviewPanel UI
```

### Concept Identity

Filename slug = concept ID: `typescript-generics.md` → concept `typescript-generics`.

### Prerequisites

Wiki-links in notes (`[[Linux CLI]]`) are parsed as prerequisite edges during vault-sync. No manual seeding needed.

---

## Quick Reference

**Author concept:** Open `vault/` in Obsidian → create note in `Concepts/` using `Templates/Cheatsheet.md`
**Author course content:** Templater → `Course.md` / `Section.md` / `Lecture.md` in `vault/Courses/<slug>/...`
**Seed a course into learning.db:** edit `vault/Courses/<slug>/manifest.json`, then `node .ava/course-import.mjs <path>`
**Sync vault → ChromaDB:** `POST /api/learning/vault-sync` (Health tab button)
**Review:** CheatSheets > Learn tab > ReviewPanel
**Search:** CheatSheets > Q&A tab (semantic search via ChromaDB)
**Tutor:** Learn tab (primary) or Smart Chat in Obsidian (secondary); identity at `knowledge-agents/tutor/`
**Agents:** 10 OpenClaw agents in `knowledge-agents/` — see `knowledge-agents/README.md`

---

## Critical Rules

### DO NOT
- Route inserts through curator agent as mandatory gateway (curator is optional enrichment)
- Use two ChromaDB collections (one `knowledge` collection with `type` metadata)
- Create concepts manually — vault-sync derives them from notes
- Seed prerequisites manually — wiki-links generate the DAG
- Put canonical concept notes outside `vault/Concepts/`
- Put course content outside `vault/Courses/<slug>/`
- Write to `learning.db` directly from the tutor agent — go through tool contracts in `knowledge-agents/tutor/TOOLS.md`

### ALWAYS
- One concept note = one canonical concept (filename slug = concept ID)
- One lecture note = one lecture page (`vault_ref` in `learning.db` points at it)
- Use wiki-links (`[[Concept Name]]`) for prerequisite relationships and course-to-concept links
- Use the templates in `vault/Templates/` for new notes (Cheatsheet for concepts; Course/Section/Lecture for courses)
- Run `node .ava/course-import.mjs <manifest>` after editing a course manifest
- Sync vault after editing (`POST /api/learning/vault-sync`)

## Session Export

After significant sessions (decisions made, version changed, cross-project work), export a structured session note:
```bash
node .ava/dal.mjs session-export session "summary"
```

This writes `sessions/session-{N}.md` at the project root. PE-framework vault export was retired in v7 — the Obsidian `vault/` here is product content (learning notes), not a continuity surface.

---

## File Structure

```
/home/ava/cheatSheets/
├── CLAUDE.md                          ← This file
├── plans/
│   ├── learning-system.md             ← Substrate (vault + FSRS + ChromaDB)
│   ├── edx-courses.md                 ← EdX course subsystem (active execution plan)
│   └── resilience.md                  ← External-service fallback plan
├── DECISIONS.md                       ← Curated architectural decisions
├── Cheatsheet_Generation_Prompt.md    ← Reference template spec
├── README.md                          ← Project intro
├── vault/                             ← Obsidian vault (content layer)
│   ├── Concepts/                      ← Canonical concept notes (cross-course)
│   ├── Courses/                       ← Per-course content
│   │   └── <course-slug>/
│   │       ├── manifest.json          ← Seed for learning.db (course + sections + tests)
│   │       ├── README.md              ← Course folder shape + workflow
│   │       ├── <section-slug>/
│   │       │   ├── <section-slug>.md  ← Section note (from Section.md template)
│   │       │   └── <lecture>.md       ← Lecture notes (from Lecture.md template)
│   │       └── _assets/{slides,transcripts}/
│   ├── Templates/                     ← Cheatsheet + Course + Section + Lecture
│   └── .obsidian/                     ← Shared Obsidian config (28 plugins)
├── .ava/                              ← Curriculum engine (only product files tracked)
│   ├── learning-schema.sql            ← Curriculum schema (v2 = + sections + tests + EdX cols)
│   ├── learning-db.mjs                ← learning.db access + migrations
│   └── course-import.mjs              ← Seed learning.db from manifest.json
├── knowledge-agents/                  ← 10 OpenClaw agent workspaces (see README there)
│   ├── README.md                      ← Identity-pack vs SKILL.md contract
│   ├── tutor/                         ← Explainer + Coach (active for EdX courses)
│   ├── curator/  qa/  verifier/  learning/  demo/  architect/
│   └── consolidator/  retrieval/  vault-health/    ← skill-only agents
└── archive/                           ← Scoped: ELEGOO Mega 2560 kit
```

---

## Agents (Revised Roles)

See `knowledge-agents/README.md` for the full directory contract (identity pack vs SKILL.md).

| Agent | Name | Role |
|-------|------|------|
| `architect` | Architect | Curriculum planning |
| `consolidator` | Consolidator | Vault deduplication + merging (skill-only) |
| `curator` | Archivist | **Optional** enrichment of stub notes (identity + skill) |
| `demo` | Spark | Exercise / lesson generation for ReviewPanel |
| `learning` | Compass | Coverage analysis, gap detection, learning-path suggestions |
| `qa` | Oracle | RAG retrieval with citations (ChromaDB) |
| `retrieval` | RAG Q&A + command router (skill-only) | Default handler for non-command messages |
| `tutor` | Tutor | **Explainer + Coach** for EdX courses (active surface) |
| `vault-health` | Vault Health | Broken-link / frontmatter / category checks (skill-only) |
| `verifier` | Sentinel | ChromaDB audit + data quality |

---

## Metadata Schema

### Obsidian Note Frontmatter — Concepts (`vault/Concepts/*.md`)

| Field | Required | Description |
|-------|----------|-------------|
| `category` | Yes | Python / DataScience / Automation / Tools / Linux / General |
| `tags` | Yes | Lowercase, hyphenated topic tags |
| `title` | Yes | Human-readable concept title |
| `created` | Yes | ISO date (YYYY-MM-DD) |
| `type` | Yes | `cheatsheet` (or `reference` future) |
| `difficulty` | Recommended | 1-10 scale (default: 5) |
| `exercise_hints` | Recommended | Object with recall/understanding/application keys |

### Obsidian Note Frontmatter — Courses

Three shapes, each with `type` discriminator:

- **Course** (`type: course`): `course_id`, `external_id`, `provider`, `kind`, `course_url`, `domain[]`, `enrolled`, `status`, `section_count`, `lecture_count`
- **Section** (`type: section`): `section_id`, `course_id`, `sort_order`, `slides_ref`, `doc_pages`, `has_pre_test`, `has_post_test`, `status`, `lecture_count`
- **Lecture** (`type: lecture`): `lecture_id`, `section_id`, `course_id`, `sort_order`, `lecture_kind` (`video`/`reading`/`exercise`/`page`/`lesson`), `transcript_ref`, `slides_ref`, `status`

The `*_id` fields are the join keys into `learning.db` (`curricula`, `curriculum_sections`, `curriculum_lessons`).

### ChromaDB Document Metadata

| Field | Source | Description |
|-------|--------|-------------|
| `title` | Frontmatter | Note title |
| `section` | H2 header | Chunk section name |
| `category` | Frontmatter | Content category |
| `type` | Frontmatter | `cheatsheet` or `reference` |
| `source_file` | Filename | Vault filename |
| `difficulty` | Frontmatter | 1-10 complexity |
