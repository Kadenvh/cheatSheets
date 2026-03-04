---
name: discovery
description: "Brainstorm a new project idea or research a domain/technology before development begins"
disable-model-invocation: true
allowed-tools:
  - Read
  - WebSearch
  - WebFetch
  - Bash
---

# Discovery — Brainstorming & Research

You are entering the Discovery phase. This produces a structured brief before any code is written.

## Instructions

1. Read the full discovery template at `.prompts/discovery.md` (relative to the project's `documentation/` folder).
2. Follow its protocol for the appropriate mode:
   - **Brainstorm** → Idea is vague, need to define scope/constraints/approach
   - **Research** → Need to understand a domain, technology, or API before committing
   - **Hybrid** → Interleave brainstorming with research as needed

## Key Rules

- **DO NOT write code.** This is planning and research only.
- **DO NOT make decisions for the user.** Present options with trade-offs.
- **Ask questions aggressively.** Cheaper to find bad assumptions now than 3 sessions later.
- **Be honest about unknowns.**

## Completion

When the brief is marked "Ready for Development," recommend running `/bootstrap` to create the project documentation.

## Inline Fallback (if prompt file not found)

If `.prompts/discovery.md` cannot be located, execute this minimal protocol:

1. **Determine mode.** Ask what the user has: a vague idea (Brainstorm), a domain to investigate (Research), or both (Hybrid).
2. **Brainstorm mode:** Ask targeted questions about goals, users, constraints, scale, and timeline. Challenge assumptions. Explore trade-offs. Converge on a concrete scope with defined boundaries, non-goals, and success criteria.
3. **Research mode:** Map the landscape — key players, approaches, trade-offs. Investigate APIs, libraries, or frameworks relevant to the domain. Produce a findings document with recommendations and risks.
4. **Produce a brief.** Structured output containing: problem statement, proposed solution, technical approach, key decisions to make, risks, and estimated scope. Mark it "Ready for Development" or "Needs More Research" with specific open questions.
5. **DO NOT write code or create project files.** Discovery produces a document, not a codebase.
