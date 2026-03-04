# Documentation Bootstrap Prompt

```
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

## 3. SUBFOLDER README CONVENTION

As part of the initial documentation setup, create a `README.md` in every major project subfolder (directories containing multiple files that serve a distinct purpose, e.g., `services/`, `components/`, `routes/`).

Each subfolder README should contain:
- A 1-2 sentence description of the folder's purpose
- A directory tree or table of its contents
- Brief descriptions of each file or subfolder (what it does, not how)
- Key interfaces or exports that other parts of the project depend on

**Template:**
```markdown
# {Folder Name}

{1-2 sentence purpose description.}

## Contents

| File/Folder | Description |
|:------------|:------------|
| `file.ts` | {What it does} |
| `subfolder/` | {What it contains} |

## Key Interfaces

- `functionName()` — {What it does, who calls it}
- `TypeName` — {What it represents}
```

These READMEs allow future agents to understand a directory's purpose without reading every file. They are the project's scalability strategy — as the codebase grows, agents navigate through READMEs rather than scanning everything.

Skip READMEs for trivial folders (single-file utilities, config-only directories, standard framework folders like `node_modules/` or `.git/`).

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
```markdown
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
```

### Step 3: Create IMPLEMENTATION_PLAN.md
Now document the tactical state.

**Template Structure:**
```markdown
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
```

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
```markdown
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
```

### Step 5: Create Subfolder READMEs
Scan the project directory tree. For each major subfolder, create a README.md following the template in Section 3.

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

**CLAUDE.md must answer:**
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
3. Create PROJECT_ROADMAP.md (vision → history → architecture → future)
4. Create IMPLEMENTATION_PLAN.md (status → tasks → debugging → handoff)
5. Refactor/Create CLAUDE.md (front-load critical rules, remove redistributed content)
6. Create subfolder READMEs for major directories
7. Validate cross-references and consistency

Take your time. These documents will be read hundreds of times. Quality matters more than speed.
```
