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
- Fuzzy match: "consolidate", "merge notes", "clean up duplicates", "deduplicate", "merge similar notes"

## Paths

- Vault: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/`
- Knowledge: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/`
- Categories: `Python/`, `DataScience/`, `Automation/`, `Tools/`
- INDEX: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/INDEX.md`
- Archive: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Archive/`

## Critical Rule

**NEVER merge notes without explicit user approval.** Always present candidates first and wait for confirmation before modifying any files.

## Consolidation Workflow

### Step 1: Scan Vault Inventory

List all notes in each category:

```bash
obsidian-cli list "Knowledge/Python"
obsidian-cli list "Knowledge/DataScience"
obsidian-cli list "Knowledge/Automation"
obsidian-cli list "Knowledge/Tools"
```

For each note found, read its frontmatter to extract tags:

```bash
obsidian-cli frontmatter "{note-name}" --print
```

Build a list of all notes with their tags, category, and file path.

### Step 2: Detect Similar Note Pairs

Compare every pair of notes using these heuristics, in order of confidence:

**Heuristic A — Tag Overlap (Primary)**

Compare frontmatter tags between pairs of notes within the same category.

- **3+ shared tags** = Strong candidate for merge
- **2 shared tags + same category** = Weak candidate, flag for review
- **<2 shared tags** = Not similar, skip

Example:
```
Note A: tags: [python, numpy, variance, statistics, data-science]
Note B: tags: [python, variance, statistics, learning]
Overlap: python, variance, statistics (3) = Strong candidate
```

**Heuristic B — Title Similarity (Secondary)**

Compare note filenames for obvious overlaps:
- Same core concept with different phrasing: "variance_calculation" vs "calculating-variance" = Flag
- Shared significant words in title: "numpy_basics" vs "numpy_arrays" = Flag
- Completely different titles: "variance" vs "docker_setup" = Skip

**Heuristic C — Cross-Category Check (Tertiary)**

Some notes in different categories may cover overlapping content:
- A Python note about "statistics with NumPy" and a DataScience note about "variance theory" might overlap
- Check tag overlap across categories with a higher threshold: **4+ shared tags** required for cross-category candidates

### Step 3: Present Candidates

For each candidate pair, format a report for Discord:

```
🔗 **Consolidation Candidates Found**

**Pair 1:**
- `Knowledge/Python/VARIANCE_CHEATSHEET.md`
  Tags: [python, numpy, variance, statistics, data-science]
  Created: 2026-02-11

- `Knowledge/DataScience/statistics_fundamentals.md`
  Tags: [statistics, variance, mean, data-science]
  Created: 2026-02-13

🔍 Overlap: variance, statistics, data-science (3 tags)
💡 Both cover variance concepts — Python note has code, DataScience note has theory

**Suggested action:** Merge into a comprehensive note, keeping code AND theory.
**Suggested target:** `Knowledge/Python/VARIANCE_CHEATSHEET.md` (has code, more actionable)

React with ✅ to merge or ❌ to skip.
```

**If no candidates found:**
```
✅ **Vault looks clean!** No similar notes detected across {N} notes in {M} categories.

Tip: As more cheat sheets are added, duplicates become more likely. Run `/consolidate` periodically.
```

**If multiple candidates:** Present all pairs at once. Let the user approve or reject each individually.

### Step 4: Execute Merge (Only After User Approval)

When the user approves a merge:

1. **Read both notes:**
   ```bash
   obsidian-cli print "{note-1-name}"
   obsidian-cli print "{note-2-name}"
   ```

2. **Synthesize merged version:**
   - Combine unique content from both notes
   - Deduplicate overlapping sections
   - Preserve ALL code examples from both
   - Preserve ALL `[[wikilinks]]` from both
   - Merge frontmatter tags (union of both tag sets)
   - Update `processed:` date to today in frontmatter
   - Keep the better structure and organization

3. **Write merged note to vault:**
   ```bash
   obsidian-cli create "{target-note-name}" --content "{merged-content}" --overwrite
   ```

4. **Archive the old note:**
   ```bash
   obsidian-cli move "{old-note-name}" "Archive/{old-note-name}-merged-{YYYY-MM-DD}"
   ```
   **CRITICAL:** `obsidian-cli move` automatically updates ALL wikilinks across the entire vault. Any note that linked to `[[old-note]]` will now point to the archive location. No broken links.

5. **Update INDEX.md:**
   - Remove the old note's entry from its category section
   - Update the merged note's description if it changed
   - Add an entry in a "Merged Notes" section tracking what was consolidated

6. **Report results:**
   ```
   ✅ **Merge complete!**

   - Target: `Knowledge/Python/VARIANCE_CHEATSHEET.md` (updated)
   - Archived: `Archive/statistics_fundamentals-merged-2026-02-11.md`
   - Wikilinks: Auto-updated across vault
   - INDEX.md: Updated
   - Tags on merged note: [python, numpy, variance, statistics, data-science, mean]
   ```

## Archive Structure

If the `Archive/` folder doesn't exist in the vault, create it:

```bash
# Check if Archive exists
obsidian-cli list "Archive"
# If error/empty, it will be created automatically when obsidian-cli move targets it
```

Archive location: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Archive/`

Archived notes keep their full content for reference but are moved out of active Knowledge categories.

## Merge Target Selection

When deciding which note becomes the merge target (the one that gets updated) vs. which gets archived:
- Prefer the note with **more code examples** (more actionable)
- Prefer the note in the **more specific category** (Python > DataScience for code topics)
- Prefer the **newer note** if content quality is similar
- Prefer the note with **more wikilinks** (better connected)

## Discord Formatting Rules

- No markdown tables — use bullet lists
- Wrap links in `<>` to suppress embeds
- Use emoji status indicators for quick scanning
- Keep the report concise but include enough detail for the user to make an informed decision

## Edge Cases

1. **Vault has <5 notes** — Still run the scan. Likely report "no candidates found." Don't skip.
2. **Notes share tags but are genuinely different** — This is why user approval is required. Present the candidate but don't assume merge is correct.
3. **Cross-category merge** — Target should be whichever category is more actionable (code > theory). Update `category:` in frontmatter to match the target folder.
4. **Multiple merge candidates** — Present all at once, let user approve/reject each individually.
5. **Note has no frontmatter tags** — Skip it for tag-based comparison, but still check title similarity.

## Future Enhancements (Not Yet Implemented)

- Graph-aware consolidation: consult GRAPH.md relationships to identify merge candidates (notes with many shared entity connections, even with low tag overlap)
- Topic summary generation: auto-generate category summaries when a cluster in GRAPH.md reaches 5+ notes
- Learning Session Configuration feedback loop: analyze consolidation patterns to suggest improvements to the cheat sheet template
- Automatic confidence-scored merges (>95% similarity = auto-merge without approval)
- Semantic similarity using embeddings (when vault exceeds 1000 notes)
