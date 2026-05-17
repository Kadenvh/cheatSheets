<%*
const slug = tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const today = tp.date.now("YYYY-MM-DD");
const course = await tp.system.prompt("Course slug") || "";
const section = await tp.system.prompt("Section slug") || "";
const sortOrder = await tp.system.prompt("Sort order within section") || "0";
const kind = await tp.system.suggester(
  ["video","reading","exercise","page","lesson"],
  ["video","reading","exercise","page","lesson"]
) || "video";
_%>---
type: lecture
lecture_id: <% slug %>
section_id: <% section %>
course_id: <% course %>
title: <% tp.file.title %>
sort_order: <% sortOrder %>
lecture_kind: <% kind %>
transcript_ref: ""
slides_ref: ""
duration_min:
status: available
created: <% today %>
---

# <% tp.file.title %>

> **Course:** [[<% course %>]] · **Section:** [[<% section %>]] · **<% kind %>** · **Status:** available

## Summary

*One-paragraph "what this lecture is about" — written by you after watching, in your own words. This is what the tutor will most often retrieve as a quick orienting answer.*

## Transcript

*If you have the transcript, paste it below. Otherwise leave the section in place — the heading is what `smart-connections` and ChromaDB chunk on.*

> *(transcript content here, or `[Transcript: see _assets/transcripts/<slug>.txt]`)*

## Key Points

- *bullet — central claim or mechanism*
- *bullet — definition introduced*
- *bullet — example demonstrated*

## Concepts

*Wiki-link to canonical concepts in `vault/Concepts/`. Create new concept notes for any term that isn't there yet.*

- [[concept-name]] — *why this concept showed up in this lecture*
- [[concept-name]]

## Personal Notes

*Your interpretation, questions, connections to other projects or prior courses, "aha" moments. This is where the tutor builds a long-term picture of how you think about this material.*

## Code / Examples

*Code blocks, diagrams, worked examples. Use ` ```python ` (or whichever language). LaTeX inline `$x^2$` or block `$$x^2$$` rendered via `obsidian-latex-suite` and `math-in-callout`.*

```python
# example code
```

## Questions for the Tutor

*Drop questions here as they occur to you. The tutor can pull this section into a Q&A focus list.*

- [ ] *(question)*
- [ ] *(question)*

## Self-Check

*After studying: can you do these without looking?*

- [ ] *(specific recall/application prompt — feeds into FSRS as a Review Item later)*
- [ ] *(specific recall/application prompt)*

## Status Log

- <% today %> — created from template
