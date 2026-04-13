# archive/

**Status:** Scoped exception to the PE v7 "no root archive/" rule.

This directory holds one load-bearing subdirectory:

- `elegoo-mega-kit/` — ELEGOO Mega 2560 starter-kit reference material (code samples, tutorial.pdf). Consumed directly by `.ava/learning-schema.sql` via 34+ hard-coded paths (`archive/elegoo-mega-kit/tutorial.pdf#page=...`, `archive/elegoo-mega-kit/code/Lesson N ...`). These paths are materialized into `learning.db` at seed time and referenced by the curriculum UI.

**Do not delete `elegoo-mega-kit/`.** Moving it requires updating `.ava/learning-schema.sql` and writing a `learning.db` migration to rewrite existing rows — track that as a separate planned change, not a topology pass.

## What used to live here (retired 2026-04-13, Session 15)

- `cleanup-2026-03-30/`, `cleanup-2026-03-31/` — transient session cleanup artifacts
- `CHEATSHEETS_PLAN.md`, `knowledge-learning-plan.md`, `learning-ontology-spec.md`, `cheatsheet-v5-schema-spec.md` — superseded by `plans/learning-system.md`
- `learningHub/` — legacy static HTML prototype, unreferenced
- `ML/`, `NeuralNetworks/` — ad-hoc topic folders, unreferenced, pre-vault era
- `quick-inserts/` — 69 JSON artifacts from the retired curator-as-gateway workflow (all `recuratedAt`-stamped, content already in `vault/Concepts/`)
