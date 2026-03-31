---
name: architecture
description: "Design systems, write Architecture Decision Records (ADRs), or review existing architecture"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Architecture — System Design & Decision Records

Design new systems, extend existing ones, record decisions, or review architecture quality.

## Instructions

Follow the protocol below. For the full detailed version, read `.claude/.prompts/architecture.md`.
### Protocol:
   - **Greenfield Design** → Requirements → components → interfaces → data flow → tech choices → design doc
   - **Extension Design** → Understand current architecture → design addition to fit existing patterns
   - **ADR** → Context → options → decision → rationale → consequences
   - **Architecture Review** → Score 6 dimensions → identify anti-patterns → recommend changes

## Key Rules

- **Decisions > diagrams.** A clear ADR outlasts any architectural diagram.
- **Boring is beautiful.** Simplest architecture that meets quality requirements wins.
- **Document the "why."** Future readers need context, not just the answer.
- **Design for the team you have.** Elegant architecture no one can maintain is worse than simple architecture everyone understands.

## Full Protocol

Detailed steps:

1. **Determine mode.** New system → Greenfield. Adding to existing → Extension. Specific decision → ADR. Evaluating quality → Review.
2. **Greenfield:** Clarify requirements. Prioritize quality attributes (scalability, maintainability, performance, security, reliability, cost). Break into components with single responsibilities. Define interfaces. Map data flow for top 3-5 operations. Choose technology (default to boring, document alternatives).
3. **ADR format:** Context (what's the issue) → Options (with pros/cons each) → Decision (what was chosen) → Rationale (why) → Consequences (positive, negative, neutral). Record via `node .ava/dal.mjs decision add --title T --context C --chosen O --rationale R`.
4. **Review:** Score separation of concerns, coupling, cohesion, extensibility, testability, operational clarity (each 1-5). Check for: god objects, distributed monolith, shared database, circular dependencies, leaky abstractions.
5. **Output:** Design doc in `.claude/plans/`, ADR in brain.db via `decision add`, review as structured report with scores and prioritized recommendations.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "architecture: <what failed>" --type investigation --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- Record the action: `node .ava/dal.mjs action record "architecture: <summary>" --type investigation --outcome success`
- If this work changed CLAUDE.md rules or key commands, update CLAUDE.md
