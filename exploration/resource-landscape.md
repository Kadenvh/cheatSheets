# Cortex Resource Landscape

**Created:** 2026-06-06 (Session 17) | **Status:** Exploration | **Owner:** Kaden + operator sessions

The full survey of what exists, what is applicable, what is deferred, and what is rejected for building Cortex. Goal: cover all ground once, so the SPEC stands on verified options instead of assumptions.

## Verdict vocabulary

| Verdict | Meaning |
|---|---|
| **ADOPT** | Use now; part of Layer 1 work |
| **TRIAL** | Pilot in a bounded experiment before committing |
| **DEFER** | Re-evaluate at a named trigger (every DEFER must name its trigger) |
| **REJECT** | Not for this project, with reason |

Every verdict must answer the post-mortem test: **does this close a loop NOW, or is it deferred capacity?** This project already died once of premature infrastructure.

---

## 1. Internal incumbents (verified by the 2026-06-06 audit)

These exist, run, and are the default substrate. External options below are evaluated *against* them.

| Asset | Where | State | Verdict |
|---|---|---|---|
| 6-stage ingestion pipeline (classify/preview -> discover/scrape -> triage -> curate -> polish -> embed) | `Ava_Main/ava_hub/server/lib/` + `tools/` | Feature-complete; E2E never verified; triage/polish are Ollama CLI scripts | **ADOPT** (port + agentify; it becomes Cortex Layer 1) |
| Hybrid retrieval engine (vector + FTS5 BM25 + symbol + heading boosts, 5 mode profiles) | `Ava_Main/ava_hub/server/lib/retrieval.mjs` (1,052 LOC) | Working, zero hub coupling | **ADOPT** (copy as-is, swap db handle) |
| Embedding service (FastAPI, bge-base-en-v1.5 768d, OpenAI-compatible, ChromaDB embedded) | `Ava_Main/embedding-service/` on :8001, systemd | Operational, GPU-backed | **ADOPT** (containerize/parametrize later) |
| Corpus disk-mirror (markdown + frontmatter contracts, human-auditable) | `~/.ava-corpus/sources/<slug>/` | 12 sources, ~680K chunks in SQL, real data | **ADOPT** (the "memory you can read" principle) |
| SQL schema (sources/pages/sections/chunks/symbols/runs + FTS5 mirrors) | `.doc-sources.db` (929MB) | Stable, portable | **ADOPT** (copy + adapt; add agent/job provenance columns) |
| `ava-docs` MCP server (7 research tools incl. answerability) | `Ava_Main/ava_hub/server/mcp/` | Operational, stdio + streamable-HTTP | **ADOPT** (template for all Cortex layer interfaces) |
| OpenClaw gateway (9 agents, cron, workspaces, Slack, dreaming/sleep-phase machinery) | `~/.openclaw/` | Running; dreaming cycles fire but consolidate nothing (nothing feeds them) | **TRIAL** as Cortex's agent runtime (vs custom orchestrator; see §3) |
| PE framework / DAL (brain.db: sessions, decisions, notes, handoffs, continuity briefs) | `.ava/` per project | Actively used; the only loop that ever closed | **ADOPT** short-term; Cortex aims to supersede it from project results |
| CE context-engineering curator (curated truth + LanceDB retrieval + dreaming + operating loop + source-of-truth ordering) | `/home/ava/ce/` | Running ecosystem-level | **ADOPT** as reference architecture; Cortex generalizes its memory contract |
| learning.db curriculum engine (courses/sections/lessons/tests, idempotent import) | `.ava/learning-*.mjs` | Sound code, stalled data | **DEFER** (revive when the learning-companion surface gets content; trigger: first real course content authored) |
| FSRS scheduling + wiki-link DAG + 10 knowledge-agent personas | `brain.db` + `knowledge-agents/` | Zero loops ever closed | **DEFER** (trigger: learning-companion surface active and asking for scheduling) |

## 2. Ontology representation

**The framing that decides everything: T-Box vs A-Box.** Cortex's ontology has two layers. The *type system* (T-Box: what entity/relationship types are legal, their constraints) is currently implicit in SQL CHECK constraints + frontmatter conventions. The *instances* (A-Box: actual concepts, edges) are derived data. A typed-graph A-Box already exists: `.ava/migrations/005_learning_ontology.sql` (concepts, prerequisites, skills, skill_concepts). The pasted proposal correctly identified the need (a validatable model behind the diagram) but prescribed heavy, Azure-coupled fixes.

