# Learning Memory Architecture v0.1

**Author:** Kaden VanHoecke (VHTech LLC)  
**Version:** 0.1  
**Date:** April 23, 2026  
**Status:** First full draft / working specification  
**Depends on:** `cognitive_architecture_spec.md` as cognitive-context document, not as storage specification [file:2]

---

## 1. Purpose

This document defines the memory architecture for the **actual learning contents** of the learning system: what is being learned, where it is stored, how it is transformed, how it is retrieved, how it evolves, and how it remains durable across sessions and tools. It is the database and memory-system specification that sits beneath the broader cognitive-learning philosophy described in `cognitive_architecture_spec.md`.[file:2]

The central distinction is:

- `cognitive_architecture_spec.md` explains **how the learner thinks and should learn**.[file:2]
- `Learning Memory Architecture v0.1.md` explains **how the learning corpus itself is stored, indexed, linked, reviewed, and surfaced**.

This architecture is meant to solve a concrete problem: a high-volume, cross-domain autodidact learning system cannot rely on scattered notes, raw chat history, or ad hoc markdown files without eventually losing traceability, retrieval precision, and continuity. The system needs a durable substrate with explicit entities, clear source-of-truth rules, and multiple retrieval paths.

---

## 2. Problem Statement

The current state is structurally insufficient for long-term learning continuity.[file:2]

The existing meta-spec already identifies several constraints that matter here:

- The learner thinks in **graphs and topologies**, not in narrative notebooks.[file:2]
- The pattern log is useful as an **index pointer**, but it is not the full knowledge store.[file:2]
- A future **personal DAL equivalent** is explicitly required for persistent knowledge.[file:2]
- Cross-domain transfer, fast retrieval, and continuity across sessions are central design goals.[file:2]

Those constraints imply that the learning system cannot be “just notes.” It must support at least six distinct memory behaviors:

1. **Capture** raw learning material without friction.
2. **Extract** structured units from that material.
3. **Normalize** repeated concepts into canonical entities.
4. **Relate** concepts structurally across domains.
5. **Retrieve** by exact match, semantic similarity, graph neighborhood, and review state.
6. **Promote** important material from transient capture into durable knowledge.

The architecture defined below is designed to satisfy those six behaviors while preserving low-friction intake.

---

## 3. Design Principles

This memory system should be governed by the following principles.

### 3.1 Separation of role

Different kinds of knowledge should not be forced into the same storage format.

- Raw source material is not the same thing as a concept.
- A concept is not the same thing as a note.
- A note is not the same thing as a pattern.
- A pattern is not the same thing as a reviewable memory item.
- A session log is not the same thing as durable knowledge.

The architecture must preserve these distinctions explicitly.

### 3.2 Append-first, structure-later

Capture must remain low-friction. Intake should accept messy raw material first, then progressively structure it. This preserves speed while preventing permanent chaos.

### 3.3 Canonical entities, plural views

Each concept should ideally have **one canonical record**, but many representations:

- source-linked excerpts
- personal notes
- pattern links
- review prompts
- related projects
- graph edges

One thing can appear in many views, but it should not silently fork into many contradictory versions.

### 3.4 Durable over decorative

The system is being designed as infrastructure, not as a pretty note-taking layer. Every field, table, and process should justify itself in retrieval, learning, or continuity terms.

### 3.5 Retrieval must be multimodal

Knowledge should be retrievable through at least five paths:

- exact lookup
- full-text search
- semantic similarity
- graph traversal / related concepts
- review-state resurfacing

### 3.6 Promotion over accumulation

The system should not merely collect information. It should move information through states of increasing value:

**captured -> extracted -> linked -> understood -> reviewable -> reusable -> patterned**

---

## 4. System Scope

This architecture covers the memory system for learning contents across engineering, robotics, ML, cognition, architecture, and adjacent domains.

It is responsible for storing and relating:

- books, papers, articles, videos, transcripts, chats, docs, specs, code references, experiments
- extracted ideas, claims, mechanisms, procedures, definitions, examples
- personal notes and interpretations
- project-linked learning artifacts
- patterns and cross-domain mappings
- review prompts and spaced-resurfacing state
- session context and provenance

