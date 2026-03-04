---
name: readme
description: "Audit, create, and update directory README.md files across the project"
disable-model-invocation: true
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# README Maintenance

Audit, create, and update README.md files across the project.

## Instructions

1. Read the full readme template at `.prompts/readme.md` (relative to the project's `documentation/` folder).
2. Follow its 4-section protocol:
   - **Section 2:** Determine which directories need READMEs (3+ files, conventions, boundaries)
   - **Section 3:** Use the appropriate template (directory-level or spoke-level)
   - **Section 4:** Follow the execution protocol (audit first, then create/update)
   - **Section 6:** Apply the rules (be factual, concise, no duplication)

## Quick Criteria

**Create a README when:** 3+ files with shared purpose, non-obvious conventions, boundary directory (components/, hooks/, features/), a new agent would need context.

**Skip when:** Fewer than 3 files, parent README covers it, directory has its own full doc system.

## Always Audit First

List all directories → check which have READMEs → identify gaps → report findings → THEN create.

## Inline Fallback (if prompt file not found)

If `.prompts/readme.md` cannot be located, execute this minimal protocol:

1. **Audit.** List all directories in the project. For each, note: file count, whether a README exists, whether the directory has a clear shared purpose.
2. **Identify gaps.** Flag directories with 3+ files and no README. Prioritize boundary directories (components/, hooks/, features/, config/, utils/).
3. **Create directory READMEs.** Each should contain:
   - 1-2 sentence purpose statement
   - File table: `| File | Purpose |` for every file in the directory
   - Conventions (naming, patterns, how to add new items)
   - Key interfaces or exports other parts of the codebase depend on
4. **Create spoke READMEs** (sub-project roots). Include: what the sub-project is, quick start, architecture overview, key files, where to find detailed docs.
5. **Rules:** Be factual, not aspirational. Describe what IS, not what should be. Don't duplicate content that belongs in CLAUDE.md or the three-doc system. Keep READMEs under 100 lines.
