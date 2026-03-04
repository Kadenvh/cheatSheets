---
name: migration
description: "Plan and execute data, schema, API, or infrastructure migrations with rollback safety"
disable-model-invocation: true
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Migration — Data, Schema & Breaking Change Management

Plan and execute migrations with zero data loss and clear rollback paths.

## Instructions

1. Read the full migration template at `.prompts/migration.md` (relative to the project's `documentation/` folder).
2. Follow its protocol:
   - Determine migration type (schema, data, API, infrastructure, dependency, config)
   - Define State A → State B with explicit delta
   - Assess impact and choose strategy
   - Design rollback plan before writing any migration code
   - Execute with monitoring and validation checkpoints
   - Validate post-migration with data queries

## Key Rules

- **Never migrate without a rollback plan.** If you can't roll back, you're not ready.
- **Expand-contract is the default.** Add new alongside old → migrate → remove old (in separate deployments).
- **Backup before everything.** Even if you're "sure" the migration is safe.
- **Validate with data, not hope.** Run validation queries before and after, compare results.

## Inline Fallback (if prompt file not found)

If `.prompts/migration.md` cannot be located:

1. **Define states.** Document current state (A) and target state (B) explicitly. List what's added, changed, and removed.
2. **Impact.** Who/what is affected? What breaks if it goes wrong? Can it be done without downtime?
3. **Strategy.** Default to expand-contract: Phase 1 (add new alongside old), Phase 2 (migrate data/consumers), Phase 3 (remove old — always a separate deployment).
4. **Rollback plan.** Define: what triggers rollback, how to reverse, how long rollback takes, what data is at risk.
5. **Execute.** Backup first. Run migration. Monitor progress. Validate at checkpoints (1%, 10%, 100%). If errors exceed threshold, rollback immediately.
6. **Validate.** Row counts match. No null values where expected. Data integrity checks pass. Application behavior verified. Monitor for 24 hours.
