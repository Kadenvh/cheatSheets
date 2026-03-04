> **IF YOU ARE AN AGENT WORKING ON A PROJECT: THIS DOCUMENT IS NOT FOR YOU.**
> This is a system-level reference manual for the documentation framework itself — not project documentation.
> Continue past this file. Your working references are `CLAUDE.md`, `PROJECT_ROADMAP.md`, and `IMPLEMENTATION_PLAN.md`.
> If you need prompt templates, they are in `.prompts/`. If you need skills, they are in `.skills/`.

---

# Documentation System — Process Manual

**Version:** 1.0.0 | **Updated:** 2026-02-06
**Environment:** Claude Code (CLI/Agentic) — compatible with Claude.ai Projects

---

## I. PURPOSE

This manual defines the documentation and prompt system used across all projects. It serves three audiences:

1. **You (the developer):** Reference for when to use which prompt and how the system fits together
2. **Agents starting a new session:** Understanding of the documentation architecture before working
3. **Future projects:** This folder is copied into new project roots as the documentation scaffold

The system solves one core problem: **maintaining perfect context continuity across AI agent sessions.** Every prompt, every document, every convention exists to ensure that Session N+1 picks up exactly where Session N left off — with zero context loss, zero regressions, and zero "vibe coding."

---

## II. THE THREE-DOCUMENT ARCHITECTURE

Every project maintains three interconnected documentation files at its root. Each has a distinct purpose, audience, and update cadence. Information lives in **one** place — other documents may reference it, never duplicate it.

### CLAUDE.md — "The Agent's Working Reference"

| Attribute | Detail |
|:----------|:-------|
| **Purpose** | Everything an agent needs to be productive immediately |
| **Audience** | AI agents starting a new session |
| **Tone** | Prescriptive, action-oriented, reference-style |
| **Updates** | Every session (current state, recent changes) |
| **Auto-Read** | Claude Code reads this file automatically at session start |

**Contains:**
- Current version and status (prominent first line — agents see this before anything else)
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

**Design Principle:** CLAUDE.md should be self-sufficient for answering "What do I need to know to work on this right now?" If an agent reads only this file, they should be able to avoid critical mistakes and navigate the codebase.

Because Claude Code auto-reads CLAUDE.md, the most dangerous information goes first. Anti-patterns and critical rules should appear before file structure and commands — agents often start acting before finishing the full read.

---

### PROJECT_ROADMAP.md — "The Strategic Record"

| Attribute | Detail |
|:----------|:-------|
| **Purpose** | Long-term vision, architectural decisions, and version history |
| **Audience** | Humans and agents needing "why" context |
| **Tone** | Explanatory, historical, forward-looking |
| **Updates** | At milestones (new versions, major decisions) |

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

**Design Principle:** PROJECT_ROADMAP.md answers "How did we get here and where are we going?" It's the institutional memory — the document you read when you need to understand *why* something was built a certain way, not *how* to use it.

---

### IMPLEMENTATION_PLAN.md — "The Tactical Playbook"

| Attribute | Detail |
|:----------|:-------|
| **Purpose** | Current work, next steps, and deployment details |
| **Audience** | Agents continuing active development |
| **Tone** | Task-oriented, checklist-style, specific |
| **Updates** | Every session (task completion, new items) |

**Contains:**
- Current phase/sprint with status
- Task checklists (`[x]` completed, `[ ]` pending)
- Migration/deployment status tables
- Files modified (per version/session)
- Known issues and blockers
- Debugging notes and investigation status
- Environment setup and commands
- Handoff notes for next session

**Does NOT contain:**
- Full architectural explanations
- Version history (reference ROADMAP instead)
- Complete schema documentation
- Long-term feature speculation

**Design Principle:** IMPLEMENTATION_PLAN.md answers "What's done, what's broken, and what should I do next?" It's the most frequently updated document and serves as the session-to-session bridge.

---

### The Routing Rule

When deciding where a piece of information belongs, ask one question:

| "What question does this answer?" | It belongs in... |
|:-----------------------------------|:-----------------|
| "What must I never do?" | `CLAUDE.md` |
| "How do I run/build this?" | `CLAUDE.md` |
| "Where are the important files?" | `CLAUDE.md` |
| "Why was this decision made?" | `PROJECT_ROADMAP.md` |
| "How did we get to this version?" | `PROJECT_ROADMAP.md` |
| "Where is this project headed?" | `PROJECT_ROADMAP.md` |
| "What should I do next?" | `IMPLEMENTATION_PLAN.md` |
| "What's currently broken?" | `IMPLEMENTATION_PLAN.md` |
| "What happened last session?" | `IMPLEMENTATION_PLAN.md` |

When in doubt, use the expanded content redistribution table in the bootstrap prompt — it covers edge cases with specific examples.

---

## III. THE PROMPT SYSTEM

Four prompts live in `.prompts/` within the project root. They are generic by default and may be customized per-project by agents when appropriate. Each prompt serves a specific phase of the project lifecycle.

### Workflow Overview

