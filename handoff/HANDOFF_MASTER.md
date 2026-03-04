# Knowledge Curator — Phases 2-4 Implementation Handoff

**For:** Claude Code  
**From:** Lead Developer (via Claude Opus planning session)  
**Date:** 2026-02-11  
**Working Directory:** `C:\aiMain\cheatSheets`

---

## Your Mission

You are implementing Phases 2, 3, and 4 of the Knowledge Curator system — an automated knowledge management pipeline built on OpenClaw + Obsidian. Phase 1 (INGEST) is already working in production. Your job is to build the remaining three phases as OpenClaw skills, test them, and update all project documentation when finished.

**Read these files IN ORDER before writing any code:**

1. `C:\aiMain\cheatSheets\CLAUDE.md` — Project reference, rules, current state
2. `C:\aiMain\cheatSheets\documentation\IMPLEMENTATION_PLAN.md` — Task checklists, debugging notes
3. `C:\aiMain\cheatSheets\documentation\PROJECT_ROADMAP.md` — Architecture, decisions, rationale
4. `C:\aiMain\cheatSheets\docs_archived\DISCOVERY_BRIEF_Phases_2-4.md` — Technical research (obsidian-cli capabilities, RAG patterns, consolidation strategies)
5. `C:\aiMain\cheatSheets\Learning_Session_Configuration.md` — The prompt template users use to generate cheat sheets (your input format)
6. `C:\Users\Kaden\.openclaw\skills\knowledge-curator\SKILL.md` — Phase 1 reference implementation (use as template for new skills)
7. `C:\Users\Kaden\.openclaw\openclaw.json` — Current OpenClaw configuration
8. `C:\Users\Kaden\.openclaw\workspace\SOUL.md` — Agent personality
9. `C:\Users\Kaden\.openclaw\workspace\AGENTS.md` — Agent behavior rules

**Also check the vault state:**
- `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\INDEX.md`
- `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\` (list all categories and contents)
- `C:\aiMain\cheatSheets\new\` (check for files to process)

---

## What You're Building

Three new OpenClaw skills, each installed at `C:\Users\Kaden\.openclaw\skills\{skill-name}\SKILL.md`:

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `knowledge-retrieval` | Any Discord message to @OpenClaw that is NOT a `/command` | RAG-based Q&A against the vault |
| `knowledge-consolidator` | `/consolidate` | Scan vault for duplicates, propose merges, execute with approval |
| `vault-health` | `/health` | Run vault health checks, report issues, fix what's fixable |

Plus a command routing layer that distinguishes between `/commands` and natural language questions.

---

## Detailed Implementation Plans

The three phase-specific implementation plans follow this document:

- **`HANDOFF_PHASE2_RETRIEVE.md`** — Knowledge retrieval / RAG skill
- **`HANDOFF_PHASE3_CONSOLIDATE.md`** — Vault consolidation skill  
- **`HANDOFF_PHASE4_HEALTH.md`** — Vault health & maintenance skill

Read all three before starting implementation. They are designed to be built sequentially (Phase 2 → 3 → 4) but understanding the full picture first will help you make better decisions.

---

## Critical Architecture Decisions (Already Made — Follow These)

### 1. Command Routing

The agent must distinguish between commands and questions:

- **`/process`** → Triggers existing `knowledge-curator` skill (Phase 1 INGEST)
- **`/consolidate`** → Triggers new `knowledge-consolidator` skill (Phase 3)
- **`/health`** → Triggers new `vault-health` skill (Phase 4)
- **Anything else** → Treated as a knowledge question → `knowledge-retrieval` skill (Phase 2)

Routing should be fuzzy-tolerant. If someone writes "process cheat sheets" without a slash, it should still route to the process skill. The key insight: slash commands are explicit actions on the vault; everything else is a question TO the vault.

Think of it like a library: `/process` is dropping off books at the intake desk, `/consolidate` is asking the librarian to reorganize the shelves, `/health` is requesting an inventory report, and any other message is just asking the librarian a question.

### 2. Skill File Convention

Every skill goes in `C:\Users\Kaden\.openclaw\skills\{skill-name}\SKILL.md` and must follow this structure (derived from the existing `knowledge-curator` skill):

```yaml
---
name: skill-name
description: One-line description of what this skill does.
metadata:
  {
    "openclaw":
      {
        "emoji": "🔍"
      },
  }
