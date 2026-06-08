# Entity Catalog — Mermaid ER (SPEC §4)

**Status:** design artifact, Mermaid (decision #20) | renders natively on GitHub + Obsidian, no infra

The load-bearing Tier 1 chain (`RUNS`, real instance counts from the 2026-06-06 audit) as an entity-relationship diagram. This is the proof that Mermaid covers the ER + flowchart needs of the design phase; the equivalent Graphviz version (`cortex-layers.dot`) is kept only as the deferred-tooling reference.

```mermaid
erDiagram
    SOURCE      ||--o{ PAGE       : "has (12 sources)"
    PAGE        ||--o{ SECTION    : "split into (~180K pages)"
    SECTION     ||--o{ CHUNK      : "chunked into (~550K sections)"
    CHUNK       ||--|| EMBEDDING  : "vectorized as (~680K chunks)"
    SECTION     ||--o{ SYMBOL     : "extracts (~150K symbols)"
    SOURCE      ||--o{ INGESTRUN  : "produced by (~300 runs)"
    SOURCE      ||--o{ TRIAGEVERDICT : "curated by"

    SOURCE {
        string slug PK
        string base_url
        string corpus_root
    }
    PAGE {
        string page_id PK
        string source_id FK
        string url
        string cleaned_text_hash
        int chunk_count
    }
    SECTION {
        string id PK
        string page_id FK
        string heading_path
        int token_count
    }
    CHUNK {
        string id PK
        string section_id FK
        int token_count
        string prev_chunk_id
        string next_chunk_id
        string embedding_id FK
    }
    SYMBOL {
        string id PK
        string section_id FK
        string symbol_type "cli_command|env_var|method|endpoint|config_key|error_code"
        string normalized_symbol
    }
    EMBEDDING {
        string embedding_id PK
        string tier "page|section|chunk"
        int dims "768 (bge-base-en-v1.5)"
    }
```

Tiers 2-5 (continuity, planned spine, stalled learning entities, speculative) are catalogued in `SPEC.md` §4; they get their own diagrams when their loops warrant.
