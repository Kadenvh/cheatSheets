---
name: discovery
description: "Brainstorm a new project idea or research a domain/technology before development begins"
allowed-tools:
  - Read
  - WebSearch
  - WebFetch
  - Bash
---

# Discovery — Brainstorming & Research

You are entering the Discovery phase. This produces a structured brief before any code is written.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/discovery.md`.
### Protocol:
   - **Brainstorm** → Idea is vague, need to define scope/constraints/approach
   - **Research** → Need to understand a domain, technology, or API before committing
   - **Hybrid** → Interleave brainstorming with research as needed

## Key Rules

- **Research-first approach.** Perform thorough autonomous discovery, analysis, and breakdown before presenting findings. Explore everything available — files, APIs, existing code, docs, web resources. Present organized findings with analysis. Ask only when genuinely ambiguous (multiple valid paths with no clear winner).
- **DO NOT write code.** This is planning and research only.
- **DO NOT ask questions you can answer yourself.** If information exists in the codebase, docs, or is searchable — find it first. Present what you found, then ask about the remaining unknowns.
- **Be honest about unknowns.** Flag what you couldn't determine and why.

## Completion

When the brief is marked "Ready for Development," recommend running `/bootstrap` to create the project documentation.

## Full Protocol

Detailed steps (always follow these):

1. **Determine mode.** Infer from context whether this is Brainstorm (vague idea), Research (domain investigation), or Hybrid. If truly unclear, ask.
2. **Brainstorm mode:** Research the problem space first — existing solutions, prior art, relevant tech. Then present goals, constraints, scale, and timeline analysis. Challenge assumptions with evidence. Converge on a concrete scope with defined boundaries, non-goals, and success criteria.
3. **Research mode:** Map the landscape — key players, approaches, trade-offs. Investigate APIs, libraries, or frameworks relevant to the domain. Produce a findings document with recommendations and risks.
4. **Produce a brief.** Structured output containing: problem statement, proposed solution, technical approach, key decisions to make, risks, and estimated scope. Mark it "Ready for Development" or "Needs More Research" with specific open questions.
5. **DO NOT write code or create project files.** Discovery produces a document, not a codebase.
