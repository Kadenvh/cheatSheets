# Phase 3: CONSOLIDATE — Vault Consolidation Skill

**Skill Name:** `knowledge-consolidator`  
**Install Path:** `C:\Users\Kaden\.openclaw\skills\knowledge-consolidator\SKILL.md`  
**Emoji:** 🔗  
**Trigger:** `/consolidate` command or fuzzy match ("consolidate vault", "merge similar notes", "clean up duplicates")

---

## What This Skill Does

When triggered, the agent scans the vault for notes that likely cover the same topic, presents merge candidates to the user for approval, and then synthesizes merged versions — keeping the best content from both while eliminating redundancy.

Think of it as the librarian noticing you have two books about the same subject and saying "Hey, these overlap a lot — want me to combine them into one better book?"

**Important:** This skill NEVER auto-merges. It always presents candidates and waits for user approval before modifying any files.

---

## Consolidation Workflow

### Step 1: Scan Vault Inventory

```powershell
# List all notes in each category
obsidian-cli list "Knowledge/Python"
obsidian-cli list "Knowledge/DataScience"
obsidian-cli list "Knowledge/Automation"
obsidian-cli list "Knowledge/Tools"
```

For each note, read its frontmatter to extract tags:

```powershell
obsidian-cli print "{note-name}"
# Parse the YAML frontmatter for tags array
```

### Step 2: Detect Similar Note Pairs

Use these heuristics (in order of confidence):

**Heuristic A — Tag Overlap (Primary)**
Compare frontmatter tags between every pair of notes within the same category.

- **3+ shared tags** → Strong candidate for merge
- **2 shared tags + same category** → Weak candidate, flag for review
- **<2 shared tags** → Not similar

Example:
```
Note A: tags: [python, numpy, variance, statistics, data-science]
Note B: tags: [python, variance, statistics, learning]
Overlap: python, variance, statistics (3) → Strong candidate
```

**Heuristic B — Title Similarity (Secondary)**
Compare note filenames for obvious overlaps:

- Same core concept with different phrasing: "variance_calculation" vs "calculating-variance" → Flag
- Shared significant words in title: "numpy_basics" vs "numpy_arrays" → Flag
- Completely different titles: "variance" vs "docker_setup" → Skip

**Heuristic C — Cross-Category Check (Tertiary)**
Some notes might belong in different categories but cover overlapping content:

- A Python note about "statistics with NumPy" and a DataScience note about "variance theory" might overlap
- Check tag overlap across categories too, but with higher threshold (4+ shared tags)

### Step 3: Present Candidates

For each candidate pair, format a report:

```
🔗 **Consolidation Candidates Found**

**Pair 1:**
📄 `Knowledge/Python/VARIANCE_CHEATSHEET.md`
   Tags: [python, numpy, variance, statistics, data-science]
   Created: 2026-02-11 | Lines: 45

📄 `Knowledge/DataScience/statistics_fundamentals.md`
   Tags: [statistics, variance, mean, data-science]
   Created: 2026-02-13 | Lines: 62

🔍 Overlap: variance, statistics, data-science (3 tags)
💡 Both cover variance concepts — Python note has code, DataScience note has theory

**Suggested action:** Merge into a comprehensive note, keeping code examples AND theory.
**Suggested target:** `Knowledge/Python/VARIANCE_CHEATSHEET.md` (has code, more actionable)

React with ✅ to merge or ❌ to skip.

---

No more candidates found. Vault has {N} total notes across {M} categories.
```

**If no candidates found:**
```
✅ **Vault looks clean!** No similar notes detected across {N} notes in {M} categories.

Tip: As more cheat sheets are added, duplicates become more likely. Run `/consolidate` periodically (weekly is a good cadence).
```

### Step 4: Execute Merge (Only After Approval)

When the user approves a merge:

1. **Read both notes:**
   ```powershell
   obsidian-cli print "Knowledge/Python/VARIANCE_CHEATSHEET"
   obsidian-cli print "Knowledge/DataScience/statistics_fundamentals"
   ```

2. **Synthesize merged version:**
   - Combine unique content from both notes
   - Deduplicate overlapping sections
   - Preserve ALL code examples
   - Preserve ALL wikilinks from both notes
   - Merge frontmatter tags (union of both tag sets)
   - Update `processed:` date in frontmatter
   - Keep the better structure/organization

