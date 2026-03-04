# Session Closeout Prompt

Perform end-of-session documentation updates and synchronize project prompts with current state.

---

## PART A: CAPTURE SESSION STATE

### Step 1: Inventory Changes (Do This First)

Before touching any file, explicitly enumerate what happened:

**Features/Implementations:**
- (list each with one-line description)

**Bug Fixes:**
- (list each with root cause if known)

**Files Modified:**
- `path/to/file` — (what changed)

**API/Interface Changes:**
- (new/modified endpoints or functions)

**Schema/Data Changes:**
- (database or data structure changes)

**Decisions Made:**
- (architectural or design choices — include ANY judgment calls or deviations from the original plan, no matter how small)

**Issues Discovered (Not Fixed):**
- (for next session's handoff)

**New Directories Created:**
- (list any new major folders added this session — these will need README.md files)

---

### Step 2: Determine Version Increment

| This Session Had... | Increment | Example |
|---------------------|-----------|---------|
| Only bug fixes, no new features | Patch | 1.0.0 -> 1.0.1 |
| New features or endpoints | Minor | 1.0.x -> 1.1.0 |
| Breaking changes, major refactors | Major | 1.x.x -> 2.0.0 |

**New Version:** ___________

---

## PART B: UPDATE DOCUMENTATION

### Document Boundaries (Respect the Routing Rule)

Each piece of information belongs in exactly one file. Use this guide:

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

**Expanded reference:**

| File | Contains | Does NOT Contain |
|------|----------|------------------|
| `CLAUDE.md` | Current version, quick start, schema/data reference, anti-patterns, commands | Version history, sprint tasks, architecture rationale |
| `PROJECT_ROADMAP.md` | Version history, architecture decisions, tech stack, future roadmap | Sprint checklists, file modification lists, debugging notes |
| `IMPLEMENTATION_PLAN.md` | Current tasks, files modified, blockers, debugging notes, handoff | Full schema docs, architectural philosophy |

**Rule:** Information lives in ONE file. Reference from others, never duplicate.

---

### Step 3: Update IMPLEMENTATION_PLAN.md

- [ ] Add new version section at top (copy structure from previous)
- [ ] Mark completed tasks with [x]
- [ ] Add "Files Modified (V{X.Y.Z})" section
- [ ] Update header: "Updated" date and "Status" line
- [ ] Add new issues to "Known Issues" or "Blockers"
- [ ] Refresh "Handoff Notes" for next session
- [ ] Include any "silent decisions" or deviations documented during the session

---

### Step 4: Update PROJECT_ROADMAP.md (if milestone)

- [ ] Add row to VERSION HISTORY table
- [ ] Add "V{X.Y.Z} COMPLETE" section with feature descriptions
- [ ] Update header: version, "Last Updated" date
- [ ] Document any architectural decisions made (with rationale)

---

### Step 5: Update CLAUDE.md

Remember: CLAUDE.md is auto-read by Claude Code — front-load the most critical information.

- [ ] Update header: Version, Last Updated, Status (this is the very first line agents see)
- [ ] Update "Recent Changes" section
- [ ] Add new anti-patterns to "DO NOT" section if discovered
- [ ] Update schema/API reference if changed
- [ ] Update file structure section if new directories were added
- [ ] Update commands if build/run process changed

---

### Step 6: Create Subfolder READMEs (if new directories were added)

If new major folders were created during this session (listed in Part A, Step 1):
- [ ] Create a `README.md` in each new major directory
- [ ] Include: 1-2 sentence purpose, contents table, key interfaces
- [ ] Skip trivial folders (single-file utilities, config-only, framework-generated)

A "major folder" is one with multiple files serving a distinct purpose. When in doubt, create the README — it costs little and helps a lot.

---

## PART C: VERIFY PROMPT SYSTEM

### Step 7: Confirm Prompts Are Present

The `.prompts/` directory should contain the 8 canonical prompts. Verify they exist:

- [ ] `init.md` — session initialization (orient, read docs, verify state)
- [ ] `discovery.md` — brainstorming and research before development
- [ ] `bootstrap.md` — create the 3-file documentation system (first time only)
- [ ] `closeout.md` — this file (end-of-session documentation updates)
- [ ] `readme.md` — audit, create, and update directory READMEs
- [ ] `testing.md` — test strategy, generation, and coverage auditing
- [ ] `code-review.md` — structured code review with prioritized feedback
- [ ] `debugging.md` — systematic bug investigation and resolution

If any are missing, copy from the canonical source at `repos/Prompt_Engineering/documentation/.prompts/`.

These prompts are universal — they are NOT project-specific. Do not generate per-project versions. Project-specific context lives in `CLAUDE.md` and the documentation files, not in the prompts.

---

## PART D: CLEAN UP PROJECT NOTES

If the project has a notes/issues/task tracking system (same sources checked during init):

1. **Review all open notes** against this session's completed work.
2. **Remove or mark resolved** any notes that describe:
   - Bugs that were fixed this session
   - Improvements that were implemented
   - Questions that were answered
   - Items that are no longer relevant (feature removed, approach changed)
3. **Update remaining notes** with any new context from this session (e.g., "Investigated this — root cause is X, fix requires Y").
4. **Add new notes** for issues discovered but not fixed this session (these also go in IMPLEMENTATION_PLAN handoff notes).

**Be aggressive about cleanup.** Stale notes are noise that slow down the next session. If it's done, remove it. If it's outdated, remove it. Only keep notes that represent real, actionable work.

---

## PART E: VERIFICATION

### Step 8: Clean Up Notes
(See Part D above — complete before verification.)

### Step 9: Cross-File Consistency Check

- [ ] Version numbers match: CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md
- [ ] Dates are consistent (all show today for "Updated")
- [ ] No contradictions between files
- [ ] No orphaned references to removed/renamed features
- [ ] Completed items marked complete, not left pending
- [ ] New subfolder READMEs created for any new major directories

### Step 10: Quality Check

- [ ] A new agent using the init prompt would orient correctly and not make critical mistakes
- [ ] Handoff notes provide enough context to continue next session
- [ ] "Recent Changes" accurately reflects this session
- [ ] CLAUDE.md front-loads critical rules before file structure/commands
- [ ] No information duplicated across files (routing rule respected)

---

## EXECUTE NOW

1. Complete Part A (inventory changes + determine version)
2. Update IMPLEMENTATION_PLAN.md
3. Update PROJECT_ROADMAP.md (if milestone reached)
4. Update CLAUDE.md
5. Create subfolder READMEs for new directories (use the readme prompt for guidance)
6. Verify prompt system is present
7. Clean up project notes (remove resolved, update remaining, add new)
8. Run verification checklists
9. Summarize changes made to each file

Documentation is the bridge between sessions. Build it well.
