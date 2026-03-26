---
name: bootstrap
description: "One-time documentation setup — creates CLAUDE.md and populates brain.db (or creates 3-file system if no DAL)"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Documentation Bootstrap

You are establishing the foundational documentation system for this project. Every future agent session depends on the quality of what you create now.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/bootstrap.md`.
2. Follow its 6-step execution process exactly:
   - **Step 1:** Deep project analysis — read everything before writing anything
   - **Step 2:** Create PROJECT_ROADMAP.md — vision, history, architecture, future
   - **Step 3:** Create IMPLEMENTATION_PLAN.md — status, tasks, debugging, handoff
   - **Step 4:** Create/refactor CLAUDE.md — front-load critical rules, slim to proper scope
   - **Step 5:** Create subfolder READMEs for major directories
   - **Step 6:** Cross-reference validation
   - **Step 7:** Initialize Obsidian vault folder (if vault exists at `/home/ava/Obsidian/Ava/`)

## File Placement

- `CLAUDE.md` → project root (auto-read by Claude Code)
- `PROJECT_ROADMAP.md` → `documentation/`
- `IMPLEMENTATION_PLAN.md` → `documentation/`

## Validation Checklist

Before finishing, verify:
- Version numbers match across all three files
- No content duplicated (only referenced)
- CLAUDE.md front-loads critical rules before file structure
- A new agent could start from CLAUDE.md alone

## Full Protocol

Detailed steps (always follow these):

1. **Analyze the project.** Read every file in the root. Identify: language/framework, architecture, entry points, existing docs, build commands, key dependencies.
2. **Create CLAUDE.md** at project root (target 80-300 lines). Include: version header (v1.0.0), critical rules/anti-patterns (use project characteristics to discover: database → no raw SQL, API → validate input, TypeScript → no `any`, etc.), file structure, build/run commands, schema/API reference. Front-load danger before reference. Quality check: read ONLY CLAUDE.md — can you avoid every critical mistake?
3. **Create PROJECT_ROADMAP.md** in `documentation/`. Include: project vision, version history table (starting at v1.0.0), architecture overview, tech stack with rationale, future roadmap.
4. **Create IMPLEMENTATION_PLAN.md** in `documentation/`. Include: current status, task checklists, known issues, handoff notes for next session.
5. **Create directory READMEs** for any directories with 3+ files and shared purpose.
6. **Validate.** Version numbers match. No content duplicated across files. Routing rule respected: "what to do now" → CLAUDE.md, "why this way" → ROADMAP, "what's next" → IMPL_PLAN.
7. **Vault init** (if `/home/ava/Obsidian/Ava/` exists). Create `{ProjectName}/{plans,schemas,sessions,architecture}` in vault. Seed initial architecture note from brain.db identity.
