# Session Initialization Prompt

You are starting a new session on this project. Before doing any work, orient yourself to the codebase, its documentation, and the current state.

---

## 1. FIND THE DOCUMENTATION SYSTEM

Every project in this ecosystem follows a hub-and-spoke documentation model. Your first job is to locate the docs and read them in order.

### Look For (In the Project Root)

| File / Source | What It Tells You | Read Order |
|------|-------------------|------------|
| `CLAUDE.md` | Critical rules, anti-patterns, quick start, file structure, tech stack | **1st** (auto-loaded by Claude Code) |
| **Continuity brief** | Synthesized resume state (project identity, open session, latest handoff, open notes, active plans, recent decisions, contradictions, recommended next step) | **2nd** (already injected by session-context hook via `dal.mjs continuity brief`) |
| **`SYSTEM-OVERVIEW.md`** | **MUST READ.** Your operating manual - skills, hooks, DAL boundaries, GitNexus role, knowledge layers, file layout. Without this you are working blind. | **3rd** (REQUIRED if file exists) |
| `plans/` | **Active plans at project root.** Read every current plan file, excluding `archive/`. Living documents curated across sessions. | **4th** |
| `sessions/` | **Recent session notes at project root.** Curated per-session summaries. Skim the latest one or two for narrative continuity if the handoff is ambiguous. | **5th (optional)** |
| GitNexus / live code | Code structure, call graphs, route maps, impact analysis | Reference as needed (explore curiously) |

If `CLAUDE.md` exists at the project root, it is auto-loaded -- you already have it. Read it anyway to confirm you've internalized the critical rules.

If the project is a **spoke** (sub-project), it may have a slimmer `CLAUDE.md` with project-specific rules, plus a `README.md` at its root. The parent hub's docs cover the broader context.

`PROJECT_ROADMAP.md` and `IMPLEMENTATION_PLAN.md` are **retired**. brain.db replaces both. Do not read or reference them.

### If Documentation Is Missing

- No `CLAUDE.md` → flag to user, offer to run `/dal-doctor` to create the documentation system
- No `.ava/brain.db` → run `/dal-doctor` to set up brain.db
- No `.claude/.prompts/` → the project hasn't adopted this system yet; proceed with whatever docs exist

---

## 1b. UNDERSTAND THE SYSTEM LAYOUT

This project uses the PE documentation framework. Here is what goes where — every file and folder has exactly one home.

### Project Folder Layout

A properly configured project looks like this:

```
{Project}/
├── .ava/                    # DAL runtime (gitignored, project-local, provisioned via /dal-doctor)
│   ├── brain.db             # Continuity ledger — sessions, decisions, notes, minimal identity
│   ├── dal.mjs              # CLI interface to brain.db
│   ├── lib/                 # Runtime modules
│   ├── migrations/          # Schema evolution
│   └── handoffs/            # YAML session handoffs (auto-pruned to 20)
├── .claude/                 # Deployable surface (synced from PE template)
│   ├── settings.json        # Hooks, permissions, env vars (from template)
│   ├── settings.local.json  # Machine-specific overrides (never committed)
│   ├── skills/              # Skill definitions (SKILL.md files)
│   ├── hooks/               # Auto-firing event handlers (JS)
│   ├── agents/              # Subagents (closeout-worker)
│   ├── .prompts/            # Skill protocol files (markdown, from template)
│   └── memory/              # Optional compatibility observations (project-local)
├── plans/                   # Active plans at project root (`archive/` holds superseded plans)
├── sessions/                # Curated structured session notes (written by session-export)
├── CLAUDE.md                # Critical rules (auto-loaded, project-specific, never template-overwritten)
├── SYSTEM-OVERVIEW.md       # Operating manual (ships via template)
├── README.md                # Human entry point
├── CHANGELOG.md             # Version history (if versioned)
├── OVERVIEW.md              # Optional design intent / invariants doc
└── {project code}           # The actual codebase
```