It is **not** intended to replace source repositories like GitHub, raw filesystems, or chat platforms. Instead, it acts as the **knowledge substrate** that indexes, distills, and connects those materials.

---

## 5. Top-Level Architecture

The learning memory system is a layered architecture with clear role separation.

| Layer | Purpose | Canonical Contents |
|---|---|---|
| Capture Layer | Low-friction intake of raw material | Raw sources, transcripts, URLs, imported docs, session dumps |
| Extraction Layer | Conversion of raw material into structured units | Excerpts, claims, definitions, procedures, observations |
| Knowledge Layer | Canonical durable knowledge store | Concepts, notes, patterns, relationships |
| Review Layer | Resurfacing and reinforcement | Cards, prompts, review events, recall scores |
| Retrieval Layer | Access paths into the whole system | FTS indexes, embeddings, graph edges, filters |
| Context Layer | Session continuity and activation | Active topics, session queues, current projects, recency state |

The key point is that **durable knowledge is only one layer**. The system must preserve raw provenance beneath it and review machinery above it.

---

## 6. Core Entity Model

The system should be modeled around explicit first-class entities.

### 6.1 Source

A **Source** is any external or internal artifact from which learning material enters the system.

Examples:

- PDF
- webpage
- YouTube video / transcript
- book chapter
- GitHub repo or specific file
- personal chat transcript
- experiment log
- architecture doc

Core fields:

- `source_id`
- `source_type`
- `title`
- `author_or_origin`
- `uri_or_path`
- `imported_at`
- `created_at`
- `published_at` (nullable)
- `hash`
- `language`
- `domain_tags`
- `trust_level`
- `source_status` (`raw`, `processed`, `archived`, `superseded`)

### 6.2 Source Segment

A **Source Segment** is an addressable chunk of a source.

Examples:

- paragraph in a PDF
- timestamped chunk of a transcript
- section of a spec
- function block in code
- page/heading range in a document

This exists because durable extraction must be traceable to a precise region of a source.

Core fields:

- `segment_id`
- `source_id`
- `locator` (page, timestamp, heading path, line range, etc.)
- `raw_text`
- `normalized_text`
- `embedding_ref`
- `checksum`

### 6.3 Extraction

An **Extraction** is a structured unit pulled from one or more source segments.

Extraction types:

- definition
- mechanism
- claim
- example
- procedure
- observation
- question
- unresolved ambiguity
- quote-worth-saving

Core fields:

- `extraction_id`
- `source_segment_id` or junction table for many-to-many
- `extraction_type`
- `text`
- `confidence`
- `extracted_at`
- `extracted_by` (`manual`, `agent`, `hybrid`)
- `needs_review`
- `canonical_concept_id` (nullable until mapped)

### 6.4 Concept

A **Concept** is the canonical durable unit of learning knowledge.

Examples:

- PID control
- retrieval-augmented generation
- reward shaping
- graph traversal
- motor cortex analogy
- hub-and-spoke topology

Concepts should be stable, deduplicated, and version-aware.

Core fields:

- `concept_id`
- `name`
- `slug`
- `canonical_definition`
- `status` (`seed`, `active`, `stable`, `deprecated`)
- `domain_primary`
- `domain_secondary`
- `abstraction_level`
- `difficulty_level`
- `created_at`
- `updated_at`
- `last_reviewed_at`
- `importance_score`
- `clarity_score`
- `reuse_score`

### 6.5 Concept Alias

A **Concept Alias** resolves naming collisions and alternate terminology.

Examples:

- “vector recall” -> “semantic retrieval”
- “hub and spoke” <-> “centralized sync topology”

Core fields:

- `alias_id`
- `concept_id`
- `alias_text`
- `alias_type` (`synonym`, `shorthand`, `legacy_term`, `project-specific`)

### 6.6 Note

A **Note** is the learner’s authored interpretation layer attached to a concept, source, or pattern.

