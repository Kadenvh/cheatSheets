# exploration/

The capture layer of this project's document lifecycle:

```
exploration/  ->  plans/  ->  architecture/
(ideas,           (active,       (consolidated,
 resources,        fully-defined   completed work,
 questions,        work refs)      curated truth)
 sketches)
```

Things start here: uningested resources, goals, open questions, research results, Excalidraw sketches, half-formed ideas. When something graduates to actionable work, it gets planned in `plans/`. When work completes, its durable value consolidates into `architecture/`.

This lifecycle deliberately mirrors the memory model Cortex builds: capture -> working memory -> long-term store. The doc system is the first running instance of the architecture. It is a starting point, not doctrine; it evolves with the project (see `SPEC.md`).

## Contents

| File | What |
|---|---|
| `resource-landscape.md` | The full survey of tools/frameworks/services considered for Cortex, with radar verdicts |
