# Loop 1 — First Closed Loop of the Cortex Brain

**Created:** 2026-06-06 (Session 17) | **Status:** Active | **Updated:** 2026-06-06
**Depends on:** `SPEC.md` §8 (the binding commitment) | `exploration/resource-landscape.md` (all verdicts)

The single active plan. Until this loop closes with artifacts, no other plan opens and no new strategy documents are written (SPEC §7).

## Goal

Close the first end-to-end loop of the agent-controlled memory:

```
real source -> ingest (E2E verified) -> agentified triage/polish -> importance-scored
MemoryOp events -> dreaming machinery fed -> first non-empty Hippocampus report
```

## Why this loop

- The 6-stage ingestion pipeline is feature-complete but its Phase 1.1 cycle (triage -> curate -> polish -> embed) has **never been run uninterrupted against a real source** (verification gap, Ava_Main crawl.md §10 #1)
- The dreaming machinery runs 3x daily and consolidates nothing: starved, not missing
- Closing both with one loop validates the SPEC's central hypothesis (agents can curate memory) on infrastructure that already runs

## Work items

- [ ] Choose Loop 1 source: Azure AI Foundry docs (serves the career thread simultaneously; AI-103 study fuel)
- [ ] Decide port-vs-wrap for the 4 portable libs (retrieval.mjs, chunker, embeddings client, MCP factory) — see reuse matrix, landscape §1
- [ ] Run E2E: scrape -> triage (CLI, as-is) -> curate (UI) -> polish (CLI) -> embed; capture the ingest-run record
- [ ] Add litellm as the model-routing front door (brain = Claude, workers = Ollama) — the one infra piece pre-approved by research
- [ ] Agentify triage: Claude Agent SDK brain dispatches local-model worker via MCP tool/subprocess; same for polish
- [ ] Define the MemoryOp JSONL event schema (append-only; every agent memory operation)
- [ ] Emit importance scores at write time (LLM-judged, slow-decay vs fast-decay routing)
- [ ] Feed scored ops to the dreaming/consolidation machinery; produce the first non-empty Hippocampus report
- [ ] Record verification artifacts in DAL; update SPEC status tags (PLANNED -> RUNS where proven)

## What I'm NOT doing

- No UI work (AG-UI adoption waits for Loop 2+)
- No store consolidation, no re-embedding, no new frameworks
- No GPU-dependent work (Loop 1 runs on the RTX 3070 with the existing serialization workaround)
- No learning-companion / curriculum revival

## Success criteria (liveness artifacts)

1. One ingest-run record showing the full cycle completed against the real source
2. A MemoryOp log segment with importance-scored events from agentified triage/polish
3. One Hippocampus consolidation report containing actually-promoted content
4. SPEC.md §4 Tier 3 entities re-tagged from PLANNED to RUNS with artifact references

## Sessions contributing

| Session | Contribution |
|---|---|
| 17 (2026-06-06) | Plan created from SPEC §8 + research landscape |

## Cross-references

- `SPEC.md` §8 Liveness discipline and Loop 1
- `exploration/resource-landscape.md` §3 (orchestration verdicts), §5 (memory verdicts, consolidation design notes)
- `exploration/research/orchestration.md` (full sourced report)
- Ava_Main `docs/crawl.md` (pipeline reference; §10 verification gap)
