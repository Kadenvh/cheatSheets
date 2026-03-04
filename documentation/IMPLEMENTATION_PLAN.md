# Knowledge Curator - Implementation Plan

**Created:** 2026-02-11
**Updated:** 2026-03-04
**Status:** All Phases Complete + Knowledge Graph (V2.1.0)
**Current Phase:** Operational — All 4 phases + GRAPH.md knowledge graph

---

## Current Status

All four phases are **implemented and operational**, enhanced with a **knowledge graph layer** (GRAPH.md) that tracks entities, relationships, and clusters across vault notes.

**What's Working:**
- ✅ Phase 1 (INGEST): `/process` — categorize, file cheat sheets, extract entities/relationships to GRAPH.md
- ✅ Phase 2 (RETRIEVE): Natural language Q&A with [[wikilink]] citations + graph-aware query expansion
- ✅ Phase 3 (CONSOLIDATE): `/consolidate` — scan for duplicates, merge with approval
- ✅ Phase 4 (MAINTAIN): `/health` — 7 health checks (including GRAPH.md validation) + HEARTBEAT.md monitoring
- ✅ Knowledge Graph: GRAPH.md with entities, relationships, clusters — maintained automatically
- ✅ Command routing via knowledge-retrieval skill (default handler)
- ✅ OpenClaw gateway running on Windows
- ✅ Discord bot connected to vhTech server
- ✅ obsidian-cli installed and configured (default vault: openClaw_Vault)

### Known Issues

#### Gateway Scheduled Task Auto-Closes
**Status:** Workaround in place
**Symptom:** Windows scheduled task for `openclaw gateway` starts then immediately closes
**Workaround:** Manual start required after each restart
```powershell
openclaw gateway --port 18789
```
**Impact:** Low — gateway stays running once started manually

#### obsidian-cli search-content Is Interactive
**Status:** Workaround in place
**Symptom:** `obsidian-cli search-content` launches interactive fuzzy UI, hangs in non-interactive shells
**Workaround:** Use PowerShell `Select-String` for content search, `obsidian-cli frontmatter --print` for tag search
**Impact:** None — alternative search methods work correctly in skill instructions

---

## V2.1.0 — Knowledge Graph Integration Tasks

### Completed ✅
- [x] Create and bootstrap GRAPH.md from existing vault content (VARIANCE_CHEATSHEET)
- [x] Update knowledge-curator SKILL.md with entity/relationship extraction steps (3, 6, 7, 8, 10)
- [x] Update knowledge-retrieval SKILL.md with graph-aware query expansion (Step 1.5)
- [x] Bug fix: vault-health path shorthand — added Critical Path Rule section
- [x] Bug fix: vault-health auto-fix without approval — added STOP directive and explicit wait
- [x] Add Check 7 (GRAPH.md Validation) to vault-health SKILL.md
- [x] Update CLAUDE.md to V2.1.0 (graph section, DO NOT path shorthand rule, file structure)
- [x] Add future enhancement stubs to knowledge-curator SKILL.md
- [x] Add future enhancement stubs to knowledge-retrieval SKILL.md
- [x] Add future enhancement stubs to knowledge-consolidator SKILL.md
- [x] Documentation closeout (IMPLEMENTATION_PLAN.md, PROJECT_ROADMAP.md)

---

## Phase 1 (INGEST) Tasks

### Completed ✅
- [x] Install OpenClaw via npm
- [x] Configure Discord bot and connect to vhTech server
- [x] Install obsidian-cli via Scoop, set default vault
- [x] Create vault structure: Knowledge/{Python,DataScience,Automation,Tools}
- [x] Create INDEX.md tracking system
- [x] Create knowledge-curator skill
- [x] Define categorization rules
- [x] Implement frontmatter enhancement
- [x] Test with VARIANCE_CHEATSHEET.md ✅

### Phase 1 Refinements (Optional)
- [ ] Test with 5+ diverse cheat sheets (different categories)
- [ ] Validate miscategorization rate (<5% target)
- [ ] Add duplicate detection (warn if similar file already in vault)

---

## Phase 2 (RETRIEVE - RAG) Tasks

### Completed ✅
- [x] Create `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md`
- [x] Implement command routing (routes `/process`, `/consolidate`, `/health` to respective skills)
- [x] Implement keyword extraction logic (3-5 substantive terms)
- [x] Implement dual search strategy:
  - Tag-based search via `obsidian-cli frontmatter --print`
  - Content search via PowerShell `Select-String`
  - (Note: `obsidian-cli search-content` is interactive, not usable programmatically)