Unlike a concept, a note is allowed to be partial, directional, and personal.

Core fields:

- `note_id`
- `note_type` (`source_note`, `concept_note`, `session_note`, `pattern_note`, `project_note`)
- `body`
- `summary`
- `author_mode` (`manual`, `agent-assisted`)
- `linked_concept_id` (nullable)
- `linked_pattern_id` (nullable)
- `linked_source_id` (nullable)
- `created_at`
- `updated_at`
- `confidence`

### 6.7 Pattern

A **Pattern** is a named structural invariant spanning multiple instances or domains, exactly as emphasized in the cognitive spec.[file:2]

Patterns are not ordinary concepts. They are higher-order abstractions built from repeated cross-instance recognition.

Core fields:

- `pattern_id`
- `name`
- `statement`
- `boundary_conditions`
- `failure_modes`
- `status` (`candidate`, `named`, `validated`, `retired`)
- `cross_domain_count`
- `first_seen_at`
- `last_seen_at`
- `confidence`

### 6.8 Evidence Link

An **Evidence Link** ties a concept or pattern back to source-grounded evidence.

Core fields:

- `evidence_link_id`
- `target_type` (`concept`, `pattern`, `note`, `claim`)
- `target_id`
- `source_segment_id`
- `support_type` (`direct`, `partial`, `counterexample`, `analogy`)
- `strength`

### 6.9 Relationship Edge

A **Relationship Edge** captures graph structure between concepts, patterns, projects, and notes.

Allowed edge types include:

- `is_a`
- `part_of`
- `similar_to`
- `contrasts_with`
- `prerequisite_for`
- `used_by`
- `instantiates`
- `analogous_to`
- `causes`
- `depends_on`
- `improves`
- `breaks_when`

Core fields:

- `edge_id`
- `from_type`
- `from_id`
- `edge_type`
- `to_type`
- `to_id`
- `weight`
- `created_at`
- `created_by`
- `verified`

### 6.10 Review Item

A **Review Item** is a resurfacing unit derived from durable knowledge.

Examples:

- active recall prompt
- definition test
- mechanism explanation prompt
- “where have you seen this pattern?” prompt
- concept differentiation card

Core fields:

- `review_item_id`
- `target_type`
- `target_id`
- `prompt`
- `expected_shape_of_answer`
- `review_type`
- `ease_score`
- `stability_score`
- `next_review_at`
- `last_review_at`
- `lapse_count`
- `success_count`

### 6.11 Learning Session

A **Learning Session** represents a bounded period of learning activity.

Core fields:

- `session_id`
- `started_at`
- `ended_at`
- `session_mode` (`reading`, `building`, `debugging`, `sprint-compare`, `review`, `capture`)
- `active_project_id`
- `active_domains`
- `intent`
- `outcomes_summary`
- `energy_rating`
- `quality_rating`

### 6.12 Session Artifact

A **Session Artifact** links a session to what it produced.

Examples:

- source imported
- notes created
- concepts updated
- pattern candidate logged
- review items generated

Core fields:

- `session_artifact_id`
- `session_id`
- `artifact_type`
- `artifact_id`
- `role` (`created`, `updated`, `reviewed`, `flagged`)

### 6.13 Project

A **Project** anchors learning to real execution contexts.

Examples:

- SPDRbot
- Oracle TradeSignal
- PE Framework
- personal neuroscience track

Core fields:

- `project_id`
- `name`
- `slug`
- `description`
- `status`
- `priority`
- `started_at`
- `ended_at`

### 6.14 Project Knowledge Link

A **Project Knowledge Link** connects concepts and patterns to practical work.

Core fields:

- `project_knowledge_link_id`
- `project_id`
- `target_type`
- `target_id`
- `role` (`used_in`, `motivated_by`, `discovered_via`, `validated_in`)
- `importance`

---

## 7. Storage Model

The architecture should use multiple coordinated stores rather than a single monolith.

### 7.1 Relational store

The **relational database** is the canonical system of record for structured knowledge entities and lifecycle state.

Recommended responsibilities:

- concepts
- aliases
- notes metadata
- patterns
- projects
- sessions
- review schedules
- relationships metadata
- provenance links

Recommended engine:

- SQLite for single-user local-first operation in v0.1
- Postgres only if multi-device sync or service orchestration becomes necessary later

### 7.2 Full-text index

A dedicated **full-text search layer** should support exact and near-exact text retrieval across:

- source text
- notes
- concept definitions
- pattern statements
- session summaries

In v0.1 this should likely be implemented via SQLite FTS5, aligning with the existing affinity toward DAL-style local persistence and low-overhead retrieval.[file:2]

### 7.3 Embedding / semantic index

A **semantic retrieval layer** should store embeddings for:

- source segments
- concept summaries
- notes
- pattern statements

Responsibilities:

- similarity search
- “what is structurally like this?” retrieval
- resurfacing related material during new intake

This layer is a retrieval accelerator, **not** the canonical source of truth.

### 7.4 Graph layer

The **graph layer** can be explicit tables inside the relational DB in v0.1 rather than a separate graph database.

Graph responsibilities:

- concept prerequisites
- cross-domain analogies
- pattern evidence chains
- project-to-knowledge mappings
- contradiction and boundary-condition edges

Separate graph DBs are optional later. In v0.1, explicit edge tables are sufficient.

### 7.5 Filesystem / raw artifact store

Raw files should remain stored as files, with the database indexing them rather than embedding everything directly in the DB.

Examples:

- PDFs
- transcripts
- markdown source docs
- screenshots
- exports
- generated summaries

The database should store paths, hashes, and derived metadata; the filesystem remains the raw artifact substrate.

---

## 8. Canonical Source-of-Truth Rules

To prevent drift, the system needs explicit authority rules.

| Entity | Canonical Store | Non-Canonical Views |
|---|---|---|
| Raw source metadata | Relational DB | dashboards, markdown summaries |
| Raw source content | Filesystem / source files | snippets, exports |
| Source chunks | Relational + FTS + embedding refs | retrieval views |
| Concepts | Relational DB | rendered notes, review prompts, graph views |
| Notes | Markdown body or DB text field, depending implementation | chat summaries, dashboards |
| Patterns | Relational DB | pattern log, reports |
| Review schedule | Relational DB | dashboards, flashcard exports |
| Graph edges | Relational DB edge tables | graph visualization tools |
| Session logs | Relational DB + append log | timelines, summaries |

Rules:

1. A canonical concept record must exist before a concept is considered stable.
2. Semantic similarity never creates truth; it only suggests candidates.
3. Chat outputs are drafts unless promoted into canonical entities.
4. Markdown documents can be excellent authored views, but should not silently become the only source of structured truth.
5. Any durable claim or pattern should be back-linkable to evidence.

---

## 9. Ingestion Pipeline

The learning system should move information through a staged pipeline.

### 9.1 Stage A — Capture

Inputs arrive with minimal friction:

- URL saved
- PDF imported
- transcript attached
- chat exported
- idea jotted down
- code/file referenced

Output:

- `Source` created
- raw artifact stored
- metadata recorded

### 9.2 Stage B — Segmentation

The source is chunked into meaningful addressable segments.

Chunking should be source-aware:

- headings/paragraphs for docs
- timestamps for media
- functions/classes for code
- logical sections for specs

Output:

- `Source Segment` records
- FTS index entries
- embeddings for segments

### 9.3 Stage C — Extraction

Important units are pulled out of segments.

This can be manual, agent-assisted, or hybrid.

Output:

- `Extraction` records of type definition/mechanism/example/question/etc.

### 9.4 Stage D — Concept Mapping

Extractions are either:

- linked to an existing concept
- merged into an existing concept candidate queue
- or used to create a new concept seed

Output:

- concept updated or created
- aliases added if needed

### 9.5 Stage E — Structural Linking

The system proposes and/or records:

- prerequisites
n- analogies
- project relevance
- pattern membership
- contradiction links

Output:

- relationship edges
- evidence links
- project knowledge links

