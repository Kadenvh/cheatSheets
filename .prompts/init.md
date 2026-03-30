# Session Initialization Prompt

You are starting a new session on this project. Before doing any work, orient yourself to the codebase, its documentation, and the current state.

---

## 1. FIND THE DOCUMENTATION SYSTEM

Every project in this ecosystem follows a hub-and-spoke documentation model. Your first job is to locate the docs and read them in order.

### Look For (In the Project Root)

| File | What It Tells You | Read Order |
|------|-------------------|------------|
| `CLAUDE.md` | Critical rules, anti-patterns, quick start, file structure, tech stack | **1st** (auto-loaded by Claude Code) |
| `documentation/PROJECT_ROADMAP.md` | Why decisions were made, version history, architecture, future direction | 2nd (if file exists) |
| `documentation/IMPLEMENTATION_PLAN.md` | Current tasks, what happened last session, blockers, handoff notes | **3rd** (if file exists — start work from here) |
| `.prompts/` | Skill protocol files (this file, dal-doctor, explore, closeout, validate, system-reference, etc.) | Reference as needed |

If `CLAUDE.md` exists at the project root, it is auto-loaded — you already have it. Read it anyway to confirm you've internalized the critical rules.

If the project is a **spoke** (sub-project), it may have a slimmer `documentation/CLAUDE.md` with project-specific rules, plus a `README.md` at its root. The parent hub's docs cover the broader context.

**File-mode vs brain.db-mode:** `PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` are used in file-mode projects. If these files exist, read them. brain.db-mode projects skip these — `node .ava/dal.mjs context` provides equivalent data (identity, architecture, decisions, session history, open notes).

### If Documentation Is Missing

- No `CLAUDE.md` → flag to user, offer to run `/dal-doctor` to create the documentation system
- No `IMPLEMENTATION_PLAN.md` and no `.ava/brain.db` → check if there's a README.md or other docs; ask the user for context on current state
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

- [ ] **Version consistency** — if `PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` exist, does the version in `CLAUDE.md` match them? If not, flag it. brain.db-mode projects: check `node .ava/dal.mjs identity list` for version instead.
- [ ] **Stale docs** — are the "Updated" dates recent? Stale docs may not reflect the actual codebase.
- [ ] **Blockers** — if `IMPLEMENTATION_PLAN.md` exists, check for known issues and blockers before starting work. brain.db-mode: check `node .ava/dal.mjs note list` for open issues.
- [ ] **Build/run** — can you build and run the project with the commands in `CLAUDE.md`? If the user asks you to make changes, verify the project compiles first.
- [ ] **Incomplete features** — check brain.db for actions with partial outcomes from recent sessions:
  ```bash
  node .ava/dal.mjs action list --outcome partial
  ```
  For each: verify the backing store exists and has data. If not, this is your highest-priority work.
  **Do not propose new features while partial-outcome actions remain unresolved.** If the user
  explicitly requests new work, surface the incomplete items first and get confirmation to defer them.

### DAL Health Check (if brain.db exists)

If `.ava/brain.db` exists at the project root, the project uses the DAL for session continuity:

```bash
node .ava/dal.mjs status        # Verify schema version and integrity
node .ava/dal.mjs identity list  # Core identity rows (should be 5-7)
node .ava/dal.mjs arch list      # Scoped architecture knowledge
```

- If `status` shows issues, flag them before starting work.
- **If brain.db has 0 identity rows and 0 sessions**: the DAL was deployed but never populated. Run `/cleanup` before starting work — it reads the project's docs and populates brain.db with identity, architecture, and decisions. Without this, the DAL provides zero continuity value.
- **If brain.db has identity rows but is missing key ones** (no `project.name`, no `tech.stack`, no decisions): brain.db is incomplete. Run `/cleanup` to fill gaps before starting work.
- If `.ava/brain.db` does NOT exist, skip this — the project uses the 3-doc markdown system only.

