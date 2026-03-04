---
description: "Use at the end of every development session to persist state, update all documentation, and ensure the next session can continue with zero context loss. NEVER skip this. Triggers on: end of session, wrapping up, closeout, done for now, stopping work."
---

# Session Closeout

You are closing out a development session. This is the most critical documentation step — skipping it is the #1 cause of documentation drift and context loss between sessions.

## Instructions

1. Read the full closeout template at `.prompts/generic_closeout_prompt.md`
2. If a project-specific closeout exists (`{project}_closeout_prompt.md`), use that instead — it contains additional project-specific guardrails
3. Follow the full Part A through Part D process:

### Part A: Capture Session State
- Inventory all changes: features, bug fixes, files modified, API changes, schema changes, decisions made, issues discovered, new directories
- Determine version increment (patch / minor / major)

### Part B: Update Documentation
Update in this order (respecting the Routing Rule — information lives in ONE place):
1. **IMPLEMENTATION_PLAN.md** — tasks, files modified, blockers, handoff notes
2. **PROJECT_ROADMAP.md** — version history, architecture decisions (only if milestone)
3. **CLAUDE.md** — version header, recent changes, new anti-patterns, file structure
4. **Subfolder READMEs** — create for any new major directories

### Part C: Synchronize Prompts
- Update `{project}_init_prompt.md` with current state (or regenerate from the three docs)
- Update project-specific closeout guardrails if new critical rules were discovered

### Part D: Verification
- [ ] Version numbers match across ALL files
- [ ] Dates are consistent
- [ ] No contradictions between files
- [ ] No orphaned references
- [ ] Handoff notes provide enough context to continue next session
- [ ] New agent reading only CLAUDE.md would not make critical mistakes

## Version Increment Guide

| Session Had... | Increment | Example |
|---|---|---|
| Bug fixes only, no new features | Patch | 1.0.0 → 1.0.1 |
| New features or endpoints | Minor | 1.0.x → 1.1.0 |
| Breaking changes, major refactors | Major | 1.x.x → 2.0.0 |
