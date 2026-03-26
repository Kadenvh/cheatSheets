# Cheatsheet Generation Prompt — v5.0 Schema Specification

**Author:** PE / Scribe
**Version:** 1.0.0 (draft)
**Date:** 2026-03-16
**Status:** Design — PE spec for Ava to apply to `0 - cheatSheets/Cheatsheet_Generation_Prompt.md`
**Implements:** Ava Session 69 Decision #72 (cheatsheet as structured input format)

---

## Purpose

Extend the cheatsheet frontmatter schema with three new fields (`difficulty`, `prerequisites`, `exercise_hints`) that enable the knowledge-curator to automatically:
1. Seed the prerequisite DAG without manual linking
2. Infer appropriate exercise complexity per mastery level
3. Generate targeted exercises for recall, understanding, and application

The cheatsheet is the **structured input format** for the learning pipeline. Curator reads it, enriches it, and produces: a ChromaDB document in `knowledge-learning`, a brain.db concept with difficulty and prerequisites, and exercise scaffolding for the Spark agent.

---

## Current State (v4.0)

The v4.0 prompt defines cheatsheet structure with these frontmatter fields:
- `title` — concept name
- `topic` / `category` — classification
- `tags` — searchable keywords
- `date` — creation date

The body contains sections like Quick Reference, Key Concepts, Common Patterns, Gotchas, etc.

**Gap:** No machine-readable difficulty, no prerequisite links, no exercise generation guidance. The curator has to infer all three from free-text content — unreliable and inconsistent.

---

## New Fields

### `difficulty`

```yaml
difficulty: 4    # 1-10 scale
```

| Value | Meaning | Example Concepts |
|-------|---------|-----------------|
| 1-2 | Fundamentals, no prerequisites | basic CLI commands, variable types |
| 3-4 | Core concepts, 1-2 prerequisites | file permissions, list comprehensions |
| 5-6 | Intermediate, requires foundation | Docker networking, async/await |
| 7-8 | Advanced, multiple prerequisites | Kubernetes operators, metaclasses |
| 9-10 | Expert, deep specialization | kernel tuning, compiler optimization |

**Default:** `5` (if omitted, curator assumes mid-range)
**Validation:** Warn if difficulty < 3 but prerequisites listed (likely underrated). Warn if difficulty > 7 but no prerequisites (likely overrated or missing links). Warnings only — never reject.

### `prerequisites`

```yaml
prerequisites:
  - linux-file-permissions
  - bash-scripting-basics
```

Values are concept slugs (matching the `concepts.id` format in the ontology spec). These seed the prerequisite DAG directly — curator creates `prerequisites` table entries with `source: 'cheatsheet'` and `strength: 1.0`.

**Default:** `[]` (empty list — no prerequisites)
**Validation:** Warn if difficulty >= 5 and prerequisites is empty ("consider adding prerequisites for intermediate+ concepts"). Warn if a prerequisite slug doesn't match any existing concept (curator should still accept — the concept may not exist yet). Warnings only.

**Slug format:** lowercase, hyphenated, domain-scoped where needed. Examples: `docker-basics`, `python-list-comprehensions`, `linux-file-permissions`. No spaces, no special characters beyond hyphens.

### `exercise_hints`

```yaml
exercise_hints:
  recall: "key syntax for chmod numeric notation"
  understanding: "when to use chmod vs chown vs chgrp"
  application: "set up a shared directory with correct group permissions"
```

These guide the Spark agent when generating exercises for this concept. Each key maps to an exercise type from the ontology spec. The value is a short prompt hint — not the full exercise, just enough direction to produce a relevant one.

**Default:** Omitted entirely (curator/Spark infers from content)
**Validation:** Warn if all three hints are identical (copy-paste error). No rejection. If only some hints are provided, that's fine — Spark infers the rest.

**Supported keys:** `recall`, `understanding`, `application`. The `analysis` exercise type is always inferred from content (spot-the-error and predict-output exercises are too concept-specific for generic hints).

---

