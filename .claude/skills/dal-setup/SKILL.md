---
name: dal-setup
description: "Set up, configure, and reference the DAL (brain.db) — sessions, identity, architecture, decisions, notes, prompts, plans, knowledge base, pipeline."
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
---

# DAL Setup — Durable Agentic Layer

Set up and configure the DAL persistent memory system (brain.db). Covers the full stack: 32 tables in 4 groups (core memory, content, system, learning).

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/dal-setup.md`.
2. Follow its protocol for setup, CLI reference, and verification.

## Key Commands (Quick Reference)

```bash
node .ava/dal.mjs status                          # Health check
node .ava/dal.mjs context --role general|dev      # Context payload
node .ava/dal.mjs session start "description"     # Start session
node .ava/dal.mjs identity list                   # Project identity
node .ava/dal.mjs arch set "key" --value "v" --scope project  # Architecture knowledge
node .ava/dal.mjs note list                       # Task queue
node .ava/dal.mjs pipeline skills core            # Core skills
node .ava/dal.mjs verify                          # 8-layer verification
```

## Full Protocol

Detailed steps:

1. **Check if DAL exists.** Look for `.ava/dal.mjs` and `.ava/brain.db`. If missing, the DAL needs to be deployed — this requires copying `.ava/` files from the PE canonical source.

2. **Bootstrap if needed.**
   ```bash
   cd .ava && npm install
   node .ava/dal.mjs bootstrap
   node .ava/dal.mjs status
   ```

3. **Verify hook.** Check that `.claude/hooks/session-context.js` exists and `.claude/settings.json` includes a `SessionStart` hook entry pointing to it.

4. **Test the lifecycle.**
   ```bash
   node .ava/dal.mjs session start "test"
   node .ava/dal.mjs arch set "test" --value "works" --scope project
   node .ava/dal.mjs context
   node .ava/dal.mjs session close
   ```

5. **Key concepts.** brain.db has 32 tables in 4 groups: core memory (identity, architecture, sessions, decisions, notes, entity_links, memory_triggers), content (prompts, plans, knowledge_base), system (pipeline, agent_actions, agent_metrics, agent_feedback), learning (concepts, prerequisites, learning_sessions, session_sections, reviews, mastery_state, streaks, learning_events, learning_preferences, lessons). Schema v12 adds Active DAL: importance scoring, access tracking, embedded_at columns, cross-entity links, and memory triggers. Architecture entries have scopes: `project` (always injected), `ecosystem` (cross-project), `infrastructure` (ops/deployment), `convention` (working style).