---
```

Followed by markdown instructions the agent reads and follows.

### 3. No Embeddings / No External Dependencies

- Vault is small (<1000 notes). Keyword search via `obsidian-cli search-content` is sufficient.
- No vector databases, no pip installs, no external APIs beyond Anthropic.
- All operations use: `obsidian-cli`, PowerShell file operations, and Claude's reasoning.

### 4. Windows Paths

Always use backslashes. Never forward slashes. Example:
```
✅ C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\Python\
❌ C:/aiMain/cheatSheets/openClaw_Vault/Knowledge/Python/
```

### 5. obsidian-cli Has No `--vault` Flag Needed

Default vault is already configured as `openClaw_Vault`. All commands can omit `--vault`.

```powershell
# These all work without specifying vault:
obsidian-cli search-content "variance"
obsidian-cli print "Knowledge/Python/VARIANCE_CHEATSHEET"
obsidian-cli list "Knowledge"
obsidian-cli create "note-name" --content "..." --overwrite
obsidian-cli move "old-path" "new-path"  # Auto-updates ALL wikilinks!
```

### 6. Learning Session Input Format

Cheat sheets arriving in `new/` are generated by Claude Chrome sessions using the template in `Learning_Session_Configuration.md`. They may or may not already have frontmatter. The Phase 1 skill handles adding/enhancing frontmatter, so Phases 2-4 can assume vault notes HAVE frontmatter with tags, category, and dates.

However, the `Learning_Session_Configuration.md` template includes fields that the curator should be aware of:
- `tags:` array
- `created:` date
- `session:` topic name
- `## Related To` section with `[[wikilinks]]`
- `## Questions/To Explore` section

Phase 2 retrieval should leverage all of these — especially tags and wikilinks for better search results.

---

## Implementation Order

```
Phase 2 (knowledge-retrieval)     ← Build first, test, verify
    ↓
Phase 3 (knowledge-consolidator)  ← Build second, test, verify
    ↓
Phase 4 (vault-health)            ← Build third, test, verify
    ↓
Update HEARTBEAT.md               ← Wire up monitoring
    ↓
Documentation Closeout            ← Update CLAUDE.md, IMPLEMENTATION_PLAN.md, PROJECT_ROADMAP.md
```

---

## Testing Strategy

After implementing each phase, test it by:

1. **Phase 2:** Ask 5+ questions via the skill logic — mix of questions that SHOULD find answers in the vault and questions that SHOULD return "not in vault." Verify [[wikilink]] citations are valid.

2. **Phase 3:** With enough notes in the vault, run `/consolidate` and verify it correctly identifies similar notes (or correctly reports no duplicates if vault is small). Verify the merge workflow logic is sound.

3. **Phase 4:** Run `/health` and verify it catches any broken wikilinks, missing frontmatter, or INDEX.md drift. Verify the report format is clear.

**Note:** The user will add additional cheat sheets to `new/` for broader testing. The system should handle the cheat sheet format defined in `Learning_Session_Configuration.md`.

---

## Documentation Closeout (MANDATORY — Do This Last)

After all three skills are implemented and tested, perform a full documentation update following the closeout protocol in `C:\aiMain\cheatSheets\documentation\.skills\session-closeout.md` and `C:\aiMain\cheatSheets\documentation\.prompts\generic_closeout_prompt.md`.

Specifically update:

1. **`CLAUDE.md`** — Add the new skills, update phase status (Phase 2/3/4 from 🔜/📅 to ✅), add any new commands, update Quick Start
2. **`IMPLEMENTATION_PLAN.md`** — Check off completed tasks, update handoff notes, add any new debugging notes
3. **`PROJECT_ROADMAP.md`** — Update version history, add architecture decisions made during implementation
4. **Version numbers** — Increment appropriately and ensure all three files match

### Routing Rule Reminder

Information lives in ONE place:

| Question | File |
|----------|------|
| "What must I never do?" | CLAUDE.md |
| "How do I run this?" | CLAUDE.md |
| "Why was this decided?" | PROJECT_ROADMAP.md |
| "What's done, what's next?" | IMPLEMENTATION_PLAN.md |

Do NOT duplicate content across files. Reference only.

---

## Deliverables Checklist

When you're done, you should have created/modified:

- [ ] `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md` — Phase 2 skill
- [ ] `C:\Users\Kaden\.openclaw\skills\knowledge-consolidator\SKILL.md` — Phase 3 skill
- [ ] `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md` — Phase 4 skill
- [ ] `C:\Users\Kaden\.openclaw\workspace\HEARTBEAT.md` — Updated with vault monitoring tasks
- [ ] `C:\aiMain\cheatSheets\CLAUDE.md` — Updated with new phases, commands, status
- [ ] `C:\aiMain\cheatSheets\documentation\IMPLEMENTATION_PLAN.md` — Tasks checked off, handoff updated
- [ ] `C:\aiMain\cheatSheets\documentation\PROJECT_ROADMAP.md` — Version history, decisions documented

**Final output:** Respond with a complete summary of everything you built, any issues encountered, and the current state of all three documentation files.

---

## One More Thing

You are operating in a Windows environment. The OpenClaw gateway may or may not be running — you don't need it running to create skill files. You're writing SKILL.md files that the agent will read when triggered via Discord. Think of yourself as writing the instruction manual the agent follows, not running the agent itself.

Good luck. The existing Phase 1 skill (`knowledge-curator/SKILL.md`) is your north star for format and conventions. Match its style.
