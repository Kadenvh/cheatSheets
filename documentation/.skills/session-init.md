---
description: "Use at the start of every development session to establish context, verify documentation consistency, and orient before work begins. Triggers on: session start, starting work, picking up where we left off, continuing development."
---

# Session Initialization

You are starting a new development session. Establish full context before any work begins.

## Protocol

### 1. Read Documentation (In Order)

1. **CLAUDE.md** — already auto-loaded by Claude Code, but review fully for anti-patterns and current state
2. **PROJECT_ROADMAP.md** — focus on current phase, recent architectural decisions
3. **IMPLEMENTATION_PLAN.md** — focus on handoff notes, current tasks, active blockers

### 2. Version Consistency Check

Verify version number and "Last Updated" date match across:
- `CLAUDE.md`
- `PROJECT_ROADMAP.md`
- `IMPLEMENTATION_PLAN.md`
- `{project}_init_prompt.md` (if it exists)

**If mismatch detected:** Flag it and resolve before starting work.

### 3. Init Prompt Check

If `{project}_init_prompt.md` doesn't exist yet:
- Read `.prompts/generic_init_prompt.md` for the template structure
- Generate the project-specific init prompt

If it exists, verify it reflects current state. If stale, regenerate it from the three core docs rather than patching.

### 4. Engagement Protocol

Before ANY implementation:
1. State your understanding of the task
2. Identify affected files/components
3. Flag potential concerns or impacts
4. Propose approach and get confirmation
5. Only then proceed

**No Silent Decisions.** Every deviation from established patterns — naming choices, architectural shortcuts, edge case handling — must be documented explicitly.

### 5. Report Ready State

Summarize to the user:
- Current version and status
- Active blockers (if any)
- Recommended next task from IMPLEMENTATION_PLAN.md
- Ask what they'd like to work on this session
