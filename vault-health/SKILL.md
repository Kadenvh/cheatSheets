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
- Fuzzy match: "health check", "vault health", "check the vault", "vault status", "how's the vault doing?"

## Paths

- Vault: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/`
- Knowledge: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/`
- Categories: `Python/`, `DataScience/`, `Automation/`, `Tools/`
- INDEX: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/INDEX.md`
- GRAPH: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/GRAPH.md`
- Archive: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Archive/`
- New (inbox): `/home/ava/Ava_Main/repos/cheatSheets/new/`

## Critical Path Rule

**ALWAYS use the full vault path `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/`.** Never abbreviate to `vault/` or any other shorthand. Every path in commands and output must reference `openClaw_Vault`, not `vault`.

## Health Check Workflow

When triggered, run ALL of the following checks in order, then output a combined report.

### Check 1: Broken Wikilinks

Scan every note in `Knowledge/` for `[[wikilinks]]`. For each link found, verify the target note exists in the vault.

**How to check:**

1. List all notes:
   ```bash
   obsidian-cli list "Knowledge/Python"
   obsidian-cli list "Knowledge/DataScience"
   obsidian-cli list "Knowledge/Automation"
   obsidian-cli list "Knowledge/Tools"
   ```

2. For each note, read its content:
   ```bash
   obsidian-cli print "{note-name}"
   ```

3. Parse content for `[[anything]]` patterns (regex: `\[\[([^\]]+)\]\]`)

4. For each link target, check if a note with that name exists anywhere in the vault. A link is broken if no matching note exists.

**Report format:**
```
🔗 Wikilinks: {N} total links found
✅ All valid
```
or
```
🔗 Wikilinks: {N} total links found
❌ {M} broken links:
  - [[missing-note]] referenced in Knowledge/Python/variance.md
  - [[old-reference]] referenced in Knowledge/DataScience/stats.md
```

### Check 2: Frontmatter Validation

Every note in `Knowledge/` should have YAML frontmatter with these required fields:
- `tags:` (array, non-empty)
- `created:` (date)
- `category:` (one of: Python, DataScience, Automation, Tools)

Optional but expected:
- `processed:` (date)
- `source:` (string)

**How to check:**

For each note:
```bash
obsidian-cli frontmatter "{note-name}" --print
```

Validate that required fields exist and have values.

**Report format:**
```
📋 Frontmatter: {N} notes checked
✅ All valid
```
or
```
📋 Frontmatter: {N} notes checked
❌ {M} issues:
  - Knowledge/Python/quick-note.md — missing tags
  - Knowledge/Tools/git-setup.md — missing category field
```

**Note:** Skip README.md files in category folders — they don't need frontmatter.

### Check 3: Category Consistency

Verify that each note's `category:` frontmatter field matches the folder it's in.

A note in `Knowledge/Python/` should have `category: Python`. A mismatch means the note is either miscategorized or in the wrong folder.

**Report format:**
```
📁 Categories: {N} notes checked
✅ All consistent
```
or
```
📁 Categories: {N} notes checked
❌ {M} mismatches:
  - Knowledge/Python/ml-theory.md has category: DataScience (should be Python or move to DataScience/)
