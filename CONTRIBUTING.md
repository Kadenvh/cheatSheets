# Contributing to Cortex

Thanks for your interest. **Status check first:** this repo (`cheatSheets`, renaming to `cortex-design`) is the **design home** for Cortex, a multi-agent orchestration system that curates an agent-controlled memory. It is currently in a **design phase** run by a single operator, not an open product soliciting feature work. Read [`SPEC.md`](SPEC.md) for what Cortex is and [`README.md`](README.md) for honest current status before assuming anything builds or runs.

The learning companion (the former "cheatSheets" product) survives as one stalled consumer surface, not the project. If you came here for that, see `SPEC.md` §4 Tier 4.

## What's welcome right now

Because we are designing, not building:

- **Corrections** to the docs, ontology, or research verdicts (`exploration/resource-landscape.md`) — especially if a technology verdict is out of date or a claim is wrong
- **Sharpening the design** — issues that poke holes in `SPEC.md`, the layer model, or the Loop 1 plan
- **Graphviz / design-tooling** improvements (`exploration/design/`)

Not welcome yet: feature PRs against a runtime that doesn't exist. Nothing gets built here or in `/home/ava/cortex` until the design phase yields a buildable Loop 1 charter (`SPEC.md` §8).

## Before You Start

1. **Read `SPEC.md`** — ontology and identity, with status tags (`RUNS`/`STALLED`/`PLANNED`/`SPECULATIVE`). Present-tense claims apply only to `RUNS` components.
2. **Read `CLAUDE.md`** — session rules, the document lifecycle (`exploration/` → `plans/` → `architecture/`), and the orchestration model.
3. **Check `PLAN.md`** — the single active plan. Open an issue before any non-trivial change.

## Document conventions

Per [`LANGUAGE.md`](LANGUAGE.md):

- GFM, repo-first syntax by default (no Obsidian-only syntax outside `vault/`)
- One canonical home per fact; link, don't duplicate
- Status words explicit; no present-tense claims about non-`RUNS` components
- Diagrams: author/generate `.dot`, commit source + rendered `.svg` together, never hand-edit renders

## Making Changes

- Keep commits small and focused, one logical change each
- Commit messages: imperative mood, first line ≤72 chars, conventional prefix (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- Never commit `.env*`, secrets, `.ava/brain.db`, or the `tutor/` runtime workspace
- Branch from `main`: `feature/...`, `fix/...`, `docs/...`; open a PR against `main`; address review as new commits (no force-push during review)

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Questions

Open a [Discussion](https://github.com/Kadenvh/cheatSheets/discussions) (URL auto-redirects after the `cortex-design` rename).
