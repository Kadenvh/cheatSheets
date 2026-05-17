# columbia-programming-data-structures

ColumbiaX **CU.OC.AI002 — Programming & Data Structures**. EdX course.

## How this folder is organized

```
columbia-programming-data-structures/
├── README.md                                          (this file)
├── manifest.json                                      seed for learning.db
├── columbia-programming-data-structures.md            course-level note
├── section-1/
│   ├── section-1.md                                   section overview
│   └── <lecture-slug>.md                              one per lecture
├── section-2/ …
└── _assets/
    ├── slides/<section>.pdf                           downloaded slide decks (pdf-plus renders)
    └── transcripts/<lecture>.txt                      raw transcripts (optional)
```

## Workflow

1. **Add a real section.** Replace placeholder rows in `manifest.json` with the actual section titles + overviews from the EdX course outline. Then re-run the importer:
   ```bash
   node .ava/course-import.mjs vault/Courses/columbia-programming-data-structures/manifest.json
   ```
   The import is idempotent — re-run any time the manifest changes.

2. **Create the section note.** From the Obsidian command palette → "Templater: Insert template" → `Section.md`. Answer the prompts (course slug = `columbia-programming-data-structures`, sort order = whichever).

3. **For each lecture, create a lecture note.** Same flow with the `Lecture.md` template. Paste transcript into the Transcript section (or link to `_assets/transcripts/<slug>.txt`).

4. **Wiki-link concepts.** As lectures introduce canonical concepts (e.g. "linked list", "hash collision", "amortized complexity"), wiki-link to `vault/Concepts/<concept>.md`. Create the concept note if it doesn't exist.

5. **Sync vault to ChromaDB** so the tutor can retrieve lecture content:
   ```bash
   curl -X POST http://localhost:4173/api/learning/vault-sync
   ```

6. **Record progress** as you complete each lecture / post-test (manual for MVP; auto-record from tutor later). Either edit status fields in `manifest.json` and re-import, or update `learning.db` directly.

## Files needed before tutor is fully grounded

- [ ] Real section list pasted into `manifest.json`
- [ ] At least one section's lectures authored as `.md` notes
- [ ] At least one section's slide deck dropped in `_assets/slides/`
- [ ] Vault-sync run once after lecture notes exist

## Cross-references

- Plan: [[plans/edx-courses]]
- Templates: `vault/Templates/Course.md`, `vault/Templates/Section.md`, `vault/Templates/Lecture.md`
- Tutor identity: `knowledge-agents/tutor/`
- Schema: `.ava/learning-schema.sql` (v2 EdX section)