| Option | Verdict | Cost | Fit | Rationale |
|---|---|---|---|---|
| Typed YAML/JSON ontology + JSON Schema (T-Box) | **ADOPT** | S | Local | Makes the implicit type system explicit; agents lint with stdlib; zero new infra |
| SQLite typed graph (A-Box) | **ADOPT** (in place) | S | Local | Already exists; typed edges, FK constraints, in-process |
| Mermaid as render-only layer | **ADOPT** | S | Local | Native rendering on GitHub + Obsidian (our exact surfaces); generated from source, never hand-edited |
| JSON-LD `@context` (no OWL) | **TRIAL** | S | Local | Interop veneer when/if an external RDF consumer appears |
| Kuzu (embedded graph, Cypher) | **DEFER** | M | Local | Upstream archived Oct 2025 (Vela fork live); adopt only if multi-hop traversal measurably slows in SQLite on a user-facing path |
| D2 diagrams | **DEFER** | S | Local | Better layout, but renders natively on neither GitHub nor Obsidian; second emitter for oversized views only |
| SHACL | **DEFER** | M | Local | Only if committed to RDF; JSON Schema covers validation today |
| Excalidraw | **TRIAL** (manual only) | S | Local | Human whiteboarding; never a source of truth |
| OWL/RDF + Protégé | **REJECT** | L | Either | Open-world reasoning we don't need; LLMs reason poorly over OWL standalone (2025 lit: wins come from KGs constraining generation, which typed SQLite + retrieval approximates); solo-operator maintenance sink |
| Neo4j on Azure VM | **REJECT** | L | Azure | A server to babysit for a graph that fits in-process; textbook premature infrastructure |
| DTDL v4 + Azure Digital Twins | **REJECT** | L | Azure | DTDL modeling IS separable from ADT (open-source DTDLParser, $0), but the metamodel (Interface/Telemetry/Command) is IoT-twin shaped; wrong fit on shape, not just cost. ADT not retired; GA, consumption-priced |

**Starting point:** `ontology/cortex-ontology.yaml` (entity types, relationship types, enums, cardinality) validated by `ontology/cortex-ontology.schema.json` (draft 2020-12); instances stay derived (notes -> sync -> SQLite); a check step asserts every type seen in SQLite is a member of the YAML T-Box; a small script emits Mermaid from the source as a build artifact.

**Named triggers:** Kuzu when multi-hop is measurably slow on a user-facing path. JSON-LD/SHACL when a named external RDF consumer exists. D2 when a load-bearing diagram exceeds Mermaid's legible layout. DTDL/ADT only if the career thread demands demonstrable ADT experience, in a sandbox, never on Cortex's critical path. OWL only if forced by an interop partner.

### 2b. Render/visualization layer addendum (2nd pasted proposal, 2026-06-06)

The second proposal (Graphviz/DOT, Langflow/Flowise, Neo4j Bloom/Linkurious) contains one genuinely new option and one valid unmet need.

| Option | Verdict | Cost | Rationale |
|---|---|---|---|
| Graphviz / DOT as a second generated emitter | **TRIAL** | S | Genuinely good for data-dense generated graphs: HTML-table nodes can show schemas/frontmatter/agent state inside nodes; agents generate DOT trivially; Obsidian renders via community plugin. BUT GitHub does not render DOT inline (unlike Mermaid), so DOT outputs are committed SVG artifacts. Same architecture rule as all renderers: emitter over the machine-readable source, never hand-edited |
| Neo4j Bloom / Linkurious | **REJECT** (form), need acknowledged | M-L | Bloom requires running Neo4j (already DEFER-local-only); Linkurious is commercial. The valid kernel: interactive exploration of the live graph |
| Interactive graph view as a Surfaces feature | **ADOPT** (when UI work starts) | S-M | The local-first form of the same need: JSON from the SQLite A-Box rendered with Cytoscape.js/vis-network in the planned agent-first UI. Obsidian's native graph view already covers wiki-link browsing meanwhile |
| Langflow / Flowise (re-raised) | unchanged: **REJECT / DEFER** | - | See §3: Langflow carries CVE-2025-3248 unauth RCE; Flowise is sketch-only. "Deep Azure integrations" does not survive contact with the verdicts in §3/§6 |

