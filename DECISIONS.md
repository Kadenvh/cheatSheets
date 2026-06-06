# Architectural Decisions

Curated record of the load-bearing decisions behind this project, exported from the continuity ledger. Each entry follows the ADR pattern: **context** (what problem) → **chosen** (what we did) → **rationale** (why this over alternatives).

For the full ongoing strategy see [`plans/learning-system.md`](plans/learning-system.md) and [`plans/resilience.md`](plans/resilience.md). For release-level changes see [`CHANGELOG.md`](CHANGELOG.md).

---

## 1. Obsidian-first learning architecture

**Context:** The learning system had 4 data stores, an 8-step pipeline, and no good authoring UX. Quick Insert was entangled with learning logic. Curator as a mandatory gateway caused friction on every note.

**Chosen:** Obsidian vault as the content layer, ChromaDB as the search layer, `brain.db` as the scheduling layer. One ChromaDB collection. Wiki-links for prerequisites. Curator agent optional, not a gateway.

**Rationale:** Simplifies to three clear layers. Obsidian provides excellent authoring UX and a native graph view. Wiki-links naturally express prerequisites as a DAG. Removes file shuffling, collection routing, and mandatory curation friction.

*Decided 2026-03-21.*

---

## 2. Single ChromaDB collection

**Context:** Had `knowledge` and `knowledge-learning` as separate collections with fragile post-embed routing between them.

**Chosen:** One `knowledge` collection with a `type` metadata field. Wiped and re-ingested from the vault.

**Rationale:** Removes routing complexity. Type is metadata, not a collection boundary. Easier to query and maintain.

*Decided 2026-03-21.*

---

## 3. Restore learning routes in Ava_Main (Path A)

**Context:** The learning pipeline was broken: archived routes, wrong DB target, wrong vault path. Two options: restore routes in the Ava_Main hub, or build a standalone server inside the CheatSheets spoke.

**Chosen:** Un-archive the routes in Ava_Main, fix DB routing to point at the spoke's brain.db, fix the vault path.

**Rationale:** 2,663 lines of tested code already existed. CheatSheets spoke has no server. `SPOKE_DB_MAP` was already configured. Lower effort and faster restoration than a fresh standalone build.

*Decided 2026-03-30.*

---

## 4. Three-track learning content strategy

**Context:** First learning topic selection for the restored system. Needed to validate content creation, review pipeline, and reference-material ingestion simultaneously.

**Chosen:** Parallel tracks — (1) author learning-methods notes, (2) review existing meta-learning frameworks, (3) plan the hardware track with PDF reference ingestion (ELEGOO Mega 2560 kit).

**Rationale:** Track 1 validates content creation end-to-end. Track 2 validates the review pipeline. Track 3 addresses the user's Arduino / Orin Nano goals and proves out future reference-material ingestion.

*Decided 2026-03-30.*

---

## 5. Separate `learning.db` for the curriculum layer

**Context:** Curriculum tables needed for guided learning paths (ELEGOO 34-lesson kit, future courses). `brain.db` migrations are PE-managed via template pull, so project-specific schema additions there would create conflicts on every template upgrade.

**Chosen:** New `learning.db` alongside `brain.db`. Own schema (`learning-schema.sql`), own migrations, own access module (`learning-db.mjs`). `getLearningDb()` auto-creates on first access. Zero PE template conflict.

**Rationale:** `brain.db` migrations are PE-controlled. Adding project-specific tables there risks version conflicts on every template pull. `learning.db` is gitignored (progress is personal state); the schema file is version-controlled. Clear ownership boundary.

*Decided 2026-04-01.*

---

## 6. iframe PDF viewer over `pdfjs-dist`

**Context:** Needed PDF rendering for the Tutorial tab in ContentPanel. The ELEGOO curriculum binds each lesson to a tutorial-PDF page range.

**Chosen:** Chrome native PDF viewer via iframe with `#page=N` fragment.

**Rationale:** Zero new dependencies. Chrome's native PDF viewer is full-featured (zoom, search, scroll). The 40 MB tutorial PDF loads fast from localhost. Can upgrade to `pdfjs-dist` later if cross-browser or deeper customization is needed.

*Decided 2026-04-01.*

---

## 7. Exclude PE scaffolding from the public repo

**Context:** cheatSheets was a private repo with `.claude/` (PE skill library, hooks, prompts, agents) and `.ava/` (brain.db, lib/, handoffs/, migrations/, node_modules) fully tracked — 533 scaffolding files. Before flipping to public we had to decide: strip scaffolding or keep it?

**Chosen:** Gitignore `.claude/` entirely and `.ava/*` with whitelisted exceptions (`learning-schema.sql`, `learning-db.mjs`, `curriculum-export.mjs`). Keep `knowledge-agents/*/*.md` definitions; gitignore `knowledge-agents/*/memory/` (OpenClaw runtime state). Keep `plans/` and `archive/` (ELEGOO kit is load-bearing); gitignore `sessions/` (personal development chronicle).

