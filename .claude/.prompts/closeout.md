# Session Closeout Prompt

Perform end-of-session documentation updates and synchronize project prompts with current state.

---

### Minimal Closeout (when time is short)

If the session must end quickly, execute these steps in priority order — stop wherever you must:

1. **Record actions to brain.db** — `node .ava/dal.mjs action record` for each significant action (2 min)
2. **Record decisions** — `node .ava/dal.mjs decision add` for any decisions made (1 min)
3. **Generate handoff** — `node .ava/dal.mjs handoff generate "summary"` (30 sec) — auto-detects the currently open session, files, decisions, and traces
4. **Close the session** — `node .ava/dal.mjs session close --summary "what happened"` (30 sec)
5. **Commit work** — stage specific files and commit (1 min)

Steps 1-4 are critical for continuity. Step 5 is important but recoverable. Everything in Parts A-G below is the full protocol — use it when you have time.

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

### Step 3: Extract Implicit Knowledge

Step 1 captured what you *consciously* did. This step scans the full conversation for knowledge you didn't think to list — the implicit learnings that would otherwise be lost.

**Review the conversation and extract:**

| Look For | Example | Where to Store |
|----------|---------|----------------|
| Conventions established | "We agreed to always use slugs for IDs" | `CLAUDE.md`, `decision add`, or active plan |
| Patterns discovered | "The API rejects requests without header X" | `decision add`, `note add`, or `OVERVIEW.md` if it changes design intent |
| Gotchas / failure modes | "SQLite can't ALTER CHECK constraints — must rebuild table" | `CLAUDE.md`, `note add`, or compatibility `arch set` only if still needed |
| Environment specifics | "Works on Linux but PowerShell needs different quoting" | `CLAUDE.md`, minimal identity, or compatibility `arch set` |
| Tool/command discoveries | "Use `dal.mjs render` not manual doc edits" | `CLAUDE.md` |
| Architecture clarified | "Component A talks to B via C, not directly" | `OVERVIEW.md`, decision, or active plan under `plans/` |
| Performance insights | "FTS5 is fast enough — no need for sqlite-vss" | `decision add` or active plan |
| Configuration learned | "SSH key id_ed25519_zoe works for both Frank and Zoe" | `CLAUDE.md`, minimal identity, or compatibility `arch set` |

