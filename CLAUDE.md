# Knowledge System

**Version:** 4.0 | **Status:** Phase 1 Curator Gateway | **Updated:** 2026-03-05

## Parent Documentation

This is a spoke component of Project Ava. Strategic docs live at the hub level:

| Document | Location |
|----------|----------|
| Architecture & Vision | `Ava_Main/documentation/PROJECT_ROADMAP.md` § Knowledge System |
| Open Items & Session Log | `Ava_Main/documentation/IMPLEMENTATION_PLAN.md` § CheatSheets |
| Project-Wide Rules | `Ava_Main/CLAUDE.md` |
| Rebuild Master Plan | `Ava_Main/repos/cheatSheets/CHEATSHEETS_PLAN.md` |

This file contains **component-specific rules only**. Do not duplicate hub-level content here.

---

## Quick Reference

**Agent-curated knowledge system.** All knowledge enters through the curator agent (Archivist), which enriches, validates, categorizes, deduplicates, and embeds entries into ChromaDB.

**Two insert paths:**
- **Quick Insert** — command/concept/snippet → curator enriches into full reference → embeds
- **Paste Cheatsheet** — full markdown → curator validates format → embeds

**Vector Knowledge Service:** FastAPI on port 8001 using `all-MiniLM-L6-v2`
**Curator endpoint:** `POST /api/knowledge/curator-insert` (120s timeout)
**Direct embed fallback:** `POST /api/knowledge/quick-insert` (bypasses curator)

**Agents:**
- `knowledge-curator` (Archivist) — gateway for all inserts
- `knowledge-qa` (Oracle) — RAG retrieval with citations

---

## Critical Rules

### DO NOT
- Use INDEX.md, GRAPH.md, or obsidian-cli — fully retired
- Use the `openClaw_Vault/` directory — retired legacy archive
- Embed directly without going through the curator (except fallback)
- Use Windows paths — headless Ubuntu server

### ALWAYS
- Route all inserts through `POST /api/knowledge/curator-insert`
- Verify curator returns `status: "embedded"` in response
- Move ingested files from `new/` to `processed/`
- Use Linux paths: `/home/ava/Ava_Main/repos/cheatSheets/`

---

## File Structure

```
/home/ava/Ava_Main/repos/cheatSheets/
├── CLAUDE.md                         ← This file
├── Cheatsheet_Generation_Prompt.md   ← Template for generating cheatsheets
├── new/                              ← Incoming cheat sheets (unprocessed)
├── processed/                        ← Archived originals (post-processing)
├── quick-inserts/                    ← Raw JSON of quick insert inputs
├── openClaw_Vault/                   ← Legacy archive (retired, do not use)
├── knowledge-agents/                 ← OpenClaw agent workspaces
│   ├── curator/                      ← Archivist (enrichment + embedding)
│   └── qa/                           ← Oracle (RAG retrieval)
```

---

## Metadata Schema

All ChromaDB entries carry these metadata fields:

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `reference` / `cheatsheet` | Entry type |
| `status` | `new` / `learning` / `practiced` / `needs-review` / `verified` / `shelved` | State machine |
| `category` | Python / DataScience / Automation / Tools / Linux / General | Content category |
| `domain` | Free text | Topic grouping |
| `related_unexplored` | Comma-separated | Related topics not yet in knowledge base |
| `status_updated_at` | ISO date | Last status change |
| `session` | Free text | Learning session grouping (cheatsheets only) |

---

## Data Flow

**Quick Insert:** User input → `POST /api/knowledge/curator-insert` → raw JSON saved to `quick-inserts/` → curator agent enriches (Synopsis/Subcommands/Flags/Examples/Related) → `POST http://127.0.0.1:8001/ingest` with full metadata → response with title, sections, related_unexplored

**Cheatsheet Paste:** User pastes markdown → `POST /api/knowledge/curator-insert` (mode: cheatsheet) → curator validates format against template → saves to `new/` → `POST http://127.0.0.1:8001/ingest-file` → moves to `processed/`

**Upsert:** Curator queries ChromaDB first → if exists, deletes old entry → creates merged entry → responds with `action: "merged"`
