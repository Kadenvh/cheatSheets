# Cortex Orchestration Framework Research — Verdict

**Date:** 2026-06-06 | **Discriminator:** "Does adopting this close a loop the operator can't close *today* with OpenClaw + Claude Agent SDK patterns + MCP + Ollama?" If no → DEFER/REJECT.

## Options Evaluated

| Option | Verdict | Integ. cost | Local-model support | One-line rationale |
|--------|---------|-------------|---------------------|--------------------|
| **OpenClaw (incumbent)** | ADOPT (keep) | — | via tools/workers | Already closes loops: gateway, cron, 9 workspaces, dreaming/sleep memory. Keep as runtime substrate. |
| **MCP (incumbent)** | ADOPT (keep) | — | yes (tools) | LF-governed standard, 10k+ servers, you already run ava-docs. The integration backbone. |
| **Claude Agent SDK** | ADOPT | S | brain only (Claude) | Same harness you already drive in Claude Code; runs loop *in your process*, std API token pricing, subagents/MCP/hooks/skills. The premium brain. |
| **Plain custom orchestrator (glue)** | ADOPT | S | yes (any) | Thin Node/Python queue over SDK+MCP+OpenClaw = what you nearly have. Endorsed as *sequencing glue*. |
| **Local models as MCP tools / subprocess workers** | ADOPT | S | yes (the point) | Ollama/vLLM behind MCP or as subprocess = your triage/polish scripts agentified. The "workers" half. |
| **OpenAI Agents SDK** | TRIAL | M | yes (LiteLLM, beta) | Cleanest framework for a pure local-worker loop; only if SDK+MCP glue proves insufficient. |
| **n8n** | TRIAL | M | yes (Ollama node) | Self-host cron/Slack/webhook glue + AI Agent node. Overlaps OpenClaw; trial only if you want a visual ops layer. |
| **LangGraph + LangChain** | DEFER | M | yes | v1.0, genuine production leader — but solves multi-agent state you don't have *yet*; adopting now = premature infra. |
| **CrewAI** | DEFER | M | yes | Role-crew prototyping toy→prod; nothing it does that SDK subagents don't for a solo operator. |
| **Microsoft Agent Framework** | DEFER | L | yes (Ollama native) | Preview till Q1'26 GA, Foundry-tilted, new framework. Real value is the *career* thread (see triggers), not the pipeline. |
| **Semantic Kernel (standalone)** | REJECT | — | yes | Maintenance mode; superseded by MAF. Do not start here. |
| **AutoGen (standalone)** | REJECT | — | yes | Maintenance mode; folded into MAF. Do not start here. |
| **Langflow** | REJECT | M | yes | CVE-2025-3248 unauth RCE; 4GB+ RAM, no version control, "not built to scale." Prototype canvas only. |
| **Flowise** | DEFER | S | yes (Ollama) | $5 VPS, single-process — fine to *sketch* a flow, but no versioning, hard-to-debug at scale. Not a prod path. |
| **Anthropic Managed Agents** | DEFER | M | brain only (Claude) | Hosted REST + $0.08/session-hr on top of tokens. Justified only when you need sandboxes/async at scale you can't run locally. |
| **A2A protocol** | DEFER | M | n/a | LF, 150+ orgs, native on Azure/Bedrock/Google — but needs a *second party*. Solo/local = no peer to talk to yet. |
| **AG-UI protocol** | DEFER | S | n/a | The right answer for the agent-first UI — but the UI is only *planned*. Adopt when UI work starts. |

## The Pasted Proposal: right and wrong

**Right:** the instinct toward visual + a managed framework, and the build-your-own pull.
**Wrong on specifics:**
- **Langflow/Flowise are prototyping toys, not production paths.** Langflow carries an unauth RCE (CVE-2025-3248), needs 4GB+ RAM, no version control; Flowise is a single Node process with no flow versioning that buckles at scale. Either is fine to *sketch* a pipeline; neither should *run* Cortex. Both also re-introduce a GUI layer you don't want in an agent-first, code-driven system.
- **LangChain as a foundation is dated framing.** In 2026 the live artifact is **LangGraph** (v1.0, the runtime for all LangChain agents). Plain LangChain chains are legacy.
- **Semantic Kernel is the wrong name now.** SK + AutoGen are both in **maintenance mode**; their successor is the **Microsoft Agent Framework**. Building on SK today means building on a frozen base.
- **Managed Agents cost is real but knowable:** std token rates + **$0.08/session-hour** runtime + $10/1k web searches. The $20 burn was almost certainly a long-running session on a premium model, not a structural tax. Self-hosting the **Agent SDK** removes the session-hour charge entirely — you pay only tokens.