- [x] Implement note reading via `obsidian-cli print "{note-name}"` (note name only, no path)
- [x] Build synthesis with [[wikilink]] citations
- [x] Implement "not in vault" response for missing topics
- [x] Handle edge cases (short questions, multiple topics, vault metadata queries, system help)
- [x] Verify all obsidian-cli commands work correctly
- [x] Verify PowerShell content search works across vault

---

## Phase 3 (CONSOLIDATE) Tasks

### Completed ✅
- [x] Create `C:\Users\Kaden\.openclaw\skills\knowledge-consolidator\SKILL.md`
- [x] Implement similarity detection heuristics:
  - Tag overlap (3+ shared = strong, 2 + same category = weak)
  - Title similarity (shared significant words)
  - Cross-category check (4+ shared tags threshold)
- [x] Build candidate presentation format for Discord
- [x] Implement merge workflow:
  - Read both notes via `obsidian-cli print`
  - Synthesize merged version preserving all code and wikilinks
  - Overwrite target via `obsidian-cli create --overwrite`
  - Archive old note via `obsidian-cli move` (auto-updates all wikilinks)
  - Update INDEX.md
- [x] Define merge target selection criteria (code > theory, newer, more connected)
- [x] User approval required before any merge (critical safety rule)
- [x] Verify `obsidian-cli move` and `obsidian-cli create --overwrite` commands work

---

## Phase 4 (MAINTAIN) Tasks

### Completed ✅
- [x] Create `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md`
- [x] Implement 7 health checks:
  - Check 1: Broken wikilinks (parse `[[links]]`, verify targets exist)
  - Check 2: Frontmatter validation (tags, created, category required)
  - Check 3: Category consistency (frontmatter category matches folder)
  - Check 4: INDEX.md drift (unlisted notes, orphaned entries)
  - Check 5: Vault metrics (note counts, inbox status)
  - Check 6: Auto-fix offer (INDEX.md drift only, with approval — STOP directive)
  - Check 7: GRAPH.md validation (entity counts, relationship integrity, source references)
- [x] Build combined health report format with emoji status indicators
- [x] Update `C:\Users\Kaden\.openclaw\workspace\HEARTBEAT.md` with lightweight monitoring:
  - Check 1: New files in inbox → notify
  - Check 2: INDEX.md sync check → notify if drift
  - Final: HEARTBEAT_OK if nothing needs attention
- [x] Verify all obsidian-cli commands used in health checks work correctly
- [x] Skip README.md files during health checks (not knowledge notes)

### Not Implemented (Future Enhancements)
- [ ] Configure daily cron job for health reports
- [ ] Configure weekly cron for consolidation scan
- [ ] Configure monthly cron for deep analysis
- [ ] Add learning gap recommendations

---

## Files Modified

### V2.1.0 (2026-02-12)

| File | Change |
|------|--------|
| `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\GRAPH.md` | Created and bootstrapped with 8 entities, 10 relationships, 1 cluster from VARIANCE_CHEATSHEET |
| `C:\Users\Kaden\.openclaw\skills\knowledge-curator\SKILL.md` | Rewritten: added entity/relationship extraction (steps 3, 6, 7, 8, 10), GRAPH.md update workflow |
| `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md` | Added Step 1.5 graph-aware query expansion, GRAPH path, future enhancement stubs |
| `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md` | Added Critical Path Rule, STOP directive for auto-fix, Check 7 (GRAPH.md validation) |
| `C:\Users\Kaden\.openclaw\skills\knowledge-consolidator\SKILL.md` | Added graph-aware future enhancement stubs |
| `C:\aiMain\cheatSheets\CLAUDE.md` | Updated to V2.1.0: graph section, DO NOT path shorthand rule, file structure, phase descriptions |
| `C:\aiMain\cheatSheets\documentation\IMPLEMENTATION_PLAN.md` | Updated to V2.1.0: graph tasks, files modified, handoff notes |
| `C:\aiMain\cheatSheets\documentation\PROJECT_ROADMAP.md` | Updated to V2.1.0: version history, architecture decision, phase descriptions |

### V2.0.0 (2026-02-11)