**Coverage evaluation:** The DAL state injected above (by the SessionStart hook) should give you enough context to understand the project without reading all the docs. If it doesn't — if you find yourself needing to read CLAUDE.md, ROADMAP, and IMPL_PLAN to understand what's going on — that means brain.db is incomplete and `/cleanup` should be run.

### Active Hooks (know what's running around you)

These hooks fire automatically — you don't invoke them, but you should know they exist:

| Hook | When | What It Does |
|------|------|-------------|
| `session-context.js` | Session start/resume | Injected the DAL state and git context you see above |
| `stop-closeout-check.js` | Session end | Warns if docs are stale (>2hrs since last edit) and there are uncommitted changes |
| `block-protected-files.js` | Before Edit/Write | Blocks writes to protected files (.env, lock files, credentials, etc.) |
| `block-dangerous-commands.js` | Before Bash | Blocks catastrophic commands (rm -rf /, force push main, etc.) |
| `typecheck-on-edit.js` | After Edit/Write | Runs type checker on modified files |
| `lint-on-edit.js` | After Edit/Write | Runs linter on modified files |
| `completion-check.js` | Session end | Warns if actions have partial outcomes |

If a write or command gets blocked, check `.claude/hooks/` for the specific rules. SOFT_BLOCK denials include override guidance.

Run `/dal-doctor` for full DAL reference if needed.

### Obsidian Vault Context (if vault exists)

Resolve vault path:
1. brain.db: `node .ava/dal.mjs identity get vault.path`
2. Environment: `$OBSIDIAN_VAULT`
3. Default: `~/Obsidian/Ava/{ProjectName}/`

If the Obsidian vault exists, check for relevant project context beyond what brain.db provides.

**Step 1: Identify the project folder.** Use `project.name` from identity to find the vault folder (e.g., `PE`, `Ava_Main`, `TradeSignal`).

```bash
VAULT_PATH=$(node .ava/dal.mjs identity get vault.path 2>/dev/null || echo "${OBSIDIAN_VAULT:-$HOME/Obsidian/Ava}")
ls "$VAULT_PATH/{ProjectName}/" 2>/dev/null
```

**Step 2: Read the most recent session note** (if any exist):

```bash
ls -t "$VAULT_PATH/{ProjectName}/sessions/"*.md 2>/dev/null | head -1
```

Read it. This gives you the previous session's summary, decisions made, files modified, and next actions — richer context than the brain.db session summary alone.

**Step 3: Check for active plans:**

```bash
ls "$VAULT_PATH/{ProjectName}/plans/"*.md 2>/dev/null
```

Read any with `status: active` in their frontmatter. These are living plans that may inform the current session's priorities.

**Step 4: Read the latest handoff** (if YAML handoffs exist):

```bash
node .ava/dal.mjs handoff latest
```

The handoff contains structured session state: traces, open notes, blockers, next actions. This supplements the brain.db session summary.

**If the vault folder doesn't exist for this project:** Skip. The vault is additive — brain.db and CLAUDE.md provide sufficient context. Note the absence as a recommendation: "Vault folder missing — consider running `/dal-doctor` to initialize."

**If no vault exists at all:** Skip entirely. The four-layer architecture is optional.

---

## 4. REVIEW PAST PERFORMANCE (if brain.db exists)

> **If `.ava/brain.db` does NOT have agent_actions table, skip this.** Requires schema v4+.

The learning loop injects performance data into your context (see above). Before starting work, review it:

1. **Check action success rates.** If any action type has failures, understand why before repeating that type of work. The context shows per-type rates — a deployment at 75% means something went wrong last time.
2. **Check metric trends.** Are key metrics (identity count, architecture count, schema version) trending in the right direction? Flat or declining metrics may indicate stalled progress.
3. **Check recent failures.** If the context lists failures, read the detail. Adjust your approach to avoid repeating them.
4. **If no loop data exists** (fresh project or first session with v4), skip this — there's nothing to learn from yet. But DO record actions during this session so the next one has data.

