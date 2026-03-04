# Documentation Bootstrap Prompt

You are establishing the foundational documentation system for this project. This is a high-stakes task—every future agent session depends on the quality and organization of what you create now.

---

## 1. THE THREE-FILE SYSTEM

You will create a documentation architecture consisting of three interconnected files, each with a distinct purpose and audience:

### CLAUDE.md — "The Agent's Working Reference"
**Purpose:** Everything an agent needs to be productive immediately
**Audience:** AI agents starting a new session
**Tone:** Prescriptive, action-oriented, reference-style
**Updates:** Every session (current state, recent changes)

**Claude Code Note:** This file is auto-read when an agent enters the project directory. Front-load the most critical information — anti-patterns and rules should appear before file structure and commands, because agents often begin acting before finishing the full read.

**Contains:**
- Current version and status (prominent first line)
- Critical rules and anti-patterns ("DO NOT" section)
- Quick start / running the project
- File structure with brief descriptions
- Schema/data model quick reference
- API endpoints or key functions
- Common tasks and commands
- Variable naming conventions
- Known issues blocking work

**Does NOT contain:**
- Version history beyond "recent changes"
- Architectural rationale or decision history
- Sprint planning or task checklists
- Future roadmap speculation

#### Discovering Critical Rules

The DO NOT section is the most important part of CLAUDE.md — it prevents mistakes before they happen. Use this table as a starting framework for identifying what belongs there:

| If the Project Has... | Consider These Anti-Patterns |
|:----------------------|:----------------------------|
| A database | No raw SQL in business logic, no schema changes without migration scripts |
| User-facing API | No breaking endpoint changes, validate all input, auth required on every endpoint |
| TypeScript | No `any` type, no `@ts-ignore` without justification comment |
| Frontend framework | No inline styles (if CSS framework exists), no direct DOM manipulation |
| Shared/published package | No lock file edits by hand, no unpinned dependency versions |
| Configuration or secrets | No secrets in code, no hardcoded environment-specific values |
| File I/O | No absolute paths, no synchronous file ops in request handlers |
| Multiple contributors | No force-pushing to main/master, no commits without descriptive messages |
| External integrations | No API calls without timeout/retry, no unhandled external failures |

| Any project | ALWAYS: summarize what changed and why after each task; when a tool fails, explain the error and next approach |
| Any project | DO NOT read, write, or reference OpenClaw config files: AGENTS.md, HEARTBEAT.md, IDENTITY.md, MEMORY.md, SOUL.md, TOOLS.md, USER.md, or the `memory/` directory. These belong to the orchestrating agent, not to Claude Code sessions. |

**This table is a seed, not a ceiling.** Every project has unique dangers. If you discover a project-specific anti-pattern during bootstrap that isn't listed here, add it to the DO NOT section and flag it in your closeout notes — it may warrant adding to this table for future bootstraps.

Additionally, scan the codebase for clues:
- **Comments with "HACK," "TODO," "FIXME," "WARNING"** → often indicate anti-patterns worth documenting
- **Try/catch blocks that swallow errors** → candidate for a DO NOT
- **Repeated patterns across files** → conventions that should be codified as ALWAYS rules
- **Existing linter/TypeScript configs** → rules the project already enforces that agents should respect

---

### PROJECT_ROADMAP.md — "The Strategic Record"
**Purpose:** Long-term vision, architectural decisions, and version history
**Audience:** Humans and agents needing "why" context
**Tone:** Explanatory, historical, forward-looking
**Updates:** At milestones (new versions, major decisions)

**Contains:**
- Project vision and goals
- Version history table (all releases)
- Architecture overview and diagrams
- Technology stack with rationale
- Data flow descriptions
- Design decisions and their reasoning
- Future roadmap (phases, planned features)
- Alternative approaches considered

**Does NOT contain:**
- Detailed API documentation
- Sprint-level task tracking
- File modification lists
- Debugging steps or known bugs

---

### IMPLEMENTATION_PLAN.md — "The Tactical Playbook"
**Purpose:** Current work, next steps, and deployment details
**Audience:** Agents continuing active development
**Tone:** Task-oriented, checklist-style, specific
**Updates:** Every session (task completion, new items)

