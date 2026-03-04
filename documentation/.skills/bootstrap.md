---
description: "Use once per project to create the three-document architecture (CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md) from scratch, or to adopt the documentation system on an existing project that lacks it."
---

# Documentation Bootstrap

You are establishing the foundational documentation system for this project. Every future agent session depends on the quality and organization of what you create now.

## Instructions

1. Read the full bootstrap template at `.prompts/documentation_bootstrap_prompt.md`
2. Follow its 6-step execution process exactly:
   - **Step 1:** Deep project analysis (read everything before writing anything)
   - **Step 2:** Create PROJECT_ROADMAP.md (vision, history, architecture, future)
   - **Step 3:** Create IMPLEMENTATION_PLAN.md (status, tasks, debugging, handoff)
   - **Step 4:** Create/refactor CLAUDE.md (front-load critical rules, slim to proper scope)
   - **Step 5:** Create subfolder READMEs for major directories
   - **Step 6:** Cross-reference validation

## Critical Principles

- **The Routing Rule:** Information lives in ONE place. Ask "what question does this answer?" to determine which file.
- **CLAUDE.md** answers: "What do I need to know to work on this right now?"
- **PROJECT_ROADMAP.md** answers: "How did we get here and where are we going?"
- **IMPLEMENTATION_PLAN.md** answers: "What's done, what's broken, what's next?"
- **CLAUDE.md goes in the project root directory**, not inside the documentation folder.

## File Placement

```
project-root/
├── CLAUDE.md                      ← project root (auto-read by Claude Code)
├── documentation/
│   ├── .prompts/                  ← prompt templates
│   ├── .skills/                   ← skill library
│   ├── PROJECT_ROADMAP.md         ← stays in documentation/
│   └── IMPLEMENTATION_PLAN.md     ← stays in documentation/
```

## Validation Checklist

Before finishing, verify:
- [ ] Version numbers match across all three files
- [ ] No content duplicated across files (only referenced)
- [ ] CLAUDE.md is self-sufficient for immediate work
- [ ] CLAUDE.md front-loads critical rules before file structure
- [ ] A new agent could start from CLAUDE.md alone

When complete, recommend generating the project-specific init prompt.
