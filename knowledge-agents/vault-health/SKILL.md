---
name: vault-health
description: Run vault health checks — broken wikilinks, frontmatter validation, category consistency, vault metrics. Reports issues; fixes require user judgment.
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

- Vault: `vault/`
- Concepts: `vault/Concepts/` (flat — one `.md` per concept)
- Templates: `vault/Templates/Cheatsheet.md`

Categories are a frontmatter field (`Python`, `DataScience`, `Tools`, `Linux`, `General`), not folder names.

## Health Check Workflow

When triggered, run ALL of the following checks in order, then output a combined report.

### Check 1: Broken Wikilinks

Scan every note for `[[wikilinks]]`. For each link found, verify the target note exists.

1. List notes and extract wikilink targets:
   ```bash
   grep -rn -oE "\[\[[^]]+\]\]" vault/Concepts/ | sort -u
   ```
2. For each distinct target `[[X]]`, verify a note exists at `vault/Concepts/<slug-of-X>.md`. Slug rule: lowercase with hyphens, matching the filename.
3. A link is broken if no matching note exists.

**Report format:**
```
🔗 Wikilinks: {N} total links found
✅ All valid
```
or
```
🔗 Wikilinks: {N} total links found
❌ {M} broken links:
  - [[missing-note]] referenced in vault/Concepts/variance.md
```

### Check 2: Frontmatter Validation

Every note should have YAML frontmatter with these required fields:
- `category:` (one of: `Python`, `DataScience`, `Tools`, `Linux`, `General`)
- `tags:` (array, non-empty)
- `title:` (string)
- `created:` (ISO date YYYY-MM-DD)
- `type:` (`cheatsheet` or `reference`)

Recommended:
- `difficulty:` (1-10)
- `exercise_hints:` (object with recall/understanding/application keys)

**How to check:** parse the frontmatter block of each `vault/Concepts/*.md` and validate each required field is present and well-formed.

**Report format:**
```
📋 Frontmatter: {N} notes checked
✅ All valid
```
or
```
📋 Frontmatter: {N} notes checked
❌ {M} issues:
  - vault/Concepts/quick-note.md — missing tags
  - vault/Concepts/git-setup.md — missing category field
```

### Check 3: Category Consistency

Verify each note's `category:` value matches one of the canonical categories.

```bash
grep -h "^category:" vault/Concepts/*.md | sort -u
```

Any value not in `{Python, DataScience, Tools, Linux, General}` is a category drift.

**Report format:**
```
📁 Categories: {N} notes checked
✅ All canonical
```
or
```
📁 Categories: {N} notes checked
❌ {M} drifts:
  - vault/Concepts/ml-theory.md has category: MachineLearning (not canonical)
```

### Check 4: Concept Identity (filename ↔ title)

Filename slug = concept ID. For each note, verify the filename slug is consistent with the `title:` frontmatter field (slug = lowercase + hyphens, no extension).

```bash
# Example check for a single file
title=$(grep "^title:" vault/Concepts/variance.md | sed 's/title: *//; s/"//g')
slug=$(basename vault/Concepts/variance.md .md)
# slug should equal lowercase-hyphenated title
```

Flag cases where the slug substantially diverges from the title.

### Check 5: Vault Metrics

Summary of vault state:

```
📊 Vault Overview:
  Total notes: {N}
  By category:
    Python: {n1} | DataScience: {n2} | Tools: {n3} | Linux: {n4} | General: {n5}
  Templates: {t} template file(s) in vault/Templates/
```

## Combined Health Report Format

**Healthy vault:**
```
🏥 **Vault Health Report**

🔗 Wikilinks: ✅ {N} links, all valid
📋 Frontmatter: ✅ {N} notes, all valid
📁 Categories: ✅ {N} notes, all canonical
🔖 Concept Identity: ✅ All slugs consistent
📊 Total: {N} notes | Py:{n1} DS:{n2} Tools:{n3} Linux:{n4} Gen:{n5}

**Overall: HEALTHY**
```

**Vault with issues:**
```
🏥 **Vault Health Report**

🔗 Wikilinks: ❌ 2 broken links
📋 Frontmatter: ❌ 1 note missing tags
📁 Categories: ✅ All canonical
🔖 Concept Identity: ⚠️ 1 slug-title mismatch
📊 Total: {N} notes | Py:{n1} DS:{n2} Tools:{n3} Linux:{n4} Gen:{n5}

**Overall: NEEDS ATTENTION** (3 issues)

Issues to resolve:
1. [[missing-note]] broken in vault/Concepts/variance.md
2. vault/Concepts/git-setup.md missing `tags` in frontmatter
3. vault/Concepts/ml-theory.md — title "Machine Learning" but slug "ml-theory"
```

## Fixes

This skill **reports** health issues. Fixes require user judgment:

- Broken wikilinks: rename the target note, create the missing note, or remove the link
- Frontmatter issues: author must fill in the missing field
- Category drift: author must reassign to a canonical category
- Slug/title mismatch: rename the file OR update the title

Do NOT auto-fix without explicit approval.

## Edge Cases

- **Empty vault** — Report "Vault is empty. Create a note in vault/Concepts/ using the Cheatsheet template to get started."
- **Notes with no frontmatter at all** — Flag as "missing frontmatter entirely" (not per-field).
- **Non-`.md` files in Concepts/** — Skip silently.
- **Large vault (100+ notes)** — Warn: "Scanning {N} notes, this may take a moment..."
