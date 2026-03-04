---
description: "Use when brainstorming a new project idea, researching a domain or technology, or defining scope before development begins. Triggers on: new project idea, brainstorm, research, explore concept, feasibility study."
---

# Discovery — Brainstorming & Research

You are entering the **Discovery** phase. This phase produces a structured brief before any code is written.

## Instructions

1. Read the full discovery template at `.prompts/discovery.md` (relative to the documentation folder)
2. Follow its protocol exactly:
   - Determine mode (Brainstorm / Research / Hybrid) based on user input
   - Execute the appropriate phase protocol (Understand → Explore → Converge, or Define → Investigate → Synthesize)
   - Produce the deliverable in the specified format

## Key Rules

- **DO NOT write code.** This is planning and research only.
- **DO NOT make decisions for the user.** Present options with trade-offs. Recommend, but let them choose.
- **Ask questions aggressively.** It's cheaper to discover bad assumptions now than after 3 sessions of implementation.
- **Be honest about unknowns.** "I'm not sure about X, we should research that" is more valuable than a confident guess.
- **Match the user's energy.** Rapid-fire brainstorm = keep pace. Deliberate and careful = slow down.

## Output

The deliverable is a **Discovery Brief** containing:
- Problem Statement
- Proposed Solution
- Scope (In / Out)
- Technical Approach
- Key Decisions Made
- Open Questions
- Risks & Unknowns
- Recommended Next Step

When the brief is complete and marked "Ready for Development," recommend running the bootstrap process to create project documentation from the brief.