**The render ladder, consolidated:** machine-readable source (YAML T-Box + SQLite A-Box) -> emitters: Mermaid (GFM-native, GitHub + Obsidian), DOT->SVG (data-dense views), Cytoscape.js JSON (interactive, in the future UI), Excalidraw (human sketching only, never source).

## 3. Agent orchestration frameworks + protocols

**Headline: adopt zero new orchestration frameworks. Upgrade the existing pipeline in place.** Full report with sources: `exploration/research/orchestration.md`.

| Option | Verdict | Cost | Local models | Rationale |
|---|---|---|---|---|
| OpenClaw (incumbent runtime) | **ADOPT** | - | via workers | Gateway, cron, workspaces, Slack, dreaming already run; keep as scheduler/host |
| MCP (incumbent backbone) | **ADOPT** | - | yes | LF-governed standard, 10k+ servers; ava-docs already speaks it |
| Claude Agent SDK (the brain) | **ADOPT** | S | brain only | The same loop as Claude Code (subagents/MCP/hooks/skills) self-hosted in our process at standard token pricing; we already author for it |
| Local models as MCP tools / subprocess workers | **ADOPT** | S | the point | Triage/polish scripts agentified; premium tokens on judgment, local GPU on bulk |
| Thin custom sequencing glue (queue) | **ADOPT** | S | yes | The safe form of build-your-own |
| OpenAI Agents SDK | **TRIAL** | M | via LiteLLM | Only if SDK+MCP glue proves insufficient for a pure local-worker loop |
| n8n | **TRIAL** | M | Ollama node | Visual ops layer only; overlaps OpenClaw |
| LangGraph (+LangChain legacy) | **DEFER** | M | yes | v1.0, the real production leader; solves durable multi-agent state we don't have yet |
| Microsoft Agent Framework | **DEFER** | L | Ollama native | Preview till Q1 2026 GA; pick up deliberately as the Azure career bet, not the Cortex runtime |
| Anthropic Managed Agents | **DEFER** | M | brain only | $0.08/session-hr on top of tokens; the $20 burn was a long premium session, not a structural tax. Self-hosting the Agent SDK removes the session-hour charge entirely |
| A2A protocol | **DEFER** | M | n/a | Needs a second party; solo/local has no peer yet |
| AG-UI protocol | **DEFER** | S | n/a | The right answer for the agent-first UI; adopt when UI work starts |
| CrewAI | **DEFER** | M | yes | Nothing SDK subagents don't do for a solo operator |
| Flowise | **DEFER** | S | yes | Sketch-only; single process, no flow versioning |
| Semantic Kernel standalone | **REJECT** | - | yes | Maintenance mode; superseded by MAF |
| AutoGen standalone | **REJECT** | - | yes | Maintenance mode; folded into MAF |
| Langflow | **REJECT** | M | yes | CVE-2025-3248 unauth RCE; no version control; "not built to scale" |
| Custom generic agent-builder | **REJECT** | - | - | The literal 18-month killer. Thin glue yes; framework no |

**Load-bearing correction:** Claude Agent SDK subagents are *always Claude*: local models cannot be SDK subagents. The split is **Claude = brain/orchestrator; Ollama/vLLM = workers behind MCP tools or a job queue.** Scales onto the 3090s by swapping worker models.

**The loop this closes now:** triage + polish go from two Ollama CLI scripts to agents on the brain/worker split, on infra already running, zero new frameworks. The pipeline becomes agent-controlled brain curation this sprint.

**Named triggers:** LangGraph when an ingestion run needs durable checkpointed multi-agent state or HITL gates the queue can't express. MAF at GA as a career learning track. Managed Agents when per-session sandboxes/async concurrency exceed local hosting and $0.08/hr beats ops time. A2A at the first cross-trust-boundary agent. AG-UI when frontend work starts.

## 4. Local inference stack + GPU path

