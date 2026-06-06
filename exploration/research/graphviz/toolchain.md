# Graphviz Toolchain & Integration Reference

**Cluster:** toolchain | **Verified:** 2026-06-06 against GitLab releases API, packages.ubuntu.com, each tool's repo/npm/PyPI | Local box: `dot` 2.43.0

## Install & Versions (Ubuntu 2026 reality)

- **Upstream latest: 15.0.0** (2026-05-23). apt: 24.04 LTS ships **2.42.2** (2019-era); 26.04 LTS ships **14.1.2**. This box has 2.43.0.
- **Does it matter?** For the core loop (`dot -Tsvg` on authored/emitted DOT): no. DOT syntax, all engines, SVG output are stable. Newer releases fix layout bugs, improve `-Tjson` fidelity, handle large graphs better.
- **Rule:** apt is the pragmatic default; pin the official `.deb` only on a hit layout bug or newer-JSON need. **CI must pin a version** so renders are reproducible.
- `libgraphviz-dev` needed ONLY for native bindings (PyGraphviz). Python `graphviz` and `ts-graphviz` don't need it.
- **`dot -c` gotcha:** regenerates the plugin registry. Pre-built on apt installs; needed (`sudo dot -c`) after manual/source installs or on "Format: svg not recognized" errors.

## Obsidian Integration (verified verdicts)

- `QAMichaelPeng/obsidian-graphviz`: **STALE** (last release 2022-12-26); renders ```dot``` blocks via local `dot` binary + experimental d3-graphviz
- `dgudim/obsidian-universal-renderer`: **STALE/personal** (2024-04-16); needs system graphviz
- **Verdict: no actively-maintained DOT plugin exists in 2026. Do NOT depend on a plugin for canonical rendering.** Committed-SVG is canonical: render `.dot -> .svg` in the repo, embed with `![[diagram.svg]]` (Obsidian renders SVG natively, zero plugins). Optionally install the stale plugin for live authoring preview only.

## Git Repo Workflow (render -> commit -> view)

- **GitHub does NOT render `.dot` inline** (Mermaid yes, Graphviz no). Third-party `gravizo` proxies through an external service: **reject**.
- **Canonical pattern: commit the SVG, embed via `![](path.svg)`.** `.dot` is the machine-readable source; `.svg` is the viewable artifact.

Makefile (every `.dot` -> sibling `.svg`):
```makefile
DOTS := $(shell find . -name '*.dot')
SVGS := $(DOTS:.dot=.svg)
diagrams: $(SVGS)
%.svg: %.dot
	dot -Tsvg $< -o $@
.PHONY: diagrams
```

Pre-commit hook keeping SVGs in sync:
```bash
#!/usr/bin/env bash
set -euo pipefail
changed=$(git diff --cached --name-only --diff-filter=ACM | grep '\.dot$' || true)
for f in $changed; do
  dot -Tsvg "$f" -o "${f%.dot}.svg"
  git add "${f%.dot}.svg"
done
```

CI safety net: `ts-graphviz/setup-graphviz@v2` (actively maintained) + fail-on-stale: `make diagrams && git diff --exit-code`. Local hook/Make for the author loop (instant); CI catches forgotten hooks.

## Editor & Live Preview

- **VS Code:** `tintinweb.graphviz-interactive-preview` (zoom/pan/search/edge tracing; 0.3.5, 2024-10; the de-facto pick); `qiu.graphviz-language-support-and-preview` (highlighting, completion, format); `EFanZh.graphviz-preview`
- **CLI watch:** `dot -Tsvg -O file.dot` + `entr`/`watchexec`: `ls *.dot | entr -r make diagrams`. **xdot** for interactive native viewing of large graphs
- **Format/lint:** `ts-graphviz/prettier-plugin-dot` for Prettier-on-save; `dot -Tcanon` as a normalize step; no dominant standalone linter exists. `dot file.dot -o /dev/null` is the practical CI parse-check

## Programmatic Generation (emitter-pattern verdicts)

| Library | State (verified) | Verdict |
|---|---|---|
| **Python `graphviz`** | v0.21, 2025-06-15, ~4.8M weekly downloads | **DEFAULT emitter.** Object API handles attribute/label escaping; `.source` = the DOT text to commit; `.render(format='svg')` |
| `pydot` | v4.0.1, 2025-06-17, Production/Stable again | Only when you must **parse DOT back** (round-trip/diffing) |
| Raw templating (Jinja2/f-strings) | n/a | Trivial fixed-shape graphs only; you own the escaping footguns |
| **`ts-graphviz`** | v3.0.7, 2026-02-07, active | The TS equivalent for a future JS UI build step; React package + Node/Deno adapter |

## Interactive Future Path

1. **Now (design repo, no JS):** `href`/`URL` (+ `tooltip`, `target`) on nodes/edges → `dot -Tsvg` emits clickable `<a>` wrappers. **Put `href` on every node pointing at its Cortex doc/anchor.**
2. **Web UI phase:** `d3-graphviz` (5.6.0, the only mature animated-DOT-transition option; bundles @hpcc-js/wasm) for showing memory-graph evolution over time. For "just render DOT in browser": `@viz-js/viz` (lean WASM). 
3. **Editable graphs:** `dot -Tjson` → map into Cytoscape.js / vis-network (invert Y) to keep Graphviz layout + gain drag/expand.