```
[New Project]
  │
  ▼
DISCOVERY ──► BOOTSTRAP ──► DEVELOPMENT LOOP
(optional)    (one-time)     ┌──────────────────────┐
                             │  INIT ──► Work ──► CLOSEOUT  ◄── repeats
                             └──────────────────────┘
```

**Discovery** is optional — used when you need to brainstorm an idea or research a domain before committing to a project. Its output feeds into the bootstrap.

**Bootstrap** runs once per project to create the three core documents from scratch.

**Init → Work → Closeout** is the repeating session loop. Init establishes context, work happens, closeout persists state for the next session.

---

### Prompt Reference

#### `.prompts/discovery.md`

| Attribute | Detail |
|:----------|:-------|
| **When** | Before a project exists, or before a major new feature |
| **Input** | A vague idea, a domain to research, or both |
| **Output** | A structured brief that can be handed to a dev agent or fed into bootstrap |
| **Modes** | Brainstorm (idea → requirements) or Research (domain → findings) |

**Use when:**
- You have a project idea but haven't defined scope, constraints, or approach yet
- You need to investigate a technology, API, or domain before committing to an architecture
- You want structured output from a brainstorming session rather than freeform conversation

**Do NOT use when:**
- The project already has documentation (use init prompt instead)
- You already know exactly what to build (go straight to bootstrap)

---

#### `.prompts/documentation_bootstrap_prompt.md`

| Attribute | Detail |
|:----------|:-------|
| **When** | Once per project, at the very beginning |
| **Input** | Existing codebase, existing docs (if any), or discovery brief |
| **Output** | All three core documents created and populated |

**Use when:**
- Starting a brand new project
- Adopting this documentation system on an existing project that lacks it
- Performing a major documentation overhaul

**Do NOT use when:**
- Documents already exist and are current (use init/closeout loop instead)

---

#### `.prompts/generic_init_prompt.md`

| Attribute | Detail |
|:----------|:-------|
| **When** | Run once to generate a project-specific init prompt; that init prompt is then used at every session start |
| **Input** | The three core documents |
| **Output** | `{project_name}_init_prompt.md` — a compact (~300-400 word) context-establishing prompt |

**Use when:**
- After bootstrap completes (to create the first init prompt)
- The init prompt generator itself is rarely re-run; the *generated* init prompt is updated by the closeout process each session

**The generated init prompt's purpose:**
- Provides enough inline context to prevent critical mistakes before the agent reads full docs
- Establishes version, status, critical rules, quick reference, and engagement protocol
- Optimized for token efficiency — just enough to orient, not a full doc dump

**In Claude Code:** CLAUDE.md is auto-read, so the init prompt focuses on what CLAUDE.md doesn't cover: current task state, session-specific context, and the engagement protocol.

---

#### `.prompts/generic_closeout_prompt.md`

| Attribute | Detail |
|:----------|:-------|
| **When** | End of every working session |
| **Input** | Everything that happened during the session |
| **Output** | Updated CLAUDE.md, IMPLEMENTATION_PLAN.md, PROJECT_ROADMAP.md (if milestone), and init prompt |

**Use when:**
- Finishing any development session, no matter how small
- Even if "nothing major happened" — version dates and handoff notes still need updating

**Do NOT skip this.** Skipping closeout is the #1 cause of documentation drift. If you skip it, the next session starts with stale context and risks regressions.

---

## IV. SUBFOLDER README CONVENTION

As projects grow, requiring agents to scan every file becomes inefficient. The solution is **subfolder READMEs** — lightweight documentation files that describe a directory's contents without requiring the agent to read every file within it.

### Rules

1. **When to create:** Agents should create a `README.md` in any new major folder they add to the project. A "major folder" is one that contains multiple files serving a distinct purpose (e.g., `services/`, `components/`, `routes/`). Single-file utility folders don't need one.

2. **What it contains:**
   - A 1-2 sentence description of the folder's purpose
   - A directory tree of its contents
   - Brief descriptions of each file or subfolder (what it does, not how it works)
   - Key interfaces or exports that other parts of the project depend on