### 9.6 Stage F — Promotion

When understanding is durable enough, the system promotes knowledge into:

- stable concept summaries
- pattern records
- review items
- “active topic” queues

### 9.7 Stage G — Resurfacing

The review layer schedules or opportunistically resurfaces items based on:

- forgetting risk
- current project relevance
- recent source overlap
- newly detected pattern similarity
- open questions

---

## 10. Retrieval Model

Retrieval should support multiple modes because different cognitive tasks require different retrieval paths.

### 10.1 Exact retrieval

Use when the learner remembers a term, project name, or precise phrase.

Backed by:

- direct key lookup
- aliases
- FTS exact phrase search

### 10.2 Concept retrieval

Use when the learner wants the canonical record for a topic.

Returns:

- definition
- related notes
- evidence links
- projects using it
- review state
- neighboring concepts

### 10.3 Semantic retrieval

Use when the learner knows the shape, not the exact wording.

Returns:

- similar segments
- similar concepts
- similar patterns
- related prior sessions

### 10.4 Graph retrieval

Use when the learner needs structure.

Questions supported:

- what depends on this?
- what is prerequisite to this?
- what is analogous to this in another domain?
- what patterns contain this concept?
- what breaks when this assumption fails?

### 10.5 Session retrieval

Use when continuity matters.

Questions supported:

- what was I last working on?
- what changed in the previous session?
- which concepts were active yesterday?
- what unresolved questions were left open?

### 10.6 Review retrieval

Use when reinforcement matters.

Questions supported:

- what is due?
- what is weak but important?
- what has not been revisited despite current relevance?
- what concepts are fragile and likely to decay?

---

## 11. Review and Memory Reinforcement

The review system should not be generic flashcards bolted on top. It should reflect the structure of the learning architecture.

### 11.1 Review item types

Recommended review types:

- **Definition recall** — “Define X in your own words.”
- **Mechanism explanation** — “How does X work?”
- **Differentiation** — “How is X different from Y?”
- **Analogy transfer** — “Where else have you seen this structure?”
- **Failure mode** — “When does this break?”
- **Project application** — “Where in SPDRbot / Oracle / PE does this apply?”
- **Prerequisite tracing** — “What must be understood before this?”

### 11.2 Scheduling logic

A simple first-pass scheduling model should consider:

- importance
- current project relevance
- difficulty
- past recall success
- time since last retrieval
- whether the concept participates in active pattern formation

### 11.3 Review outcomes

Each review event should update:

- ease score
- stability score
- lapse count
- confidence
- optional note on what failed

Review should improve not just retention, but **structural compression**.

---

## 12. Pattern Integration

Because pattern learning is central in the cognitive spec, the memory architecture must treat patterns as native, not optional.[file:2]

### 12.1 Pattern emergence path

Patterns should emerge from repeated evidence across:

- multiple concepts
- multiple projects
- multiple sessions
- multiple domains

The system should support progression:

**pattern candidate -> named pattern -> validated pattern -> refined boundary conditions**

### 12.2 Pattern evidence requirements

A pattern should not be considered validated unless it has:

- at least two domain instances
- at least one explicit statement of shared structure
- at least one documented boundary or failure condition

### 12.3 Pattern retrieval

Pattern views should show:

- pattern statement
- supporting concepts
- supporting sessions
- supporting projects
- analogous instances
- counterexamples / failure modes

---

## 13. Session Continuity Model

The system must preserve working continuity between sessions without confusing transient context for durable knowledge.

### 13.1 Active context objects

At session end, the system should persist:

- active project
- active concepts
- unresolved questions
- next recommended sources
- pending promotions
- due review items
- likely continuation tasks

### 13.2 Session handoff packet

A lightweight handoff object should be generated after each meaningful session containing:

- what was worked on
- what was learned
- what was left unresolved
- what should be resumed next
- which concepts/patterns were touched

This gives continuity without requiring the entire prior session to be reloaded every time.

### 13.3 Separation from canonical knowledge

