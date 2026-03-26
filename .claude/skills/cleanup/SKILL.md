---
name: cleanup
description: "Reconcile brain.db against project documentation — populate empty databases, assign architecture scopes, detect drift, enforce coverage."
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
---

# Cleanup — DAL Reconciliation & Knowledge Hygiene

Comprehensive reconciliation of brain.db against project documentation and codebase. Handles first-run hydration (empty brain.db), ongoing maintenance (drift/gaps), and coverage enforcement (required entries present).

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/cleanup.md`.

### Protocol
   - Verify DAL prerequisites and detect mode (first-run vs ongoing)
   - Required identity extraction (project.name, version, vision, stack, build)
   - Required architecture extraction (system design patterns from codebase/docs)
   - Compare and reconcile (brain.db ↔ docs ↔ codebase)
   - Architecture health (scopes assigned, no empty values)
   - Decision health (relevant? scoped? missing?)
   - Session health (interrupted/crashed patterns)
   - Note hygiene (stale, completed)
   - Coverage report (required identity present? PASS/FAIL)
   - Present findings, wait for confirmation before changes

## Key Rules

- **Coverage is mandatory.** brain.db identity MUST have: project.name, project.version, project.vision, tech.stack. "Clean" with missing identity = FAIL.
- **Docs are truth, brain.db is the cache.** When they contradict, docs win.
- **Don't invent knowledge.** Only insert what's explicitly in docs or verifiable in codebase.
- **Dry-run first.** User confirms inserts and deletions.
- **Decisions matter most.** Architecture decisions prevent the next agent from relitigating settled questions.

## Full Protocol

Detailed steps:

1. **Check DAL.** `node .ava/dal.mjs status`. If fails, stop.

2. **Detect mode.** 0 identity entries with value 'UNSET' = first-run hydration. Otherwise ongoing.

3. **Extract identity.** Read CLAUDE.md → extract: `project.name`, `project.version`, `tech.stack`, `tech.build`. Read ROADMAP or brain.db decisions → extract: `project.vision`.
   ```bash
   node .ava/dal.mjs identity set "project.name" --value "..."
   ```

4. **Extract architecture.** Read codebase for system patterns, conventions, deployment topology.
   ```bash
   node .ava/dal.mjs arch set "key" --value "..." --scope project
   ```
   Scopes: `project` (system design), `ecosystem` (cross-project), `infrastructure` (ops), `convention` (working style).

5. **Extract decisions.** Every architectural choice → `node .ava/dal.mjs decision add ...`.

6. **Coverage report.** List each required identity entry as present/MISSING. Count architecture entries by scope. Report decisions. VERDICT: PASS only if all required identity present.
