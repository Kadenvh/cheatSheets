---
name: explore
description: "Non-implementation thinking: mid-project divergent exploration, pre-dev brainstorming, or domain research. Use --discovery for structured pre-dev briefs."
allowed-tools:
  - Read
  - Bash
  - WebSearch
  - WebFetch
---

# Explore — Thinking Before & During Development

Unified skill for all non-implementation thinking: mid-project exploration, pre-dev brainstorming, and domain research.

## Instructions

1. Load the exploration prompt:
   - Read `.claude/.prompts/explore.md` (relative to project root)
2. Determine mode from arguments or context:
   - **`/explore`** — Mid-project divergent thinking. No deliverables, no decisions. Think freely.
   - **`/explore --discovery`** — Pre-dev brainstorming. Produces a structured Discovery Brief.
   - **`/explore --research`** — Domain/technology investigation. Produces findings document.

## Key Rules

**Explore mode (default):**
- Nothing commits. Ideas are possibilities, not decisions. No DAL entries, no task creation.
- Share your own perspective. "I think X," not "one option is X."
- Follow the energy. No convergence pressure.

**Discovery/Research mode:**
- DO NOT write code. Planning and research only.
- Research first — find answers yourself before asking.
- Be honest about unknowns.
- Produce a structured brief when done.

## Inline Fallback (if prompt file not found)

**Explore mode:** Synthesize project state in 3-5 sentences. Question assumptions, surface opportunities, bring 3-5 genuine open questions. Open with the most interesting tension.

**Discovery mode:** Determine if brainstorm (vague idea), research (domain investigation), or hybrid. Explore the space, then converge into a Discovery Brief: problem, solution, scope, technical approach, decisions, risks, next step.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "explore: <what failed>" --type investigation --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- Record the exploration: `node .ava/dal.mjs action record "explore: <summary>" --type investigation --outcome success`
