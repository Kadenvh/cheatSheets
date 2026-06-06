# Cortex — Session Rules & Orchestration

**Version:** 8.0.0-spec | **Status:** SPEC unvalidated until Loop 1 closes | **Updated:** 2026-06-06

This file owns **rules and session orchestration**. The project's ontology and identity live in `SPEC.md` (read it before architectural claims). The repo was `cheatSheets` through v7.8.1; that name now refers only to the learning-companion surface layer.

## Documentation map

| Question | Read |
|---|---|
| What IS this project? Ontology, layers, entities, status tags | `SPEC.md` |
| What work is active right now? | `PLAN.md` -> `plans/loop-1-ingestion.md` |
| Why was each technology chosen/rejected? | `exploration/resource-landscape.md` |
| Operator contract (posture, non-negotiables, authority) | `OPERATOR.md` (read every session) |
| Architectural decision record | `DECISIONS.md` + `node .ava/dal.mjs decision list` |
| Framework operating manual (PE scaffolding, local-only) | `SYSTEM-OVERVIEW.md` (untracked) |
| Project-wide hub rules | `Ava_Main/CLAUDE.md` |

## Document lifecycle

`exploration/` (ideas, resources, sketches, research) -> `plans/` (few, fully-defined, active) -> `architecture/` (consolidated, completed, with receipts). This mirrors the memory model Cortex builds (SPEC §2). Session outputs land in the stage matching their maturity.

## Critical rules

### DO NOT

- Describe non-`RUNS` components in the present tense, anywhere. Status tags (SPEC §1) are mandatory in every architectural claim
- Create new strategy documents while Loop 1 is open (SPEC §7)
- Build or adopt orchestration frameworks, agent-builders, or stores rejected in `exploration/resource-landscape.md` without a new decision superseding the verdict
- Let agents write to memory stores directly once MemoryOp tooling exists; writes go through tool contracts that emit events (SPEC §6)
- Remove human curation gates from the ingestion flow
- Write to sibling projects (operator model; note follow-ups in brain.db instead)
- Commit `.ava/` runtime (gitignored by design; whitelisted product files excepted)

### ALWAYS

- Start significant work with `node .ava/dal.mjs session start "..."`; close with `/session-closeout`
- Record traces as findings happen, decisions at fork points (`dal.mjs trace add`, `decision add`)
- Verification artifact for every claim of done: command output, diff, query result, commit hash visible in `git log`
- GFM for all documents (until a better language is engineered and documented)
- Update `plans/loop-1-ingestion.md` when work touches its domain; re-tag SPEC §4 entities when a status genuinely changes (with artifact)
- Surface judgment calls as you go; state understanding before acting

## Development orchestration model (sub-agent driven)

Sessions on this project are long-running planning/working sessions, not quick fixes. The working model:

1. **Main loop = synthesis and judgment.** The session's primary context holds the thread: decisions, user dialogue, document writes.
2. **Fan out everything fannable.** Independent reads, research, audits, and searches go to parallel background subagents (Explore/general-purpose) or staged Workflows. Never serially read what agents can sweep concurrently.
3. **Research agents verify against the live web/current state**, never training-data assumptions; verdicts use the radar vocabulary (ADOPT/TRIAL/DEFER/REJECT) with named triggers, filtered by "does this close a loop NOW?"
4. **Verification gates:** advisor consult (when available) before major artifact writes and at completion; every `[x]` carries an artifact; subagent outputs get folded into durable docs, not left in transcripts.
5. **Durability ordering:** write and commit the deliverable before long-running follow-up work; the session can die at any moment.
6. **Outputs land by lifecycle stage:** research -> `exploration/`, active work definitions -> `plans/`, completed/consolidated -> `architecture/`, identity/ontology changes -> `SPEC.md` + a DAL decision.

## Quick reference

```bash
node .ava/dal.mjs session start "..."        # begin
node .ava/dal.mjs trace add discovery "..."  # breadcrumbs as you go
node .ava/dal.mjs decision add --title ...   # fork points
node .ava/dal.mjs consolidate <slug> --keep <plan> --archive <p1,p2>  # plan archival with receipt
node .ava/dal.mjs session-export session "summary"   # sessions/session-{N}.md
```

Runtime services (verify, don't assume): hub UI `ava:4173` (Ava_Main, serves no learning backend); embedding service `:8001` (Ava_Main-owned FastAPI, bge-base-en-v1.5 + embedded ChromaDB); OpenClaw gateway `:18789`.

## Learning-companion surface (STALLED — SPEC §4 Tier 4)

The former cheatSheets product. Engine code is sound; data stalled 2026-04. Revival trigger: first real course content authored. Until then:

- Concept notes: `vault/Concepts/` via `vault/Templates/Cheatsheet.md` (frontmatter contract: category, tags, title, created, type; slug = concept ID)
- Course scaffolding: `vault/Courses/<slug>/` + `node .ava/course-import.mjs <manifest>` (ColumbiaX scaffold exists, placeholder-only)
- Agent identity packs: `knowledge-agents/` (10 workspaces, none yet exercised; see SPEC §11 on tutor consolidation)

Do not extend this surface while Loop 1 is open.

## Session export

After significant sessions: `node .ava/dal.mjs session-export session "summary"` writes `sessions/session-{N}.md` (gitignored, local chronicle).
