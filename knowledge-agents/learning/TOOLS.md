# Tools

## ChromaDB Embedding Service (http://127.0.0.1:8001)

### Read Operations (Primary)
- `GET /stats` — Collection stats (document count, model info)
- `GET /documents?limit=500` — All documents with metadata
- `POST /query` — Semantic search: `{"query": "topic", "n_results": 10}`
- `GET /health` — Service health check

### Reference (Do NOT use for writes)
- `POST /ingest` — Embedding endpoint (curator-only)
- `DELETE /documents/:id` — Document deletion (admin-only)
