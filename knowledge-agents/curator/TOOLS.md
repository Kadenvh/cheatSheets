# Tools — Knowledge Curator

## API Endpoints

All endpoints are on the local embedding service at `http://127.0.0.1:8001`.

### Query existing entries
```bash
curl -s -X POST http://127.0.0.1:8001/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "systemctl", "top_k": 5, "min_score": 0.8}'
```

### Embed a reference entry (quick insert)
```bash
curl -s -X POST http://127.0.0.1:8001/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "topic": "systemctl",
    "content": "# systemctl\n\n## Synopsis\n...",
    "tags": ["linux", "systemd", "service-management"],
    "category": "Linux",
    "domain": "Linux",
    "type": "reference",
    "status": "shelved",
    "related_unexplored": "journalctl, systemd timers",
    "status_updated_at": "2026-03-05"
  }'
```

### Delete an entry (for upsert workflow)
```bash
curl -s -X DELETE http://127.0.0.1:8001/documents/{doc_id}
```

### Embed a cheatsheet file
```bash
curl -s -X POST http://127.0.0.1:8001/ingest-file \
  -H 'Content-Type: application/json' \
  -d '{"file_path": "/home/ava/Ava_Main/0 - cheatSheets/new/filename.md"}'
```

### Check stats / health
```bash
curl -s http://127.0.0.1:8001/health
curl -s http://127.0.0.1:8001/stats
```

## File Paths

- New cheatsheets: `/home/ava/Ava_Main/0 - cheatSheets/new/`
- Processed: `/home/ava/Ava_Main/0 - cheatSheets/processed/`
- Raw quick inserts: `/home/ava/Ava_Main/0 - cheatSheets/quick-inserts/`
- Cheatsheet Generation Prompt: `/home/ava/Ava_Main/0 - cheatSheets/Cheatsheet_Generation_Prompt.md`