For deeper investigation:

```bash
node .ava/dal.mjs loop summary           # Full performance overview
node .ava/dal.mjs action rate <type>     # Success rate for a specific action type
node .ava/dal.mjs metric trend <key>     # Trend over time for a metric
```

**The goal:** Don't repeat what failed. Double down on what worked. If deployments keep having partial outcomes, investigate the pattern before deploying again.

---

## 5. UNDERSTAND THE PROMPT SYSTEM

The `.prompts/` directory contains session lifecycle templates. You are reading one of them right now.

| Prompt | When To Use |
|--------|-------------|
| **init** (this file) | Start of every new session — orient, read docs, verify state |
| **closeout** | End of session — update docs, version bump, handoff notes |
| **explore** | Mid-project thinking, or pre-dev brainstorming (`--discovery`) |
| **validate** | Project health audit: docs consistency, template deployment, CLAUDE.md coverage |
| **dal-doctor** | System health, first-run setup, remediation |

You don't need to create an init prompt. This IS the init prompt. The documentation system is already in place — your job is to read it, verify it, and start working.

---

## 6. ENGAGEMENT PROTOCOL

Before any implementation:

1. **State your understanding** of the task
2. **Identify affected files** and components
3. **Flag concerns** — potential impacts, ambiguities, risks
4. **Propose your approach** and get confirmation
5. **Then proceed**

**No silent decisions.** If you deviate from established patterns — naming, architecture, edge case handling — document it explicitly. The next session needs to know what actually happened vs. what was planned.

---

## 7. SURFACE INSIGHTS

Before waiting for instructions, proactively share what you've noticed:

1. **Inconsistencies or concerns.** Anything that contradicts itself across docs, smells wrong in the codebase, or seems like a latent issue. Don't wait to be asked.
2. **Top improvements.** 2-3 specific optimizations, refactors, or fixes you'd recommend based on what you've read. Be concrete — "the error handling in X could be simplified" not "code quality could improve."
3. **Questions that affect approach.** If anything is ambiguous, underspecified, or could go multiple ways, ask now. A 30-second question saves a 30-minute redo.
4. **Criticism.** If the documentation is stale, the architecture has debt, or a previous decision looks wrong in hindsight — say so. Directly.

Don't filter yourself. The human wants a collaborator who notices things, not an executor who waits for orders.

---

## 8. READ PROJECT NOTES

If the project has a notes, issues, or task tracking system (markdown files, in-app notes, TODO lists, etc.):

1. **Locate notes.** Check these sources in order:
   - **DAL notes** (if `.ava/brain.db` exists): `node .ava/dal.mjs note list` and `node .ava/dal.mjs note counts`. Categories: improvement, issue, bug, idea.
   - **Markdown notes**: `notes/`, `TODO.md`, `NOTES.md`, or any notes directory/file mentioned in the documentation.
   - **Ava_Main ecosystem only** (optional): `.tab-notes.json` via REST API (`GET /api/notes/all` or `GET /api/notes/:tabKey`). Requires Ava_Main's REST server — not available in standalone deployments.

   Open notes are your primary task queue. In file-mode projects, also check IMPLEMENTATION_PLAN.md handoff notes.

2. **Read all open items.** Categorize what you find: bugs, improvements, feature requests, questions, stale/already-resolved items.
3. **Flag resolved items.** If a note describes something that's already been fixed or implemented (based on the current codebase), flag it for removal.
4. **Incorporate into session plan.** Merge relevant notes (and IMPLEMENTATION_PLAN handoff notes, if the file exists) to build a prioritized plan for this session. Present it to the user.

If no notes system exists, skip this step.

### Archived Context

If you encounter references to past decisions, sessions, or architectural context that aren't fully explained in the current core docs, check these locations:
- `documentation/archive/` — Historical overflow from core docs
- `exploration/` — Research artifacts
- Any `SESSION_ARCHIVE.md` or similar files referenced in the documentation

