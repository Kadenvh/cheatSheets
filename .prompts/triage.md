# Ecosystem Triage Prompt

You are performing an ecosystem-wide status assessment. Your job is to read state from every available source — health beacons, vault session notes, open notes, active plans — and produce a clear picture of what's happening across all projects, what needs attention, and what the recommended priority stack is.

This is hub-main's "morning briefing." It answers: what did each project do last? what's blocked? what's stale? what should happen next?

---

## 1. READ HEALTH BEACONS

Health beacons are JSON files emitted by each project's session-context hook:

```bash
ls ~/.pe-health/*.json 2>/dev/null
```

For each beacon, extract:
- Project name, version, schema version
- Last session timestamp and summary
- Open notes count
- Verify status (pass/warn/fail counts)
- Template sync status

If no beacons exist, fall back to direct brain.db reads (Step 1B).

### 1B. Direct brain.db reads (fallback)

For each known local project, read brain.db directly:

```bash
# Check ecosystem notes if available
node .ava/dal.mjs ecosystem notes 2>/dev/null

# Or manually per project:
for proj in Ava_Main CloudBooks seatwise tradeSignal WATTS cheatSheets 3D_Printing; do
  echo "=== $proj ==="
  sqlite3 /home/ava/$proj/.ava/brain.db "SELECT key, value FROM identity WHERE key = 'project.name';" 2>/dev/null
  sqlite3 /home/ava/$proj/.ava/brain.db "SELECT count(*) as open_notes FROM notes WHERE completed_at IS NULL;" 2>/dev/null
  sqlite3 /home/ava/$proj/.ava/brain.db "SELECT id, substr(summary, 1, 80) as summary, ended_at FROM sessions ORDER BY started_at DESC LIMIT 1;" 2>/dev/null
done
```

---

## 2. READ RECENT VAULT SESSION NOTES

For each project with a vault folder, read the most recent session note:

```bash
for proj in PE Ava_Main McQueenyML CloudBooks TradeSignal WATTS Seatwise Adze-CAD; do
  latest=$(ls -t "/home/ava/Obsidian/Ava/$proj/sessions/"*.md 2>/dev/null | head -1)
  if [ -n "$latest" ]; then
    echo "=== $proj: $(basename "$latest") ==="
  fi
done
```

Read each latest session note. Extract:
- Session number and title
- Date and status
- Summary (what was accomplished)
- Key deliverables
- Open items or handoffs mentioned

---

## 3. READ OPEN NOTES ACROSS PROJECTS

```bash
node .ava/dal.mjs ecosystem notes 2>/dev/null
```

Or manually aggregate open notes from each local brain.db. Categorize by:
- **Bugs/issues** — highest priority
- **Handoffs** — cross-project dependencies or pending work
- **Improvements** — nice-to-have enhancements
- **Ideas** — future possibilities

Flag any notes older than 14 days as potentially stale.

---

## 4. READ ACTIVE VAULT PLANS

```bash
for proj in PE Ava_Main McQueenyML CloudBooks TradeSignal WATTS; do
  plans=$(ls "/home/ava/Obsidian/Ava/$proj/plans/"*.md 2>/dev/null)
  for plan in $plans; do
    status=$(head -10 "$plan" | grep "status:" | sed 's/status: //')
    if [ "$status" = "active" ]; then
      echo "$proj: $(basename "$plan")"
    fi
  done
done
```

Read each active plan. Note:
- Completion percentage
- Blocking dependencies
- Next actions

---

## 5. SYNTHESIZE ECOSYSTEM STATUS

Produce a structured report:

```
Ecosystem Triage Report — {date}
═══════════════════════════════════

PROJECT STATUS:
  {project}: v{version} — Last session: {date} "{summary}"
    Notes: {open} open ({bugs} bugs, {handoffs} handoffs)
    Health: {pass}/{total} verify checks
    Status: {healthy|stale|needs-attention}

  {repeat for each project}

CROSS-PROJECT:
  Dependencies: {any handoff notes that reference other projects}
  Stale projects: {projects with no session in >7 days}
  Failed checks: {projects with verify failures}

ACTIVE PLANS:
  {project}: {plan name} — {completion}% ({next action})

PRIORITY STACK (recommended):
  1. {highest priority item with rationale}
  2. {second priority}
  3. {third priority}
  ...

NOTES:
  {any observations, risks, or recommendations}
```

---

## 6. PRIORITY RANKING RULES

Rank by this hierarchy:
1. **Broken** — verify failures, crashed sessions, blocked work
2. **Stale** — projects with no activity >7 days that have open notes
3. **Cross-project dependencies** — handoff notes that block other projects
4. **Bugs/issues** — open bug/issue notes across all projects
5. **Active plan progress** — next actions on active plans
6. **Improvements** — enhancement notes sorted by project importance
7. **Ideas** — future possibilities (lowest priority, surface for awareness)

---

## 7. RULES

- **Read everything, change nothing.** Triage is observation, not action.
- **Be honest about staleness.** If a project hasn't been touched in weeks, say so.
- **Surface cross-project dependencies.** These are invisible unless someone looks.
- **Don't filter.** Show all projects, even healthy ones. The user needs the full picture.
- **Recommend, don't decide.** The priority stack is a recommendation. The user chooses.
