---
name: cleanup
description: "Structural hygiene and targeted continuity repair. Enforce where-things-live rules, trim stale storage, and keep DAL lean. Use --full-ingest only for legacy migrations."
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - Agent
---

# Cleanup — Structural Hygiene & DAL Reconciliation

Enforce the "one place per question" rule across the project. Consolidate redundant storage locations, trim stale continuity data, audit optional memory files, and eliminate archive sprawl.

**Three modes:**
- **Default** (`/cleanup`) — structural enforcement + lean continuity audit + orphan scan
- **Full ingest** (`/cleanup --full-ingest`) — legacy migration mode only; read existing prose, extract durable value, and migrate it into the right canonical homes
- **Structural only** (`/cleanup --structure`) — skip DAL reconciliation, focus on filesystem consolidation

## Instructions

Follow the protocol below. For the full detailed version, read `.claude/.prompts/cleanup.md`.

### Phase 1: Structural Enforcement (always runs first)
   - **Where-things-live audit** — verify content is in the canonical location per the rules below
   - **Plans placement check** — `plans/` is at the project root, not under `.claude/`. Flag any plans found under `.claude/plans/` (v7 violation).
   - **Archive consolidation** — extract first, then keep superseded plans in `plans/archive/` with receipts
   - **Memory file audit** — `.claude/memory/` is optional compatibility space for lean observations, not a shadow documentation tree
   - **Root cleanup** — eliminate orphaned files at project root

### Phase 2: Lean DAL Audit (default + full-ingest)
   - Verify DAL prerequisites, detect mode (first-run vs ongoing)
   - Extract/verify minimal identity (project name/version/vision only when genuinely load-bearing) from CLAUDE.md
   - Compare and reconcile continuity state (brain.db ↔ CLAUDE.md ↔ plans ↔ handoff)
   - Prune or demote legacy architecture/learning-loop rows that do not justify themselves
   - Decision, session, note, and handoff health checks
   - Coverage report (PASS/FAIL)

### Phase 3: Full Ingest (--full-ingest only)
   - Discover legacy `.md`/`.txt` documents
   - Read each → extract durable value → route to the right canonical home
   - Classify: COVERED, STALE, MISSING
   - Present plan → confirm → execute → verify with a continuity-first resume check

## Where Things Live — Canonical Rules

These rules are the structural enforcement target. Cleanup MUST flag violations.

| Content Type | ONE Canonical Location | Violations to Flag |
|---|---|---|
| Active strategy/plans | `plans/` (project root) | Plans under `.claude/plans/`, root `archive/`, anywhere else |
| Superseded plans worth keeping | `plans/archive/` (project root) + receipt | Root `archive/`, `.claude/archive/`, nested cleanup dirs |
| Curated session notes | `sessions/` (project root) | Session logs in `plans/`, root, archive/ |
| Continuity state | brain.db (`sessions`, `notes`, `decisions`, minimal `identity`) + `.ava/handoffs/` | Broad code-structure dumps, stale prose blobs, duplicate status docs |
| Working observations | `.claude/memory/` only if still useful | Memory files that mirror brain.db, plans, or docs |
| Rules/commands | `CLAUDE.md` | Duplicated in SYSTEM-OVERVIEW.md or memory |
| System reference | `SYSTEM-OVERVIEW.md` | Duplicated in plans or memory |
| Code structure | GitNexus or live code inspection | FileStructure snapshots, route maps, symbol inventories, broad `architecture` rows |
| Archived cleanup residue | DELETE (not re-archive) | Timestamped cleanup-YYYY-MM-DD/ dirs |
| Obsidian vault folder for this project | RETIRED (v7) | Vault folder still exists — migrate `sessions/`, `END-GOAL.md` to project root and remove |

## Key Rules

- **One place per question.** Content in the wrong location is a bug, not a convenience.
- **Extract first, archive second.** Moving clutter to a new archive dir creates more clutter.
- **DAL is continuity, not encyclopedia.** Keep what helps session restart; demote the rest.
- **Dry-run first.** Present all moves/deletes/inserts before executing. User confirms.
- **Memory is optional compatibility, not canon.** If it is canonical, it does not belong in `memory/`.
- **Plans live at project root.** Active plans live in `plans/` exclusively, never under `.claude/`.
- **Root archive/ is legacy.** Content should be in `plans/archive/` or deleted. Do not create new root `archive/` entries.
- **Obsidian vault is retired.** v7 removed the vault layer. Any vault folder for this project should be migrated to project root and removed.

## Execution Notes

- **Always use absolute paths** for DAL commands — shell CWD can drift after archive moves
- **Verify moves** — `ls -la` the destination after every `mv` to confirm the file landed
- **GitNexus reindex** — after deleting/moving files that affect code structure, the codebase index goes stale. Run `npx gitnexus analyze` or note for post-commit hook
- **Read before deleting** — for unique files, always read first to extract value
- **Full ingest is exceptional** — use it for legacy migration or first-run hydration, not as routine maintenance

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the issue as a note or include it in the handoff/closeout summary. Use `agent_actions` only if the project still relies on that legacy surface.
2. Report to user with error message and suggested fix.
3. If brain.db is unreachable, note for closeout.

## After Completion

- If this project still uses `agent_actions`, record the cleanup result there. Otherwise rely on notes + handoff continuity.
- If CLAUDE.md rules or key commands changed, update CLAUDE.md
