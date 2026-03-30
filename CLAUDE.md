# Knowledge System

**Version:** 7.2.0 | **Status:** Obsidian-First (Pipeline Operational) | **Updated:** 2026-03-30

## Parent Documentation

Spoke component of Project Ava. Hub docs at `Ava_Main/CLAUDE.md`.

| Document | Location |
|----------|----------|
| Learning System Plan | `LEARNING_SYSTEM_PLAN.md` (this directory) |
| Project-Wide Rules | `Ava_Main/CLAUDE.md` |
| Hub Roadmap | `Ava_Main/documentation/PROJECT_ROADMAP.md` § Knowledge System |

---

## Architecture

Three layers, clear boundaries:

| Layer | Tool | Owns |
|-------|------|------|
| **Content** | Obsidian vault (`vault/`) | Note text, organization, wiki-link graph, exercise hints |
| **Scheduling** | brain.db (`.ava/brain.db`) | Concepts, mastery levels, FSRS state, reviews, streaks, prerequisites |
| **Search** | ChromaDB (`:8001`) | Embeddings, vector search, chunked content |

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

**Author content:** Open `vault/` in Obsidian → create note in `Concepts/` using Cheatsheet template
**Sync to system:** `POST /api/learning/vault-sync` (Health tab button)
**Review:** CheatSheets > Learn tab > ReviewPanel
**Search:** CheatSheets > Q&A tab (semantic search via ChromaDB)
**Agents:** 7 OpenClaw agents in `knowledge-agents/` (curator, qa, verifier, compass, spark, tutor, architect)

---

## Critical Rules

### DO NOT
- Route inserts through curator agent as mandatory gateway (curator is optional enrichment)
- Use two ChromaDB collections (one `knowledge` collection with `type` metadata)
- Create concepts manually — vault-sync derives them from notes
- Seed prerequisites manually — wiki-links generate the DAG
- Put learning content outside `vault/Concepts/`

### ALWAYS
- One note = one concept (filename slug = concept ID)
- Use wiki-links (`[[Concept Name]]`) for prerequisite relationships
- Use the Cheatsheet template in `vault/Templates/` for new notes
- Sync vault after editing (`POST /api/learning/vault-sync`)

## Vault Export

After significant sessions (decisions made, version changed, cross-project work), export to Obsidian vault:
```bash
node .ava/dal.mjs vault-export session "summary"
node .ava/dal.mjs vault sync CheatSheets 2>/dev/null || true
```

---

## File Structure

```
/home/ava/cheatSheets/
├── CLAUDE.md                          ← This file
├── LEARNING_SYSTEM_PLAN.md            ← Comprehensive plan (supersedes all prior plans)
├── Cheatsheet_Generation_Prompt.md    ← Reference template spec
├── README.md                          ← Project intro
├── vault/                             ← Obsidian vault (content layer)
│   ├── Concepts/                      ← One .md per concept (67 notes)
│   ├── Templates/                     ← Obsidian note templates
│   │   └── Cheatsheet.md
│   └── .obsidian/                     ← Obsidian config
├── .ava/                              ← brain.db (scheduling layer)
│   ├── brain.db
│   ├── dal.mjs
│   ├── lib/
│   └── migrations/
├── knowledge-agents/                  ← OpenClaw agent workspaces
│   ├── curator/                       ← Archivist (optional enrichment)
│   ├── qa/                            ← Oracle (RAG retrieval)
│   ├── verifier/                      ← Sentinel (audit)
│   ├── learning/                      ← Compass (coverage + gaps)
│   ├── demo/                          ← Spark (exercise generation)
│   ├── tutor/                         ← Socratic teaching
│   └── architect/                     ← Curriculum planning
├── archive/                           ← Superseded plans + legacy dirs
└── [agent identity files]             ← SOUL.md, IDENTITY.md, etc.
```

---

## Agents (Revised Roles)

| Agent | Name | Role |
|-------|------|------|
| `knowledge-curator` | Archivist | **Optional** enrichment — flesh out stub notes via MCP on request |
| `knowledge-qa` | Oracle | RAG retrieval with citations (searches ChromaDB) |
| `knowledge-verifier` | Sentinel | ChromaDB audit + data quality |
| `knowledge-learning` | Compass | Coverage analysis, gap detection, learning path suggestions |
| `knowledge-demo` | Spark | Exercise/lesson generation for ReviewPanel |
| `learning-tutor` | Tutor | Socratic teaching in session tabs |
| `learning-architect` | Architect | Curriculum planning for sessions |

---

## Metadata Schema

### Obsidian Note Frontmatter

| Field | Required | Description |
|-------|----------|-------------|
| `category` | Yes | Python / DataScience / Tools / Linux / General |
| `tags` | Yes | Lowercase, hyphenated topic tags |
| `title` | Yes | Human-readable concept title |
| `created` | Yes | ISO date (YYYY-MM-DD) |
| `type` | Yes | `cheatsheet` (or `reference` future) |
| `difficulty` | Recommended | 1-10 scale (default: 5) |
| `exercise_hints` | Recommended | Object with recall/understanding/application keys |

### ChromaDB Document Metadata

| Field | Source | Description |
|-------|--------|-------------|
| `title` | Frontmatter | Note title |
| `section` | H2 header | Chunk section name |
| `category` | Frontmatter | Content category |
| `type` | Frontmatter | `cheatsheet` or `reference` |
| `source_file` | Filename | Vault filename |
| `difficulty` | Frontmatter | 1-10 complexity |
