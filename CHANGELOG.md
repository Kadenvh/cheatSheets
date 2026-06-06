# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [8.0.0-spec] — 2026-06-06

**Re-founding release: cheatSheets becomes Cortex.** A 9-territory audit of the project's full 18-month history found elaborate, repeatedly re-architected infrastructure with zero closed loops (FSRS never performed a second review, the prerequisite DAG held 0 edges, the documented `vault-sync` flow existed in no live code, and the hub served no learning backend). The project is re-founded around its actual demonstrated goal: a multi-agent orchestration system curating an agent-controlled memory. The learning system survives as one consumer surface.

### Added
- `SPEC.md` — single source of truth for ontology + identity. Status vocabulary (`RUNS`/`STALLED`/`PLANNED`/`SPECULATIVE`; present tense only for RUNS), entity catalog ordered by instance count, layer model (Ingestion / Memory / Orchestration / Surfaces), resolved architecture decisions, and the binding Loop 1 commitment
- `PLAN.md` — zoomed-out index of active plans
- `exploration/` + `architecture/` — document lifecycle directories (capture -> working -> consolidated), deliberately mirroring the memory model Cortex builds
- `exploration/resource-landscape.md` — 5-cluster researched verdict set (ontology representation, agent orchestration, local inference + GPU path, memory substrates, Azure bridge) with named triggers for every deferral
- `plans/loop-1-ingestion.md` — the single active plan: close the first end-to-end loop of the brain

### Changed
- `CLAUDE.md` — rewritten as rules + session orchestration only; architecture content moved to `SPEC.md`; adds the sub-agent-driven development model
- `README.md` — rewritten; removes false present-tense claims (ChromaDB-at-:8001 attribution, `vault-sync` API, "45 learning endpoints", working UI tabs) in favor of the status-tagged honest picture

### Removed / Retired (with receipts)
- `AGENTS.md`, `SOUL.md` — broken symlinks into a nonexistent sibling path, shipped public since v7.7.1
- `SYSTEM-OVERVIEW.md` — untracked from the public repo (PE framework manual, stale at v7.0.0-rc1; kept locally)
- `END-GOAL.md`, `Cheatsheet_Generation_Prompt.md` -> `architecture/retired/` with receipt
- `Learning_Memory_Architecture_v0.1.md`, `memory_system_expansion.md` -> `exploration/idea-mines/` with receipt
- `plans/{learning-system,edx-courses,resilience}.md` -> `plans/archive/cortex-rebrand/` with extraction receipt

### Identity / continuity
- brain.db decisions #14 (Cortex rebrand), #15 (doc lifecycle topology), #16 (SPEC adoption + Loop 1 binding)
- Session 17 audit artifacts: 9 territory reports + ingestion-layer map recorded as DAL traces

## [7.8.1] — 2026-05-17

**Meta release.** Establishes the operator-self contract (`OPERATOR.md`) as a first-class continuity surface and syncs the Obsidian plugin settings layer that drifted since v7.7.1.

### Added
- `OPERATOR.md` at project root — non-negotiables, posture rules, self-maintenance rituals, authority scope, inline Evolution Log. Read every session after CLAUDE.md.
- 18 plugin `data.json` settings files under `vault/.obsidian/plugins/*/` — covers excalidraw, linter, pdf-plus, tasks, quickadd, style-settings, the full smart-* suite, and others. Plugin source code stays gitignored per the OSS convention set in v7.7.1.
- `vault/.obsidian/{backlink,core-plugins,types,webviewer}.json` — Obsidian-level configuration files that were drifting locally.

### Changed
- `CLAUDE.md` Parent Documentation table gains a row for `OPERATOR.md`.

### Identity / continuity
- brain.db `identity.project.version` → 7.8.1
- brain.db decision #12 — establish operator-self contract
- brain.db decision #13 — defer (not reject) superpowers skill framework adoption

## [7.8.0] — 2026-05-17

**Milestone: EdX-course capable.** First concrete dogfood target is **ColumbiaX CU.OC.AI002 — Programming & Data Structures**. Implements a strict subset of the v0.1 Learning Memory Architecture (Source / Source Segment / Note / Concept / Review Item / Learning Session) — full entity model deferred per `plans/edx-courses.md`.

### Added
- `plans/edx-courses.md` — canonical execution plan for the EdX subsystem (Phases 1–5)
- `Learning_Memory_Architecture_v0.1.md` and `memory_system_expansion.md` — design context docs at project root
- `DECISIONS.md` entry #11 — EdX subset-of-v0.1 commitment
- **learning.db schema v2** (additive over v1): `curriculum_sections` table, `curriculum_tests` table, EdX columns on `curricula` (`kind`, `external_id`, `provider`, `course_url`, `vault_ref`), course/lecture linkage columns on `curriculum_lessons` (`section_id`, `lecture_kind`, `transcript_ref`, `vault_ref`). v1 "flat" curricula (ELEGOO) work unchanged
- `.ava/course-import.mjs` — idempotent JSON-manifest seeder for `learning.db`
- `vault/Templates/` — Course.md, Section.md, Lecture.md templater templates
- `vault/Courses/columbia-programming-data-structures/` — course scaffold (manifest.json + README + `_assets/{slides,transcripts}/` directories)
- `knowledge-agents/tutor/MEMORY.md` — durable tutor memory (active course pointer, architecture anchors, cross-reference hints)

