# Phase 4: MAINTAIN — Vault Health Skill + HEARTBEAT.md

**Skill Name:** `vault-health`  
**Install Path:** `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md`  
**Emoji:** 🏥  
**Trigger:** `/health` command or fuzzy match ("vault health", "health check", "check the vault")

**Also updates:** `C:\Users\Kaden\.openclaw\workspace\HEARTBEAT.md`

---

## What This Skill Does

Two things:

### A) On-Demand Health Check (via `/health` command)
When the user runs `/health`, the agent performs a comprehensive vault audit and reports findings. This is the primary interaction mode for now.

### B) Passive Monitoring (via HEARTBEAT.md)
The HEARTBEAT.md file defines checks that run during OpenClaw's periodic heartbeat. For now, this is lightweight — the real work happens via `/health`. But wiring up HEARTBEAT.md means the agent can eventually catch issues proactively.

**No cron jobs are being configured in this phase.** Cron is a future enhancement. The system relies on manual `/health` triggers and the built-in heartbeat cycle.

---

## Health Check Workflow (On-Demand)

When `/health` is triggered, run ALL of the following checks:

### Check 1: Broken Wikilinks

Scan every note in the vault for `[[wikilinks]]`. For each link found, verify the target note exists.

```powershell
# For each note in the vault:
obsidian-cli print "{note-name}"
# Parse content for [[anything]] pattern
# For each [[link]], verify the target exists:
obsidian-cli list "Knowledge/"  # and Archive/ if it exists
# Compare link targets against actual files
```

**Report:**
```
🔗 Wikilinks: {N} total links found
✅ All valid    OR    ❌ {M} broken links:
  - [[missing-note]] referenced in Knowledge/Python/variance.md (line 42)
  - [[old-reference]] referenced in Knowledge/DataScience/stats.md (line 15)
```

### Check 2: Frontmatter Validation

Every note in `Knowledge/` should have YAML frontmatter with these fields:
- `tags:` (array, non-empty)
- `created:` (date)
- `processed:` (date)
- `category:` (matches one of: Python, DataScience, Automation, Tools)

```powershell
# For each note:
obsidian-cli print "{note-name}"
# Check for --- delimited frontmatter at top
# Validate required fields exist and have values
```

**Report:**
```
📋 Frontmatter: {N} notes checked
✅ All valid    OR    ❌ {M} issues:
  - Knowledge/Python/quick-note.md — missing tags
  - Knowledge/Tools/git-setup.md — missing category field
```

### Check 3: Category Consistency

Verify that each note's `category:` frontmatter field matches the folder it's in.

```
📁 Categories: {N} notes checked
✅ All consistent    OR    ❌ {M} mismatches:
  - Knowledge/Python/ml-theory.md has category: DataScience (should be Python or move to DataScience/)
```

### Check 4: INDEX.md Drift

Compare INDEX.md entries against actual vault contents:
- Notes in vault but missing from INDEX.md → "Unlisted"
- Notes in INDEX.md but not in vault → "Orphaned entry"

```powershell
# List actual vault contents
obsidian-cli list "Knowledge/Python"
obsidian-cli list "Knowledge/DataScience"
obsidian-cli list "Knowledge/Automation"
obsidian-cli list "Knowledge/Tools"

# Read INDEX.md
obsidian-cli print "Knowledge/INDEX"

# Compare
```

**Report:**
```
📑 INDEX.md: {N} entries, {M} actual notes
✅ In sync    OR    ❌ Drift detected:
  - UNLISTED: Knowledge/Python/new-note.md (not in INDEX.md)
  - ORPHANED: [[deleted-note]] (in INDEX.md but file doesn't exist)
```

### Check 5: Vault Metrics

```
📊 Vault Overview:
  Total notes: {N}
  Python: {n1} | DataScience: {n2} | Automation: {n3} | Tools: {n4}
  Archived: {n5}
  Last processed: {date of newest processed: field}
```

### Check 6: Auto-Fix (Safe Fixes Only)

If INDEX.md has drift, offer to fix it:
```
🔧 Auto-fixable issues:
  - INDEX.md has 2 unlisted notes → Add entries? (react ✅ to fix)
  - INDEX.md has 1 orphaned reference → Remove? (react ✅ to fix)
```

**Only auto-fix INDEX.md drift.** Everything else (broken wikilinks, frontmatter issues, category mismatches) should be reported for the user to address, since fixing those requires judgment calls.

---

## Combined Health Report Format