**Contains:**
- Current phase/sprint with status
- Task checklists ([x] completed, [ ] pending)
- Migration/deployment status tables
- Files modified (per version/session)
- Known issues and blockers
- Debugging notes and investigation status
- Environment setup and commands
- Handoff notes for next session

**Does NOT contain:**
- Full architectural explanations
- Version history (just reference ROADMAP)
- Complete schema documentation
- Long-term feature speculation

---

## 2. THE ROUTING RULE

When deciding where a piece of information belongs, ask: **"What question does this answer?"**

| Question | Document |
|:---------|:---------|
| "What must I never do?" | `CLAUDE.md` |
| "How do I run/build this?" | `CLAUDE.md` |
| "Where are the important files?" | `CLAUDE.md` |
| "Why was this decision made?" | `PROJECT_ROADMAP.md` |
| "How did we get to this version?" | `PROJECT_ROADMAP.md` |
| "Where is this project headed?" | `PROJECT_ROADMAP.md` |
| "What should I do next?" | `IMPLEMENTATION_PLAN.md` |
| "What's currently broken?" | `IMPLEMENTATION_PLAN.md` |
| "What happened last session?" | `IMPLEMENTATION_PLAN.md` |

Information lives in **ONE** place. Other documents may reference it, never duplicate it.

### Detailed Content Redistribution

If an existing CLAUDE.md or other documentation exists, use this table to redistribute content:

| Content Type | Belongs In | Example |
|:-------------|:-----------|:--------|
| "Why we chose X over Y" | ROADMAP | "Native plugin vs Python approach" |
| "History of how we got here" | ROADMAP | "Originally tried carball, incompatible" |
| "Future phases/features" | ROADMAP | "Phase 2: ML integration" |
| Version history table | ROADMAP | "V1.0.0 - Initial release" |
| Technology stack rationale | ROADMAP | "Why C++ instead of Python" |
| Current blockers/bugs | IMPLEMENTATION | "CRASH: Plugin fails on load" |
| Debugging steps | IMPLEMENTATION | "Check logs at %APPDATA%..." |
| Task lists | IMPLEMENTATION | "Next steps: 1. Debug crash..." |
| Files modified | IMPLEMENTATION | "Modified: RLStatsExporter.cpp" |
| Alternative approaches | ROADMAP | "If plugin fails: use RLCSVPlugin" |
| Build commands | CLAUDE.md | "Run build.bat" |
| File structure | CLAUDE.md | Directory tree |
| Schema/data format | CLAUDE.md | CSV columns table |
| Configuration reference | CLAUDE.md | CVars table |
| Quick start | CLAUDE.md | "How to run" |
| Anti-patterns | CLAUDE.md | "DO NOT use old directory" |

**Key Principle:** CLAUDE.md should be self-sufficient for "what do I need to know to work on this right now?" Everything else distributes out.

---

## 3. DIRECTORY READMEs

As part of the initial documentation setup, create `README.md` files in significant project directories. READMEs let agents navigate the codebase without reading every file.

For detailed templates, criteria, and execution protocol, use the **readme prompt** (`.prompts/readme.md`). The short version:

- Create a README when a directory has **3+ files**, non-obvious **conventions**, or is a **boundary** (components/, hooks/, features/, etc.)
- Skip trivial folders, single-file directories, and directories with their own full documentation system
- Include: one-sentence purpose, contents table, conventions, how to add new items
- Be factual — describe what exists, not what should exist

---

## 4. EXECUTION PROCESS

### Step 1: Deep Project Analysis
Before writing anything, build comprehensive understanding:
- Read the existing CLAUDE.md completely (if one exists)
- Examine all source files to understand actual implementation
- Identify the project's current state (working? broken? in-progress?)
- List all technical decisions that were made
- Identify what's planned vs. what's speculation

### Step 2: Create PROJECT_ROADMAP.md
Start here because it establishes the "why" context.

**Template Structure:**

````markdown
# [Project Name] - Project Roadmap

**Last Updated:** [Date]
**Current Version:** [X.Y.Z]
**Status:** [One-line status]

---

## Vision & Goals