### Changed
- `knowledge-agents/tutor/TOOLS.md` — replaced template placeholders with real tool contracts: `query_course`, `get_section`, `get_lecture`, `get_vault_note`, `semantic_search`, `list_concepts`, `get_concept`, `record_lecture_complete`, `record_test_score`, `record_question`, `list_due_reviews`, `suggest_next`, `get_recent_sessions`, `log_session_summary`. Plus a "tools you don't have yet" list pointing at deferred phases
- `knowledge-agents/tutor/USER.md` — Kaden's profile (active projects, current course, working-style preferences, boundary rules, em-dash ban)
- `CLAUDE.md` — five-layer architecture (Concept Content + Course Content + Scheduling + Search + Curriculum); rules updated for the course surface; file structure rewritten; agent table aligned with the 10 agents under `knowledge-agents/`; metadata schema expanded with Course/Section/Lecture frontmatter shapes
- `README.md` — How It Works now shows two flows (concept notes + course content); Links section adds EdX plan, tutor, and resilience pointers
- `plans/learning-system.md` — Session 16 contribution row + cross-ref to `plans/edx-courses.md`
- `.gitignore` — whitelist `.ava/course-import.mjs` (joins existing whitelist alongside schema, db module, curriculum-export)
- `.ava/learning-db.mjs` — migration logic extended: detects schema_info version, applies v1→v2 ALTERs and CREATEs idempotently

### Identity / continuity
- brain.db `identity.project.version` → 7.8.0
- brain.db `identity.tech.stack` updated for course layer
- brain.db `identity.active.course` set to ColumbiaX CU.OC.AI002
- brain.db decision #11 recorded

## [7.7.1] — 2026-04-22

**Milestone: repo flipped to PUBLIC.** Full 7-phase `/repo-release` audit executed against self. Issue [#2](https://github.com/Kadenvh/cheatSheets/issues/2) tracks remaining post-public housekeeping.

### Added
- `LICENSE` (MIT)
- `SECURITY.md` vulnerability reporting policy
- `CONTRIBUTING.md` contribution guide
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1)
- `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `END-GOAL.md` — long-term vision / north star document
- GitHub repo metadata: description, 10 topics (`learning-system`, `spaced-repetition`, `fsrs`, `obsidian`, `chromadb`, `rag`, `curriculum`, `arduino`, `elegoo`, `knowledge-management`)
- GitHub security features enabled post-public: Dependabot alerts, Dependabot security updates, secret scanning, push protection
- Branch protection on `main`: PR required, no force-push, no deletion, conversation resolution required

### Changed
- README: MIT license badge + section, dropped stale "73 notes" claim, rewrote File Structure section to reflect actual public surface (no `.ava/` DAL runtime, no `sessions/` chronicle, explicit note about what's *not* in the repo)
- `knowledge-retrieval/SKILL.md` and `vault-health/SKILL.md`: replaced retired `openClaw_Vault/Knowledge/{category}/` references with current `vault/Concepts/` flat layout + frontmatter categories. Dropped retired INDEX.md / GRAPH.md / Archive / inbox checks.
- `knowledge-agents/{qa,demo,tutor,architect}/TOOLS.md`: replaced personal home-infrastructure examples (specific LAN IP, admin username, camera names, speaker names) with generic placeholders
- `.gitignore`: added `dist/`, `build/`, `.output/`, `out/`, plus standard secret-file extensions for defense in depth
- GitHub repo: delete-branch-on-merge on; Issues on; Discussions on; Wiki off; Projects off

### Removed
- PE framework scaffolding (`.claude/` skill library, hooks, prompts; `.ava/` DAL runtime with `brain.db`, `lib/`, `handoffs/`, `migrations/`, `node_modules/`) from tracking. Each environment provisions its own via the PE template. Product content inside `.ava/` (curriculum schema, DB access, export utility) remains tracked via gitignore exception.
- `sessions/` personal development chronicle from tracking (kept local only).
- Superseded archive content: `cleanup-*` timestamped dirs, `CHEATSHEETS_PLAN.md`, `knowledge-learning-plan.md`, `learning-ontology-spec.md`, `cheatsheet-v5-schema-spec.md`, `learningHub/`, `ML/`, `NeuralNetworks/`, `quick-inserts/`. Only `archive/elegoo-mega-kit/` remains (load-bearing per `.ava/learning-schema.sql`).

### Fixed
- `CLAUDE.md §Vault Export` section replaced with `§Session Export` — prior section referenced DAL `vault-export` + `vault sync` subcommands that were removed in the v7 template (retired vault continuity layer).

### Infrastructure
- PE template pulled from v6.0.0-rc1 to v7.0.0-rc1: new `continuity` DAL subcommand, new `session-export` subcommand replacing retired `vault-export`, new runtime libs (`consolidate.mjs`, `continuity.mjs`, `session-export.mjs`), new `session-export-on-close` hook, new `portfolio-generation` skill.
- New `/repo-release` skill installed locally (trio: `SKILL.md` + `MANUAL.md` + `.prompts/repo-release.md`), translated from GitHub-MCP design to `gh` CLI + local scanners (gitleaks/trufflehog/regex fallback). Open note: promote to PE template for ecosystem-wide availability.

## [7.7.0] — 2026-04-06

### Added
- Lesson completion flow: complete → unlock next → start → metadata (auto-plan)

## [7.6.0] — 2026-04-05

### Added
- PDF tutorial viewer: iframe-based, Chrome-native, `#page=N` fragment targeting

## [7.5.1] — 2026-04-04

### Added
- ContentPanel code viewer (syntax-highlighted `.ino` files for ELEGOO lessons)

## [7.5.0] — 2026-04-01

### Added
- Curriculum layer: `learning.db` alongside `brain.db`, seeded with the 34-lesson ELEGOO Mega 2560 Arduino starter kit including tutorial-PDF page ranges and code samples per lesson
- Curriculum auto-plan flow
