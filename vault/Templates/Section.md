<%*
const slug = tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const today = tp.date.now("YYYY-MM-DD");
const course = await tp.system.prompt("Course slug (e.g., columbia-programming-data-structures)") || "";
const sortOrder = await tp.system.prompt("Sort order (1, 2, 3 …)") || "0";
_%>---
type: section
section_id: <% slug %>
course_id: <% course %>
title: <% tp.file.title %>
sort_order: <% sortOrder %>
slides_ref: ""
doc_pages: ""
has_pre_test: false
has_post_test: false
status: available
lecture_count: 0
created: <% today %>
---

# <% tp.file.title %>

> **Course:** [[<% course %>]] · **Section <% sortOrder %>** · **Status:** available

## Section Overview

*Paste the section overview from the course. This is the "what you'll learn in this section" blurb.*

## Lectures

*Use the Lecture template (`vault/Templates/Lecture.md`) for each lecture / page / video. Link them here:*

- [ ] [[<% course %> · <% sortOrder %>.1 — …]]
- [ ] [[<% course %> · <% sortOrder %>.2 — …]]

## Slide Deck

*If the section has a downloadable slide PDF, drop it in `vault/Courses/<% course %>/_assets/slides/` and link here. The `pdf-plus` plugin will render it inline.*

- **Slides:** *(link to PDF)*
- **Pages covered:** *(e.g. 1-24)*

## Pre-Test

*Skip this section if `has_pre_test: false`.*

- **Score:** *(out of total)*
- **Date taken:** *(YYYY-MM-DD)*
- **Topics missed:** *(list — these become tutor focus areas)*

## Post-Test

*Skip this section if `has_post_test: false`.*

- **Score:** *(out of total)*
- **Date taken:** *(YYYY-MM-DD)*
- **Topics missed:** *(list — these become FSRS-worthy review items)*

## Concepts Surfaced in This Section

*As lectures introduce canonical concepts, wiki-link here:*

- [[concept-name]]
- [[concept-name]]

## Section-Level Reflection

*After completing all lectures + post-test: what stuck, what didn't, what surprised you?*
