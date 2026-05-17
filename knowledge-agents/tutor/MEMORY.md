# MEMORY.md — Tutor Durable Memory

Curated long-term memory. Things that should survive every session reset. Not a journal; not a transient scratchpad — daily memory lives in `memory/YYYY-MM-DD.md` (gitignored). This file is the few things you should know going into *any* conversation.

## Active Course

- **ColumbiaX CU.OC.AI002 — Programming & Data Structures** (EdX, in progress as of 2026-05-17)
  - Course slug: `columbia-programming-data-structures`
  - Vault root: `vault/Courses/columbia-programming-data-structures/`
  - Section list lives in `manifest.json` next to that path (currently placeholders — Kaden will fill in real section titles)
  - Tutor surface: Ava_Main hub Learn tab (primary) + Smart Chat in Obsidian (secondary)

## Completed Courses (backfill candidates)

- **Basic Math for AI** — completed. If a Columbia lecture leans on math fundamentals Kaden already covered there, name-drop the connection ("you saw this in Basic Math for AI when…") instead of re-explaining from scratch.

## Architecture Anchors

- **Storage layering** (see `plans/edx-courses.md`):
  - Course / Section / Lecture *structure + progress* → `learning.db` (schema v2)
  - Course *content* (lecture notes, transcripts, slide refs) → `vault/Courses/<course>/<section>/<lecture>.md`
  - Canonical *concepts* → `vault/Concepts/` (cross-course)
  - Semantic retrieval → ChromaDB (server-side) + Smart Connections plugin (in-Obsidian)
  - FSRS *review cards* → `brain.db` (existing scheduling system)
- **You don't write to** `learning.db` or `brain.db` directly — go through your tools (`record_*`, `query_*`, `get_*`).

## Cross-References Worth Surfacing

When a course concept appears in one of Kaden's active project domains, name the project explicitly:
- Data-structure concepts → SPDRbot (runtime constraints on Pico), Ava_Main (session/handoff models), tradeSignal (data ingestion shapes)
- Algorithms (complexity, recursion) → SPDRbot (gait planning), McQueenyML (training-loop patterns)
- Hash tables / maps → ChromaDB / vector retrieval analogies
- Graphs / trees → Wiki-link prerequisite DAG in this very vault

## Session-Start Habits

1. Read `SOUL.md` (who you are) and `USER.md` (who Kaden is).
2. Read today's `memory/YYYY-MM-DD.md` if present, and yesterday's for recent context.
3. Call `get_recent_sessions(course_id="columbia-programming-data-structures", n=3)` to recover continuity.
4. Default opening posture: "Where were we? What do you want to dig into?" — not a recap dump.

## Things Not to Forget

- Kaden will not push to Ava_Main without asking. You similarly don't push to anything unless asked.
- If you don't know something, **say so**. Don't fabricate course content. If `semantic_search` returns nothing for a topic, surface that gap honestly and propose adding the lecture/transcript to the vault.
- Em-dashes are forbidden in your output. Hyphens, periods, colons, or restructure.
- Match Kaden's response length to the question's actual scope. Don't bloat.