A session handoff is not durable truth. It is a continuation aid. Only promoted concepts, notes, patterns, and reviewed conclusions should modify canonical memory.

---

## 14. Minimal Relational Schema for v0.1

The following tables are the minimum viable structured database for v0.1.

### 14.1 Core tables

- `sources`
- `source_segments`
- `extractions`
- `concepts`
- `concept_aliases`
- `notes`
- `patterns`
- `evidence_links`
- `relationship_edges`
- `projects`
- `project_knowledge_links`
- `learning_sessions`
- `session_artifacts`
- `review_items`
- `review_events`

### 14.2 Suggested future tables

- `concept_versions`
- `pattern_versions`
- `ingestion_jobs`
- `active_context_snapshots`
- `promotions`
- `contradictions`
- `topic_queues`
- `source_annotations`

---

## 15. Suggested Lifecycle States

### 15.1 Concept lifecycle

- `seed` — observed but unclear
- `active` — currently being learned
- `stable` — durable and reusable
- `fragile` — understood once but decaying
- `deprecated` — replaced or superseded

### 15.2 Pattern lifecycle

- `candidate`
- `named`
- `validated`
- `refined`
- `retired`

### 15.3 Source lifecycle

- `raw`
- `segmented`
- `extracted`
- `linked`
- `archived`
- `superseded`

---

## 16. Implementation Guidance for v0.1

The first implementation should bias toward simplicity and local durability.

### 16.1 Recommended stack

- SQLite as canonical relational store
- SQLite FTS5 for full-text search
- local embedding store or vector table for semantic search
- markdown files as authored human-readable views where useful
- filesystem-backed raw artifact storage

This aligns with the existing orientation toward local structured persistence and low-overhead retrieval already described in the cognitive spec’s discussion of DAL/brain.db and the future personal DAL equivalent.[file:2]

### 16.2 What not to overbuild in v0.1

Do **not** start with:

- distributed sync complexity
- a separate graph database
- elaborate dashboards before schema clarity
- fully automated extraction without manual correction loops
- dozens of tables before ingestion and retrieval are working end-to-end

### 16.3 What must work in v0.1

The first implementation should prove this loop:

1. import source
2. chunk source
3. create extraction
4. map extraction to concept
5. link concept to project and/or pattern
6. generate review item
7. retrieve later by exact, semantic, and graph-neighbor paths

If that loop works, the architecture is alive.

---

## 17. Open Questions

This draft intentionally leaves several implementation choices open.

1. Should authored notes live primarily in markdown files with DB indexing, or directly in DB text fields with markdown export views?
2. What is the threshold for promoting a concept from `seed` to `active` or `stable`?
3. How much extraction should be manual vs agent-assisted in early iterations?
4. Should pattern review be scheduled separately from concept review?
5. What exact embedding model and chunking strategy best fit technical learning material?
6. Should project relevance influence review scheduling heavily or lightly?
7. What is the minimal session-handoff format that preserves continuity without bloating the system?

These should become implementation and tuning tasks, not blockers to initial build-out.

---

## 18. Immediate Next Steps

The next steps after this draft should be:

1. Review and refine entity boundaries.
2. Decide canonical storage rules for notes vs markdown-authored documents.
3. Translate the core entity model into an actual SQLite schema.
4. Define one ingestion workflow for a single source type first, likely markdown/PDF/chat transcript.
5. Create first-pass CRUD and retrieval interfaces.
6. Add review scheduling only after canonical concept flow works.
7. Break the architecture into GitHub and/or Linear implementation tasks.

---

## 19. Summary

`Learning Memory Architecture v0.1` defines the memory substrate for the learning system itself: the database of learning contents, their provenance, their structure, their retrieval pathways, and their reinforcement lifecycle. It is distinct from the broader cognitive-learning philosophy document and should be treated as the operational specification for building the personal learning knowledge base.[file:2]

Its core claim is simple:

> A real learning system needs more than notes. It needs a layered memory architecture with explicit entities, canonical storage rules, provenance, graph structure, semantic retrieval, and review-state resurfacing.

That is the system this document is intended to define.
