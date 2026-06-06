# Graphviz Layout Engines Reference

**Cluster:** layouts + large graphs | **Verified:** 2026-06-06 against graphviz.org pages + man pages (gvpr/unflatten/ccomps extracted via pdftotext) | Engine catalog: [docs/layouts](https://graphviz.org/docs/layouts/)

## Engine Selection Table

| Engine | Graph shape it draws | Size sweet spot | One-line rule |
|--------|----------------------|-----------------|---------------|
| **dot** | Hierarchical/layered, directed (ranks) | ~5-500 nodes | Default when edges have direction (DAGs, layer/architecture views) |
| **neato** | Spring model / MDS | tens to low hundreds | Undirected where edge length ~ distance; symmetric layouts |
| **fdp** | Spring-electrical force-directed | small-medium undirected | Like neato; supports clusters via `splines=compound` |
| **sfdp** | Multilevel force-directed | **thousands+** | THE large-graph engine; pair with `overlap=prism` |
| **circo** | Circular | medium | Cyclic/biconnected structures |
| **twopi** | Radial rings by distance from `root` | medium, tree-ish | One clear center |
| **osage** | Clusters as boxes | any, cluster-dominated | When cluster structure IS the diagram |
| **patchwork** | Squarified treemap | any | Proportion/containment, not edges |
| **nop / nop2** | None (pretty-print / use given positions) | n/a | Reformat; render pre-positioned |

**Cortex mapping:** layer/architecture views (5-20 nodes) → **dot**. Generated ontology graphs (hundreds-thousands from SQLite) → **sfdp**. Cluster-summary subsystem views → **osage**.

## dot Engine Control Reference

- `rankdir` = `TB`(default) `BT` `LR` `RL` — dot only
- `ranksep` / `nodesep` — raise both to de-clutter dense layers
- `ratio` / `size` — fit/scale
- **Rank constraints** (subgraph `rank=`, dot only): `same` (align peers), `min`/`source` (pin top/left; source = exclusive), `max`/`sink`
- `ordering=out|in` — stable sibling order
- `concentrate=true` — merges multiedges + shares partially-parallel paths (dot-only); NOT edge bundling
- **Splines**: `true`/`spline` (routed curves, dot default), `polyline`, `curved` (no obstacle routing), `line`/`false`, `none`, `ortho` (Manhattan; **caveat: no ports, and in dot no edge labels**), `compound` (fdp-only, avoids clusters)
- **Clusters**: `subgraph cluster_X {}`; dot ranks clusters as units. `ortho`+clusters and `concentrate`+clusters interact poorly — prefer default splines inside clusters. Pure cluster layout → osage.

## Large Generated Graphs: Survival Guide

- **Overlap removal** ([attrs/overlap](https://graphviz.org/docs/attrs/overlap/)): `overlap=prism` (= prism1000) is the practical default; sfdp defaults to prism0. Alternatives: `false`, `scale`, `scalexy`, `compress`, `vpsc`, `voronoi`.
- Typical invocation: `sfdp -Goverlap=prism -Gsplines=true big.gv -Tsvg -o big.svg`
- **Edge bundling**: `mingle` on an already-laid-out graph: `dot -Tdot g.gv | mingle | dot -n -Tsvg -o g.svg` (`-n` = keep positions). `concentrate` ≠ bundling.
- **Legibility limits (practitioner guidance, NOT documented numbers):** dot ~200-500 nodes; neato/fdp few hundred; sfdp renders thousands but SVG text unreadable past ~1-2k unless labels drop/shrink.
- **When too big — reduce before drawing:** filter with gvpr (degree/type predicates); decompose with `ccomps -x` / `sccmap` (render largest: `ccomps -zX#0`); collapse subsystems to cluster nodes (osage); drop labels (`-Nfontsize`, `label=""`, keep IDs in tooltips); emit SVG links/tooltips or `-Tcmapx` imagemaps instead of one giant static image.

## Output Formats for a Git Repo Workflow

| Use | Format | Notes |
|-----|--------|-------|
| Commit to GitHub | `-Tsvg` | Vector, scales; clickable via node/edge `href`/`URL` + `tooltip` + `target`; `svg_inline` to embed; `svgz` gzipped |
| Chat / image surfaces | `-Tpng -Gdpi=150..300` | Default dpi 96 |
| Docs/print | `-Tpdf` | Vector |
| Round-trip / re-layout | `-Tcanon` / `-Tdot` / `-Txdot` | canon = normalized DOT; dot = +positions; xdot = +draw ops |
| Feed other viewers | `-Tjson` / `-Tdot_json` / `-Txdot_json` | Laid-out graph as JSON for D3/web |
| Clickable raster maps | `-Tcmapx` (client) / `-Timap` (server) | Pair PNG with cmapx |

**Cortex pattern:** SQLite → DOT → `sfdp -Tsvg` (committed, `href` links to source docs) + `-Tpng -Gdpi=200` (chat) + `-Tjson` artifact reserved for a future interactive viewer.

## CLI Toolkit

- **Engine/attr injection**: `dot -Ksfdp g.gv`; `-Gname=val -Nname=val -Ename=val` inject defaults without editing the file
- **gvpr** (graph stream editor, awk-style; [cli/gvpr](https://graphviz.org/docs/cli/gvpr/)): clauses `BEGIN / BEG_G / N[pred]{act} / E[pred]{act} / END_G / END`; current object `$.`, target graph `$T`, output `$O`. Verbatim example: `gvpr -c 'N[color=="blue"]{color = "red"}' file.gv`. Cortex filter: `gvpr 'N[degree>5]' onto.gv` keeps hub nodes
- **unflatten** ([cli/unflatten](https://graphviz.org/docs/cli/unflatten/)): improves aspect ratio of leaf-heavy graphs; `-l len` stagger leaf edges, `-f` extend to fan-out nodes (needs `-l`), `-c len` chain disconnected nodes. Pipe: `unflatten -l3 g.gv | dot -Tsvg`
- **ccomps** ([cli/ccomps](https://graphviz.org/docs/cli/ccomps/)): connected components; `-x` separate graphs, `-z` largest-first (`-zX#0` = largest only), `-X node` component containing node, `-o out` per-component files
- **sccmap**: strongly-connected components (directed cycles); find/collapse cycle groups before a dot pass