| Option | Verdict | Cost | Fit | Rationale |
|---|---|---|---|---|
| Ollama | **ADOPT** (incumbent) | S | CUDA mature, ROCm OK | 2026 scheduler does multi-GPU VRAM-pooling; the coexistence pain is a VRAM problem, not an Ollama problem |
| litellm (router) | **ADOPT** (today) | S | Local | One YAML: Claude as orchestrating brain + local workers + fallbacks + spend tracking. The one piece that closes a loop today regardless of GPU |
| vLLM | **TRIAL** (when GPUs land) | M | CUDA excellent, ROCm RDNA4 rough | Real concurrent serving (continuous batching, TP) for throughput-bound stages |
| llama.cpp / llama-server | **TRIAL** | S | Best portability | Escape hatch + bench tool; serves sequentially, so not the serving spine |
| Foundry Local | **REJECT** as substrate, WATCH for career | S | Linux x64 GA (May 2026) | Self-describes as not-a-server-stack; points at vLLM/Triton for concurrency. Career-thread demo artifact only |
| LM Studio | **DEFER** | S | Headless daemon real now | Convenience tier over llama.cpp; nothing it adds next to Ollama |
| SGLang | **DEFER** | M | ROCm = Instinct only | Revisit only if vLLM concurrency proves insufficient on CUDA |
| TensorRT-LLM | **REJECT** (for now) | L | NVIDIA-only | Compile-per-model, weeks of effort, solves a latency problem we don't have |

**GPU path: 2x RTX 3090 (CUDA), not 2x AMD R9700.** 48GB used (~$1.2-2K) vs 64GB new (~$2.6K). The R9700's extra 16GB buys a 2026 software-maturity problem: vLLM RDNA4 (gfx1201) FP8 not mainlined, documented tensor-parallel multi-process crashes on that exact card ("not recommended for production" from a tester on the same hardware). 48GB CUDA dissolves the VRAM serialization pain on day one: embedding service + triage model + polish model all resident, `OLLAMA_KEEP_ALIVE=1m` workaround deleted. ROCm fluency has career value: learn it later on one cheap card, never by betting Cortex's serving spine on it.

**Embeddings: stay on bge-base-en-v1.5 until retrieval misses are a measured, recurring failure.** Then bge-m3 (~0.5B, 1024d, unified dense+sparse+multi-vector, 8192-token context) over MTEB-leader Qwen3-Embedding-8B (a heavy resident on a GPU whose whole problem is coexistence). Re-embedding 680K chunks is an afternoon of compute; the real cost is the 768d->1024d reindex + retrieval re-validation.

**Today (3070, unchanged):** keep the loop as-is; add litellm as the routing front door. **When 3090s arrive:** everything resident, delete the KEEP_ALIVE hack, Ollama stays default worker host, vLLM trialed on throughput-bound stages with measured t/s comparison.

**Named triggers:** vLLM->ADOPT when a batch stage is measurably throughput-bound under Ollama. Re-embed when retrieval misses recur. R9700/ROCm reconsidered only if >48GB single-model residency is needed AND vLLM RDNA4 TP reaches mainline stability. TensorRT-LLM never before outgrowing vLLM. Foundry Local only as a career demo artifact.

## 5. Memory substrates + agent-memory frameworks

**Headline: build the policy, keep the substrate.** Every agent-memory framework (Letta/Mem0/Zep/cognee/LangMem) bundles its own opinionated curation product plus a substrate; adopting one means inheriting someone else's memory-curation product and bolting our agents onto it - the inverse of "agent-controlled brain built from project results." The frameworks are idea-mines for the policy layer, not adoption targets for the stack.