Archived content is still valid context — it was moved for size management, not because it stopped mattering.

---

## 9. START WORKING

Once oriented:

1. Present your ready state: version, blockers, **incomplete features from prior sessions**, insights, questions, and a prioritized plan. **Incomplete features are the default top priority.** Await explicit confirmation before implementing.
2. If the user has a specific request, proceed with that — but surface incomplete items first so the user can make an informed choice to defer them.
3. If picking from the plan, propose your approach and get confirmation
4. If unclear, ask — it's cheaper to clarify now than to redo work later

**When tools or commands fail:** Explain what was attempted, the specific error, and your next approach. Never silently retry or move on without surfacing what happened.

---

## 10. AUTONOMOUS EXECUTION (--auto-dev mode only)

> **If `--auto-dev` was NOT passed, skip this section entirely.** Section 9's confirmation gate applies.

You have completed orientation (Sections 1-8) and built a prioritized plan. In auto-dev mode, you skip the confirmation gate and begin executing immediately.

### 10.1. Start a DAL Session

```bash
node .ava/dal.mjs session start "auto-dev: [1-line summary of top priority]"
```

### 10.2. Select Work (priority order)

Pick the single highest-priority item using this hierarchy:

1. **Partial outcomes** — `node .ava/dal.mjs action list --outcome partial`. Verify backing store exists and has data. If not, this is your work.
2. **Handoff notes** — open notes with category `handoff`. These are explicit continuity from the prior session.
3. **Bugs** — open notes with category `bug`.
4. **Issues** — open notes with category `issue`.
5. **Improvements** — open notes with category `improvement`.
6. **Ideas** — DO NOT auto-select. Surface in plan only.

**Within a category**, prefer foundational work (fixes to infrastructure, tooling, or process) over new features. If multiple items exist, briefly assess which unblocks the most future work or fixes the deepest problem. Do not just pick the first one returned.

If no actionable items exist at any level, report the empty state and stop. Do not invent work.

### 10.3. Execute

Work the selected item following normal development practices:

- **Plan your approach** (internally — no confirmation needed, but still think before acting).
- **Implement** the changes.
- **Verify** — run tests, type checks, linters. Verification must pass before proceeding.
- **Record the action** — `node .ava/dal.mjs action record "description" --type <type> --outcome success|failure|partial`

If time and scope allow, continue to the next priority item. One well-completed item is better than two partial ones.

### 10.4. Guardrails During Execution

- **Tool failure:** Surface the error clearly. Stop and report. Do not silently retry.
- **Ambiguity discovered:** Choose the safer option (less blast radius, more reversible). Flag what was ambiguous and what you chose.
- **Learning loop signal:** If `loop summary` shows failures for the action type you are about to attempt, investigate the failure pattern before proceeding. Do not repeat known failure modes.
- **Scope creep:** Stay on the selected item. If you discover adjacent work, record it as a note (`node .ava/dal.mjs note add "..." --category improvement`) — do not chase it.
- **Verification failure:** Do NOT commit. Record the action with `--outcome partial` and describe what failed.

### 10.5. Dispatch Closeout

When work is complete (or you have exhausted your session scope):

1. Compile a session summary: what was selected, what was done, what was the outcome, what remains.
2. Dispatch the closeout-worker agent with the summary.
3. The closeout-worker handles: version increment, brain.db recording, CLAUDE.md update, handoff generation, self-verification, and commit.

If the closeout-worker is not available (Agent tool not permitted), fall back to running `/session-closeout` inline.

### 10.6. Report

After closeout completes, output a final summary:

```
## Auto-Dev Session Complete

**Selected:** [what was picked and why]
**Outcome:** [success/partial/failure]
**Changes:** [files modified, commits made]
**Closeout:** [dispatched/inline, version bump]
**Next priority:** [what the next auto-dev session should pick up]
```