3. **Write merged note:**
   ```powershell
   obsidian-cli create "{target-note}" --content "{merged-content}" --overwrite
   ```

4. **Archive the old note:**
   ```powershell
   obsidian-cli move "{old-note}" "Archive/{old-note-name}-merged-{YYYY-MM-DD}"
   ```
   
   **CRITICAL:** `obsidian-cli move` automatically updates ALL wikilinks across the entire vault. Any note that linked to `[[old-note]]` will now link to `[[Archive/old-note-name-merged-date]]`. This is a key feature — no broken links.

5. **Update INDEX.md:**
   - Remove the old note's entry
   - Update the merged note's description if needed
   - Add an entry in a "Merged Notes" section tracking what was consolidated

6. **Report results:**
   ```
   ✅ **Merge complete!**
   
   📄 Target: `Knowledge/Python/VARIANCE_CHEATSHEET.md` (updated)
   📦 Archived: `Archive/statistics_fundamentals-merged-2026-02-11.md`
   🔗 Wikilinks: Auto-updated across vault
   📑 INDEX.md: Updated
   
   Tags on merged note: [python, numpy, variance, statistics, data-science, mean]
   ```

---

## Archive Structure

Create an `Archive/` folder in the vault if it doesn't exist:

```
openClaw_Vault/
├── Knowledge/
│   ├── Python/
│   ├── DataScience/
│   ├── Automation/
│   ├── Tools/
│   └── INDEX.md
├── Archive/                    ← Merged/replaced notes go here
│   └── {note-name}-merged-{date}.md
└── Welcome.md
```

Archived notes retain their content for reference but are moved out of the active knowledge categories.

---

## Future Enhancement (Stub Only — Do Not Implement Now)

### Learning Session Feedback Loop

Eventually, this skill will analyze patterns in what gets consolidated and feed suggestions back to `Learning_Session_Configuration.md`. For example:

- "Notes about Python + statistics frequently need merging → suggest the learning session template include a 'Related Existing Notes' field"
- "Theory and code notes about the same topic end up in different categories → suggest a dual-category tag approach"

**For now:** Just add a comment in the SKILL.md noting this as a future enhancement. Do not implement.

---

## SKILL.md Template

```yaml
---
name: knowledge-consolidator
description: Scan vault for similar/duplicate notes, propose merges, and execute consolidation with user approval.
metadata:
  {
    "openclaw":
      {
        "emoji": "🔗"
      },
  }
---

# Knowledge Consolidator — Vault Deduplication & Merging

## Trigger
- `/consolidate` command
- Fuzzy match: "consolidate", "merge notes", "clean up duplicates", "deduplicate"

## Paths
[... vault paths, archive path ...]

## Consolidation Workflow
[... the 4-step workflow above ...]

## Similarity Heuristics
[... tag overlap, title similarity, cross-category rules ...]

## Merge Rules
[... synthesis instructions, what to preserve, frontmatter merging ...]

## Report Formats
[... candidate presentation format, merge result format ...]

## Future Enhancement (Not Yet Implemented)
- Learning Session Configuration feedback loop
- Automatic confidence-scored merges (>95% = auto-merge)
- Semantic similarity using embeddings
```

---

## Edge Cases

1. **Vault has <5 notes** — Still run the scan, likely report "no candidates found." Don't skip just because the vault is small.
2. **Notes share tags but are genuinely different** — This is why user approval is required. Present the candidate but don't assume merge is correct.
3. **Cross-category merge** — When merging notes from different categories, the target should be whichever category is more actionable (code > theory, generally). Update the merged note's `category:` frontmatter field.
4. **Archive folder doesn't exist** — Create it: `C:\aiMain\cheatSheets\openClaw_Vault\Archive\`
5. **Multiple merge candidates** — Present all candidates at once, let user approve/reject each individually.

---

## Success Criteria

- ✅ Correctly identifies similar notes via tag overlap and title matching
- ✅ Presents clear, actionable merge candidates
- ✅ NEVER merges without user approval
- ✅ Merged notes preserve all unique content from both sources
- ✅ `obsidian-cli move` used for archiving (auto-updates wikilinks)
- ✅ INDEX.md updated after every merge
- ✅ Archive/ folder created and used properly
- ✅ Reports results clearly after merge