| Option | Verdict | Cost | Rationale |
|---|---|---|---|
| OpenClaw channel memory + dreaming (incumbent) | **ADOPT** | S | The machinery is starved, not missing; feed it, don't replace it |
| ChromaDB (incumbent) | **ADOPT** (hold) | S | Works at tiered scale; known ceiling ~1M vectors/collection (RAM-bound); don't migrate on principle |
| Event-sourced memory-op log (append-only JSONL) | **ADOPT** (build) | S | The new spine: audit trail of every agent memory operation; makes future store consolidation a replay, not a migration. Cheapest highest-leverage win |
| A-MEM zettelkasten pattern (NeurIPS 2025) | **ADOPT** (ideas) | S | New memory auto-generates note + tags + bidirectional links + updates neighbors' summaries: "agent curates memory" made concrete, maps onto the markdown mirror + wiki-links |
| SCM / SleepGate / FadeMem consolidation research (2026) | **ADOPT** (ideas) | S | Importance tagging at write time, three forgetting signals (Ebbinghaus decay + access frequency + LLM-judged importance), bounded working memory with deep-sleep flush: literally a spec for the starved Hippocampus layer |
| Graphiti bitemporal validity model | **ADOPT** (ideas) | S | Supersede facts with invalid-at-T instead of deleting; model as SQLite columns, no Neo4j |
| LanceDB (CE incumbent) | **TRIAL** | M | Disk-based (scales past RAM), versioned, already in-house; the convergence target for cold vectors IF consolidation is ever forced |
| sqlite-vec | **TRIAL** | S | Brute-force to ~1M vectors; unifies a hot/curated tier with FTS5 in ONE file, killing two-store sync for the working set |
| Mem0 | **DEFER** | M | Mine its add/update/contradiction heuristics; graph tier is $249/mo Pro |
| Zep + Graphiti stack | **DEFER** | M | Best LongMemEval score (63.8) via temporal KG; steal the bitemporal model, don't run Neo4j/FalkorDB |
| cognee | **DEFER** | M | ECL pipeline closest to "agent builds graph from results"; design reference, not another graph DB to operate |
| LazyGraphRAG | **DEFER** (watch) | S | Query-time pattern (~$0.50/500pp, 70-90% quality); OSS landing Q1-Q2 2026 - verify shipped before betting |
| Microsoft GraphRAG (full) | **REJECT** | L | LLM extraction over 680K chunks = thousands of $; incremental is append-only, no edit/removal: disqualifying for a living, curated memory |
| Letta / MemGPT | **REJECT** | L | Opinionated agent-OS + own Postgres store; surrenders the agent loop AND migrates substrate |
| LangMem | **REJECT** | M | LangGraph-coupled, 59.8s p95 recall; borrow its semantic/episodic/procedural taxonomy as vocabulary only |
| Qdrant / pgvector | **REJECT** | M | New servers for scale problems we don't have; violates local-first single-operator |

**One-store-or-many: MANY for now, with a named convergence path.** Forcing consolidation today is itself premature infra. The event-sourced log goes in immediately as the spine; if Chroma's RAM ceiling or two-store sync pain ever bites (empirical trigger, not aesthetic), converge on LanceDB (cold) + sqlite-vec (hot working set).

**The first loop to close (the whole point):** wire importance-scored memory writes -> feed the dreaming/consolidation phases -> emit the first non-empty Hippocampus reports. That single loop turns starved machinery into a working product and validates the design before any substrate decision.

**Consolidation design notes for the Hippocampus layer:** (1) importance tagging at write time routes to slow-decay vs fast-decay tiers; (2) eviction on the joint score of time decay + access frequency + judged importance; (3) zettelkasten linking with neighbor-summary updates; (4) bitemporal validity columns; (5) consolidation as the promotion lifecycle, mirroring exploration/ -> plans/ -> architecture/; (6) bounded active memory with deep-sleep flush.

**Named triggers:** LazyGraphRAG when OSS ships AND thematic cross-corpus queries become a felt need. Store consolidation when the ceiling or a sync incident is hit in practice. Mem0/cognee heuristic-mining if the curation policy stalls. Zep reconsidered only if temporal queries outgrow SQLite bitemporal columns.

## 6. Azure bridge + career alignment

**What Foundry is in 2026:** "Azure AI Foundry" is now Microsoft Foundry: portal + SDKs + model catalog + Agent Service + evaluations. Agent Service entry point is the **Responses API** with three tiers: prompt agents (config-only, pay-per-call), hosted agents (your code: Agent Framework, LangGraph, Anthropic Agent SDK, custom container), or calling the Responses API from your own process. **The portability layer is the Responses API + MCP interface, not any runtime**: Cortex's MCP servers plug in directly; the same Agent Framework code can call from local process today and containerize as a hosted agent later. Foundry also speaks A2A (preview). **Foundry Local: GA on Linux x64**, ONNX-based, OpenAI-compatible, $0, no subscription, but single-user on-device by its own docs (not a serving stack): the local leg of a hybrid demo, consistent with §4's verdict.

