# CheatSheets Knowledge System — Architecture

> **Note (2026-03-18):** Stale — agent models listed as Ollama Qwen 7B are incorrect (all Codex via OpenClaw gateway since Session 75). Architecture is being redesigned per session-based model in `documentation/plans/knowledge-learning-plan.md`. This file will be rewritten.

**Version:** 4.2 | **Generated:** 2026-03-11

---

## 1. C4 Container Diagram

```mermaid
C4Container
    title CheatSheets Knowledge System — Container View

    Person(user, "User", "Mobile PWA over Tailscale")

    System_Boundary(pwa, "ava_hub PWA (React 19 + Vite 8)") {
        Container(ui, "CheatSheets Page", "React TSX", "5 sub-tabs: Insert | Explorer | Q&A | Learn | Health")
    }

    System_Boundary(server, "ava-hub Server (Express 5, :3001/:4173)") {
        Container(kapi, "Knowledge API", "24 endpoints", "CRUD, curator-insert, ask, audit, reprocess-all, coverage, quality-gates")
        Container(lapi, "Learning API", "38 endpoints", "progress, path, compass, concepts, prerequisites, reviews, mastery, sessions")
        Container(oapi, "OpenClaw Proxy", "1 endpoint", "/api/openclaw/message — agent chat relay")
    }

    System_Boundary(agents, "OpenClaw Gateway (:18789)") {
        Container(curator, "Archivist", "knowledge-curator", "Codex model (OAuth). Enriches + validates + embeds via tools.")
        Container(qa, "Oracle", "knowledge-qa", "Ollama Qwen 7B. RAG retrieval with citations.")
        Container(verifier, "Sentinel", "knowledge-verifier", "Ollama Qwen 7B. ChromaDB audit + reprocess trigger.")
        Container(compass, "Compass", "knowledge-learning", "Ollama Qwen 7B. Coverage analysis. Server-augmented (coverage pre-injected).")
    }

    System_Boundary(storage, "Storage Layer") {
        ContainerDb(chromadb, "ChromaDB", "FastAPI :8001, all-MiniLM-L6-v2, CUDA", "Vector store. Single collection, type metadata filter.")
        ContainerDb(quickins, "quick-inserts/", "JSON files (59)", "Raw input only: {input, mode, ts}. All enriched.")
        ContainerDb(newdir, "new/", "Markdown (0 pending)", "Cheatsheet files awaiting ingestion")
        ContainerDb(procdir, "processed/", "Markdown (archived)", "Post-ingestion archive")
        ContainerDb(lpjson, ".learning-progress.json", "JSON", "Per-item learning status + notes")
        ContainerDb(pathjson, ".learning-path.json", "JSON", "Compass-generated learning sections")
    }

    Rel(user, ui, "Interacts via")
    Rel(ui, kapi, "HTTP REST")
    Rel(ui, lapi, "HTTP REST")
    Rel(ui, oapi, "HTTP REST (Agent tab chat)")

    Rel(kapi, curator, "POST /v1/chat/completions (gateway HTTP, 600s timeout)")
    Rel(kapi, chromadb, "HTTP proxy (knowledgeProxy)")
    Rel(kapi, quickins, "Write raw JSON on every insert")
    Rel(kapi, newdir, "Read pending / ingest-file")
    Rel(kapi, procdir, "Move after ingestion")

    Rel(lapi, compass, "POST /v1/chat/completions (server-augmented)")
    Rel(lapi, lpjson, "Read/write progress")
    Rel(lapi, pathjson, "Read/write path")
    Rel(lapi, chromadb, "Pre-fetch coverage data for Compass")

    Rel(oapi, qa, "CLI spawn: openclaw agent --agent knowledge-qa")

    Rel(curator, chromadb, "Tool calls: ingest, query (dedup check)")
    Rel(qa, chromadb, "memory_search (OpenClaw built-in)")
    Rel(verifier, chromadb, "Audit reads via server endpoints")
    Rel(compass, chromadb, "No direct access — server injects data")
```

---

## 2. Data Flow — Insert Paths