```
🏥 **Vault Health Report**

🔗 Wikilinks: ✅ {N} links, all valid
📋 Frontmatter: ✅ {N} notes, all valid
📁 Categories: ✅ {N} notes, all consistent
📑 INDEX.md: ⚠️ 1 unlisted note (auto-fixable)
📊 Total: {N} notes | Python: {n1} | DS: {n2} | Auto: {n3} | Tools: {n4}

**Overall: HEALTHY** (1 minor issue)

🔧 Auto-fix available: Add 1 unlisted note to INDEX.md → react ✅
```

Or if issues found:
```
🏥 **Vault Health Report**

🔗 Wikilinks: ❌ 2 broken links
📋 Frontmatter: ❌ 1 note missing tags
📁 Categories: ✅ All consistent
📑 INDEX.md: ✅ In sync
📊 Total: {N} notes | Python: {n1} | DS: {n2} | Auto: {n3} | Tools: {n4}

**Overall: NEEDS ATTENTION** (3 issues)

Issues to resolve:
1. [[missing-note]] broken in Knowledge/Python/variance.md:42
2. [[old-ref]] broken in Knowledge/DataScience/stats.md:15
3. Knowledge/Tools/git-setup.md missing `tags` in frontmatter

Run `/health` again after fixing to verify.
```

---

## HEARTBEAT.md Configuration

Update `C:\Users\Kaden\.openclaw\workspace\HEARTBEAT.md` with a lightweight monitoring checklist. This runs on OpenClaw's built-in heartbeat cycle (~30 min intervals when active).

**Keep this minimal** — heartbeats should be fast and cheap on tokens:

```markdown
# Knowledge Curator Vault Monitor

1. Check if any new files exist in `C:\aiMain\cheatSheets\new\`
   - If yes: notify user "📥 {N} new cheat sheets ready for processing. Run `/process` when ready."
   - If no: continue silently

2. Quick INDEX.md sync check
   - Count files in Knowledge/ subfolders
   - Compare against INDEX.md entry count
   - If mismatch: notify user "📑 INDEX.md may be out of sync. Run `/health` for details."
   - If match: continue silently

3. FINAL STEP: HEARTBEAT_OK (only if nothing needs attention)
```

**Why minimal:** Each heartbeat consumes API tokens. The detailed checks (broken links, frontmatter validation) are expensive and should only run on-demand via `/health`. The heartbeat just watches for the obvious stuff — new files waiting and index drift.

---

## SKILL.md Template

```yaml
---
name: vault-health
description: Run vault health checks — broken links, frontmatter validation, INDEX.md sync, category consistency. Auto-fixes safe issues.
metadata:
  {
    "openclaw":
      {
        "emoji": "🏥"
      },
  }
---

# Vault Health — Monitoring & Maintenance

## Trigger
- `/health` command
- Fuzzy match: "health check", "vault health", "check the vault", "vault status"

## Paths
[... vault paths ...]

## Health Checks
[... all 6 checks detailed above ...]

## Report Format
[... the combined report template ...]

## Auto-Fix Rules
[... INDEX.md drift only, with approval ...]

## Discord Formatting
[... no tables, use emoji status indicators ...]
```

---

## Edge Cases

1. **Empty vault** — Report "Vault is empty. Add cheat sheets to `new/` and run `/process` to get started."
2. **Obsidian-cli not responding** — Report the error clearly: "Couldn't connect to obsidian-cli. Is the default vault configured? Run `obsidian-cli print-default` to check."
3. **Archive/ folder doesn't exist** — Skip archive metrics, don't error. Create it if a consolidation happens later.
4. **Notes with no frontmatter at all** — Flag as "missing frontmatter entirely" (not just missing individual fields). These are likely notes that were manually added without going through the `/process` pipeline.
5. **Very large vault (100+ notes)** — The check should still work but may take longer. Warn the user: "Scanning {N} notes, this may take a moment..."

---

## What This Phase Does NOT Do (Yet)

- ❌ No cron jobs configured (future enhancement)
- ❌ No automatic repair of broken wikilinks (requires judgment)
- ❌ No automatic re-categorization (requires content analysis)
- ❌ No graph visualization (future GRAPH.md generation)
- ❌ No learning recommendations based on gaps

These are all documented in the PROJECT_ROADMAP.md as future enhancements.

---

## Success Criteria

- ✅ All 6 health checks run correctly
- ✅ Report is clear, concise, and Discord-formatted
- ✅ Auto-fix only touches INDEX.md (safe operations)
- ✅ Never modifies note content without explicit approval
- ✅ HEARTBEAT.md is lightweight (minimal token consumption)
- ✅ Handles edge cases gracefully (empty vault, missing obsidian-cli, etc.)
- ✅ Emoji status indicators make report scannable at a glance