**Rationale:** Subject-discipline rule — scaffolding is developer infrastructure, not product. Collaborators cloning the public repo should get the learning system (vault, curriculum engine, agent definitions), not the PE framework internals. Exception-pattern gitignore avoids refactoring product code out of `.ava/` in one pass; that refactor can come later as a separate planned migration.

*Decided 2026-04-22.*

---

## 8. MIT license

**Context:** Pre-public audit flagged the missing LICENSE as a blocker. Choices: MIT (permissive), Apache 2.0 (permissive + patent grant), GPL-3.0 (copyleft), UNLICENSED (all-rights-reserved but still publicly visible).

**Chosen:** MIT.

**Rationale:** Maximally permissive, matches the "collaborate with other developers" goal. No strong patent surface on a personal-learning system, so Apache 2.0's explicit patent grant isn't load-bearing. No desire to enforce copyleft. MIT is the lowest-friction license for attracting small-project collaborators.

*Decided 2026-04-22.*

---

## 9. Translate `/repo-release` trio from GitHub MCP to `gh` CLI

**Context:** The external-agent-curated `repo-release` skill trio (skill + prompt + manual) targeted a GitHub MCP server not configured in this environment. A raw install would have failed on first invocation.

**Chosen:** Preserve the curated 7-phase structure, gates, report templates, and safety rules verbatim. Replace every MCP tool reference with `gh` CLI + local equivalents: `gitleaks`/`trufflehog`/regex fallback for scanning, local `Read`/`Grep` for file inspection, `git` + `gh pr create` for commits and PRs, `gh issue create` for the checklist issue. Document the substitution table at the top of the prompt.

**Rationale:** The trio's value lives in its phase design and safety posture, not its specific MCP bindings. The `gh` CLI is already authenticated, and local scanners cover the audit's core need. Preserves the curation work while making the skill actually executable here.

*Decided 2026-04-22.*

---

## 10. Branch protection policy on `main`

**Context:** Post-public flip of cheatSheets. GitHub branch protection became API-reachable. Needed to decide the protection profile: full approval requirements or lighter touch for a solo-maintainer OSS project.

**Chosen:** PR required (0 approvals minimum; not requiring outside approvals since sole maintainer). Disallow force-push, disallow branch deletion, require conversation resolution. `enforce_admins=false` — Kadenvh retains direct-push ability for docs-only fixes. Stale reviews dismissed on new commits.

**Rationale:** Solo-maintainer OSS: requiring approvals would block the maintainer themselves. PR-required + dismiss-stale + no-force-push + no-delete is the minimum viable protection that catches mistakes without creating dead-end locks. `enforce_admins=false` kept because self-merging approved small PRs is normal at this stage. Can tighten later when contributors arrive.

*Decided 2026-04-22.*

---

## 14. Project re-founded as Cortex (2026-06-06)

**Context:** A 9-territory audit of 18 months of history found the named product (a learning-content system) had zero closed loops while every session's energy gravitated to agent/memory/orchestration infrastructure. The operator stated the true goal: an orchestration pipeline between agents creating an agent-controlled memory ("brain").

**Chosen:** Rebrand in place to **Cortex**. The name targets goal-accuracy over collision-avoidance; **Hippocampus** is reserved for the consolidation layer; `cheatSheets` survives as the learning-companion surface's name.

**Rationale:** The misdeclared product identity was the root cause of non-viability: nothing could ever count as done. Naming the real goal makes loops closable.

*Decided 2026-06-06.*

---

## 15. Document lifecycle topology (2026-06-06)

**Context:** 13 overlapping strategy docs; audit named "specification mistaken for construction" as the project's killer pattern.

**Chosen:** `SPEC.md` owns ontology + identity; `CLAUDE.md` owns rules + session orchestration; `PLAN.md` indexes `plans/`. Lifecycle: `exploration/` -> `plans/` -> `architecture/` (capture -> working -> consolidated), explicitly mirroring the memory model Cortex builds. Provisional by design.

**Rationale:** One place per question; the doc system dogfoods the product's memory architecture.

*Decided 2026-06-06.*

---

## 16. SPEC adoption with status-tag discipline + Loop 1 binding commitment (2026-06-06)

**Context:** Every prior strategy doc described aspiration in the present tense until nobody could tell what existed.

**Chosen:** `SPEC.md` carries a status vocabulary (`RUNS`/`STALLED`/`PLANNED`/`SPECULATIVE`); present tense is permitted only for RUNS. The entity catalog is ordered by instance count. The SPEC declares itself an unvalidated hypothesis until **Loop 1** closes (E2E-verified ingestion + agentified triage/polish + first non-empty Hippocampus consolidation report). No new strategy documents while Loop 1 is open.

**Rationale:** Structural guards make the failure pattern grammatically impossible rather than relying on discipline.

*Decided 2026-06-06.*

---

*This document is curated from the project's continuity ledger (brain.db). Decisions #11-#13 live in the ledger (`node .ava/dal.mjs decision list`); they predate the Cortex re-founding and concern the retired EdX/operator era. For ongoing strategy see `PLAN.md`; for ontology see `SPEC.md`.*