```mermaid
flowchart TB
    subgraph UI["PWA — Insert Tab"]
        QI["Quick Insert<br/>(command/concept/snippet)"]
        CS["Paste Cheatsheet<br/>(full markdown)"]
        DI["Quick-Insert Fallback<br/>(bypass curator)"]
    end

    subgraph Server["Express Server"]
        CI_EP["POST /api/knowledge/curator-insert"]
        QI_EP["POST /api/knowledge/quick-insert"]
        SAVE_RAW["Save raw JSON<br/>quick-inserts/{ts}.json"]
        GW_CALL["POST gateway:18789<br/>/v1/chat/completions<br/>model: openclaw:knowledge-curator"]
        PARSE["Parse curator response<br/>extractCuratorJSON()"]
        BUSY["curatorBusy mutex<br/>(429 if locked)"]
    end

    subgraph Curator["Archivist Agent (Codex)"]
        ENRICH["Enrich: Synopsis, Subcommands,<br/>Flags, Examples, Related"]
        VALIDATE["Validate cheatsheet format"]
        DEDUP["Query ChromaDB for duplicates"]
        EMBED_TOOL["Tool call: POST :8001/ingest"]
        MERGE["If exists: delete old → merge → re-embed"]
    end

    subgraph ChromaDB["ChromaDB (:8001)"]
        INGEST["/ingest endpoint"]
        INGEST_FILE["/ingest-file endpoint"]
        COLLECTION["knowledge_vault collection<br/>all-MiniLM-L6-v2 embeddings"]
    end

    subgraph Files["File Storage"]
        RAW["quick-inserts/<br/>59 raw JSON files"]
        NEW["new/<br/>0 pending .md files"]
        PROC["processed/<br/>archived .md files"]
    end

    QI --> CI_EP
    CS --> CI_EP
    DI --> QI_EP

    CI_EP --> BUSY --> SAVE_RAW --> RAW
    BUSY --> GW_CALL --> ENRICH & VALIDATE
    ENRICH --> DEDUP --> EMBED_TOOL --> INGEST --> COLLECTION
    DEDUP --> MERGE --> INGEST
    VALIDATE --> EMBED_TOOL
    GW_CALL --> PARSE

    QI_EP --> INGEST --> COLLECTION

    CS -.->|"cheatsheet mode"| NEW
    NEW -->|"/api/knowledge/ingest"| INGEST_FILE --> COLLECTION
    INGEST_FILE -->|"move on success"| PROC

    style RAW fill:#7c2d12,stroke:#f97316,color:#fff
    style COLLECTION fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style BUSY fill:#4a1942,stroke:#a855f7,color:#fff
```

---

## 3. Data Flow — Retrieval Paths

```mermaid
flowchart TB
    subgraph UI["PWA Sub-Tabs"]
        EXP["Explorer Tab"]
        QA_TAB["Q&A Tab"]
        LEARN["Learn Tab<br/>(Overview panel)"]
        HEALTH["Health Tab"]
    end

    subgraph Server["Express Server"]
        DOCS_EP["GET /api/knowledge/documents"]
        SIM_EP["GET /api/knowledge/similarity-graph"]
        ASK_EP["POST /api/knowledge/ask"]
        QUERY_EP["POST /api/knowledge/query"]
        STATS_EP["GET /api/knowledge/stats"]
        DOMAINS_EP["GET /api/knowledge/domains"]
        COV_EP["GET /api/knowledge/coverage"]
        AUDIT_EP["POST /api/knowledge/audit"]
        REPROC_EP["POST /api/knowledge/reprocess-all"]
        COMPASS_EP["POST /api/learning/compass"]
    end

    subgraph Agents["OpenClaw Agents"]
        ORACLE["Oracle (knowledge-qa)<br/>CLI spawn, Ollama 7B"]
        SENTINEL["Sentinel (knowledge-verifier)<br/>Ollama 7B"]
        COMPASS_A["Compass (knowledge-learning)<br/>Ollama 7B"]
    end

    subgraph ChromaDB["ChromaDB (:8001)"]
        QUERY_C["/query — semantic search"]
        DOCS_C["/documents — list all"]
        STATS_C["/stats — collection metrics"]
        SIM_C["/similarity-graph — pairwise"]
        RESET_C["/reset — bulk delete"]
    end

    EXP --> DOCS_EP --> DOCS_C
    EXP --> SIM_EP --> SIM_C

    QA_TAB --> ASK_EP
    ASK_EP -->|"1. Retrieve context"| QUERY_C
    ASK_EP -->|"2. Build RAG prompt"| ORACLE
    ORACLE -->|"Answer with citations"| QA_TAB

    LEARN --> COV_EP --> STATS_C & DOCS_C
    LEARN --> COMPASS_EP
    COMPASS_EP -->|"Pre-fetch coverage"| STATS_C & DOCS_C
    COMPASS_EP -->|"Augmented message"| COMPASS_A

    HEALTH --> AUDIT_EP -->|"Scan all docs"| DOCS_C
    HEALTH --> REPROC_EP -->|"1. Wipe"| RESET_C
    REPROC_EP -->|"2. Move processed/ → new/"| FILES_MOVE["File ops"]
    REPROC_EP -->|"3. Re-ingest .md"| INGEST_FILE["/ingest-file"]
    REPROC_EP -->|"4. Re-ingest quick JSON"| INGEST["/ingest"]

    style ORACLE fill:#1a472a,stroke:#22c55e,color:#fff
    style COMPASS_A fill:#1a472a,stroke:#22c55e,color:#fff
    style SENTINEL fill:#1a472a,stroke:#22c55e,color:#fff
```

