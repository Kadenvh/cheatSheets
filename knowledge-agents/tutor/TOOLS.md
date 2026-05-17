# TOOLS.md — Tutor Tools

The tools you can call to do your job. These are the **conceptual contracts** — actual API endpoints live in the Ava_Main hub (`/api/learning/*`). If a tool you need isn't here, ask for it before improvising.

## Course / Section / Lecture queries

### `query_course(course_id)`
Get a course's full structure and current progress.
- **Input:** `course_id` slug (e.g. `columbia-programming-data-structures`)
- **Returns:** course metadata + ordered section list + lesson_count + progress summary
- **Use when:** the user asks "where am I in this course?" or you need orientation

### `get_section(section_id)`
Get one section's detail.
- **Input:** `section_id` slug (e.g. `cu-pds-section-1`)
- **Returns:** title, overview, ordered lecture list, slides_ref, pre/post test status
- **Use when:** the user wants to start or resume a section

### `get_lecture(lecture_id)`
Get one lecture's metadata + content reference.
- **Input:** `lecture_id` slug
- **Returns:** title, lecture_kind, transcript_ref, vault_ref (path to lecture note), status
- **Use when:** the user asks about a specific lecture by name/number

### `get_vault_note(path)`
Read the full content of a vault note.
- **Input:** path relative to vault root
- **Returns:** raw markdown content
- **Use when:** you have a `vault_ref` from `get_lecture` or `get_section` and need the actual content

## Semantic retrieval

### `semantic_search(query, scope, course_id?, k=5)`
Vector-similarity search via ChromaDB.
- **Input:** `query`, `scope` (`lecture`|`concept`|`both`), optional `course_id`, `k` (default 5)
- **Returns:** ordered list of `{ source, score, snippet, full_ref }`
- **Use when:** the user asks a question and you need grounded answer material before responding

### `list_concepts(course_id?)`
Concepts linked from any course's lecture notes.
- **Returns:** array of concept slugs + last-touched dates
- **Use when:** surface cross-course pattern opportunities, or check what concepts a course has touched

### `get_concept(slug)`
Read a canonical concept note.
- **Returns:** vault/Concepts/<slug>.md content + prerequisites + difficulty
- **Use when:** you need the canonical definition or want to surface prerequisite gaps

## Progress recording

### `record_lecture_complete(lecture_id)`
Mark a lecture done. `curriculum_lessons.status` → `complete`. If all lectures in a section done and no post-test, section status flips too.

### `record_test_score(test_id, score, notes?)`
Record a pre/post/final test result. Updates `curriculum_tests` row (score, last_attempt_at, attempts++, completed_at if score >= passing).

### `record_question(lecture_id, question)`
Log a question for follow-up. Appends to the lecture note's "Questions for the Tutor" section.

## Coach surface

### `list_due_reviews()`
FSRS-due concept review items. Use when opening a study session.

### `suggest_next(course_id)`
Recommend what to do next in a course with rationale.

## Conversation continuity

### `get_recent_sessions(course_id?, n=3)`
Last N tutoring session summaries. Call at session start.

### `log_session_summary(summary, concepts_touched[], lectures_referenced[])`
Persist a session summary to `brain.db` sessions (kind=`tutor`).

---

## Tools you don't have (yet)

If you need any of these, ask for them — don't fake them:

- `auto_extract_concepts(lecture_id)` — deferred per `plans/edx-courses.md` Phase 3
- `auto_generate_review_card(concept_slug)` — deferred Phase 3
- `crawl_edx_course(url)` — deferred Phase 5
- `grade_test(test_id, answers[])` — deferred Phase 4

## Environment-specific notes

- Vault root: `vault/` (project root `/home/ava/cheatSheets`)
- Courses: `vault/Courses/<course-slug>/`
- Concepts canonical: `vault/Concepts/`
- ChromaDB: localhost:8001 (server-managed; go through `semantic_search`)
- learning.db: `.ava/learning.db` (server-managed; go through query tools)
