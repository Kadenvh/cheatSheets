# Generic Closeout Prompt

```
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
| Only bug fixes, no new features | Patch | 1.0.0 → 1.0.1 |
| New features or endpoints | Minor | 1.0.x → 1.1.0 |
| Breaking changes, major refactors | Major | 1.x.x → 2.0.0 |

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

## PART C: SYNCHRONIZE PROMPTS

### Step 7: Update Init Prompt

If `{project_name}_init_prompt.md` exists, update:

- [ ] Version number and status
- [ ] Version check section (expected versions for all 3 docs)
- [ ] "Current State" section with recent work
- [ ] Any NEW critical rules discovered this session
- [ ] Build/run commands if changed

If it doesn't exist, create it using the generic_init_prompt template.

---

### Step 8: Update Closeout Prompt (This File's Project-Specific Version)

If `{project_name}_closeout_prompt.md` exists, verify:

- [ ] "Project-Specific Guardrails" section contains current critical rules
- [ ] Rules extracted from CLAUDE.md's "DO NOT" section are present
- [ ] Any NEW critical rules from this session are added

---

## PART D: VERIFICATION

### Step 9: Cross-File Consistency Check

- [ ] Version numbers match: CLAUDE.md, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md, init prompt
- [ ] Dates are consistent (all show today for "Updated")
- [ ] No contradictions between files
- [ ] No orphaned references to removed/renamed features
- [ ] Completed items marked complete, not left pending
- [ ] New subfolder READMEs created for any new major directories

### Step 10: Quality Check

- [ ] New agent reading ONLY init prompt would not make critical mistakes
- [ ] Handoff notes provide enough context to continue tomorrow
- [ ] "Recent Changes" accurately reflects this session
- [ ] CLAUDE.md front-loads critical rules before file structure/commands
- [ ] No information duplicated across files (routing rule respected)

---

## EXECUTE NOW

1. Complete Part A (inventory changes + determine version)
2. Update IMPLEMENTATION_PLAN.md
3. Update PROJECT_ROADMAP.md (if milestone reached)
4. Update CLAUDE.md
5. Create subfolder READMEs for new directories
6. Update init prompt
7. Verify/update closeout prompt guardrails
8. Run verification checklists
9. Summarize changes made to each file

Documentation is the bridge between sessions. Build it well.
```
