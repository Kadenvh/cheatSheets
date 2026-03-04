# README Maintenance Prompt

Audit, create, and update README.md files across the project. READMEs are how agents and developers navigate the codebase without reading every file.

---

## 1. THE DOCUMENTATION HIERARCHY

Projects follow a hub-and-spoke model. READMEs exist at two levels:

**Spoke-level README** — At the root of a sub-project (e.g. `ava_hub/README.md`). Covers: what the project is, quick start, architecture overview, key files, and where to find detailed docs.

**Directory-level README** — Inside significant directories (e.g. `src/components/README.md`). Covers: what the directory contains, file-by-file table, conventions, and how to add new items.

READMEs do NOT replace the full documentation system (`CLAUDE.md` + `PROJECT_ROADMAP.md` + `IMPLEMENTATION_PLAN.md`). They complement it by providing quick navigation at the directory level.

---

## 2. WHEN TO CREATE A README

**Create one when:**
- A directory contains **3+ files** with a shared purpose
- A directory has **conventions** that aren't obvious from filenames
- A new agent would need context to work in the directory
- The directory is a **boundary** (components/, hooks/, features/, config/, etc.)

**Skip when:**
- Fewer than 3 files and their purpose is obvious
- A parent README already covers this directory adequately
- The directory has its own full documentation system (CLAUDE.md + documentation/)

---

## 3. README TEMPLATES

### Directory Level

For directories within a project:

````markdown
# {Directory Name}

{One sentence: what this directory contains and its role in the project.}

## Contents

| File/Folder | Purpose |
|-------------|---------|
| `Example.tsx` | {Brief description} |
| `utils/` | {Brief description} |

## Conventions

- {Naming convention}
- {File structure convention}
- {Pattern convention}

## Adding New Items

{Step-by-step: how to add a new file. Reference registry files, naming patterns, or templates.}
````

### Spoke Level

For sub-project roots:

````markdown
# {Project Name}

{2-3 sentences: what this project is, what it does, who it's for.}

**Version:** {X.Y.Z} | **Status:** {status}

## Quick Start

```bash
{install/run commands}
```

## Architecture

{Brief structure overview. Point to key directories.}

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | {Entry point} |

## Documentation

- `documentation/CLAUDE.md` — agent rules and anti-patterns
- Root `CLAUDE.md` — project-wide reference
- Root `documentation/` — roadmap and implementation plan
````

---

## 4. EXECUTION PROTOCOL

### Audit Phase (Always Do This First)

1. List all directories at the target level
2. Check which already have a README.md
3. Identify directories that need one (per Section 2 criteria)
4. **Report findings to the user before creating anything**

### Creation Phase

1. Read the directory contents — every file
2. Identify conventions from existing code (naming patterns, export styles, etc.)
3. Write the README following the appropriate template
4. Include **only information that is currently true** — no aspirational content

### Update Phase

1. Read the existing README.md
2. Diff against actual directory contents
3. Add new files, remove deleted ones, update descriptions
4. Preserve any hand-written sections (marked with `<!-- custom -->` comments)

---

## 5. RELATIONSHIP TO OTHER DOCS

READMEs are part of a larger documentation system. Here's how they relate:

| Document | Scope | Updates |
|----------|-------|---------|
| `CLAUDE.md` | Project-wide rules, anti-patterns, quick reference | Every session |
| `PROJECT_ROADMAP.md` | Strategic decisions, version history, architecture | At milestones |
| `IMPLEMENTATION_PLAN.md` | Current tasks, handoff notes, blockers | Every session |
| **READMEs** | Per-directory navigation and conventions | When directory contents change |
| `.prompts/` | Session lifecycle templates (including this file) | When the process evolves |

**CLAUDE.md should reference the README system** — it tells agents that READMEs exist and to read the relevant ones. The READMEs themselves provide the detail.

**The closeout prompt checks for new directories** — Step 6 of closeout creates READMEs for any directories added during the session.

---

## 6. RULES

- **Be factual.** Describe what exists, not what should exist.
- **Be concise.** READMEs should be scannable in under 30 seconds.
- **Don't duplicate.** If a parent README covers something, reference it instead of repeating.
- **Don't over-document.** A 3-file utility directory needs 5 lines, not 50.
- **Keep tables tight.** One-line descriptions per entry. Details live in the files themselves.
- **Update, don't rewrite.** When maintaining, preserve existing structure and custom content.
- **Match the project's voice.** If the project uses casual language, the README should too.
