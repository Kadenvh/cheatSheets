# Knowledge System (CheatSheets Spoke)

File storage spoke for the vector knowledge system. Documents flow through `new/` → ingestion → ChromaDB. The UI lives in `ava_hub/src/features/cheatsheets/`, the embedding service in `embedding-service/`.

**Spoke doc:** `CLAUDE.md` (component-specific rules only)
**Hub docs:** `documentation/PROJECT_ROADMAP.md` § Knowledge System, `documentation/IMPLEMENTATION_PLAN.md`

## Contents

| Item | Purpose |
|------|---------|
| `CLAUDE.md` | Spoke rules — ingestion format, domain metadata, parent pointers |
| `new/` | Pending documents awaiting ingestion |
| `processed/` | Documents already ingested into ChromaDB |
| `quick-inserts/` | Raw JSON of quick insert inputs |
| `knowledge-agents/` | OpenClaw agent workspaces (curator, qa, verifier, learning, demo) |

## Document Flow

Paste/upload → `new/` → `POST /api/knowledge/ingest` → ChromaDB → `processed/`
Quick insert → `POST /api/knowledge/quick-insert` → ChromaDB (bypasses file stage)
Curator insert → `POST /api/knowledge/curator-insert` → curator agent enriches → ChromaDB
