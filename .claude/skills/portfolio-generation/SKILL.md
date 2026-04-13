---
name: portfolio-generation
description: Generate portfolio project entries (keyMetric, description) or profile-level narrative (bio, summary, headline) in the user's voice. Grounded in brain.db identity/decisions, CLAUDE.md, active plans, and live repo state. Enforces strict voice rules (no em-dashes, no diplomatic reframes, no fabricated capabilities, no vanity metrics, no scaffolding bleed).
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# /portfolio-generation — Portfolio & Profile Narrative Generator

Generate portfolio or profile copy in the user's voice, grounded in the running project's authoritative sources.

## When to Use

- Generating a new portfolio `keyMetric` or `description` for a project
- Writing a profile `bio`, `summary`, or `headline`
- Rewriting existing copy the user hands over for revision
- Typically invoked after `/session-closeout` when the agent has maximum working knowledge of the project

## Protocol

Read `.claude/.prompts/portfolio-generation.md` for the full protocol. It covers:

- Hard voice rules (no em-dashes, no diplomatic reframes, no fabricated capabilities, no vanity metrics, no scaffolding bleed)
- Output formats (portfolio project entry JSON, profile bio/summary/headline JSON)
- Subject discipline (when scaffolding IS the product vs when it's just infrastructure)
- Grounding sources (brain.db identity, decisions, active plans, CLAUDE.md, README, route registry)
- Grounding depth (specificity test — the sentence could only fit THIS project)
- Voice anchor (match the existing `product.summary` density and register)
- Voice guidelines (density over polish, quantified claims only, anti-hype vocabulary ban)
- Surface-specific rules (keyMetric, description, bio, headline each have their own register)
- Iteration protocol (when a draft is rejected, update the template before redrafting)
- Anti-patterns (em-dash flow, diplomatic reframing, filler-cutting, rhythm smoothing, stale metrics, generic tech names)
- Verification trace (every quantified claim must trace to a concrete source)

## Output

A JSON object matching the requested output format. Only include claims that trace to a concrete source (brain.db key, decision ID, live query, source file, CLAUDE.md section).

## After Completion

- If the draft was rejected and the correction generalizes beyond this session, save the lesson as a feedback memory (see Iteration Protocol in the protocol file).
- Do not record per-generation results to brain.db — the output lives where the user places it (portfolio repo, LinkedIn, site copy), not in continuity state.