**Deployable (`.claude/`) vs non-deployable (project root):**
- `.claude/` ships to downstream projects via Sync All. Skills, hooks, prompts, agents, settings.
- `plans/`, `sessions/`, and project-authored docs live at root because they are project-specific working state, not meant to deploy.
- `CLAUDE.md` is project-authored; template sync never overwrites it.

### Where Information Lives

| Location | What goes here | What does NOT go here | Updated by |
|----------|---------------|----------------------|------------|
| **CLAUDE.md** | DO/DON'T rules, build commands, file structure, tech stack, key commands | Session state, task lists, version history, architecture rationale | Closeout (every session with changes) |
| **brain.db** | Continuity state: recent sessions, open notes, active decisions, handoff-adjacent context, minimal identity | Prose, narratives, code structure, project data, broad architecture snapshots | DAL CLI during work + closeout |
| **GitNexus / live code** | Code structure, symbol relationships, route maps, impact analysis | Narrative docs, continuity state, project rules | GitNexus index + direct inspection |
| **`.claude/memory/`** | Optional compatibility observations that are not canonical elsewhere | Decisions, plans, broad project facts, duplicated docs | AutoMemory / deliberate curation |
| **`plans/`** (project root) | Active plans — strategic direction and execution docs curated across sessions | Superseded plans (move to `plans/archive/` only after extraction) | Updated each session when relevant work touches a plan |
| **`sessions/`** (project root) | Curated structured session notes written by `session-export` at closeout | Raw narrative dumps, unrelated project content | Written once per significant session |
| **`OVERVIEW.md`** | Optional design intent, invariants, open architectural questions | File trees, route maps, symbol inventories | Agent + human when design evolves |

### Template Deployment Model

This project's deployable `.claude/` and documentation surface come from the PE template. They are deployed via:
- `node .ava/dal.mjs template pull` — pulls updates from the configured template source
- The template source is set in brain.db: `node .ava/dal.mjs identity get template.source`

Project-local `.ava/` setup, repair, and validation are handled separately through `/dal-doctor`.

Template sync NEVER overwrites: `CLAUDE.md`, `brain.db`, `settings.local.json`. These are project-specific.

---

## 2. ORIENT TO THE CODEBASE

After reading the docs, build a mental model by scanning the project structure:

1. **Read the file structure** — `CLAUDE.md` usually has a directory tree. If not, list the top-level directories.
2. **Find the READMEs** — significant directories have `README.md` files explaining their contents, conventions, and how to add new items. Read the ones relevant to your task.
3. **Identify the key files** — entry points, config files, and anything called out in the docs.
4. **Check for existing patterns** — naming conventions, file organization, coding style. Follow what's established.
5. **Use GitNexus or direct code reads for structure** — do not expect `FileStructure.md` or broad DAL architecture rows to be canonical.

---

## 3. VERIFY STATE

Before proceeding to any task, confirm:

**Note:** The session-context hook has already injected DAL continuity state, git status, and the latest handoff YAML into your context. Review this injected context before running additional DAL commands — most of what you need for session continuity should already be loaded.

**Settings priority:** Project `.claude/settings.local.json` overrides `.claude/settings.json`. Global `~/.claude/` settings are system-level defaults — project settings always win. Check that `autoMemoryDirectory` is set to `.claude/memory` in `settings.local.json` (not settings.json). If missing, add it.

- [ ] **Version consistency** — does the version in `CLAUDE.md` match brain.db and any actively maintained docs? If not, flag it.
- [ ] **Stale docs** — are the "Updated" dates recent? Stale docs may not reflect the actual codebase.
- [ ] **Blockers** — check `node .ava/dal.mjs note list` for open issues and review the latest handoff for carried-forward blockers.
- [ ] **Active decisions** — review active decisions that constrain the next move.
- [ ] **Build/run** — can you build and run the project with the commands in `CLAUDE.md`? If the user asks you to make changes, verify the project compiles first.
- [ ] **Incomplete work** — check notes + latest handoff first. If the project still uses `agent_actions`, review partial outcomes there as a compatibility surface, not as the primary continuity source.

