<%*
const slug = tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const today = tp.date.now("YYYY-MM-DD");
_%>---
type: course
course_id: <% slug %>
external_id: ""
provider: EdX
title: <% tp.file.title %>
domain: []
course_url: ""
kind: edx-course
enrolled: <% today %>
status: in_progress
section_count: 0
lecture_count: 0
created: <% today %>
---

# <% tp.file.title %>

> **Provider:** EdX · **External ID:** *(fill in, e.g. CU.OC.AI002)* · **Status:** in_progress
> **Enrolled:** <% today %>

## Course Overview

*Paste or summarize the course description from the provider here.*

## Sections

*Use the Section template (`vault/Templates/Section.md`) to create each section. Link them here as you go:*

- [ ] [[Section 1 - …]]
- [ ] [[Section 2 - …]]

## Final / Capstone

*If the course has a final exam, capstone project, or certificate-on-completion, note the structure here.*

- **Final exam:** *yes / no / capstone*
- **Certificate on completion:** *yes / no*

## Cross-Course Concepts Encountered

*As you author lecture notes, wiki-link to canonical [[Concepts]]. Surface a running list here so the tutor can prioritize them in cross-course pattern queries.*

## Course-Level Notes

*Synthesis-level reflections. What is this course really about? What does the instructor seem to value? How does this slot into your broader learning?*

---

## Tutor Pointers

*Things you want the tutor to know about *this* course specifically — pacing preferences, prerequisite gaps you want it to fill, related projects to anchor examples in.*

- *(e.g.) Ground examples in Python where possible; I'm comfortable with C-family syntax.*
- *(e.g.) Connect data-structure topics to SPDRbot's runtime constraints where relevant.*