```

### Check 4: INDEX.md Drift

Compare INDEX.md entries against actual vault contents:

1. List actual notes in each category folder
2. Read INDEX.md and parse wikilinks in each section
3. Compare:
   - Notes in vault but missing from INDEX.md = "Unlisted"
   - Notes in INDEX.md but not in vault = "Orphaned entry"

**Report format:**
```
📑 INDEX.md: {N} entries, {M} actual notes
✅ In sync
```
or
```
📑 INDEX.md: {N} entries, {M} actual notes
❌ Drift detected:
  - UNLISTED: Knowledge/Python/new-note.md (not in INDEX.md)
  - ORPHANED: [[deleted-note]] (in INDEX.md but file doesn't exist)
```

### Check 5: Vault Metrics

Provide a summary of the vault's current state:

```
📊 Vault Overview:
  Total notes: {N}
  Python: {n1} | DataScience: {n2} | Automation: {n3} | Tools: {n4}
  Archived: {n5}
  Inbox: {n6} files waiting in new/
  Last processed: {date of newest processed: field}
```

### Check 6: Auto-Fix Offer — APPROVAL REQUIRED

**STOP.** Do NOT auto-fix anything without explicit user approval.

If INDEX.md has drift (unlisted or orphaned entries), present the issue and ask:

```
🔧 Auto-fixable issues:
  - INDEX.md has {N} unlisted notes — Add entries?
  - INDEX.md has {M} orphaned references — Remove?

React ✅ to approve this fix, or ❌ to skip.
```

**You MUST wait for the user's response before making any changes.** Do NOT fix INDEX.md, rename files, or modify any vault content without the user explicitly approving.

**Only INDEX.md drift is auto-fixable.** Everything else (broken wikilinks, frontmatter issues, category mismatches) should be reported for the user to address manually, since fixing those requires judgment calls.

**When user explicitly approves the INDEX.md fix:**
1. Read current INDEX.md
2. Add unlisted notes to the correct category section with a basic description
3. Remove orphaned entries
4. Update the "Last Updated" date
5. Write updated INDEX.md using `obsidian-cli create "Knowledge/INDEX" --content "{updated}" --overwrite`

### Check 7: GRAPH.md Validation

Verify the knowledge graph is consistent:

1. Check GRAPH.md exists:
   ```bash
   obsidian-cli print "GRAPH"
   ```

2. Count entities and relationships in the file

3. Verify the header counts match actual counts (e.g., "Entities: 8" should match the number of entity lines)

4. For every `Source: [[note]]` reference in an entity, verify the target note exists in the vault

5. Report any orphaned graph entries (entities whose source notes have been deleted)

**Report format:**
```
🕸️ Graph: {N} entities, {M} relationships, all sources valid
```
or
```
🕸️ Graph: ❌ {M} issues:
  - Header says 8 entities but found 6
  - Source [[deleted-note]] not found in vault
```

If GRAPH.md doesn't exist, report:
```
🕸️ Graph: ⚠️ GRAPH.md not found — run `/process` to generate it
```

---

## Combined Health Report Format

**Healthy vault:**
```
🏥 **Vault Health Report**

🔗 Wikilinks: ✅ {N} links, all valid
📋 Frontmatter: ✅ {N} notes, all valid
📁 Categories: ✅ {N} notes, all consistent
📑 INDEX.md: ✅ In sync
🕸️ Graph: ✅ {N} entities, {M} relationships, all sources valid
📊 Total: {N} notes | Python: {n1} | DS: {n2} | Auto: {n3} | Tools: {n4}

**Overall: HEALTHY**
```

**Vault with issues:**
```
🏥 **Vault Health Report**

🔗 Wikilinks: ❌ 2 broken links
📋 Frontmatter: ❌ 1 note missing tags
📁 Categories: ✅ All consistent
📑 INDEX.md: ⚠️ 1 unlisted note (auto-fixable)
🕸️ Graph: ✅ 8 entities, 10 relationships
📊 Total: {N} notes | Python: {n1} | DS: {n2} | Auto: {n3} | Tools: {n4}
📥 Inbox: {N} files waiting to be processed

**Overall: NEEDS ATTENTION** (3 issues)

Issues to resolve:
1. [[missing-note]] broken in Knowledge/Python/variance.md
2. Knowledge/Tools/git-setup.md missing `tags` in frontmatter

🔧 Auto-fix available: Add 1 unlisted note to INDEX.md — react ✅
```

## Discord Formatting Rules

- No markdown tables — use bullet lists and emoji indicators
- Use ✅ ❌ ⚠️ for quick visual scanning
- Keep the report concise — details only for issues, not for passing checks
- If the vault is large (100+ notes), warn: "Scanning {N} notes, this may take a moment..."

## Edge Cases

1. **Empty vault** — Report "Vault is empty. Add cheat sheets to `new/` and run `/process` to get started."
2. **obsidian-cli not responding** — Report the error: "Couldn't access vault. Is obsidian-cli configured? Run `obsidian-cli print-default` to check."
3. **Archive/ folder doesn't exist** — Skip archive metrics, report 0 archived. Don't error.
4. **Notes with no frontmatter at all** — Flag as "missing frontmatter entirely" (not just missing individual fields).
5. **README.md files in category folders** — Skip these during all checks. They are not knowledge notes.

## What This Skill Does NOT Do (Yet)

- No cron jobs configured (future enhancement)
- No automatic repair of broken wikilinks (requires judgment)
- No automatic re-categorization (requires content analysis)
- No learning gap recommendations

These are documented in PROJECT_ROADMAP.md as future enhancements.
