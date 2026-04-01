---
name: criticism
description: "Deep adversarial strategic analysis — find what's broken, fragile, missing, misaligned, or wasted. Structured review with severity ratings and actionable findings."
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
  - WebSearch
---

# /criticism — Adversarial Strategic Review

Deep analysis of the project's architecture, decisions, direction, and assumptions. Unlike /explore (divergent) or /cleanup (reconciliation), /criticism is adversarial: actively look for what's wrong.

## Instructions

1. **Load context.** Read brain.db strategic entries, active decisions, open notes, recent session history, and active plans. Use `dal_retrieve` MCP tool if available, otherwise `node .ava/dal.mjs context --scope full`.

2. **Run 5 analysis lenses** (all required):

   ### Lens 1: Structural
   - Single points of failure (what breaks everything if it goes down?)
   - Missing redundancy / backup gaps
   - Tight coupling between components that should be independent
   - Dead code, unused endpoints, vestigial features

   ### Lens 2: Strategic
   - Alignment between stated vision (brain.db `product.where`) and actual implementation
   - Priority stack (brain.db `product.priority-stack`) vs. where time is actually spent
   - Features built that serve no user need
   - Goals stated but never progressed

   ### Lens 3: Temporal
   - Decisions that made sense 20 sessions ago but don't scale
   - Technical debt accumulating faster than it's resolved
   - Patterns that work at current scale but will break at 2x/10x
   - Stale architecture entries describing past state as current

   ### Lens 4: Adversarial
   - What breaks if ChromaDB goes down? If brain.db corrupts? If OpenClaw gateway fails?
   - What assumptions are untested? What if they're wrong?
   - What would a skeptical reviewer say about the architecture?
   - Security: what's exposed that shouldn't be?

   ### Lens 5: Opportunity
   - Biggest thing we're NOT doing that we should be
   - Capabilities that exist but aren't leveraged (infrastructure built but unused)
   - Low-effort / high-impact improvements hiding in plain sight
   - External factors (market, tools, ecosystem) that change the calculus

3. **Produce findings.** For each finding:
   - **Severity:** critical / high / medium / low / info
   - **Lens:** which of the 5 lenses surfaced it
   - **Finding:** what's wrong (1-2 sentences)
   - **Evidence:** how you verified it
   - **Recommendation:** what to do about it

4. **Record to brain.db.**
   - Critical/high findings → `node .ava/dal.mjs note add "<finding>" --category improvement`
   - Architecture insights → `node .ava/dal.mjs arch set "criticism.<key>" --scope project --value "<finding>"`
   - If a finding warrants a decision → `node .ava/dal.mjs decision add --title "<finding>" --context "<evidence>" --chosen "TBD" --rationale "<recommendation>"`

5. **Output a structured report** with findings grouped by severity, then by lens.

## When to Use

- At the start of a strategic planning session
- After completing a major milestone (before moving to next phase)
- When something feels off but you can't articulate why
- Periodically (every ~10 sessions) as a health check
- When the user explicitly wants honest assessment of the system

## What This Is NOT

- Not a code review (use /code-review for that)
- Not a security audit (use the security-audit system for that)
- Not cleanup/reconciliation (use /cleanup for that)
- Not exploration (use /explore for divergent thinking)

This is structured adversarial analysis. Be direct. Be specific. Don't soften findings.
