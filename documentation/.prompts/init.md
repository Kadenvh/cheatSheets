# Session Initialization Prompt

You are starting a new session on this project. Before doing any work, orient yourself to the codebase, its documentation, and the current state.

---

## 1. FIND THE DOCUMENTATION SYSTEM

Every project in this ecosystem follows a hub-and-spoke documentation model. Your first job is to locate the docs and read them in order.

### Look For (In the Project Root)

| File | What It Tells You | Read Order |
|------|-------------------|------------|
| `CLAUDE.md` | Critical rules, anti-patterns, quick start, file structure, tech stack | **1st** (auto-loaded by Claude Code) |
| `documentation/PROJECT_ROADMAP.md` | Why decisions were made, version history, architecture, future direction | 2nd |
| `documentation/IMPLEMENTATION_PLAN.md` | Current tasks, what happened last session, blockers, handoff notes | **3rd** (start work from here) |
| `documentation/.prompts/` | Session lifecycle prompts (this file, bootstrap, discovery, closeout, readme) | Reference as needed |

If `CLAUDE.md` exists at the project root, it is auto-loaded — you already have it. Read it anyway to confirm you've internalized the critical rules.

If the project is a **spoke** (sub-project), it may have a slimmer `documentation/CLAUDE.md` with project-specific rules, plus a `README.md` at its root. The parent hub's docs cover the broader context.

### If Documentation Is Missing

- No `CLAUDE.md` → flag to user, offer to run the **bootstrap** prompt to create the documentation system
- No `IMPLEMENTATION_PLAN.md` → check if there's a README.md or other docs; ask the user for context on current state
- No `.prompts/` → the project hasn't adopted this system yet; proceed with whatever docs exist

---

## 2. ORIENT TO THE CODEBASE

After reading the docs, build a mental model by scanning the project structure:

1. **Read the file structure** — `CLAUDE.md` usually has a directory tree. If not, list the top-level directories.
2. **Find the READMEs** — significant directories have `README.md` files explaining their contents, conventions, and how to add new items. Read the ones relevant to your task.
3. **Identify the key files** — entry points, config files, and anything called out in the docs.
4. **Check for existing patterns** — naming conventions, file organization, coding style. Follow what's established.

---

## 3. VERIFY STATE

Before proceeding to any task, confirm:

- [ ] **Version consistency** — does the version in `CLAUDE.md` match `PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md`? If not, flag it.
- [ ] **Stale docs** — are the "Updated" dates recent? Stale docs may not reflect the actual codebase.
- [ ] **Blockers** — check `IMPLEMENTATION_PLAN.md` for known issues and blockers before starting work.
- [ ] **Build/run** — can you build and run the project with the commands in `CLAUDE.md`? If the user asks you to make changes, verify the project compiles first.

---

## 4. UNDERSTAND THE PROMPT SYSTEM

The `.prompts/` directory contains session lifecycle templates. You are reading one of them right now.

| Prompt | When To Use |
|--------|-------------|
| **init** (this file) | Start of every new session — orient, read docs, verify state |
| **discovery** | Before development — brainstorm, research, or define scope for a new feature |
| **bootstrap** | First time only — create the 3-file documentation system for a new project |
| **closeout** | End of session — update docs, version bump, handoff notes |
| **readme** | When directories need README.md files — audit, create, or update |

You don't need to create an init prompt. This IS the init prompt. The documentation system is already in place — your job is to read it, verify it, and start working.

---

## 5. ENGAGEMENT PROTOCOL

Before any implementation:

1. **State your understanding** of the task
2. **Identify affected files** and components
3. **Flag concerns** — potential impacts, ambiguities, risks
4. **Propose your approach** and get confirmation
5. **Then proceed**

**No silent decisions.** If you deviate from established patterns — naming, architecture, edge case handling — document it explicitly. The next session needs to know what actually happened vs. what was planned.

---

## 6. SURFACE INSIGHTS

Before waiting for instructions, proactively share what you've noticed:

1. **Inconsistencies or concerns.** Anything that contradicts itself across docs, smells wrong in the codebase, or seems like a latent issue. Don't wait to be asked.
2. **Top improvements.** 2-3 specific optimizations, refactors, or fixes you'd recommend based on what you've read. Be concrete — "the error handling in X could be simplified" not "code quality could improve."
3. **Questions that affect approach.** If anything is ambiguous, underspecified, or could go multiple ways, ask now. A 30-second question saves a 30-minute redo.
4. **Criticism.** If the documentation is stale, the architecture has debt, or a previous decision looks wrong in hindsight — say so. Directly.

Don't filter yourself. The human wants a collaborator who notices things, not an executor who waits for orders.

---

## 7. READ PROJECT NOTES

If the project has a notes, issues, or task tracking system (markdown files, in-app notes, TODO lists, etc.):

1. **Locate notes.** Check for: `notes/`, `TODO.md`, `NOTES.md`, issue tracker references in CLAUDE.md, or any notes directory/file mentioned in the documentation.

> **Ava ecosystem:** Notes are stored server-side in `.tab-notes.json` via the
> `GET /api/notes/all` endpoint (or `GET /api/notes/:tabKey` per tab). Categories:
> improvement, issue, bug, idea. Open notes are your primary task queue alongside
> IMPLEMENTATION_PLAN.md handoff notes.

2. **Read all open items.** Categorize what you find: bugs, improvements, feature requests, questions, stale/already-resolved items.
3. **Flag resolved items.** If a note describes something that's already been fixed or implemented (based on the current codebase), flag it for removal.
4. **Incorporate into session plan.** Merge relevant notes with the IMPLEMENTATION_PLAN handoff notes to build a prioritized plan for this session. Present it to the user.

If no notes system exists, skip this step.

---

## 8. START WORKING

Once oriented:

1. Present your ready state: version, blockers, insights, questions, and **a prioritized plan for this session**. **Await explicit confirmation before implementing.**
2. If the user has a specific request, proceed with that
3. If picking from the plan, propose your approach and get confirmation
4. If unclear, ask — it's cheaper to clarify now than to redo work later

**When tools or commands fail:** Explain what was attempted, the specific error, and your next approach. Never silently retry or move on without surfacing what happened.
