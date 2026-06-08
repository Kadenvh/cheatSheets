# Obsidian — Reference (Cortex design phase)

> Verified against [help.obsidian.md](https://help.obsidian.md/) and [jsoncanvas.org](https://jsoncanvas.org/), 2026-06-08. Obsidian is a surface, not the source of truth.

## Role in Cortex (a surface, not the source of truth)

Obsidian is **one viewing/authoring surface** over Cortex's markdown, not the design source of truth. The repo is repo-first: portable GFM in git is canonical, and it must render correctly on GitHub with no Obsidian present. Obsidian earns its place by making that same GFM *nicer to author and browse* — native [Mermaid](https://obsidian.md/help/Editing+and+formatting/Advanced+formatting+syntax) preview while editing, a [graph view](https://obsidian.md/help/Plugins/Graph+view) and [backlinks](https://obsidian.md/help/Plugins/Backlinks) for orientation, and [Canvas](https://jsoncanvas.org/) for spatial brainstorming. Its proprietary extensions (wikilinks, embeds, `.base`, dataview) are allowed **only inside `vault/`**, the Obsidian-first learning surface (currently STALLED). Everywhere else in the repo, if a feature would render as broken or invisible on GitHub, do not use it. Neither Canvas nor Bases changes this: design/ontology stays repo-first GFM + Mermaid + git.

## Portable GFM vs Obsidian-locked syntax (the repo-first / vault-first rule)

The rule: **repo docs use only the Portable column. The vault-first `vault/` subtree may use the Locked column.**

| Feature | Syntax | Renders on GitHub? | Verdict |
|---|---|---|---|
| **Mermaid diagrams** | ```` ```mermaid ```` | **Yes** (native on GitHub + Obsidian) | **Portable** — diagram backbone (#20) |
| Headings / lists / tables / code | standard GFM | Yes | Portable |
| Standard links | `[text](path.md)` | Yes | Portable |
| YAML frontmatter / properties | `---` block | Yes (shown as table on GitHub) | Portable |
| Task lists | `- [ ]` / `- [x]` | Yes | Portable |
| Footnotes | `[^1]` | Yes | Portable |
| **Callouts** | `> [!NOTE]` | **Partial** — 5 std types (NOTE/TIP/IMPORTANT/WARNING/CAUTION) style on GitHub | **Portable if std type**; custom types + collapsible `+/-` are locked |
| Wikilinks | `[[Note]]` | No (raw text) | Locked → vault only |
| Embeds / transclusion | `![[Note]]`, `![[Note#h]]` | No | Locked → vault only |
| Block references | `^block-id`, `[[Note#^id]]` | No | Locked → vault only |
| Highlights | `==text==` | No | Locked → vault only |
| Canvas | `.canvas` file | No (JSON, not rendered) | Locked → exploration/vault |
| Bases | `.base` file | No (YAML, not rendered) | Locked → vault only |
| Dataview / Datacore | ```` ```dataview ```` | No (raw code block) | Locked → vault only |
| Graph view / backlinks pane | (app UI) | n/a — UI, not file syntax | Obsidian-only browse aid |

To keep new links portable, set Obsidian **Settings → Files & Links → "Use [[Wikilinks]]" OFF** so it writes `[text](path)`.

## Canvas (JSON Canvas) — what it is + Cortex verdict

[JSON Canvas](https://jsoncanvas.org/) is an **open file format** (MIT-licensed, spec at [jsoncanvas.org/spec/1.0](https://jsoncanvas.org/spec/1.0/)) for infinite-canvas data, originated by Obsidian and now a standalone spec. A `.canvas` file is plain JSON with two top-level arrays:

- **`nodes`** — each has `id`, `type` (`text` | `file` | `link` | `group`), `x`, `y`, `width`, `height`, optional `color`. Type-specific: `text` (markdown string), `file` (vault path + optional `subpath`), `url`, group label.
- **`edges`** — `id`, `fromNode`, `toNode`, optional `fromSide`/`toSide`, `fromEnd`/`toEnd` (arrow), `color`, `label`.

Because it is JSON with a published schema, it is **fully machine-parseable and agent-readable** — an agent can read, diff, or emit a `.canvas` programmatically. Good for spatial brainstorming and loose system mapping where layout carries meaning.

**Cortex verdict:** **Yes for the capture stage** — use Canvas for early spatial brainstorming and system maps in `exploration/` (or the vault). It does **not** render on GitHub, so it never becomes a committed design source of truth. When a Canvas sketch hardens into a real diagram, **graduate it to Mermaid** (#20), which is portable and lives inside the `.md`. Canvas = scratchpad; Mermaid = the artifact.

## Bases — what it is + Cortex verdict

[Bases](https://obsidian.md/help/bases) is Obsidian's database/table feature: a **core plugin** that turns notes into queryable, multi-view databases. Timeline (verified 2026-06-08): shipped **early access in v1.9.0, 21 May 2025** (Catalyst-gated), reached **stable / general core-plugin status in early 2026**.

- A **`.base` file is YAML** conforming to Obsidian's schema (`filters`, `formulas`, `properties`, `views`, `summaries`). The *data* itself stays in your normal markdown notes' YAML properties — the `.base` is just the query/view definition.
- Views in 2026: **table, list, cards (gallery), and map.** Filters, grouping, and computed formulas over properties.
- **Open format?** The YAML is readable, but the schema is Obsidian-specific and a `.base` **renders as nothing on GitHub** — it is effectively Obsidian-locked. It only queries data held in *properties* (not arbitrary note body content).

**Cortex verdict:** **Useful inside the (stalled) `vault/` learning surface** — concept tables / course indexes over note properties are a natural fit there, and it is now native rather than depending on the community-maintained Dataview. **Not** a fit for design ontology: that is repo-first GFM + git, and `.base` would be invisible to anyone reading on GitHub. Net: **vault-only convenience, Obsidian-locked** — do not introduce `.base` files outside `vault/`.

## Core features quick reference

- **Mermaid** — native fenced-block preview; the only diagram type that is both Obsidian-live and GitHub-portable. Default per #20.
- **Properties / frontmatter** — typed YAML frontmatter (text/number/date/checkbox/list); portable, and what Bases queries.
- **Tags** — `#tag` inline or `tags:` in frontmatter; portable text, Obsidian indexes them for search/graph.
- **Wikilinks vs standard links** — `[[Note]]` is terser and supports rename-tracking in Obsidian but is **not portable**; use `[text](path.md)` in repo docs.
- **Embeds / transclusion** — `![[Note#section]]` inlines other notes live in Obsidian; **not portable**, vault only.
- **Callouts** — `> [!NOTE]`; 5 standard types style on GitHub too; extra/custom/collapsible are Obsidian-only.
- **Graph view / backlinks / outgoing links** — Obsidian-only *browse aids* (no file syntax); good for orienting in `vault/`, irrelevant to the committed repo.

## Plugins (brief)

- **smart-connections** — installed, never embedded in workflow. RAG/AI over the vault (semantic "related notes" + chat). Active. Cortex already has the Ava_Main embedding service `:8001`, so this is redundant for us.
- **excalidraw** — declined. Freehand/diagram drawing; stores `.excalidraw(.md)`, Obsidian-locked, not portable. Mermaid covers our diagram need.
- **dataview / datacore** — Dataview: query language over notes; primary dev stepped back 2023, still works, community-watched. Datacore: its faster successor, near community-list release. Both Obsidian-locked. Bases is the native replacement for simple table/property queries.
- **templater** — scripting/templating engine (beyond core Templates). Authoring convenience, vault-side only.

## When to use what (Canvas vs Mermaid vs plain md)

| Situation | Reach for | Why |
|---|---|---|
| Loose spatial brainstorm, system map where *layout* matters, capture stage | **Canvas** (`exploration/` or vault) | Free-form 2D, agent-readable JSON; throwaway/sketch |
| A diagram that belongs *in* a doc and must render on GitHub (ER, flowchart, architecture, sequence) | **Mermaid** in the `.md` | Portable, versioned-as-text, native in both #20 |
| Prose, decisions, specs, ontology, the actual content | **Plain GFM `.md`** | Repo-first source of truth; diffs cleanly in git |
| Property-table / index over many notes, inside the vault only | **Bases** (vault) | Native, no plugin dep — but Obsidian-locked |

Rule of thumb: **brainstorm in Canvas, decide in Mermaid, ship in markdown.** The design source of truth is always repo-first GFM + git — Obsidian, Canvas, and Bases are surfaces and scratchpads on top of it, never replacements for it.
