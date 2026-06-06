Agent memory and context engineering are about turning a stateless LLM into something that behaves like a cognitive system with continuity, goals, and a sense of “self over time.” Multi-layer memory really is a requirement once you move past toy agents toward something brain-like or “from the future.”

Core definitions (high level, but precise)
Agent memory: All mechanisms that let an AI agent store, retrieve, and update information across steps and across sessions: short-term scratchpads, working state during a task, long-term knowledge, user-specific facts, and shared system state.

Context engineering: The deliberate design of what to fetch from memory, when, and how to inject it into the model’s context window so the LLM has exactly the right information at inference time.

Memory engineering (as infrastructure): Treating memory like a database layer for agents—schema, consistency, indexing, promotion/decay policies—rather than ad‑hoc “stick it in a vector store and hope retrieval works.”

One way to phrase it: the LLM is the processor, context engineering is the compiler + query planner, and agent memory is the hierarchical storage system that makes long-term behavior possible.

Multi-layer memory as an architectural pattern
Most serious agent designs converge on a layered memory stack, because different “kinds” of knowing have different lifecycles and access patterns.

Typical layers
Ephemeral / short-term context

The messages and scratch notes in the current context window.

Volatile, high-bandwidth, ultra low-latency, erased when the task ends (like a call stack).

Working memory

Structured, task-scoped state: plan steps, intermediate results, partial world models.

Lives longer than the context window for a single turn, but is discarded when the job/episode finishes unless explicitly promoted.

Personal / agent long-term memory

Persistent vector/graph stores, key–value stores, or SQL/NoSQL databases with facts, learned preferences, and durable knowledge.

Has promotion and decay: important experiences/facts are summarized and stored; noisy logs are forgotten or compacted.

Shared / global memory (multi-agent systems)

A “source of truth” used by multiple agents: state of the environment, shared knowledge, coordination logs, locks, etc.

Needs stronger consistency and concurrency control, like a database, not just a vector store.

Meta-memory (about memory itself)

Policies and models that decide what to remember, how to index and summarize it, and when to retrieve it.

For example, a summarizer that periodically condenses interaction logs, or a scheduler that chooses between “semantic” vs “episodic” retrieval.

These layers closely mirror layered hardware memory (L1/L2 cache, DRAM, HBM, disk) and layered cognitive memory (short-term, working, long-term, semantic, episodic).

Why layering is basically required
Different latency vs capacity tradeoffs: fast but narrow (context window) vs slow but huge (databases, logs).

Different consistency needs: a per-agent scratchpad can be eventually consistent; shared memory must not corrupt or lose global truth.

Different semantics: a plan in working memory is not the same as an evergreen skill definition; mixing them in one blob leads to retrieval noise and “forgetting by pollution.”

In other words, if you don’t separate memory types, you either over-persist junk or under-persist valuable structure, and the agent feels “dumb and forgetful.”

Brain analogies: mapping cognitive systems to agent stacks
Memory systems diagram 
Neuroscience doesn’t agree on a single neat model, but some parallels are useful as design metaphors.

Sensory buffers ↔ perception cache

Very short-lived sensory traces in early cortical areas; in agents, this is like recent observations or raw tool outputs kept briefly for immediate use.

Working memory (prefrontal–parietal) ↔ task working set

The brain keeps task-relevant items “online” using active neural firing; in agents, a working memory store and the active context window keep the current plan, constraints, and local variables alive.

Hippocampus / episodic memory ↔ episodic interaction logs

The hippocampus rapidly encodes experiences and later replays them for consolidation, especially during sleep.

Agents analog: log streams of episodes, then offline summarizers compress them into durable “episodes” or knowledge chunks stored in vector/graph databases.

Neocortex / semantic memory ↔ distilled knowledge base

Over time, the cortex encodes stable, abstract knowledge that doesn’t depend on a particular episode.

Agents analog: curated, schema’d knowledge (documents, graphs, structured tables) that outlives any single conversation.

Predictive brain / proactive memory

The brain constantly uses memory to generate predictions; perception is framed as prediction error minimization.

Agents analog: planning loops where the LLM imagines future states, evaluates them, and stores “policy” updates or refined heuristics in memory for next time.

Glia and astrocytes / extended memory fabric

Recent work suggests astrocytes form a distributed associative memory substrate that enhances capacity and pattern completion beyond neuron-only models.

This is analogous to having an extra, slower-but-massive memory lattice—dense associative memories, big vector stores, or graph memories—that the agent taps for pattern completion beyond its parameter weights.

These mappings are imperfect but useful: they push you toward architectures where prediction, retrieval, summarization, and consolidation are first-class processes, not afterthoughts.