---

## 4. Agent Architecture

```mermaid
flowchart LR
    subgraph Gateway["OpenClaw Gateway (:18789)"]
        direction TB

        subgraph A1["knowledge-curator (Archivist)"]
            M1["Model: openai-codex/gpt-5.3-codex (OAuth)"]
            T1["Tools: ChromaDB ingest, query, dedup"]
            W1["Workspace: knowledge-agents/curator/"]
        end

        subgraph A2["knowledge-qa (Oracle)"]
            M2["Model: ollama/qwen2.5:7b (GPU)"]
            T2["No direct tools — server pre-fetches context"]
            W2["Workspace: knowledge-agents/qa/"]
            I2["Invocation: CLI spawn (not gateway HTTP)"]
        end

        subgraph A3["knowledge-verifier (Sentinel)"]
            M3["Model: ollama/qwen2.5:7b (GPU)"]
            T3["Audit via server /api/knowledge/audit"]
            W3["Workspace: knowledge-agents/verifier/"]
        end

        subgraph A4["knowledge-learning (Compass)"]
            M4["Model: ollama/qwen2.5:7b (GPU)"]
            T4["No ChromaDB access — server-augmented"]
            W4["Workspace: knowledge-agents/learning/"]
            I4["Server pre-injects: doc count, domains,<br/>status dist, unexplored topics, titles"]
        end
    end

    A1 --- A2 --- A3 --- A4
```

---

## 5. UI Tab Structure

```mermaid
flowchart TB
    CS["CheatSheets Page (v3.4, amber accent)"]

    CS --> INS["Insert Tab"]
    CS --> EXP["Explorer Tab"]
    CS --> QAT["Q&A Tab"]
    CS --> AGT["Agent Tab"]
    CS --> LRN["Learn Tab"]
    CS --> HLT["Health Tab"]

    INS -->|"Quick Insert"| QI_F["command/concept → curator-insert"]
    INS -->|"Paste Cheatsheet"| CS_F["markdown → curator-insert (cheatsheet mode)"]
    INS -->|"Direct Embed"| DE_F["quick-insert (bypasses curator)"]

    EXP --> DOCS["Document list + search"]
    EXP --> SIM["Similarity graph visualization"]

    QAT --> RAG["RAG query → Oracle agent → cited answer"]

    AGT --> CHAT["OpenClaw agent chat (any agent)"]
    AGT --> IDENT["Agent identity panels (4 agents)"]

    LRN --> OV["Overview"]
    LRN --> ML["ML Demos"]
    LRN --> LLM["LLM Demos"]
    LRN --> LP["Learning Path"]

    OV --> COV["Coverage dashboard (domains, categories, gaps)"]
    OV --> COMP["Compass agent chat (server-augmented)"]

    LP --> DYN["Dynamic path from .learning-path.json"]
    LP --> PROG["Per-item progress tracking (.learning-progress.json)"]

    HLT --> AUD["Audit (deterministic scan)"]
    HLT --> REPR["Reprocess All (wipe + re-ingest, requires confirmation)"]
    HLT --> SENT["Sentinel agent identity"]
```