[2-3 paragraphs: What is this project? What problem does it solve? What's the end-state vision?]

---

## Version History

| Version | Date | Milestone |
|---------|------|-----------|
| V1.0.0 | YYYY-MM-DD | [Description] |

---

## V[Current] — [Version Name]

### Completed
- [Feature/fix completed]

### Architecture Decisions
- **[Decision]:** [Rationale]

---

## Architecture

### Technology Stack
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | X | [Why] |

### Data Flow
[Description or diagram of how data moves through the system]

---

## Future Roadmap

### Phase 2: [Name] (Planned)
- [Feature]
- [Feature]

### Phase 3: [Name] (Conceptual)
- [Ideas]

---

## Alternatives Considered

### [Alternative Approach]
- **Pros:** [...]
- **Cons:** [...]
- **Decision:** [Why rejected or kept as fallback]
````

### Step 3: Create IMPLEMENTATION_PLAN.md
Now document the tactical state.

**Template Structure:**

````markdown
# [Project Name] - Implementation Plan

**Created:** [Date]
**Updated:** [Date]
**Status:** [Current phase/sprint status]
**Current Phase:** [Phase name]

---

## Current Status

[Brief paragraph on where things stand RIGHT NOW]

### Blockers
- [ ] [Blocker 1 with details]
- [ ] [Blocker 2 with details]

---

## [Current Version] Tasks

### Completed
- [x] [Task]
- [x] [Task]

### In Progress
- [ ] [Task with status notes]

### Pending
- [ ] [Task]

---

## Debugging Notes

### [Issue Name]
**Status:** [Investigating/Blocked/Resolved]
**Symptoms:** [What's happening]
**Tried:**
1. [Approach] — [Result]
2. [Approach] — [Result]

**Next to try:**
- [Approach]

---

## Environment & Setup

### Prerequisites
- [Requirement]

### Build Commands
```bash
[commands]
```

### Verification
```bash
[how to verify it's working]
```

---

## Files Modified

### V[Current]
| File | Change |
|------|--------|
| [path] | [description] |

---

## Handoff Notes

[What the next agent needs to know to continue seamlessly]

### Recommended Next Steps
1. [Specific action]
2. [Specific action]

### Context They'll Need
- [Important context]
````

### Step 4: Refactor/Create CLAUDE.md
If an existing CLAUDE.md has content, slim it down to its proper scope. If starting fresh, populate from the analysis.

**Keep in CLAUDE.md:**
- Project overview (brief)
- Current version/status header (first line)
- Critical anti-patterns section (immediately after header)
- File structure
- Build/run instructions
- Schema/data format references
- Configuration reference
- Key technical details (SDK limitations, etc.)

**Move to ROADMAP (if redistributing):**
- Architecture rationale ("Why X instead of Y")
- Alternative approaches considered
- Development history and context
- Version history table

**Move to IMPLEMENTATION (if redistributing):**
- Current status details and crash reports
- Debugging steps and investigation notes
- "Next Steps" and TODO items
- File modification lists

**CLAUDE.md Template:**

````markdown
# [Project Name]

**Version:** X.Y.Z | **Status:** [Status] | **Updated:** [Date]

---

## Quick Reference

[1-2 sentence project description]

**Run:** `[command]`
**Build:** `[command]`
**Output:** `[path]`

---

## Critical Rules

### DO NOT
- [Anti-pattern with explanation]

### ALWAYS
- [Required practice]

---

## File Structure

```
[directory tree]
```

---

## [Data Format / Schema / API]

[Tables and quick reference for data structures]

---

## Configuration

[CVars, settings, environment variables]

---

## Key Technical Details

[SDK limitations, important discoveries, things that aren't obvious]

---

## Common Tasks

### [Task Name]
```bash
[commands]
```

---

## Links & Resources

- [Resource]: [URL]
````

#### Filled-In Example

Here's what a completed CLAUDE.md looks like for a typical Node.js API:

````markdown
# Task Queue API

**Version:** 1.2.0 | **Status:** Production | **Updated:** 2026-02-15

---

## Critical Rules

### DO NOT
- Use raw SQL — all queries go through the `db/queries/` layer
- Skip input validation — every endpoint uses `zod` schemas in `validators/`
- Commit `.env` — secrets are in Vault, local dev uses `.env.example`
- Use `any` type — all request/response bodies are typed in `types/api.ts`
- Modify `migrations/` after they've run in production — create a new migration

### ALWAYS
- Run `npm test` before pushing — CI will reject failures
- Use `AppError` class for thrown errors (not raw `throw`)
- Log with `logger.{level}()`, never `console.log`

---

## Quick Reference

REST API for async task processing. Express + TypeScript + PostgreSQL.

**Run:** `npm run dev`
**Build:** `npm run build`
**Test:** `npm test`
**Migrate:** `npm run db:migrate`

---

## File Structure

```
src/
├── routes/          # Express route handlers (one file per resource)
├── services/        # Business logic (no HTTP awareness)
├── db/
│   ├── queries/     # Parameterized SQL (no raw queries elsewhere)
│   └── migrations/  # Sequential migration files
├── validators/      # Zod schemas for request validation
├── types/           # Shared TypeScript types
└── middleware/       # Auth, error handling, request logging
```
````

This is 45 lines covering version header, 5 DO NOTs, 3 ALWAYSes, quick reference, and file structure. Note how the DO NOT section cites specific locations (`db/queries/`, `validators/`, `types/api.ts`) — rules are more enforceable when they point to where the right pattern lives.

### Step 5: Create Directory READMEs
Scan the project directory tree. For each significant directory, create a README.md. Use the **readme prompt** (`.prompts/readme.md`) for detailed templates and criteria.

### Step 6: Cross-Reference Validation
After creating all files:
- [ ] Version numbers match across all files
- [ ] Dates are consistent
- [ ] No content is duplicated (only referenced)
- [ ] CLAUDE.md is self-sufficient for immediate work
- [ ] CLAUDE.md front-loads critical rules (anti-patterns before file structure)
- [ ] ROADMAP tells the full "why" story
- [ ] IMPLEMENTATION has clear next actions
- [ ] Subfolder READMEs exist for major directories
- [ ] A new agent could start from CLAUDE.md alone

---

## 5. QUALITY STANDARDS

### CLAUDE.md Sizing

Target **80–150 lines** for most projects:
- Under 80 lines risks missing critical context an agent needs to avoid mistakes.
- Over 200 lines wastes context window — consider splitting project-specific rules into spoke-level `documentation/CLAUDE.md` files for sub-projects.
- When in doubt, err on the side of including a rule. A rule an agent reads and doesn't need costs 1 line; a rule an agent needed but didn't have costs a session.

### CLAUDE.md Quality Self-Check

After writing CLAUDE.md, run this test before moving on:

1. **Read ONLY your CLAUDE.md — nothing else.** Can you avoid every critical mistake in this project? If not, the DO NOT section is incomplete.
2. **Is the first thing an agent sees the most dangerous information?** Version header → critical rules → everything else. If file structure comes before anti-patterns, reorder.
3. **Could you build and run the project from just this file?** If not, the Quick Reference section is missing commands or prerequisites.
4. **Are convention rules separated from danger rules?** Naming conventions go lower in the file. "This will break production" goes at the top. Priority = consequence of violation.

### CLAUDE.md must answer:
- What is this project? (1-2 sentences)
- How do I run/build it?
- What are the critical rules I must follow?
- Where are the important files?
- What's the current state?

**PROJECT_ROADMAP.md must answer:**
- Why does this project exist?
- How did we get to the current state?
- What technical decisions were made and why?
- Where is this project headed?

**IMPLEMENTATION_PLAN.md must answer:**
- What's working and what's broken right now?
- What tasks are completed vs. pending?
- What debugging has been tried?
- What should I do next?

---

## 6. EXECUTE NOW

1. Read the existing CLAUDE.md and all project source files
2. Build a mental model of: current state, decisions made, work remaining
3. Create PROJECT_ROADMAP.md (vision -> history -> architecture -> future)
4. Create IMPLEMENTATION_PLAN.md (status -> tasks -> debugging -> handoff)
5. Refactor/Create CLAUDE.md (front-load critical rules, remove redistributed content)
6. Create subfolder READMEs for major directories
7. Validate cross-references and consistency

Take your time. These documents will be read hundreds of times. Quality matters more than speed.
