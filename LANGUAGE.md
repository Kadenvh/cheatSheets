# LANGUAGE.md — Content Format Contract

**Status:** DRAFT — active design surface | **Role:** defines the format of contents expected at Cortex's **ingest layer**, and the authoring contract for this design repo's documents | **Updated:** 2026-06-06 (Session 17)

Two jobs, one file:

1. **Ingest contract** `PLANNED`: when Cortex agents ingest documents (this repo's own docs first, external sources later), this is the format spec the parser validates against
2. **Authoring contract** `RUNS`: how humans + Claude write documents in this repo today

## The one rule that prevents drift

**Humans author once, in GFM + YAML frontmatter. Machines derive everything else** (JSON via parsing, DOT/Mermaid/SVG via emitters, per `exploration/resource-landscape.md` §2). Multiple representations exist; multiple *hand-authored* representations of one fact never do. MD/YAML // JSON // DOT are interchangeable surfaces only because all but one are generated.

## Surface classes

| Surface | Syntax allowed | Examples |
|---|---|---|
| **repo-first** (default) | Standard GFM: `[label](path)` links, headings, fenced code, tables, Mermaid blocks | `SPEC.md`, `PLAN.md`, `exploration/`, `architecture/` |
| **vault-first** (explicitly marked) | + `[[wikilinks]]`, `![[embeds]]`, callouts, Dataview/Templater, typed frontmatter | `vault/**` only |
| **generated** | Never hand-edited; source committed beside render | `.svg` from `.dot`, future Mermaid from YAML |

Repo-first docs do NOT use: wikilinks, embeds, Dataview blocks, Templater tokens, Tasks-emoji metadata, `==highlight==`, hidden Obsidian comments.

## Diagram conventions (decision #20)

| Need | Tool | Why |
|---|---|---|
| Design-phase diagrams (ER, flowchart, architecture, sequence) | **Mermaid**, fenced ```mermaid in the `.md` | Native rendering in GitHub + Obsidian + markdown tooling; zero infra; lives in the doc |
| Generated / data-dense views (schemas inside nodes, row ports, large graphs from SQLite/ontology) | **Graphviz/DOT** -> committed `.svg` | DOT's genuine edge; deferred until a diagram needs data-in-nodes or is machine-generated. Reference: `exploration/research/graphviz.md` |
| Free-form spatial brainstorming (capture stage) | Obsidian Canvas (open JSON Canvas) or hand sketch | Agent-parseable; never a source of truth |

Diagrams follow the drift rule: a hand-authored Mermaid block is fine as authored truth; any diagram *generated from a data source* is a build artifact (commit source + render, never hand-edit the render).

## Core writing rules

- One canonical home per durable fact; link to it, don't duplicate it (transclusion mindset)
- Current operating truth near the top; status words explicit (`RUNS`/`STALLED`/`PLANNED`/`SPECULATIVE` per SPEC §1)
- Atomic docs: one document, one job; index docs (MOCs) point at canonical children
- Concrete nouns, current behavior; scan-friendly sections over narrative
- No decorative metadata or layout tricks without a retrieval or maintenance payoff

## Operator notation

Preserve Kaden's notation; it carries precision. Do not flatten it into PM prose.

| Pattern | Meaning |
|---|---|
| `X // Y` | Alternate framing, refinement, or "X in the context of Y" |
| `X && Y` | Both required / jointly true / coupled |
| `ie` | Clarification or narrowing, not necessarily exhaustive |

## Document-type registry (the doc T-Box, v0)

Every root document declares what it is. This table is the seed of `ontology/doc-types.yaml` (machine-readable, generated diagrams) when the ontology dir lands.

| Document | Type | Job | Lifecycle |
|---|---|---|---|
| `SPEC.md` | ontology | What Cortex IS: identity, layers, entities, status | Living; amended via `DECISIONS.md` entry |
| `CLAUDE.md` | rules | Session rules + dev orchestration | Living; rewritten when the working model changes |
| `PLAN.md` | index | Zoomed-out view of active work | Regenerated whenever `plans/` changes |
| `LANGUAGE.md` | contract | This file: ingest format + authoring rules | DRAFT; design-phase work item |
| `DECISIONS.md` | ledger | ADR record, append-only | Append at fork points |
| `OPERATOR.md` | contract | Operator-self contract + Evolution Log | Append-only log; rules amended via decision |
| `*/RECEIPT.md` | receipt | What was extracted where, on every retirement | Written once at the move |

## Open design questions (work on these next)

- [ ] Which frontmatter keys does the ingest parser REQUIRE per doc type? (The corpus pipeline's page contract — `page_id`, `source_id`, `cleaned_text_hash` — is the proven reference: see landscape §1)
- [ ] Do design diagrams get their own doc type (`.dot` + `.svg` pair with a manifest), and what metadata travels with them?
- [ ] `ontology/doc-types.yaml` + JSON Schema: when does the registry table above graduate from prose to validated artifact?
- [ ] Surface n beyond Project-facing: agent-to-agent message formats, MemoryOp event schema (overlaps Loop 1; design here, bind there)
- [ ] How much of this file folds into the ingest parser's own validation spec once Cortex reads its own docs?
