# Contributing to CheatSheets Knowledge System

Thanks for your interest. This project is a personal learning system that pairs an Obsidian vault with FSRS spaced repetition, ChromaDB semantic search, and a curriculum engine. Contributions that improve the product for a broader set of learners are welcome.

## Before You Start

1. **Read `CLAUDE.md`** — the project's architecture rules (layer boundaries, concept identity, wiki-link prerequisites) are enforced.
2. **Read `plans/learning-system.md`** — the active roadmap. New features should slot into the plan's Phase 3 scope or be proposed as an issue first.
3. **Open an issue first for non-trivial changes.** This saves everyone time if the idea doesn't fit the direction.

## Development Setup

The repo is the *content + curriculum* spoke of a larger system. The API and UI layers live in a separate hub repo (Ava_Main, not open-source). For local exploration of just the cheatSheets repo:

```bash
git clone https://github.com/Kadenvh/cheatSheets.git
cd cheatSheets

# Open the vault in Obsidian
# File → Open folder as vault → select ./vault
```

For the full system (hub + spoke + ChromaDB), see `CLAUDE.md §Architecture`.

## Making Changes

### Vault Content (Concept Notes)

- New concept notes go in `vault/Concepts/` using the `vault/Templates/Cheatsheet.md` template.
- Filename slug = concept ID: `typescript-generics.md` → concept `typescript-generics`.
- Use `[[wiki-links]]` to declare prerequisite edges.
- Required frontmatter: `category`, `tags`, `title`, `created`, `type`. See `CLAUDE.md §Metadata Schema`.

### Curriculum Content (`learning.db`)

Seeded in `.ava/learning-schema.sql`. New curricula:

1. Add a `curricula` row with id, title, description, reference material pointer.
2. Add `lessons` rows with sequence numbers, reference PDF page ranges, and code sample paths.
3. Test via `node .ava/curriculum-export.mjs <curriculum-id>`.

### Code Changes

- Run existing lint/type checks before opening a PR.
- Keep commits small and focused. One logical change per commit.
- Commit messages: imperative mood, first line ≤72 chars. Prefix with type if useful (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Never commit `.env*`, secrets, or `.ava/brain.db`.

## Pull Request Process

1. Fork and branch from `main`.
2. Make your changes in a focused branch. Name format: `feature/short-description`, `fix/short-description`, `docs/short-description`.
3. Open a PR against `main` using the PR template.
4. Ensure CI passes (when configured).
5. Address review comments as new commits (do not force-push during review).
6. Maintainer merges; branch is deleted after merge.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Questions

Open a [Discussion](https://github.com/Kadenvh/cheatSheets/discussions) for questions that aren't bug reports or feature requests.
