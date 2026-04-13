---
name: triage
description: "Ecosystem-wide status assessment: read health beacons, project-root sessions/ notes, open notes across all projects, and recommend priorities"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
---

# Triage — Ecosystem Status & Priority Routing

Read state from every project in the ecosystem — health beacons, session notes in each project's `sessions/`, open notes, active plans in each project's `plans/` — and produce a prioritized status report.

## Instructions

Follow the protocol below. For the full detailed version, read `.claude/.prompts/triage.md`.

### Protocol:
   - **Read health beacons** → `~/.pe-health/*.json` for machine-readable status per project
   - **Read recent session notes** → latest `sessions/session-{N}.md` per project (structured schema, written by session-export)
   - **Read open notes** → `ecosystem notes` or direct brain.db reads across all local projects
   - **Read active plans** → `.md` files under each project's `plans/` (excluding `archive/`); flag projects with ≥2 active plans
   - **Synthesize** → per-project status, cross-project dependencies, stale projects, priority stack
   - **Recommend** → ordered priority list with rationale

## Key Rules

- **Read everything, change nothing.** Triage is observation, not action.
- **Surface cross-project dependencies.** Handoff notes that reference other projects are invisible unless someone looks.
- **Be honest about staleness.** Projects with no session in >7 days get flagged.
- **Show the full picture.** Don't filter healthy projects — the user needs complete ecosystem awareness.

## Priority Ranking

1. Broken (verify failures, crashed sessions)
2. Stale (no activity >7 days with open notes)
3. Cross-project blockers (handoffs that block other projects)
4. Bugs/issues (open across all projects)
5. Active plan progress (next actions)
6. Improvements (enhancements)
7. Ideas (future, lowest priority)

## Quick Start

```bash
# Health beacons
ls ~/.pe-health/*.json

# Open notes across ecosystem
node .ava/dal.mjs ecosystem notes

# Recent session notes (project-root sessions/)
for proj in /home/ava/Prompt_Engineering /home/ava/Ava_Main /home/ava/CloudBooks /home/ava/tradeSignal /home/ava/WATTS /home/ava/seatwise /home/ava/adze-cad /home/ava/3D_Printing; do
  ls -t "$proj/sessions/"*.md 2>/dev/null | head -1
done

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "triage: <what failed>" --type investigation --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.
```