| Option | Verdict | Cost | Rationale |
|---|---|---|---|
| Foundry Local (Linux, dev/demo leg) | **ADOPT** | $0 | GA, OpenAI-compatible; the local half of the hybrid story |
| Foundry Responses API from the gateway | **TRIAL** | pay-per-call | One integration buys models + tools + portability with zero standing compute |
| Foundry evaluation/observability pass | **TRIAL** | per-eval tokens | Cheapest path to a portfolio-credible eval pipeline |
| Azure Digital Twins + DTDL | **REJECT** | metered | IoT spatial-twin tool; wrong shape (matches §2 verdict) |
| OWL/Neo4j on Azure VM | **REJECT** VM form | standing VM | Graph-RAG idea survives as local-Docker DEFER (§5); standing VM violates local-first |
| Langflow/Flowise via Azure Web Apps | **REJECT** cloud form | standing | Self-host in Docker locally for free if ever wanted |
| Lucidchart | **REJECT** | paid seat | draw.io/Mermaid/generated diagrams cover it at $0 |
| Azure AI Search | **DEFER** | ~$245/mo S1 | Local hybrid retrieval is fine at 680K chunks; trigger: >1M chunks or security-trimmed multi-tenant retrieval |
| Azure Cosmos DB | **DEFER** | free tier exists | Only if a cloud hosted agent needs durable concurrent thread state |
| Azure Container Apps | **DEFER** | scale-to-zero | Right home for the backend when it needs a public URL; idle cost $0 |
| Azure Arc | **REJECT** for now | per-resource | One GPU box gains nothing; trigger: 2+ inference nodes |

**Career leverage (TIME-SENSITIVE): AI-102 retires 2026-06-30.** Its successor **AI-103 (Azure AI App and Agent Developer Associate)** covers agentic AI, multi-agent orchestration, Foundry architectures: a near-exact match for what Cortex exercises. In beta now, GA expected June 2026. Skip AI-102; target AI-103; use Foundry learning paths (Agent Service, Foundry Local, evaluations) as study + build fuel simultaneously.

**Portfolio-credible Cortex, one integration, three artifacts, zero standing bill:** (1) Foundry project on pay-per-call; (2) one Cortex flow calling the Responses API from the gateway (write to the interface, not the platform); (3) one Foundry evaluation pass over that flow's outputs (trace + scores); (4) hybrid toggle: same OpenAI SDK pointed at Foundry Local (RTX 3070) vs Foundry cloud model. That demo IS Microsoft's local-inference vision told in our own voice, and maps 1:1 to AI-103 objectives.

**Named triggers:** AI Search at >1M chunks or multi-tenant needs. Cosmos when a cloud hosted agent ships. Container Apps when the backend needs a public URL. Arc at 2+ nodes. Graph-RAG locally (Docker Neo4j or embedded) only on a measured multi-hop retrieval failure.

---

## Decisions resolved by this research (2026-06-06)

| Decision | Resolution |
|---|---|
| Ontology file format | Typed YAML T-Box + JSON Schema validation over the SQLite A-Box; Mermaid/DOT/Cytoscape as generated render layers (§2, §2b) |
| Orchestration runtime for Layer 1 | Zero new frameworks: OpenClaw (runtime) + Claude Agent SDK (brain) + local models as MCP-tool/subprocess workers + thin queue glue (§3) |
| GPU purchase path | 2x used RTX 3090 (48GB CUDA), not R9700 (§4) |
| One-store-or-many | Many for now + event-sourced memory-op log as the spine; empirical convergence triggers to LanceDB + sqlite-vec (§5) |
| Minimal Azure touchpoint | One Foundry pay-per-call integration -> three portfolio artifacts (Responses API call, eval pass, Foundry Local hybrid toggle); target AI-103 cert (§6) |
| First loop to close | Importance-scored memory writes feeding the dreaming machinery -> first non-empty Hippocampus reports (§5); triage/polish agentified on the brain/worker split (§3) |