### DAL Health Check (if brain.db exists)

If `.ava/brain.db` exists at the project root, the project uses the DAL for session continuity:

```bash
node .ava/dal.mjs status        # Verify schema version and integrity
node .ava/dal.mjs identity list  # Core identity rows (should be 5-7)
node .ava/dal.mjs decision list  # Active constraints and rationale
node .ava/dal.mjs note list      # Open work / blockers
```

- If `status` shows issues, flag them before starting work.
- **If brain.db has 0 identity rows and 0 sessions**: the DAL was deployed but never populated. Run `/cleanup` or `/dal-doctor` before starting work — without this, the DAL provides zero continuity value.
- **If brain.db has identity rows but is missing load-bearing ones** (no `project.name`, no `project.version`, no active decisions or useful open notes): the continuity layer is incomplete. Run `/cleanup` to fill gaps before starting work.
- If `.ava/brain.db` does NOT exist, do not assume a markdown-only fallback. Run `/dal-doctor` and surface the missing runtime clearly.

**First session detection:** If brain.db has 0 sessions and <3 identity entries, this is likely a first-time setup. Run `/dal-doctor` for full initialization rather than proceeding with a partial state. If brain.db has sessions but the last one was >7 days ago, note the gap and check for stale plans, notes, and decisions.

### Error Recovery

If any DAL command fails during initialization:
1. Record the error for the session summary — do not silently skip the step.
2. If brain.db is unreachable: run `/dal-doctor` to diagnose and repair.
3. If dal.mjs is missing: the DAL runtime is not deployed. Run template sync from PE or report to user.
4. If identity is empty (0 entries): run `/cleanup` to hydrate from existing docs.
5. Do NOT proceed as if everything is fine when it isn't. Surface the error clearly.

**Coverage evaluation:** The DAL state injected above should give you enough continuity to understand what happened recently and what needs to happen next. If you still have to reconstruct continuity manually from scattered docs, that means brain.db and/or the handoff trail are incomplete and `/cleanup` should be considered. Structural questions should go to GitNexus or direct code reads, not more DAL accumulation.

### Active Hooks (know what's running around you)

These hooks fire automatically — you don't invoke them, but you should know they exist:

| Hook | When | What It Does |
|------|------|-------------|
| `session-context.js` | Session start/resume | Injected the DAL state, git context, handoff, doc rules, and agent identity you see above |
| `block-protected-files.js` | Before Edit/Write | Blocks writes to protected files (.env, secrets, lock files, agent personality files) |
| `gitnexus-impact-check.js` | Before Edit/Write | Auto impact analysis on source files — injects blast radius to context |
| `block-dangerous-commands.js` | Before Bash | Blocks catastrophic commands (rm -rf /, force push main, etc.) |
| `typecheck-on-edit.js` | After Edit/Write | Runs type checker on modified files |
| `lint-on-edit.js` | After Edit/Write | Runs linter on modified files |
| `gitnexus-post-commit.js` | After git commit | Re-indexes codebase intelligence |
| `stop-closeout-check.js` | Session end | Warns if docs are stale (>2hrs since last edit) and there are uncommitted changes |
| `completion-check.js` | Session end | Warns if actions have partial outcomes |

If a write or command gets blocked, check `.claude/hooks/` for the specific rules. SOFT_BLOCK denials include override guidance.

Run `/dal-doctor` for full DAL reference if needed.

### Narrative Continuity (optional)

The continuity brief (injected above) is the primary resume surface. If you need deeper narrative context — the "why" behind decisions, the feel of the previous session — pull from these in order:

**1. Latest handoff YAML:**
```bash
node .ava/dal.mjs handoff latest
```
Structured YAML with summary, decisions, files modified, open notes, next actions.

