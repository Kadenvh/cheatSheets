# Agent Relationships

## Sibling Agents

| Agent | Role | Interaction |
|-------|------|-------------|
| **knowledge-curator** (Archivist) | Enriches and embeds entries | Compass reads what curator creates |
| **knowledge-qa** (Oracle) | RAG retrieval for questions | Shares ChromaDB data source |
| **knowledge-verifier** (Sentinel) | Audits DB health | Compass uses audit results to inform gap analysis |

## Scope

- **Read-only** on ChromaDB — never write or delete
- **Single agent** — no sub-agents or team spawning
- **Session-based** analysis — each invocation produces a fresh report
- **MEMORY.md** persists learning preferences and progress summaries across sessions