3. **What it does NOT contain:**
   - Full implementation details (that's what the source code is for)
   - Debugging notes or task lists (those belong in IMPLEMENTATION_PLAN.md)
   - Architectural rationale (that belongs in PROJECT_ROADMAP.md)

4. **Maintenance:** When the closeout process detects that new major folders were created during a session, the agent creates README.md files for them. When files within a folder change significantly, the relevant README should be updated.

### Template

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

### How Agents Use Them

When an agent needs to understand a part of the codebase, they read the subfolder README first. If the README provides enough context for the task, they don't need to read every file. If they need deeper understanding, the README tells them exactly which files to look at.

This is the scalability strategy — as a project grows from 10 files to 100+, agents navigate through READMEs rather than scanning everything.

---

## V. VERSION MANAGEMENT

### Semantic Versioning

All projects use semver (MAJOR.MINOR.PATCH):

| This Session Had... | Increment | Example |
|:---------------------|:----------|:--------|
| Bug fixes only, no new features | Patch | 1.0.0 → 1.0.1 |
| New features or endpoints | Minor | 1.0.x → 1.1.0 |
| Breaking changes, major refactors | Major | 1.x.x → 2.0.0 |

Version decisions are made during the closeout process. The closeout prompt includes a semver decision table to guide the agent.

### Cross-File Consistency

After every closeout, the following must match:
- Version number in `CLAUDE.md`, `PROJECT_ROADMAP.md`, `IMPLEMENTATION_PLAN.md`, and the init prompt
- "Last Updated" dates (all reflect the session date)
- No orphaned references to renamed or removed features
- Completed tasks marked `[x]`, not left as `[ ]`

The closeout prompt includes explicit verification checklists for these. If a version mismatch is detected at session start (via the init prompt or CLAUDE.md), it should be flagged and resolved before work begins.

---

## VI. CLAUDE CODE INTEGRATION

### Auto-Read Behavior

Claude Code automatically reads `CLAUDE.md` when entering a project directory. This means:
- CLAUDE.md is always the first thing the agent sees
- Critical rules and anti-patterns should be front-loaded (top of the file)
- The init prompt supplements CLAUDE.md — it doesn't replace it

### Session Flow in Claude Code

Typical session pattern:

```
> [Agent auto-reads CLAUDE.md]
> [You paste the init prompt or instruct the agent to read it]
> [Work happens]
> [You instruct: "Read .prompts/generic_closeout_prompt.md and execute it"]
```

For new projects:
```
> [You instruct: "Read .prompts/discovery.md — I want to brainstorm {idea}"]
> [Discovery output produced]
> [You instruct: "Read .prompts/documentation_bootstrap_prompt.md and execute it"]
> [Bootstrap creates all 3 docs]
> [You instruct: "Read .prompts/generic_init_prompt.md and generate the init prompt"]
```

### File Access

Claude Code accesses the local filesystem natively. All prompts in this system use standard file operations. No special configuration is required.

---

## VII. AGENT DISCIPLINE PRINCIPLES

These principles apply across all sessions regardless of which prompt is active:

### No Silent Decisions
Every deviation from established patterns, no matter how small, must be documented. If an agent makes a judgment call — a naming choice, an architectural shortcut, an edge case handling — it goes in the session notes for closeout to capture. The next agent needs to know what *actually* happened, not just what was planned.

### Plan Before Implementing
Agents should state their understanding of a task, identify affected files, flag concerns, and propose an approach before writing code. This is codified in the init prompt's engagement protocol and should be followed even when time pressure suggests skipping it.

### Respect Document Boundaries
Information lives in one place. If an agent finds themselves writing architectural rationale in IMPLEMENTATION_PLAN.md or task checklists in CLAUDE.md, they're putting content in the wrong file. The routing rule (Section II) resolves ambiguity.

### Flag and Stop on Ambiguity
When an agent encounters a situation not covered by the documentation — an undefined edge case, a missing specification, a contradictory instruction — the correct response is to flag it and ask, not to guess and implement. Guessing creates hidden decisions that the next session won't know about.

---

## VIII. DEPLOYING TO A NEW PROJECT

### New Project Setup

1. Copy the entire `prompts/` folder (or its contents) into the new project root, renaming it if desired (e.g., `docs/`, `documentation/`, or keeping the files at root level)
2. Optionally run the **Discovery** prompt if the project idea needs brainstorming or research
3. Run the **Bootstrap** prompt to create all three core documents
4. Run the **Init Prompt Generator** to create the project-specific init prompt
5. Begin the development loop: Init → Work → Closeout

### Adopting on an Existing Project

1. Copy `.prompts/` into the existing project root
2. If CLAUDE.md already exists, run the bootstrap prompt — it will analyze the existing content and redistribute it across the three-file system
3. If CLAUDE.md doesn't exist, bootstrap will create everything from the codebase analysis
4. Run the init prompt generator
5. Begin the development loop

### What Gets Customized Per-Project

The prompts in `.prompts/` are generic and designed to work across any project. However, agents may customize them when project-specific needs arise:
- The **closeout prompt** often gets a project-specific version (`{project}_closeout_prompt.md`) with additional guardrails extracted from CLAUDE.md's anti-patterns
- The **init prompt generator** produces a project-specific output (`{project}_init_prompt.md`) by design
- The **bootstrap and discovery prompts** typically remain generic

---

## IX. SYSTEM MAINTENANCE

### Updating This System

When improvements are discovered through real project usage:
1. Update the prompt in the `prompts/` source directory (this folder or wherever you keep the master copy)
2. Copy the updated prompt to active projects as needed
3. Update this manual if the change affects workflow or conventions

### Known Limitations

- **Context window size:** Very large projects may exceed what an agent can hold in context even with subfolder READMEs. For these, consider splitting the init prompt to focus on the active subsystem only.
- **Multi-agent concurrency:** This system assumes one agent at a time per project. If multiple agents work simultaneously, document merge conflicts become possible. This is not a current concern but would require a locking mechanism if it becomes one.
- **Prompt drift:** If project-specific closeout prompts diverge significantly from the generic version, improvements to the generic version won't propagate automatically. Periodically re-sync project-specific prompts with the generic source.

---

*This manual is the operating system for your development workflow. The prompts are the programs that run on it. The documents are the state it persists.*