This kind of diagrammed separation of short-term, working, and long-term memory in the brain maps well to layered agent memory designs.

“From the future” functional memory systems (what they look like)
Context Engineering Diagram 
The more futuristic systems people are building now have some common traits:

Layered memory systems with explicit promotion/decay

They implement policies like: “after a task, summarize the episode; embed it; store in episodic DB; periodically distill frequently used chunks into a semantic knowledge layer.”

They monitor usage statistics (recall frequency, recency, downstream impact) to adapt what is kept vs forgotten, like adaptive cache replacement or synaptic pruning.

Graph + vector + symbolic hybrids

Raw text chunks in a vector store are not enough; advanced systems combine:

Vector stores for fuzzy semantic similarity

Knowledge graphs for structured relationships

Symbolic stores (SQL, key–value) for exact facts, counters, and constraints

Context-aware retrieval and routing

Instead of “retrieve top‑k similar chunks,” they ask:

What type of memory is needed (episodic, semantic, global state, user preferences)?

At what granularity (full doc, paragraph, triple, function spec)?

With what constraints (freshness, authority, safety)?

Memory as shared infrastructure in multi-agent systems

Multi-agent setups use a coordination + memory layer that functions like a transactional database: agents publish and subscribe to state; memory guarantees ordering/atomicity rather than each agent keeping its own fragile local history.

Closed-loop learning from memory

Logs and episodic memories feed evaluation systems that rewrite prompts, update tools, or refine retrieval schemas.

This is akin to the brain’s offline consolidation and synaptic changes after experience.

This kind of context-engineering diagram—short-term memory, long-term memory, retrieval, and tools around an LLM—is a good visual approximation of the emerging pattern.

Design implications if you’re building this
Given your background, you can think of an “agent memory OS” with layers like:

Layer	Human brain rough analog	Tech example
Context window	Conscious focus	LLM messages, scratchpad
Working memory store	Prefrontal working memory	Redis/doc store with task state
Episodic memory database	Hippocampus episodes	Vector DB of interaction summaries
Semantic knowledge base	Cortical semantic memory	Graph/SQL/NoSQL curated knowledge
Shared global state	Social/world models	Transactional DB for multi-agent truth
Meta-memory/policies	Metacognition, attention	Schedulers, retrievers, summarization agents
Each has its own API, schema, and retention policy, and your context engineering layer orchestrates queries across them to assemble the “mental workspace” the LLM sees each step.

What you are calling “dreaming” is usually the missing layer between raw interaction history and actual long-term behavioral improvement: not just storing more memory, but running an offline consolidation loop that converts noisy episodes into durable, retrievable, policy-shaping knowledge. In practice, the hard part is not memory capture but building a closed loop where experience produces scored candidates, candidates get consolidated, and consolidated outputs change future retrieval, prompts, routing, or planning behavior.

Dreaming defined
OpenClaw’s definition is a good concrete anchor: dreaming is a background memory-consolidation system with three phases—Light, Deep, and REM—where Light stages recent material, Deep promotes durable items into long-term memory, and REM extracts themes and reflections without directly writing long-term memory. That is a strong operational definition because it separates ingestion, promotion, and reflection instead of treating “memory” as a single write path.

A useful general definition is: dreaming = offline replay + consolidation + abstraction + prospective synthesis. The minimal version is replay and scoring; the more advanced version includes reflective pattern extraction and “what might matter tomorrow?” style synthetic rehearsal, which is why it feels like the missing piece in continual learning loops.

Process model
A solid dreaming pipeline usually looks like this:

1. Ingest episodes: collect daily notes, session transcripts, tool traces, recalls, failures, and user corrections into a short-term evidence store rather than immediately promoting them.

2. Normalize and dedupe: cluster similar observations, strip noise, and resolve whether a memory is factual, procedural, preference-based, or just transient context.

3. Score durability: rank candidates with signals like recurrence, retrieval usefulness, query diversity, recency, task impact, and conceptual richness.

4. Reflect and abstract: derive higher-level patterns, “lessons,” reusable heuristics, and failure signatures from multiple episodes rather than from a single event.

5. Promote selectively: write only high-confidence durable facts, preferences, or policies into persistent memory; keep reflections separate from hard memory unless they are grounded enough to survive verification.

6. Feed forward: make those promotions affect future runs through retrieval, policy files, routing rules, evaluation checks, or system/preamble context.

That last step is the one many systems miss: dreaming is not complete unless tomorrow’s agent behaves differently because of last night’s consolidation.