| File | Change |
|------|--------|
| `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md` | Created Phase 2 RETRIEVE skill (RAG + command router) |
| `C:\Users\Kaden\.openclaw\skills\knowledge-consolidator\SKILL.md` | Created Phase 3 CONSOLIDATE skill |
| `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md` | Created Phase 4 MAINTAIN skill |
| `C:\Users\Kaden\.openclaw\workspace\HEARTBEAT.md` | Updated with vault monitoring tasks |
| `C:\aiMain\cheatSheets\CLAUDE.md` | Updated: version 2.0.0, all phases complete, new commands, search-content warning |
| `C:\aiMain\cheatSheets\documentation\IMPLEMENTATION_PLAN.md` | Updated: all tasks checked off, new debugging notes |
| `C:\aiMain\cheatSheets\documentation\PROJECT_ROADMAP.md` | Updated: version history, architecture decisions |

### V1.0.0 (2026-02-11)

| File | Change |
|------|--------|
| `C:\Users\Kaden\.openclaw\skills\knowledge-curator\SKILL.md` | Created Phase 1 INGEST skill |
| `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\INDEX.md` | Created tracking index |
| `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\Python\VARIANCE_CHEATSHEET.md` | First processed cheat sheet |
| `C:\aiMain\cheatSheets\processed\VARIANCE_CHEATSHEET.md` | Archived original |
| `C:\aiMain\cheatSheets\documentation\PROJECT_ROADMAP.md` | Created (bootstrap) |
| `C:\aiMain\cheatSheets\documentation\IMPLEMENTATION_PLAN.md` | Created (bootstrap) |
| `C:\aiMain\cheatSheets\CLAUDE.md` | Created (bootstrap) |

---

## Debugging Notes

### Issue: Gateway Scheduled Task
**Status:** Workaround in place (manual start)
See CLAUDE.md → Known Issues for details.

### Issue: obsidian-cli search-content Is Interactive
**Status:** Workaround in place (see CLAUDE.md DO NOT rules)
**Discovery:** During Phase 2 implementation, `obsidian-cli search-content` was found to launch an interactive fuzzy UI, unusable for agents.
**Solution:** Use `obsidian-cli frontmatter --print` for tags, PowerShell `Select-String` for content.

### Note: obsidian-cli print Path Format
**Discovery:** `obsidian-cli print` requires just the note name (e.g., `"VARIANCE_CHEATSHEET"`), not the full path (e.g., `"Knowledge/Python/VARIANCE_CHEATSHEET"`). Including the path causes "Cannot find note in vault" error.

### Issue: vault-health Used Path Shorthand (V2.1.0 Fix)
**Status:** Fixed
**Discovery:** During V2.0.0 testing, `/health` used `C:\aiMain\cheatSheets\vault\` instead of the correct `openClaw_Vault\` path. The bug was in the agent's runtime path construction, not the skill text itself.
**Fix:** Added explicit "Critical Path Rule" section to vault-health SKILL.md: "ALWAYS use the full vault path `C:\aiMain\cheatSheets\openClaw_Vault\`."

### Issue: vault-health Auto-Fixed INDEX.md Without Approval (V2.1.0 Fix)
**Status:** Fixed
**Discovery:** During V2.0.0 testing, `/health` auto-fixed INDEX.md drift without waiting for user approval.
**Fix:** Rewrote Check 6 with "STOP" directive and explicit "You MUST wait for the user's response before making any changes" instruction.

---

## Handoff Notes

**System is operational at V2.1.0.** All four phases are implemented as OpenClaw skills, enhanced with a knowledge graph layer (GRAPH.md).

**Current state (verified 2026-03-04):**
- `new/` is empty — no pending cheat sheets
- `processed/` contains 4 files: `gemini-said.md`, `tags-python-pandas-data-science-learning-created-2025-02-16-.md`, `tags-statistics-data-science-descriptive-statistics-learning.md`, `tags-variance-statistics-data-science-descriptive-statistics.md`
- Vault on Linux copy has category directories with README placeholders only (actual knowledge notes may reside on Windows primary)
- INDEX.md and GRAPH.md not present on Linux copy

**Next priorities (for future sessions):**
1. Verify vault state on Windows primary (INDEX.md, GRAPH.md, knowledge notes)
2. Process any cheat sheets waiting in `new/` to populate the vault and grow the graph
3. Test graph-aware retrieval end-to-end via Discord
4. Test GRAPH.md validation via `/health`
5. Configure cron jobs for automated health reports and consolidation scans

**Architecture decisions documented in:** PROJECT_ROADMAP.md

---

*Updated after each session. Current as of 2026-03-04.*