## Options Not Previously Considered

- **Claude Agent SDK as the orchestrator itself** (not just a model API). It runs the *same loop you use in Claude Code* — subagents, MCP servers, hooks, skills, sessions — inside your own process, on standard token pricing. This is the lowest-friction "premium brain" because you already author for it (`.claude/`, CLAUDE.md, skills).
- **LangGraph** — the actual production leader the proposal gestured at via "LangChain." Worth knowing as the *named trigger* destination if you ever outgrow SDK subagents.
- **AG-UI** — the agent↔frontend protocol (CopilotKit-origin, SSE-based, MAF-supported) that your planned agent-first UI should speak, so the UI stays decoupled from any one runtime.
- **A2A** — relevant the day Cortex exposes/consumes agents across a trust boundary (e.g., the Azure-Foundry career thread).

## Recommended Starting Point

**Adopt zero new orchestration frameworks. Upgrade the existing 6-stage pipeline in place.**

1. **Runtime = OpenClaw (incumbent).** It already gives the gateway, cron, workspaces, Slack channels, and dreaming/sleep-phase memory. Keep it as the scheduler/host. What it *lacks* (vs. a purpose-built brain): a first-class premium-model agent loop with hooks/subagents/skills — that gap is exactly what the Agent SDK fills, not replaces.
2. **Brain = Claude Agent SDK**, self-hosted (loop in your process, std token pricing). It orchestrates the Layer-1 ingestion agents: promote the **triage** and **polish** stages from Ollama CLI scripts into agents the SDK brain drives.
3. **Workers = local models, invoked as MCP tools or subprocess jobs — NOT as SDK subagents.** Important: SDK subagents are *always Claude*, and Bedrock/Vertex/Foundry auth still routes to *Claude*. The split is: **Claude = brain/orchestrator; Ollama/vLLM = cheap workers behind MCP tools or a job queue** (triage/polish/embed). That keeps premium tokens on judgment, local GPU on bulk — the budget shape you want, and it scales straight onto 2×3090/R9700 by swapping the worker model.
4. **Glue = thin custom sequencing** (Node/Python queue) over SDK + MCP + OpenClaw. This *is* the build-your-own you're drawn to, in its safe sense. **Building a generic agent-*framework*/agent-builder is REJECT — that is the literal 18-month killer.**
5. **Agent-first UI talks AG-UI (SSE) to a thin backend that wraps the SDK loop.** Backend stays decoupled from the hub, runtime swappable. Build this only when UI work actually starts.

**Loop this closes NOW:** triage + polish become real agents on the brain/worker split, on infra you already run, with no new framework to learn. Pipeline goes from "two Ollama scripts" to "agent-controlled brain curation" — the Cortex thesis — this sprint.

## Named Triggers for Deferred Items

- **LangGraph:** adopt when a single ingestion run needs durable multi-agent state / conditional branching that SDK subagents + a job queue can't express cleanly (checkpointing across a long crawl, HITL approval gates).
- **Microsoft Agent Framework:** pick up deliberately as the **Azure-Foundry career bet** at GA (Q1 2026) / Process Framework GA (Q2 2026) — a learning track, *not* the Cortex pipeline runtime.
- **Anthropic Managed Agents:** when you need per-session sandboxes or long-running async sessions at a concurrency you can't host locally — and the $0.08/session-hr is cheaper than the ops time to self-host.
- **A2A:** when Cortex must expose or consume an agent across a trust boundary (cross-vendor / cross-org / Foundry interop).
- **AG-UI:** when the agent-first frontend leaves the planning stage.
- **n8n / OpenAI Agents SDK:** if SDK+MCP+OpenClaw glue proves insufficient — n8n for a visual ops/cron layer, OpenAI Agents SDK if you want a framework-grade pure-local-worker loop.
- **Custom agent-builder:** never (REJECT). Revisit only if a *product* need (selling the builder) appears, not an internal one.
