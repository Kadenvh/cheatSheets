# Cortex Design — Session Rules & Orchestration

**Version:** 8.1.0-design | **Phase:** DESIGN (build home `/home/ava/cortex` intentionally empty) | **Updated:** 2026-06-06

This repo is the **design home** for Cortex: a multi-agent orchestration system that takes content and results in and responds by curating a totally agent-controlled memory (the brain). Directory/repo rename to `cortex-design` pends at a session boundary (`exploration/cortex-design-rename.md`, decision #18). Nothing gets BUILT here or in `/home/ava/cortex` until the design phase yields a buildable Loop 1 charter.

This file owns **rules and session orchestration**. Ontology and identity live in `SPEC.md`.

## Documentation map

| Question | Read |
|---|---|
| What IS Cortex? Ontology, layers, entities, status tags | `SPEC.md` |
| What work is active right now? | `PLAN.md` -> `plans/loop-1-ingestion.md` |
| What format do ingest-layer contents follow? Authoring contract | `LANGUAGE.md` (DRAFT, active design surface) |
| Why was each technology chosen/rejected? | `exploration/resource-landscape.md` |
| Operator contract (posture, non-negotiables, authority) | `OPERATOR.md` (read every session) |
| Decision record (primary, append directly) | `DECISIONS.md` |
| Design-tool expertise (Graphviz etc.) | `exploration/research/` |
| Project-wide hub rules | `Ava_Main/CLAUDE.md` |

## Document lifecycle

`exploration/` (ideas, resources, sketches, research) -> `plans/` (few, fully-defined, active) -> `architecture/` (consolidated, completed, with receipts). Mirrors the memory model Cortex builds (SPEC §2). Session outputs land in the stage matching their maturity.

## Continuity model (post-DAL, decision #17)

The PE DAL is **frozen**: no more `dal.mjs` writes (brain.db is read-only history; final write was decision #17's forwarding address; the session-context hook gets disabled at the next session boundary).

| Continuity question | Now lives in |
|---|---|
| Why did we choose X? | `DECISIONS.md` — append directly, ADR pattern |
| What's open / next? | `PLAN.md` + active plan checkboxes |
| What happened? | git history; optional `sessions/` note for milestone sessions |
| Operator memory across sessions | Claude auto-memory |
| Non-obvious findings mid-session | Straight into the doc they belong to (lifecycle stage), not a side ledger |

`.ava/` deletion trigger: first real MemoryOp events (decision #17). The three whitelisted product files there are Tier 4 product, untouched.

## Critical rules

### DO NOT

- Describe non-`RUNS` components in the present tense, anywhere. Status tags (SPEC §1) are mandatory in architectural claims
- Build anything in `/home/ava/cortex` or this repo during the DESIGN phase; design artifacts only (docs, .dot/.svg, ontology files, research)
- Create new strategy documents while Loop 1 is open (SPEC §7); design artifacts in `exploration/` are not strategy documents
- Write to brain.db (frozen, decision #17)
- `git add -A` at this repo root — runtime workspaces (`tutor/`) live here untracked; stage explicitly (Session 17 incident)
- Adopt tools rejected in `exploration/resource-landscape.md` without a superseding decision in `DECISIONS.md`
- Write to sibling projects (operator model); the rename checklist's cross-project steps are executed manually by Kaden or with explicit confirmation
- Hand-author the same fact in two formats: humans author once (GFM + YAML frontmatter); machines derive JSON/DOT/Mermaid/SVG (emitter pattern, landscape §2)

### ALWAYS

- Record decisions in `DECISIONS.md` at fork points; verification artifact for every claim of done (command output, diff, commit hash visible in `git log`)
- GFM per `LANGUAGE.md`; respect operator notation (`X // Y` = alternate framing, `X && Y` = jointly required, `ie` = clarification)
- Generated diagrams are build artifacts: commit the source (`.dot`, `.yaml`) AND the rendered `.svg`; never hand-edit renders
- Update `PLAN.md` and the active plan when work touches their domain; re-tag SPEC §4 entities only with artifacts
- Surface judgment calls as you go; state understanding before acting

## Development orchestration model (sub-agent driven)

Sessions are long-running design/working sessions. The model:

1. **Main loop = synthesis and judgment.** Primary context holds the thread: decisions, dialogue, document writes.
2. **Fan out everything fannable.** Independent reads, research, audits go to parallel background subagents or staged Workflows; never serially read what agents can sweep concurrently.
3. **Research agents verify against the live web**, never training-data assumptions; verdicts use ADOPT/TRIAL/DEFER/REJECT with named triggers, filtered by "does this close a loop NOW?"
4. **Verification gates:** advisor consult before major artifact writes and at completion; subagent outputs get folded into durable docs, not left in transcripts.
5. **Durability ordering:** write and commit the deliverable before long-running follow-up work.
6. **Outputs land by lifecycle stage:** research -> `exploration/`, active work -> `plans/`, consolidated -> `architecture/`, ontology/identity -> `SPEC.md` + a `DECISIONS.md` entry.

## Current design-phase focus

1. **Graphviz expertise** (`exploration/research/graphviz.md`): DOT is the design-phase visualization language; data-dense HTML-label nodes render schemas/status inside diagrams; all diagrams generated from machine-readable sources
2. **LANGUAGE.md curation**: the ingest-layer format contract + doc-type registry
3. **System design artifacts**: layer diagrams, entity graphs, orchestration flows as `.dot` -> `.svg` in `exploration/` graduating to `architecture/`
4. **Azure touchpoint** (when its Loop 1 item fires): Entra done; next = subscription -> resource group -> Foundry project (pay-per-call) -> first Responses call. Azure Local is rejected (datacenter product); Foundry Local is the local leg. Cert: AI-103, not AI-102 (retires 2026-06-30)

## Learning-companion surface (STALLED — SPEC §4 Tier 4)

The former cheatSheets product. Engine code sound; data stalled 2026-04. Revival trigger: first real course content authored. Until then: concepts in `vault/Concepts/` via `vault/Templates/Cheatsheet.md` (slug = concept ID); courses in `vault/Courses/<slug>/` + `node .ava/course-import.mjs <manifest>`; agent identity packs in `knowledge-agents/`. Do not extend this surface during the DESIGN phase.

## Runtime services (verify, don't assume)

Hub UI `ava:4173` (Ava_Main; serves no learning backend). Embedding service `:8001` (Ava_Main-owned FastAPI, bge-base-en-v1.5 + embedded ChromaDB). OpenClaw gateway `:18789` (tutor workspace registration points at this repo's `tutor/`; consolidation deferred to Loop 2).
