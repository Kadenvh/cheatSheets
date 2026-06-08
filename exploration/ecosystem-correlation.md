# Ecosystem Correlation — Cortex's Scattered Scope

**Created:** 2026-06-08 (Session 18) | **Status:** Exploration — FINDING PENDING RESOLUTION | **Blocks:** convergence decision, SPEC §6 reconciliation
**Gate:** do not act on the convergence proposal until the Ava_Main orchestration track gives a definitive answer on where the agentic-pipeline lives.

## The finding

Cortex's scope already exists across the ecosystem, scattered — and the **orchestration half is more developed outside `cortex-design` than inside it.** The Session-17 re-founding named the **brain** (memory curation) here; a parallel track independently named the **orchestration substrate** (table-store pipeline) in `Ava_Main/docs` + `/home/ava/agent-pipeline/`. These are two halves of one system that don't yet reference each other — the audit's "split brain," now at ecosystem scale.

## Surfaces (correlated to SPEC.md, verified 2026-06-08, read-only)

| Surface | What it really is | Correlation to SPEC |
|---|---|---|
| `/home/ava/agent-pipeline/` (root; Jun 6-8; working v0) | Proven prototype of "every value is a row" + single step-runner. Real PydanticAI→Ollama (`qwen2.5:7b`) run; inputs/params/outputs all rows bound to `run_id=1`. Stack: PydanticAI + Ollama + SQLite + LangFuse (`:3000`, dark/keys-unset). `pipeline.db`: steps=1, runs=1, values_store=8. | **Seed of the `cortex/` build home.** It is SPEC §4 Tier-3 MemoryOp + §6 orchestration, already breathing. Its own `AUDIT-2026-06-08.md` asks "graduate into where?" — Cortex is the answer. |
| `Ava_Main/docs/architecture/agentic-pipeline.md` | Canonical orchestration vision (table-as-layers; small-local-model per step; Closed Learning Loop; DSPy/TextGrad as prior art; PydanticAI execution substrate; SQLite store; LangFuse traces; graph viz last). Authored 2026-06-06 from Kaden. | **Absorbs/supersedes SPEC §6** — deeper than what SPEC currently says. The CLL is the self-engineering goal SPEC only gestures at. |
| `Ava_Main/docs/architecture/` (four-layer-knowledge-architecture, context-system-map, crawl-pipeline, observability-map, ava-hub-*) | Ingestion + knowledge architecture in depth, where the code lives | SPEC's Ingestion + Memory layers, documented at the code's home. |
| `/home/ava/docs/exploration/cognitive_architecture_spec.md` | **The "missing" parent** `Learning_Memory_Architecture_v0.1` referenced — never missing, lives here | Resolves a dangling-reference flag from the Session-17 audit. Memory/cognition theory root. |
| `/home/ava/docs/` (exploration/ patterns/ plans/ SERVICES.md 47KB) | Ecosystem-level docs home — same `exploration→plans` lifecycle one level up | Cortex's internal lifecycle is a fractal of this. SERVICES.md = runtime map. |
| `ce/` | Context-engineering curator (LanceDB + curated truth + operating loop) | Reference architecture for Cortex's memory policy. |
| `career-agent/` | The D3 second prompt-decomposition target for agent-pipeline | A pipeline tenant, not an independent loose dir. |

## Implications

1. **SPEC.md is correct in shape, under-scoped on orchestration, unaware of its siblings.** The 4-layer model holds. §6 should defer to `agentic-pipeline.md` rather than restate it thinner. The MemoryOp spine should be re-tagged from `PLANNED` toward prototyped (agent-pipeline proved it).
2. **`agent-pipeline/` is likely what `cortex/` should become** — not empty-until-charter, but "graduate the v0." Resolves split-brain + empty-build-home at once.
3. **The risk now is the inverse of Session 17.** Then: one repo over-claiming. Now: fragmentation — the same vision authored in 3-4 homes. Without reconciliation, the drift the re-founding fought returns, distributed.
4. **PydanticAI vs Claude Agent SDK is an unresolved conflict.** `agentic-pipeline.md` chose PydanticAI (typed, provider-agnostic, maps to typed tables) and explicitly doubts OpenClaw; SPEC §6 + landscape chose Claude Agent SDK + OpenClaw host. The pipeline track has working code on its choice. **Needs one explicit decision, not two coexisting answers.**

## Recommendation (pending the gate)

A reconciliation pass before more building or speccing:

1. **Decide convergence:** does `cortex-design` become the design home for the whole system (brain + pipeline), absorbing `agentic-pipeline.md` and adopting `agent-pipeline/` as the `cortex/` build seed? (Strong read: yes, same system.)
2. **Reconcile the two specs:** fold orchestration depth + CLL into SPEC, or link SPEC §6 to `agentic-pipeline.md` as canonical; resolve PydanticAI-vs-Agent-SDK with one decision.
3. **Re-tag SPEC §4** against ground truth (MemoryOp prototyped, not planned).
4. **Then** agent-pipeline's two blocked decisions (parent_id tree, rows-as-source-of-truth) get answered in Cortex's frame, and Loop 1 absorbs the working step-runner instead of rebuilding it.

**Option on the table:** run a proper ecosystem-reconciliation survey (fan-out like the Session-17 audit) → one correlation doc + a convergence proposal, to answer #1 with evidence rather than first-read.

## Why this is gated

Per Kaden (Session 18): the agentic-pipeline lives in the Ava_Main orchestration track, which owns the definitive answer on its home and direction. Cortex must not unilaterally absorb it. This doc captures the correlation so it does not evaporate into chat (the exact failure `agentic-pipeline.md` itself was written to prevent); the convergence acts only after Ava_Main's track decides.

## Cross-refs

- `SPEC.md` §3 (layers), §4 (entities), §6 (orchestration — the under-scoped section)
- `Ava_Main/docs/architecture/agentic-pipeline.md` (the canonical orchestration vision)
- `/home/ava/agent-pipeline/{README,AUDIT-2026-06-08,DELIVERABLE-2-SPEC,SCHEMA_PROPOSAL}.md`
- `exploration/resource-landscape.md` §3 (orchestration verdicts — to reconcile with PydanticAI choice)