**Quality filter — only extract facts that:**
- Would prevent a future agent from repeating work or making the same mistake
- Can't be derived by reading the current codebase (if you can `grep` for it, don't store it)
- Are durable enough to matter next session (don't store dead-end debugging attempts)
- Aren't already captured in Step 1's explicit inventory

**Project identity maintenance:** If this session materially changed the project's version, status, or durable description, update the relevant `project.*` identity rows. Do not invent or maintain marketing or portfolio keys unless the project already uses them intentionally.

**For each extracted fact, produce:**
```text
Target: <CLAUDE.md | plan | decision | note | OVERVIEW.md | identity | architecture-compat>
What: <concise statement of the durable knowledge>
Why here: <why this location is canonical>
```

List these alongside the explicit Step 1 inventory. They all get recorded in Part A-2 below.

**If nothing was extracted:** That's fine — not every session produces implicit knowledge. But sessions involving debugging, configuration, cross-system work, or architecture discussions almost always do. If you found nothing, scan once more for gotchas and failure modes.

---

### Step 3a: Review AutoMemory for Promotion

Check `.claude/memory/MEMORY.md` (if it exists) for entries that should be promoted into a canonical home:

- **Rules/command entries** → `CLAUDE.md`
- **Decision-quality entries** (choices with rationale, rejected alternatives) → `decision add`
- **Identity-quality entries** (project facts that truly affect continuity) → `identity set`
- **Design-intent entries** → `OVERVIEW.md` or active plan under `plans/`
- **Compatibility-only arch entries** → `arch set` only if the project still depends on that legacy surface

Promotion criteria: Is this entry durable (will it matter in 10 sessions)? Is it canonical somewhere stronger than memory? Would it be lost if AutoMemory pruned the file?

If promoted, note the promotion in the memory file as a comment: `<!-- promoted to canonical surface: <target> -->`

Do NOT delete the original from MEMORY.md — AutoDream handles pruning. Just promote and annotate.

---

## PART A-1: COMPLETION AUDIT (Do This BEFORE Recording Anything as Done)

For each feature or implementation listed in Part A, verify vertical completion before recording it as shipped. **This is the gate.** Nothing passes into Part A-2 as "success" without passing these checks.

### For each feature touched this session:

| Check | How to Verify | If it fails |
|-------|--------------|-------------|
| **Backing store exists** | `ls -la` the database file, JSON file, or table. 0 bytes or missing = not done. | Mark as in-progress. Do not count in version bump. |
| **Backing store has data** | Query for row count or check file content. Empty store = not done. | Mark as in-progress. |
| **User loop closes** | Can the user perform the intended action end-to-end through the UI or CLI? Create → view at minimum. | Mark as in-progress. |
| **Tests validate behavior** | Do tests assert on meaningful state change, not just HTTP status codes against empty responses? | Flag: tests prove existence, not function. |

### Closeout language rules:

- **"Shipped X"** requires all 4 checks passing. If any check fails, the feature is in-progress, not shipped.
- **"Added N endpoints"** is never valid closeout language. State what the user can now **do**, not what code exists.
- If a feature fails any check, record the action with `--outcome partial` and describe what's missing in the detail.
- **Do not version-bump for partial features.** A minor version increment requires at least one feature that passes all 4 checks.

### If applicable: Route-Data Integrity (server-backed projects)

If the project has an Express server (or equivalent with a route/controller entry point):

1. List all mounted route files from the server entry point (e.g., `server.mjs` imports).
2. For each route file, identify its backing persistence (database table, JSON file, external service).
3. Verify the backing persistence exists and is non-empty.
4. **Route files serving empty or nonexistent stores are dead code, not features.** Flag them.

This check applies to projects with server components. Skip for CLI tools, libraries, or static sites.

---

## PART A-2: RECORD MINIMAL CONTINUITY TO brain.db (Do This BEFORE Updating Docs)

> **If `.ava/brain.db` does NOT exist, skip to Part B.** This section requires an active DAL.

**This is the most important step for session continuity.** The notes, decisions, and session summary you record here are what the next agent will see at session start. If you skip this, the next session starts blind.

### Record knowledge from this session

For each item in your Part A inventory, record only the continuity data that materially helps the next session:

```bash
# Minimal identity facts (only when changed)
node .ava/dal.mjs identity set "<key>" --value "<value>"

# Decisions and open follow-up
node .ava/dal.mjs decision add --title "Title" --context "Why it came up" --chosen "What was chosen" --rationale "Short summary"
node .ava/dal.mjs note add "follow-up or blocker" --category handoff
```

**What to record as identity:**
- Project name, version, vision, or status only when this session materially changed them

**What to record as notes:**
- Anything the next session must resume, confirm, or unblock
- Unfinished work, scope cuts, follow-ups, and user-directed next steps

**What to record as decisions:**
- Any architectural or design choice made this session
- Any judgment call that deviated from the plan
- Any "we chose X over Y because Z"

**What to record as architecture (compatibility only):**
- Only non-derivable, cross-session facts that are not better expressed in `CLAUDE.md`, a decision, a plan, or `OVERVIEW.md`
- Do **not** use `arch set` for code structure, file maps, route maps, or facts GitNexus can answer on demand

### Verify existing continuity still accurate

Spot-check the continuity surfaces that will matter next session:

```bash
node .ava/dal.mjs identity list
node .ava/dal.mjs decision list
node .ava/dal.mjs note list
```

If the project still uses legacy architecture rows, prune or fix any entry that points at renamed paths or duplicates code structure that GitNexus can derive. Do not add fresh structural snapshots back into brain.db.

### Coverage check

Verify brain.db has the required minimum continuity coverage:
- `project.name` and `project.version` are present if the project uses identity rows
- `project.vision` is present if it is still a load-bearing project fact
- At least 1 active decision exists when this project has durable design constraints
- Open blockers / next steps are captured in notes or the generated handoff

If any are missing, extract them now. **A brain.db without these surfaces provides little continuity value.**

---

## PART A-3: OPTIONAL LEGACY LOOP DATA

> **If `.ava/brain.db` does NOT have agent_actions table, skip this section.** These surfaces are compatibility-only and are no longer the default continuity model.

Record only the legacy loop data that still materially helps this project. The default continuity path is notes + decisions + handoff.

**Do not force this part.** If the project does not actively use these tables, skip them and capture unfinished work in notes + handoff instead.

### Verify Traces Were Recorded

Session traces should have been recorded during work (see init.md Section 9). If you didn't record any, add them now — retrace the key steps of the session:

```bash
node .ava/dal.mjs trace add "summary of key step 1"
node .ava/dal.mjs trace add "summary of key step 2"
```

Traces are auto-collected into the handoff YAML. Without them, the next agent only gets a summary. Use traces when they materially improve the handoff.

### Record Actions

**BEFORE recording any action, answer this question:**

> Did anything this session fail, get abandoned, change approach mid-attempt, or only partially land?
> If yes, record those FIRST with `--outcome failure` or `--outcome partial`.
> If you use these legacy tables, record failures and partial outcomes honestly. Otherwise keep unfinished work in notes + handoff and skip the table entirely.

For each significant action this session — **including failures and abandoned attempts**:

```bash
node .ava/dal.mjs action record "description" --type <type> --target "file/component" --outcome success|failure|partial
```

Action types: `bugfix`, `feature`, `refactor`, `deployment`, `schema_evolution`, `consolidation`, `investigation`, `maintenance`

**Honesty gate:** If every action you are about to record is `success`, stop. Review the conversation for: changed approaches, retried commands, user corrections, abandoned paths, scope cuts. Each of these is a `failure` or `partial` outcome that should be recorded honestly. Only after this review should you proceed with `success` for actions that genuinely succeeded without issues.

### Record Metrics Only If They Are Objective And Still Used

Do not create or maintain manual vanity metrics. If a metric is weakly grounded, stale, or only interesting for dashboard aesthetics, skip it.

### Friction Notes

Do **not** record self-grading feedback into `agent_feedback`; self-feedback is deprecated as a signal. If you encountered recurring friction, a misleading workflow, or a system-level gotcha, record it as a decision, note, CLAUDE rule update, or compatibility `architecture` entry only if the project still depends on that table.

### Review Past Performance (if data exists and still matters)

If the project still relies on these legacy surfaces, review them. Otherwise skip and rely on notes, decisions, and handoff quality.

---

## PART A-4: HANDOFF GENERATION (Session Continuity)

> **If `.ava/brain.db` does NOT exist, skip this section.**

Generate a YAML handoff for the next session:

```bash
node .ava/dal.mjs handoff generate "Session summary here"
```

The handoff auto-collects: session traces, open notes, version, and any data you pass. It writes to `.ava/handoffs/` and prunes to the 20 most recent.

### Verification

- [ ] `.ava/handoffs/handoff-{timestamp}.yaml` exists and contains session data

### Session Note — Conditional Export

Export a structured session note to `sessions/` at the project root if ANY of these are true:
- Session recorded 1+ decisions
- Session changed project version
- Session involved cross-project coordination
- Session shipped a significant feature or architectural change

If the session qualifies, run:
```bash
node .ava/dal.mjs session-export session "concise summary"
```

This writes `sessions/session-{N}.md` with a structured schema (Summary, Decisions, Files Changed, Notes Opened/Closed, Continuity → Next Session, Cross-Refs). The schema is optimized for GitNexus indexing so future sessions can retrieve by session number, file path, or decision ID.

Skip session-export for trivial sessions (typo fixes, single-note closes, failed/abandoned sessions).

### Update Active Plans

Review `plans/` at the project root — if this session's work touched any plan's domain, update that plan:

1. **Check each plan** — did this session advance, inform, or change any plan's known items?
2. **Update "Sessions Contributing"** — add this session number and what it contributed
3. **Update "Known Items"** — check off completed items, add new items discovered
4. **Update "Open Questions"** — add new questions, resolve answered ones
5. **Update the "Updated" date** in the plan header

Plans are living documents curated across sessions. Every session that touches a plan's domain should leave it more current than it found it. If a plan hasn't been updated in 5+ sessions, either it's complete (archive it) or it's being neglected (flag it).

**Session summaries** are closeout artifacts, not plans. They belong as brain.db session records + handoff YAML + `sessions/session-{N}.md` (if qualified). Don't accumulate session logs in `plans/`.

### Close the DAL Session

All brain.db recording is complete (continuity, optional legacy data, handoff). Formally close the session:

```bash
node .ava/dal.mjs session close --summary "1-2 sentence session summary"
```

### Contribution Attribution Check

Before committing, check the repo's attribution policy:
- **Default:** Include `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>` trailer
- **Per-repo override:** If the repo or client requires suppressed attribution, omit the trailer but always record agent involvement in brain.db (`action record`)
- Internal provenance is always preserved regardless of public attribution

**Critical:** Pass `--summary` with a meaningful description. Without it, the session record has a NULL summary and the next agent gets no context about what happened.

This must happen AFTER all brain.db writes (Parts A-2 through A-4) and BEFORE the final commit (Part G). A session left open is a lifecycle leak — init opens it, closeout must close it.

**If no session is open:** This means `/session-init` didn't start one, or the session was already closed. Do NOT call `session close` without an open session — it creates a phantom record with start_time == end_time. Instead, start one now with `session start "late-start: ..."`, record your knowledge, then close it.

---

## PART B: UPDATE DOCUMENTATION

### Document Boundaries (Respect the Routing Rule)

Each piece of information belongs in exactly one file. Use this guide:

| "What question does this answer?" | It belongs in... |
|:-----------------------------------|:-----------------|
| "What must I never do?" | `CLAUDE.md` |
| "How do I run/build this?" | `CLAUDE.md` |
| "Where are the important files?" | `CLAUDE.md` |
| "Why was this decision made?" | brain.db decisions |
| "How did we get to this version?" | brain.db decisions |
| "Where is this project headed?" | brain.db identity |
| "What should I do next?" | brain.db notes |
| "What's currently broken?" | brain.db notes |
| "What happened last session?" | brain.db sessions |

**Expanded reference:**

| Destination | Contains | Does NOT Contain |
|------|----------|------------------|
| `CLAUDE.md` | Current version, quick start, schema/data reference, anti-patterns, commands | Version history, sprint tasks, architecture rationale |
| brain.db decisions | Architecture decisions with rationale, tech stack choices | Sprint checklists, file lists |
| brain.db notes | Current tasks, blockers, handoff items | Full schema docs, architectural philosophy |
| brain.db identity | Project name, version, vision, status | Detailed history |

**Rule:** Information lives in ONE place. Reference from others, never duplicate.

`PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` are **retired**. Do not update them.

---

### Step 3: Update brain.db State

- [ ] Record handoff notes: `node .ava/dal.mjs note add "note text" --category handoff`
- [ ] Record actions: `node .ava/dal.mjs action record "description" --type feature --outcome success`
- [ ] Record decisions: `node .ava/dal.mjs decision add --title "..." --context "..." --chosen "..." --rationale "..."`
- [ ] Update `plans/` at project root if any active plans were completed or modified during this session

---

### Step 4: Update CLAUDE.md

Remember: CLAUDE.md is auto-read by Claude Code — front-load the most critical information.

- [ ] Update header: Version, Last Updated, Status (this is the very first line agents see)
- [ ] Update "Recent Changes" section
- [ ] Add new anti-patterns to "DO NOT" section if discovered
- [ ] Update schema/API reference if changed
- [ ] Update file structure section if new directories were added or renamed
- [ ] Update commands if build/run process changed
- [ ] Verify counts: skill count, hook count, agent count, prompt count still accurate

### Step 5a: Update CHANGELOG.md (if version bumped)

If version was incremented in Step 2, CHANGELOG.md MUST be updated. This is the human-readable release history.

- [ ] Add `[{version}] -- {YYYY-MM-DD}` section at top
- [ ] Group changes: Breaking, Features, Fixes, Cleanup, Docs
- [ ] Include ALL changes from Step 1 inventory — nothing omitted
- [ ] For breaking changes, note migration path (e.g., "agents/ renamed to agent-definitions/ — update any path references")

**CHANGELOG is NOT optional.** If version bumped without a CHANGELOG entry, the release is undocumented.

### Step 5b: Verify template/VERSION consistency (if PE or template changed)

If this is the PE project or template files were modified:

- [ ] `template/VERSION` matches the version set in Step 2
- [ ] `template/README.md` version header matches
- [ ] brain.db identity `project.version` matches
- [ ] CLAUDE.md version header matches

All four MUST show the same version. Mismatch means downstream drift detection breaks.

---

### Step 6: Update Sub-project CLAUDE.md & Subfolder READMEs (if new directories were added)

If new major folders were created during this session (listed in Part A, Step 1):
- [ ] **Primary:** Ensure sub-project CLAUDE.md files are current (if sub-projects exist) — version, critical rules, build/run commands
- [ ] **Secondary:** Create/update README.md for new directories (for human reference, optional)
- [ ] Include: 1-2 sentence purpose, contents table, key interfaces
- [ ] Skip trivial folders (single-file utilities, config-only, framework-generated)

Sub-projects (directories with their own package.json, brain.db, or significant scope) need CLAUDE.md for agent context. README.md is secondary, for human readers.

---

## PART C: VERIFY PROMPT SYSTEM

### Step 7: Confirm Prompt Bundle Is Present

The `.claude/.prompts/` directory should contain the current template prompt bundle. Do not trust hard-coded counts; use the actual directory contents or `node .ava/dal.mjs template manifest` when exact inventory matters. Verify at least the core lifecycle and engineering prompts exist:

- [ ] `init.md` — session initialization (orient, read docs, verify state)
- [ ] `closeout.md` — this file (end-of-session documentation updates)
- [ ] `dal-doctor.md` — unified system health, setup, and remediation
- [ ] `system-reference.md` — agent-readable system architecture reference
- [ ] `explore.md` — mid-project thinking + pre-dev discovery/research
- [ ] `validate.md` — project health audit (docs, template, READMEs)
- [ ] `testing.md` — test strategy, generation, and coverage auditing
- [ ] `code-review.md` — structured code review with prioritized feedback
- [ ] `debugging.md` — systematic bug investigation and resolution
- [ ] `architecture.md` — system design and architectural decisions
- [ ] `requirements.md` — requirements gathering and specification
- [ ] `refactor.md` — code restructuring and improvement
- [ ] `migration.md` — data and system migrations
- [ ] `together.md` — relationship mode, human-first dialogue
- [ ] `cleanup.md` — DAL reconciliation and knowledge hygiene
- [ ] `METRICS.md` — metrics definitions and tracking
- [ ] `plan-validator.md` — plan auditing and gap analysis
- [ ] `triage.md` — ecosystem-wide status assessment and prioritization
- [ ] `ui-dev.md` — frontend UI development protocols
- [ ] `supabase.md` — Supabase development protocols

If any are missing, copy from the template source directory (check brain.db identity `template.source`, or the PE template location configured for this environment).

These prompts are universal — they are NOT project-specific. Do not generate per-project versions. Project-specific context lives in `CLAUDE.md` and the documentation files, not in the prompts.

---

## PART D: CLEAN UP PROJECT NOTES

Check for notes in this order:

### DAL Notes (if `.ava/brain.db` exists)

```bash
node .ava/dal.mjs note list
node .ava/dal.mjs note counts
```

Review open notes against this session's work. Mark resolved items as completed. Add new notes for issues discovered but not fixed.

### Markdown / UI Notes (if applicable)

For `.tab-notes.json`: set `"completed": true` on resolved notes. Do NOT delete entries — the UI handles cleanup. For markdown-based notes (`TODO.md`, `NOTES.md`, `notes/`): update or remove resolved items.

### For all note sources:

1. **Review all open notes** against this session's completed work.
2. **Mark resolved** any notes that describe:
   - Bugs that were fixed this session
   - Improvements that were implemented
   - Questions that were answered
   - Items that are no longer relevant (feature removed, approach changed)
3. **Update remaining notes** with any new context from this session (e.g., "Investigated this — root cause is X, fix requires Y").
4. **Add new notes** for issues discovered but not fixed this session.

**Be aggressive about cleanup.** Stale notes are noise that slow down the next session. If it's done, remove it. If it's outdated, remove it. Only keep notes that represent real, actionable work.

---

## PART D-2: FINAL KNOWLEDGE REVIEW

> **If `.ava/brain.db` does NOT exist, skip this section.**

Session knowledge was recorded in Part A-2. Now do the final review:

```bash
node .ava/dal.mjs identity list    # Should be 5-7 core rows
node .ava/dal.mjs decision list
node .ava/dal.mjs note list
```

1. **Verify** identity rows are still accurate and complete (5-7 core rows).
2. **Verify** active decisions and notes reflect the current state of the work.
3. **If legacy architecture rows still exist,** remove or prune any that no longer justify themselves.

If Part A-2 was skipped or incomplete, go back and do it now. **Closeout without knowledge recording is an incomplete closeout.**

---

## PART E: CHECK SCALING THRESHOLDS

After updating documentation, check if any core docs have exceeded advisory thresholds:

- **CLAUDE.md > 300 lines or 16KB** → Flag for the user. Consider moving detailed reference to spoke docs or annexes.
- **`plans/` total > 200KB** → Archive completed/superseded plans to `plans/archive/` with extraction receipts. Keep only active strategy docs in the top level.

If archiving is needed, move content to `plans/archive/` with a receipt file capturing `archive_reason`, `superseded_by`, and `extracted_to` targets. **Archived content must remain discoverable.**

If no thresholds are exceeded, skip this step.

---

## PART F: VERIFICATION

### Step 8: Clean Up Notes
(See Part D above — complete before verification.)

### Step 9: Cross-File Consistency Check

- [ ] Version numbers match across CLAUDE.md and brain.db `project.version`
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

## PART G: COMMIT & PUSH

### Step 11: Stage and Commit Changes

After all documentation updates and verification are complete:

```bash
git add <specific-files>   # Stage only the files you changed — never git add -A
git commit -m "docs: session closeout v{X.Y.Z} — {1-line summary of session work}"
```

> **Do NOT use `git add -A` or `git add .`** — these can stage sensitive files (.env, .ava/brain.db, credentials). Always stage specific files by name.

If a remote is configured and you have push access:

```bash
git push
```

If the push fails (auth, permissions, etc.), output the command for the user to run manually:

```bash
git push origin {branch}
```

**Do not skip this step.** An uncommitted closeout means the next session starts with a dirty working tree and potentially stale documentation.

---

## EXECUTE NOW

1. Complete Part A (inventory changes + determine version)
2. Update brain.db (notes, decisions, actions, identity)
3. Update CLAUDE.md
5. Create subfolder READMEs for new directories (use `/validate --readme` for guidance)
6. Verify prompt system is present
7. Clean up project notes (remove resolved, update remaining, add new)
8. Run verification checklists
9. Commit and push all changes
10. Summarize changes made to each file

Documentation is the bridge between sessions. Build it well.
