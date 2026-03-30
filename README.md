# CheatSheets Knowledge System

Personal learning system built on Obsidian vault authoring, FSRS spaced repetition (brain.db), and ChromaDB semantic search. Part of Project Ava.

## How It Works

1. **Author** cheat sheet notes in Obsidian (`vault/Concepts/`)
2. **Sync** vault to system (`POST /api/learning/vault-sync`)
3. **Review** via FSRS scheduling in the Learn tab (ava_hub)
4. **Search** semantically via Q&A tab (ChromaDB)

## Architecture

| Layer | Tool | Owns |
|-------|------|------|
| Content | Obsidian vault (`vault/`) | Note text, wiki-link graph, exercise hints |
| Scheduling | brain.db (`.ava/brain.db`) | Concepts, mastery, FSRS state, reviews, prerequisites |
| Search | ChromaDB (`:8001`) | Embeddings, vector search, chunked content |

## UI (ava_hub CheatSheets tab)

- **Explorer** — 3D force-graph of knowledge chunks, semantic search
- **Q&A** — RAG chat with citations
- **Learn** — FSRS review queue, learning sessions, mastery tracking
- **Health** — Service monitoring, vault sync, quality gates

## Agents

7 OpenClaw agents in `knowledge-agents/`: curator, qa, verifier, learning (Compass), demo (Spark), tutor, architect.

## Quick Start

```bash
# Author content
# Open vault/ in Obsidian, create note in Concepts/ using the Cheatsheet template

# Sync to system
curl -X POST http://localhost:3001/api/learning/vault-sync

# Check health
node .ava/dal.mjs status
```

See `CLAUDE.md` for critical rules and `LEARNING_SYSTEM_PLAN.md` for the full plan.
