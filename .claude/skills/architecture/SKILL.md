---
name: architecture
description: "Design systems, write Architecture Decision Records (ADRs), or review existing architecture"
disable-model-invocation: true
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

1. Read the full architecture template at `.prompts/architecture.md` (relative to the project's `documentation/` folder).
2. Follow its protocol for the appropriate mode:
   - **Greenfield Design** → Requirements → components → interfaces → data flow → tech choices → design doc
   - **Extension Design** → Understand current architecture → design addition to fit existing patterns
   - **ADR** → Context → options → decision → rationale → consequences
   - **Architecture Review** → Score 6 dimensions → identify anti-patterns → recommend changes

## Key Rules

- **Decisions > diagrams.** A clear ADR outlasts any architectural diagram.
- **Boring is beautiful.** Simplest architecture that meets quality requirements wins.
- **Document the "why."** Future readers need context, not just the answer.
- **Design for the team you have.** Elegant architecture no one can maintain is worse than simple architecture everyone understands.

## Inline Fallback (if prompt file not found)

If `.prompts/architecture.md` cannot be located:

1. **Determine mode.** New system → Greenfield. Adding to existing → Extension. Specific decision → ADR. Evaluating quality → Review.
2. **Greenfield:** Clarify requirements. Prioritize quality attributes (scalability, maintainability, performance, security, reliability, cost). Break into components with single responsibilities. Define interfaces. Map data flow for top 3-5 operations. Choose technology (default to boring, document alternatives).
3. **ADR format:** Context (what's the issue) → Options (with pros/cons each) → Decision (what was chosen) → Rationale (why) → Consequences (positive, negative, neutral). Store in `documentation/decisions/`.
4. **Review:** Score separation of concerns, coupling, cohesion, extensibility, testability, operational clarity (each 1-5). Check for: god objects, distributed monolith, shared database, circular dependencies, leaky abstractions.
5. **Output:** Design doc in `documentation/plans/`, ADR in `documentation/decisions/`, review as structured report with scores and prioritized recommendations.
