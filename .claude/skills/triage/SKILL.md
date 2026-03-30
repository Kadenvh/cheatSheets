---
name: triage
description: "Ecosystem-wide status assessment: read health beacons, vault notes, open notes across all projects, and recommend priorities"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
---

# Triage — Ecosystem Status & Priority Routing

Read state from every project in the ecosystem — health beacons, vault session notes, open notes, active plans — and produce a prioritized status report.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/triage.md`.

### Protocol:
   - **Read health beacons** → `~/.pe-health/*.json` for machine-readable status per project
   - **Read recent vault session notes** → latest session note per project from Obsidian vault
   - **Read open notes** → `ecosystem notes` or direct brain.db reads across all local projects
   - **Read active plans** → vault plans with `status: active` frontmatter
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

# Recent vault sessions
for p in PE Ava_Main McQueenyML CloudBooks; do
  ls -t "/home/ava/Obsidian/Ava/$p/sessions/"*.md 2>/dev/null | head -1
done
```
