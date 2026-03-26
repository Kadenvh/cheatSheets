# Tools

## ChromaDB Embedding Service (HTTP)
- `GET http://127.0.0.1:8001/stats` — collection count, model, device
- `GET http://127.0.0.1:8001/documents?limit=500` — all documents with metadata
- `POST http://127.0.0.1:8001/query` — `{"query": "text", "n_results": 5}` similarity search
- `GET http://127.0.0.1:8001/health` — service health check
- `GET http://127.0.0.1:8001/domains` — list all domains/categories
- `DELETE http://127.0.0.1:8001/documents/{id}` — remove document (ONLY with explicit user approval)

## Usage
Use `exec` tool with `curl` to call these endpoints. Always use `-s` flag for clean output.
Parse JSON responses to extract document IDs, metadata, and content for analysis.