What dreaming is not
Dreaming is not “ask the model to summarize chat history.” Summaries compress text, but dreaming should also classify memory type, estimate durability, attach provenance, and decide whether something should change behavior, not just be stored.

It is also not full continual learning in the weight-update sense. In most production agent systems, “continual learning” is better achieved first through external memory, replay, ranking, retrieval shaping, prompt evolution, and evaluation loops, because these are auditable and reversible in ways online weight updates usually are not.

Layers on top of the LLM
For Claude Code or similar systems, the biggest hidden variable is usually not one secret magic prompt but the stacking order of context layers and the rules that decide which layers are present in a given turn. A useful decomposition is:

Layer	Purpose	Common failure mode
System prompt	Role, safety, defaults, tool behavior, planning style.
Too broad, too long, or contradictory, which causes literal misfires or excess reasoning.
Harness policy / orchestration	When to call tools, when to summarize, when to compact, when to spawn subagents.
Implicit logic not visible in prompts, so behavior feels mysterious.
Persistent memory	Durable facts, preferences, long-lived decisions.
Polluted with transient details.
Working memory	Current plan, active hypotheses, todos, intermediate state.
Lost between windows or mixed with long-term memory.
Retrieved context	Task-relevant snippets, docs, code, prior episodes.
Top-k semantic retrieval brings in plausible but wrong context.
User turn	Immediate task and constraints.
Underspecified intent creates thrash.
Tool outputs	Ground truth from filesystem, tests, APIs, search.
Not post-processed, so raw outputs dominate context.
The important insight is that many “LLM failures” are actually context composition failures. If your system has weak dreaming, weak orchestration, or no distinction between working memory and durable memory, the model will look inconsistent even if the base model is strong.

Practical dreaming design
If you want to engineer this into your system, treat dreaming as a separate service with explicit artifacts, not as an extra prompt appended to the main loop. The three outputs I would keep are:

Evidence store: raw grounded snippets with provenance, timestamps, source type, retrieval hits, and usage counts.

Candidate memory objects: normalized items with type (fact, preference, procedure, anti-pattern, open-question), confidence, recurrence, and promotion status.

Reflections / dream diary: higher-order summaries and hypotheses that are readable and useful for debugging but do not automatically become truth.

A good rule is: facts promote only when grounded; reflections can shape future search or planning, but they should not silently become durable truth without evidence. That separation is one of the strongest ideas in the OpenClaw design.

Closed-loop learning
For CLL, the missing bridge is usually this chain:

Experience creates signals.

Signals create candidate memories.

Candidate memories create retrieval priors and policy updates.

Policy updates change future behavior.

Future behavior is measured by evals.

Evals influence next dreaming pass and orchestration policy.

If you stop at “store memory,” you have recall but not learning. If you stop at “reflect,” you have insight but not control. Learning happens when dream outputs change prompts, routing, ranking, test plans, tool selection, or self-check criteria in the next session.

A very practical implementation is to let dreaming write to four different destinations, not one:

MEMORY.md or durable store for stable truths.

PLAYBOOK.md for distilled procedural heuristics.

WATCHOUTS.md for recurring failure modes and anti-patterns.

WORKING_STATE.json for current multi-window continuity, not long-term identity.

That split often works better than one giant memory file because it separates what is true, how to act, what to avoid, and what is currently in progress.

Unknown variables to account for
A few discrete variables commonly go untracked and make systems feel worse than they are:

Memory type confusion: facts, preferences, hypotheses, and procedures stored together.

No provenance field: later retrieval cannot tell whether a memory came from user statement, tool output, inference, or reflection.

No negative memory: systems remember what worked but not failure signatures, dead ends, or bad retrieval patterns.

No retrieval evaluation: you store memories but never measure whether retrieved memories improved outcomes.

Context pollution: too much low-value recalled material crowds out the task working set.

No compaction policy: working memory becomes a junk drawer instead of a structured handoff between windows.

No promotion rollback: wrong memories get written and then quietly persist.

No distinction between reflection and truth: speculative dream output leaks into durable memory.

If I were reducing this to one sentence: your system probably does not need “more memory”; it needs a memory lifecycle.

Recommended mental model
Use this as your implementation-level definition:

Dreaming is a scheduled offline process that replays grounded short-term evidence, clusters and scores recurring patterns, generates human-readable reflections, selectively promotes durable facts/procedures into persistent memory, and emits policy updates that alter future retrieval and orchestration.

That definition is narrow enough to engineer and broad enough to cover the missing loop you are describing.

What you already have
You already have the right primitives for a serious continuity runtime:

Lifecycle hooks on session start/stop and commits, so every coding session naturally becomes a continuity event rather than an ad‑hoc conversation.

A session export pattern (per‑session markdown / YAML, plus archived sessions) that gives you immutable evidence and clean episode boundaries instead of undifferentiated logs.

A layered .context/ runtime with:

CLAUDE.md as a small, always-loaded kernel

state.yaml for current snapshot

knowledge.db for durable, typed memory (with rationale)

session/current.yaml for working memory

archive/, evolve.sh, and a dreaming area that already separates offline synthesis from immediate truth.

A clear doctrine that continuity must remain bounded, token‑disciplined, and subordinate to actual work, so the system doesn’t metastasize into the project.

In other words, you don’t have a “missing memory system”; you have a solid memory substrate whose main gap is conversion efficiency (how much session activity turns into durable knowledge, priors, and behavior change).

Best architecture move
Given that substrate, the best move is not to cram more logic into live sessions. The best move is to treat dreaming and consolidation as a separate process that runs around sessions, not inside them.

Concretely:

Keep SessionStart light:

Load identity, state.yaml, a tiny handoff from the last session (task, stopping point), and a very small set of dream‑generated priors/watchouts.

Avoid auto-injecting big histories or large swaths of knowledge.db.

Let the main session stay focused on:

Doing work.

Updating session/current.yaml with discoveries, errors, staged candidates.

Calling query.sh only when needed, keeping retrieval bounded.

On SessionStop:

Always capture the session record (markdown/YAML).

Run a small promotion step that turns explicit promote_to_knowledge entries into candidate rows.

Archive the session file and recreate a neutral current.yaml for the next boot.

Run dreaming out-of-band (timer or explicit command):

Read archived sessions and access logs.

Generate priors, watchouts, and review queues.

Write only into dreaming outputs and small feed-forward artifacts, not directly into durable truth (at least in MVP).

Architecturally, that means: sessions stay small and sharp; dreaming and evolution handle heaviness off the hot path. CE remains a continuity OS, not a giant prompt.

File‑level model
At the filesystem level, the simplest, strongest pattern is to keep each “kind” of continuity artifact in a typed, obvious place:

CLAUDE.md

Kernel: always-loaded rules and minimal identity.

.context/state.yaml

“What’s true right now?” snapshot: current goal, stack, constraints, token budgets.

.context/knowledge.db

Durable memory with categories like decision, lesson, pattern, etc., plus rationale, confidence, provenance, and supersession.

.context/session/current.yaml

Live working memory for the active session: task, plan, discoveries, errors, and promote_to_knowledge candidates.

.context/session/archive/

Immutable past session records, not used as preload but as evidence for dreaming and manual inspection.

.context/dreaming/ and dreams.db

Dream outputs: light/deep/REM reports, review-queue.yaml, priors.json, watchouts.md, plus any internal state needed by the dreaming engine.

.context/archive/

Long-term archive for superseded plans, prompts, skills, and legacy docs; recoverable but outside the cold-start path.

The core idea: state, session, durable knowledge, archive, and dreaming are separate directories with clear responsibilities. That keeps lookups and promotion policies simple and auditable.

Dreaming loop
The dreaming loop you want (and mostly already sketched) can be thought of as a scheduled pipeline:

Ingest

Take new or recently modified artifacts: archived sessions, knowledge access logs, maybe failed promotions.

Treat them as raw evidence: episodes, not truths.

Normalize

Slice sessions into structured events: goals, attempts, errors, decisions, outcomes.

Attach metadata (timestamps, files touched, session type, project area).

Score

Rank candidate items using:

Recurrence across sessions

Task impact (did it resolve a blocker?)

Retrieval gravity (how often similar things were queried)

Stability (is it likely to remain true beyond today?)

Abstract

Generate candidate objects such as:

decision: “we chose X over Y because Z”

lesson: “when doing A, always remember B”

pattern: “this type of bug tends to appear when…”

watchout: “avoid approach P; it led to failure Q”

handoff: “next time, resume at R with context S”

higher-level reflections: themes, hypotheses, open questions

Promote (carefully)

For MVP, do not directly write into knowledge.db from dreaming.

Instead:

Emit structured candidates into review-queue.yaml

Maybe pre-fill promote_to_knowledge in a future session’s current.yaml

Leave final promotion to explicit promotion paths (promote.sh or human approval)

Feed forward

Produce small, high-value artifacts that SessionStart can safely load:

priors.json: “likely relevant lessons/decisions for this project area”

watchouts.md: 3–5 current failure modes or anti-patterns to keep in mind

Possibly a single short “dream summary” of what changed in the continuity landscape since last time