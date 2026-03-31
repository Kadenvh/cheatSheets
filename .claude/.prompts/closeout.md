# Session Closeout Prompt

Perform end-of-session documentation updates and synchronize project prompts with current state.

---

### Minimal Closeout (when time is short)

If the session must end quickly, execute these steps in priority order — stop wherever you must:

1. **Record actions to brain.db** — `node .ava/dal.mjs action record` for each significant action (2 min)
2. **Record decisions** — `node .ava/dal.mjs decision add` for any decisions made (1 min)
3. **Close the session** — `node .ava/dal.mjs session close --summary "what happened"` (30 sec)
4. **Generate handoff** — `node .ava/dal.mjs handoff generate "summary"` (30 sec) — auto-detects session ID, files, decisions
5. **Commit work** — stage specific files and commit (1 min)

Steps 1-3 are critical (brain.db state). Steps 4-5 are important but recoverable. Everything in Parts A-G below is the full protocol — use it when you have time.

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
| Conventions established | "We agreed to always use slugs for IDs" | `arch set` (scope: convention) |
| Patterns discovered | "The API rejects requests without header X" | `arch set` (scope: convention) |
| Gotchas / failure modes | "SQLite can't ALTER CHECK constraints — must rebuild table" | `arch set` (scope: project) |
| Environment specifics | "Works on Linux but PowerShell needs different quoting" | `arch set` (scope: infrastructure) |
| Tool/command discoveries | "Use `dal.mjs render` not manual doc edits" | `arch set` (scope: convention) |
| Architecture clarified | "Component A talks to B via C, not directly" | `arch set` (scope: project) |
| Performance insights | "FTS5 is fast enough — no need for sqlite-vss" | `arch set` (scope: project) |
| Configuration learned | "SSH key id_ed25519_zoe works for both Frank and Zoe" | `arch set` (scope: infrastructure) |