## Complete Example

A cheatsheet with all v5.0 fields populated:

```yaml
---
title: Linux File Permissions
topic: Linux System Administration
category: linux
tags: [permissions, chmod, chown, chgrp, acl, umask]
date: 2026-03-16
difficulty: 4
prerequisites:
  - linux-filesystem-basics
  - bash-scripting-basics
exercise_hints:
  recall: "numeric notation for rwxr-xr-- and common permission sets (755, 644, 600)"
  understanding: "when chmod numeric vs symbolic is preferred, and why setuid/setgid are dangerous"
  application: "configure a shared project directory where group members can create and edit files but not delete each other's work (sticky bit)"
---

## Quick Reference
...rest of cheatsheet body...
```

### How the Curator Processes This

1. **Creates/updates concept** in brain.db: `id: 'linux-file-permissions'`, `name: 'Linux File Permissions'`, `domain: 'linux'`, `difficulty: 4`, `source: 'cheatsheet'`
2. **Creates prerequisite edges:** `linux-file-permissions → linux-filesystem-basics` and `linux-file-permissions → bash-scripting-basics`, both `strength: 1.0`, `source: 'cheatsheet'`
3. **Stores document** in ChromaDB `knowledge-learning` collection with full cheatsheet content
4. **Links concept to document:** sets `chroma_doc_id` on the concept
5. **Stores exercise hints** as metadata on the ChromaDB document (or in a concept metadata column — implementation choice for Ava)

When Spark generates a lesson for this concept at mastery level `novice`:
- **recall** exercise uses the hint to focus on numeric notation patterns
- **understanding** exercise uses the hint to compare chmod modes
- **application** exercise uses the hint to design a sticky-bit scenario
- **analysis** exercise is inferred from content (e.g., "what permissions result from `chmod 2775`?")

---

## Design Principles

1. **Recommended with defaults, not required.** A cheatsheet with zero new fields is still valid. The curator processes it the same as before — it just has less metadata to work with.

2. **Warnings, not rejections.** The validator emits quality warnings for suspicious combinations (high difficulty + no prerequisites, identical exercise hints, etc.) but never hard-rejects a cheatsheet. Friction kills contributions.

3. **Progressive enhancement.** Existing v4.0 cheatsheets work without modification. Adding v5.0 fields improves curator output quality but isn't mandatory. Migration is organic — add fields when editing or creating cheatsheets, not as a bulk operation.

4. **Hints, not prescriptions.** `exercise_hints` guide generation — they're not exercise text. The Spark agent uses them as direction, not templates. If the hint says "key syntax for chmod" but the agent generates a better exercise about umask, that's fine.

---

## Validator Rules

For the cheatsheet validator (if one exists or is built):

```
WARN  difficulty < 3 AND prerequisites is non-empty
      → "Low difficulty with prerequisites — consider raising difficulty or removing prerequisites"

WARN  difficulty >= 5 AND prerequisites is empty
      → "Intermediate+ concept with no prerequisites — consider adding foundational concepts"

WARN  prerequisite slug not found in concepts table
      → "Prerequisite '{slug}' not found — will be created as stub concept on import"

WARN  all exercise_hints values are identical
      → "Exercise hints appear duplicated — each type should target different cognitive skills"

INFO  difficulty omitted → defaulting to 5
INFO  prerequisites omitted → no prerequisite edges created
INFO  exercise_hints omitted → Spark will infer exercises from content
```

---

## Migration Path

No breaking changes. v4.0 cheatsheets remain valid. The curator should:
1. Check for new fields on import
2. Use defaults when fields are absent
3. Log which cheatsheets would benefit from v5.0 fields (for gradual backfill)

Ava applies these schema changes to `0 - cheatSheets/Cheatsheet_Generation_Prompt.md`. The prompt itself should document the new fields in its "Frontmatter Schema" section with the defaults and examples shown above.

---

*This spec is a PE-managed design document. Ava applies the changes to the cheatsheet prompt file. Changes to this spec require PE review.*