**2. Most recent session note** (if `sessions/` exists at project root):
```bash
ls -t sessions/*.md 2>/dev/null | head -1
```
Agent-curated structured session summary. Short and factual by design — if you need more narrative, follow cross-refs in the file to plans, decisions, or the handoff.

Both are supplemental. The core continuity surface is brain.db (via `continuity brief`) plus the handoff trail. Missing `sessions/` is not a broken runtime.

---

## 4. REVIEW LEGACY LOOP DATA (OPTIONAL)

> **If `.ava/brain.db` does NOT have `agent_actions`, skip this section.** These tables are compatibility-only and are no longer the default continuity model.

If the project still relies on legacy action/metric tables, review them briefly:

1. Check whether repeated failures or partial outcomes suggest a workflow problem worth flagging.
2. Do not confuse these tables with the primary continuity source. Notes, decisions, sessions, and handoffs matter more.
3. If the loop data is weak, stale, or obviously low-signal, do not expand it. Treat it as compatibility baggage, not required ritual.

**The goal:** learn from genuinely useful historical signal without rebuilding the old heavy memory model around it.

---

## 5. UNDERSTAND THE PROMPT SYSTEM

The `.claude/.prompts/` directory contains session lifecycle templates. You are reading one of them right now.

| Prompt | When To Use |
|--------|-------------|
| **init** (this file) | Start of every new session — orient, read docs, verify state |
| **closeout** | End of session — update docs, version bump, handoff notes |
| **explore** | Mid-project thinking, or pre-dev brainstorming (`--discovery`) |
| **validate** | Project health audit: docs consistency, template deployment, CLAUDE.md coverage |
| **dal-doctor** | System health, first-run setup, remediation |

You don't need to create an init prompt. This IS the init prompt. The documentation system is already in place — your job is to read it, verify it, and start working.

---

## 6. STATE YOUR UNDERSTANDING (mandatory — do not skip)

**Before any work, demonstrate to the user that you've absorbed the context.** This is not a formality — it's how trust is built. The user needs confidence that init worked and you're ready to continue seamlessly from the last session.

State back to the user in natural language:

1. **Project state** — version, health, any drift or open issues you noticed
2. **Last session** — what happened, what was delivered, what was left open (from handoff YAML, session notes, or brain.db traces)
3. **Open items** — unresolved notes, partial-outcome actions, or blockers that carry forward
4. **This session** — what you believe the session should accomplish (from plans, user direction, or open items)

**Wait for the user to confirm or correct before touching any file.** A correction here is not a failure — it's the system working. It means you caught a gap early instead of executing on wrong assumptions. Surface uncertainty honestly: "I'm not sure about X — the handoff says Y but the code shows Z."

If the user says your understanding is wrong, update your mental model and restate. If they confirm, proceed to the engagement protocol below.

---

## 7. ENGAGEMENT PROTOCOL

When approaching implementation:

1. **Identify affected files** and components
2. **Flag concerns** — potential impacts, ambiguities, risks
3. **Propose your approach** — then proceed

**Decision-point surfacing:** Before touching files, present your understanding and proposed approach and wait for confirmation. After that confirmation, continue to surface meaningful judgment calls and trade-offs as you go. You do not need to stop for every micro-decision, but you do need to make the important ones visible.

**No silent decisions.** If you deviate from established patterns — naming, architecture, edge case handling — document it explicitly. The next session needs to know what actually happened vs. what was planned.

**Corrections are positive signal.** If the user corrects your understanding, reasoning, or approach — that means the communication loop is working. Record the correction as a trace or architecture entry so future sessions benefit. A correction caught early prevents a wrong-direction implementation.

---

## 8. SURFACE INSIGHTS

Before waiting for instructions, proactively share what you've noticed:

1. **Inconsistencies or concerns.** Anything that contradicts itself across docs, smells wrong in the codebase, or seems like a latent issue. Don't wait to be asked.
2. **Top improvements.** 2-3 specific optimizations, refactors, or fixes you'd recommend based on what you've read. Be concrete — "the error handling in X could be simplified" not "code quality could improve."
3. **Questions that affect approach.** If anything is ambiguous, underspecified, or could go multiple ways, ask now. A 30-second question saves a 30-minute redo.
4. **Criticism.** If the documentation is stale, the architecture has debt, or a previous decision looks wrong in hindsight — say so. Directly.

Don't filter yourself. The human wants a collaborator who notices things, not an executor who waits for orders.

Present your insights in this format:
- **Version:** current version from identity
- **Blockers:** anything preventing work (0 if none)
- **Inconsistencies:** things that don't match (stale counts, version drift, etc)
- **Recommendations:** 2-3 prioritized suggestions
- **Questions:** anything that needs user clarification

---

## 9. READ PROJECT NOTES

If the project has a notes, issues, or task tracking system (markdown files, in-app notes, TODO lists, etc.):

1. **Locate notes.** Check these sources in order:
   - **DAL notes** (if `.ava/brain.db` exists): `node .ava/dal.mjs note list` and `node .ava/dal.mjs note counts`. Categories: improvement, issue, bug, idea.
   - **Markdown notes**: `notes/`, `TODO.md`, `NOTES.md`, or any notes directory/file mentioned in the documentation.
   - **Ava_Main ecosystem only** (optional): `.tab-notes.json` via REST API (`GET /api/notes/all` or `GET /api/notes/:tabKey`). Requires Ava_Main's REST server — not available in standalone deployments.

   Open notes are your primary task queue.

2. **Read all open items.** Categorize what you find: bugs, improvements, feature requests, questions, stale/already-resolved items.
3. **Flag resolved items.** If a note describes something that's already been fixed or implemented (based on the current codebase), flag it for removal.
4. **Incorporate into session plan.** Merge relevant notes and handoff items to build a prioritized plan for this session. Present it to the user.

If no notes system exists, skip this step.

### Archived Context

If you encounter references to past decisions, sessions, or architectural context that aren't fully explained in the current core docs, check these locations:
- `plans/archive/` — Superseded plans with receipts
- `sessions/` — Curated session notes (older sessions still in-tree)
- brain.db: `decision list --status superseded` for historical decisions

Archived content is still valid context — it was moved because the active surface changed, not because it stopped mattering.

---

## 10. START WORKING

Once oriented:

1. Present your ready state: version, blockers, **incomplete features from prior sessions**, insights, questions, and a prioritized plan. **Incomplete features are the default top priority.** Await explicit confirmation before implementing.
2. If the user has a specific request, proceed with that — but surface incomplete items first so the user can make an informed choice to defer them.
3. If picking from the plan, propose your approach and get confirmation
4. If unclear, ask — it's cheaper to clarify now than to redo work later

### Start a DAL Session (before implementation begins)

Once you have confirmation to proceed and know what you're working on, open a DAL session:

```bash
node .ava/dal.mjs session start "description of the work"
```

This MUST happen before any `action record`, `trace add`, or other brain.db writes. The session is the container — actions and traces bind to the open session automatically. If you skip this step, all actions will have `session_id = null` and the handoff will show `session_id: "unknown"`.

**When tools or commands fail:** Explain what was attempted, the specific error, and your next approach. Never silently retry or move on without surfacing what happened.

### During Work: Record Traces

As you work, leave breadcrumbs for the next session using session traces:

```bash
node .ava/dal.mjs trace add "investigating: found root cause in X"
node .ava/dal.mjs trace add "implementing: rewrote Y to fix Z"
node .ava/dal.mjs trace add "verified: tests pass after change"
```

Traces are lightweight — use them for significant steps, not every file edit. They auto-collect into the handoff YAML at closeout, giving the next agent a step-by-step record of what happened and why.

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