---

## 6. Server Endpoint Map

```mermaid
flowchart LR
    subgraph KnowledgeCRUD["Knowledge CRUD (19 endpoints)"]
        direction TB
        K1["GET /health — ChromaDB status"]
        K2["GET /stats — collection metrics"]
        K3["GET /domains — topic list"]
        K4["GET /documents — paginated list"]
        K5["DELETE /documents/:id — remove entry"]
        K6["POST /query — semantic search"]
        K7["POST /analyze — content auto-detection"]
        K8["POST /audit — deterministic health scan"]
        K9["POST /reprocess-all — wipe + re-ingest"]
        K10["POST /curator-insert — enriched insert (600s)"]
        K11["POST /quick-insert — direct embed fallback"]
        K12["GET /pending — list new/ files"]
        K13["POST /ingest — process new/ files"]
        K14["POST /ask — RAG Q&A via Oracle"]
        K15["GET /similarity-graph — pairwise scores"]
        K16["GET/POST /preferences — Q&A settings"]
        K17["POST /reset — bulk delete"]
        K18["POST /reset-files — processed/ → new/"]
        K19["GET /coverage — domain analysis"]
    end

    subgraph LearningAPI["Learning API (3 endpoints)"]
        direction TB
        L1["GET/POST /learning/progress"]
        L2["GET/POST /learning/path"]
        L3["POST /learning/compass"]
    end

    subgraph Downstream["Downstream Services"]
        CHROMA["ChromaDB :8001"]
        GW["OpenClaw Gateway :18789"]
        CLI["openclaw CLI (spawn)"]
    end

    KnowledgeCRUD -->|"knowledgeProxy()"| CHROMA
    K10 -->|"gateway HTTP API"| GW
    K14 -->|"CLI spawn"| CLI
    L3 -->|"gateway HTTP API"| GW
```

---

## 7. ChromaDB Metadata Schema

```mermaid
erDiagram
    DOCUMENT {
        string id PK "ChromaDB auto-generated"
        string content "Full text (embedded)"
        float[] embedding "all-MiniLM-L6-v2 vector"
    }
    METADATA {
        string type "reference | cheatsheet"
        string status "new | learning | practiced | needs-review | verified | shelved"
        string category "Python | DataScience | Automation | Tools | Linux | General"
        string domain "Free text topic grouping"
        string title "Display name"
        string related_unexplored "Comma-separated gap topics"
        string status_updated_at "ISO 8601 date"
        string session "Learning session grouping"
    }
    DOCUMENT ||--|| METADATA : "carries"
```

**Current state:** 55 documents total. Retention cycle (shelved -> needs-review -> verified) via FSRS engine.

---

## 8. Known Issues and Architectural Notes

```mermaid
flowchart TB
    subgraph Issues["Known Issues"]
        direction TB
        I1["quick-inserts/ stores only raw input<br/>{input, mode, ts} — no curator output<br/>→ reprocess-all falls back to raw input,<br/>losing enrichment (lossy reprocessing)"]
        I2["OpenClaw memory_search quota exhausted<br/>→ Compass cannot query ChromaDB directly<br/>→ Server pre-fetches coverage data<br/>and injects into prompt"]
        I3["related_unexplored references<br/>May have stale entries after<br/>knowledge base growth"]
        I4["55 docs total<br/>Status lifecycle never exercised<br/>(no verified, no needs-review)"]
        I5["Curator mutex: curatorBusy flag<br/>Only 1 concurrent insert<br/>(429 if busy, no queue)"]
    end

    subgraph Notes["Architecture Notes"]
        direction TB
        N1["Single ChromaDB collection<br/>type metadata filters reference vs cheatsheet"]
        N2["Oracle invoked via CLI spawn<br/>(not gateway HTTP — legacy path)"]
        N3["Compass is server-augmented:<br/>coverage data pre-injected into prompt<br/>so 7B model needs no tool access"]
        N4["Gateway HTTP requires OPENCLAW_GATEWAY_TOKEN<br/>env var set in systemd service"]
    end
```