**Quality filter — only extract facts that:**
- Would prevent a future agent from repeating work or making the same mistake
- Can't be derived by reading the current codebase (if you can `grep` for it, don't store it)
- Are durable enough to matter next session (don't store dead-end debugging attempts)
- Aren't already captured in Step 1's explicit inventory

**Portfolio identity maintenance:** If this session shipped a major feature, changed key metrics (endpoint count, table count, downstream project count), or added significant tech stack components, update the `product.*` identity entries (`product.summary`, `product.key-metrics`, `product.tech-highlights`). These feed portfolio sync endpoints — stale metrics undermine external presentation.

**For each extracted fact, produce:**
```
Key: <domain.descriptive_key>
Value: <concise statement of the knowledge>
Table: <identity | architecture>
Scope: <project | ecosystem | infrastructure | convention>  (architecture only)
```

List these alongside the explicit Step 1 inventory. They all get recorded in Part A-2 below.

**If nothing was extracted:** That's fine — not every session produces implicit knowledge. But sessions involving debugging, configuration, cross-system work, or architecture discussions almost always do. If you found nothing, scan once more for gotchas and failure modes.

---

### Step 3a: Review AutoMemory for Promotion

Check `.claude/memory/MEMORY.md` (if it exists) for entries that should be promoted to brain.db:

- **Architecture-quality entries** (coding conventions, infrastructure details, system patterns) → `arch set` with appropriate scope
- **Identity-quality entries** (project facts, team context, product descriptions) → `identity set`
- **Decision-quality entries** (choices with rationale, rejected alternatives) → `decision add`

Promotion criteria: Is this entry durable (will it matter in 10 sessions)? Is it structured enough for brain.db? Would it be lost if AutoDream pruned the MEMORY.md file?

If promoted, note the promotion in the memory file as a comment: `<!-- promoted to brain.db arch: key.name -->`

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

## PART A-2: RECORD SESSION KNOWLEDGE TO brain.db (Do This BEFORE Updating Docs)

> **If `.ava/brain.db` does NOT exist, skip to Part B.** This section requires an active DAL.

**This is the most important step for session continuity.** The facts and decisions you record here are what the next agent will see at session start. If you skip this, the next session starts blind.

### Record knowledge from this session

For each item in your Part A inventory, record durable knowledge to the appropriate table:

```bash
# Core identity facts (5-7 rows max — project name, vision, mission, etc.)
node .ava/dal.mjs identity set "<key>" --value "<value>"

# Scoped architecture knowledge (conventions, tech stack, infrastructure, etc.)
node .ava/dal.mjs arch set "<key>" --value "<value>" --scope <scope>
```

**What to record as identity:**
- Project name, vision, mission → `identity set`

**What to record as architecture:**
- New tech stack choices or changes → `arch set` (scope: project)
- New conventions or patterns established → `arch set` (scope: convention)
- Version changes → `arch set` (scope: project, update `project.version`)
- Infrastructure and environment details → `arch set` (scope: infrastructure)
- Ecosystem-level knowledge → `arch set` (scope: ecosystem)

**What to record as decisions:**
- Any architectural or design choice made this session
- Any judgment call that deviated from the plan
- Any "we chose X over Y because Z"

```bash
node .ava/dal.mjs decision add --title "Title" --context "Why it came up" --chosen "What was chosen" --rationale "Short summary" --rationale-long "Full narrative with context, alternatives considered, and why this was the right call"
```

### Verify existing knowledge still accurate

Spot-check 3-5 existing architecture rows against current reality. If any are wrong, update them:

```bash
node .ava/dal.mjs arch list
node .ava/dal.mjs identity list
```

**Path staleness check:** If any files or directories were renamed this session, grep architecture entries for the old path and update them:
```bash
node .ava/dal.mjs arch list | grep "old/path"  # find stale references
node .ava/dal.mjs arch set "key" --value "updated value" --scope project  # fix each
```
Renames propagate to CLAUDE.md and README.md but NOT automatically to brain.db entries. This is a manual step.

### Coverage check

Verify brain.db has the required minimum rows (see `/cleanup` for the full schema):
- `project.name`, `project.version`, `project.identity` — present in identity or architecture?
- `tech.stack`, `tech.build` — present in architecture?
- `project.vision` — present in identity?
- At least 1 active decision — present?

If any are missing, extract from CLAUDE.md (or PROJECT_ROADMAP.md if it exists) now. **A brain.db without these rows provides zero continuity value.**

---

## PART A-3: SELF-ASSESSMENT (Agent Learning Loop)

> **If `.ava/brain.db` does NOT have agent_actions table, skip this.** Requires schema v4+.

Record what you did, measure outcomes, capture feedback. This data feeds the learning loop — future sessions can see what worked, what didn't, and adjust.

**Do not skip this part.** The loop only works if every session contributes data. Even routine sessions should record actions and metrics. The next agent reads this at init to adjust its approach.

### Verify Traces Were Recorded

Session traces should have been recorded during work (see init.md Section 9). If you didn't record any, add them now — retrace the key steps of the session:

```bash
node .ava/dal.mjs trace add "summary of key step 1"
node .ava/dal.mjs trace add "summary of key step 2"
```

Traces are auto-collected into the handoff YAML. Without them, the next agent only gets a summary — no step-by-step record of what happened.

### Record Actions

For each significant action this session — **including failures and abandoned attempts**:

```bash
node .ava/dal.mjs action record "description" --type <type> --target "file/component" --outcome success|failure|partial
```

Action types: `bugfix`, `feature`, `refactor`, `deployment`, `schema_evolution`, `consolidation`, `investigation`, `maintenance`

**Honesty check:** If every action this session is `success`, pause and review. Did anything fail or get abandoned mid-attempt? Did you change approach after something didn't work? Those are `failure` or `partial` outcomes that should be recorded. A learning loop that only sees success cannot learn from failure.

### Record Metrics

Capture measurable values that matter for this project:

```bash
node .ava/dal.mjs metric record <key> --value <number> --context "explanation"
```

Common metrics: `brain.identity`, `brain.architecture`, `brain.prompts`, `schema.version`, `downstream.health`, `test.pass_rate`

### Self-Assess

Answer briefly (record as architecture note if useful):
- Did my actions improve the target metrics?
- What would I do differently?
- Did I encounter friction with PE's systems? (Record as `pe.friction.*` architecture entry)

### Review Past Performance (if data exists)

```bash
node .ava/dal.mjs loop summary    # Overall performance
node .ava/dal.mjs action rate <type>  # Per-type success rate
node .ava/dal.mjs metric trend <key>  # Is this metric improving?
```

If success rate for an action type is declining, flag it. If a metric is trending wrong, investigate.

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

### Vault Notes — Conditional Export

Export a vault session note if ANY of these are true:
- Session recorded 1+ decisions
- Session changed project version
- Session involved cross-project coordination
- Session shipped a significant feature or architectural change

If the session qualifies, run:
```bash
node .ava/dal.mjs vault-export session "concise summary"
```

Skip vault export for trivial sessions (typo fixes, single-note closes, failed/abandoned sessions).

**Vault folder schema:** The vault project folder should contain ONLY `sessions/`, `architecture/`, `plans/`, `schemas/`, and `VAULT_GUIDE.md`. Do NOT copy project files (code, configs, node_modules, .git, .ava, .claude) into the vault. The vault is for curated knowledge, not project replication.

After vault export, sync to ChromaDB if the embedding service is running:
```bash
node .ava/dal.mjs vault sync {ProjectSlug} 2>/dev/null || true
```

### Close the DAL Session

All brain.db recording is complete (knowledge, actions, metrics, handoff). Formally close the session:

```bash
node .ava/dal.mjs session close --summary "1-2 sentence session summary"
```

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
| "Why was this decision made?" | `PROJECT_ROADMAP.md` (if exists) or brain.db decisions |
| "How did we get to this version?" | `PROJECT_ROADMAP.md` (if exists) or brain.db decisions |
| "Where is this project headed?" | `PROJECT_ROADMAP.md` (if exists) or brain.db identity |
| "What should I do next?" | `IMPLEMENTATION_PLAN.md` (if exists) or brain.db notes |
| "What's currently broken?" | `IMPLEMENTATION_PLAN.md` (if exists) or brain.db notes |
| "What happened last session?" | `IMPLEMENTATION_PLAN.md` (if exists) or brain.db sessions |

**Expanded reference:**

| File | Contains | Does NOT Contain |
|------|----------|------------------|
| `CLAUDE.md` | Current version, quick start, schema/data reference, anti-patterns, commands | Version history, sprint tasks, architecture rationale |
| `PROJECT_ROADMAP.md` | Version history, architecture decisions, tech stack, future roadmap | Sprint checklists, file modification lists, debugging notes |
| `IMPLEMENTATION_PLAN.md` | Current tasks, files modified, blockers, debugging notes, handoff | Full schema docs, architectural philosophy |

**Rule:** Information lives in ONE file. Reference from others, never duplicate.

---

### Step 3: Update IMPLEMENTATION_PLAN.md (if file exists)

> **brain.db-mode projects skip this step.** State is in brain.db — use `node .ava/dal.mjs note add` for handoff notes and `node .ava/dal.mjs action record` for session actions.

- [ ] Add new version section at top (copy structure from previous)
- [ ] Mark completed tasks with [x]
- [ ] Add "Files Modified (V{X.Y.Z})" section
- [ ] Update header: "Updated" date and "Status" line
- [ ] Add new issues to "Known Issues" or "Blockers"
- [ ] Refresh "Handoff Notes" for next session (also write to brain.db: `node .ava/dal.mjs note add "note text" --category handoff`)
- [ ] Include any "silent decisions" or deviations documented during the session
- [ ] Update `.claude/plans/` if any active plans were completed or modified during this session

---

### Step 4: Update PROJECT_ROADMAP.md (if file exists and milestone reached)

> **brain.db-mode projects skip this step.** Architecture decisions and version history are recorded via `node .ava/dal.mjs decision add` and `node .ava/dal.mjs arch set`.

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

### Step 7: Confirm Prompts Are Present

The `.claude/.prompts/` directory should contain the 21 canonical prompts. Verify the core set exists:

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
- [ ] `agent-qa.md` — agent quality assurance protocols
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
4. **Add new notes** for issues discovered but not fixed this session (these also go in IMPLEMENTATION_PLAN handoff notes, if that file exists).

**If no notes system exists**, skip this part. Session state is captured in IMPLEMENTATION_PLAN.md handoff notes (if that file exists) or brain.db handoff notes.

**Be aggressive about cleanup.** Stale notes are noise that slow down the next session. If it's done, remove it. If it's outdated, remove it. Only keep notes that represent real, actionable work.

---

## PART D-2: FINAL KNOWLEDGE REVIEW

> **If `.ava/brain.db` does NOT exist, skip this section.**

Session knowledge was recorded in Part A-2. Now do the final review:

```bash
node .ava/dal.mjs identity list    # Should be 5-7 core rows
node .ava/dal.mjs arch list        # Scoped architecture knowledge
```

1. **Verify** identity rows are still accurate and complete (5-7 core rows).
2. **Verify** architecture entries have correct scopes (project/ecosystem/infrastructure/convention).
3. **Remove** any architecture entries that are no longer relevant.

If Part A-2 was skipped or incomplete, go back and do it now. **Closeout without knowledge recording is an incomplete closeout.**

---

## PART E: CHECK SCALING THRESHOLDS

After updating documentation, check if any core docs have exceeded advisory thresholds:

- **CLAUDE.md > 300 lines or 16KB** → Flag for the user. Consider moving detailed reference to spoke docs or annexes.
- **IMPLEMENTATION_PLAN.md > 400 lines** (if file exists) → Archive older sessions (keep last 3-5). Move detail to the Obsidian vault. Leave a one-line summary and reference in the live doc.
- **PROJECT_ROADMAP.md > 400 lines** (if file exists) → Move deep-dive sections to brain.db via `decision add` or `.claude/archive/`.

If archiving is needed, ensure the live document retains a reference (e.g., "See `.claude/archive/` for sessions 1-20"). **Archived content must remain discoverable.**

If no thresholds are exceeded, skip this step.

---

## PART F: VERIFICATION

### Step 8: Clean Up Notes
(See Part D above — complete before verification.)

### Step 9: Cross-File Consistency Check

- [ ] Version numbers match across all existing docs (CLAUDE.md and, if they exist, PROJECT_ROADMAP.md, IMPLEMENTATION_PLAN.md)
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
2. Update IMPLEMENTATION_PLAN.md
3. Update PROJECT_ROADMAP.md (if milestone reached)
4. Update CLAUDE.md
5. Create subfolder READMEs for new directories (use `/validate --readme` for guidance)
6. Verify prompt system is present
7. Clean up project notes (remove resolved, update remaining, add new)
8. Run verification checklists
9. Commit and push all changes
10. Summarize changes made to each file

Documentation is the bridge between sessions. Build it well.
