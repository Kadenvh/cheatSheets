# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [7.7.1] — 2026-04-22

**Milestone: repo flipped to PUBLIC.** Full 7-phase `/repo-release` audit executed against self. Issue [#2](https://github.com/Kadenvh/cheatSheets/issues/2) tracks remaining post-public housekeeping.

### Added
- `LICENSE` (MIT)
- `SECURITY.md` vulnerability reporting policy
- `CONTRIBUTING.md` contribution guide
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1)
- `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `END-GOAL.md` — long-term vision / north star document
- GitHub repo metadata: description, 10 topics (`learning-system`, `spaced-repetition`, `fsrs`, `obsidian`, `chromadb`, `rag`, `curriculum`, `arduino`, `elegoo`, `knowledge-management`)
- GitHub security features enabled post-public: Dependabot alerts, Dependabot security updates, secret scanning, push protection
- Branch protection on `main`: PR required, no force-push, no deletion, conversation resolution required

### Changed
- README: MIT license badge + section, dropped stale "73 notes" claim, rewrote File Structure section to reflect actual public surface (no `.ava/` DAL runtime, no `sessions/` chronicle, explicit note about what's *not* in the repo)
- `knowledge-retrieval/SKILL.md` and `vault-health/SKILL.md`: replaced retired `openClaw_Vault/Knowledge/{category}/` references with current `vault/Concepts/` flat layout + frontmatter categories. Dropped retired INDEX.md / GRAPH.md / Archive / inbox checks.
- `knowledge-agents/{qa,demo,tutor,architect}/TOOLS.md`: replaced personal home-infrastructure examples (specific LAN IP, admin username, camera names, speaker names) with generic placeholders
- `.gitignore`: added `dist/`, `build/`, `.output/`, `out/`, plus standard secret-file extensions for defense in depth
- GitHub repo: delete-branch-on-merge on; Issues on; Discussions on; Wiki off; Projects off

### Removed
- PE framework scaffolding (`.claude/` skill library, hooks, prompts; `.ava/` DAL runtime with `brain.db`, `lib/`, `handoffs/`, `migrations/`, `node_modules/`) from tracking. Each environment provisions its own via the PE template. Product content inside `.ava/` (curriculum schema, DB access, export utility) remains tracked via gitignore exception.
- `sessions/` personal development chronicle from tracking (kept local only).
- Superseded archive content: `cleanup-*` timestamped dirs, `CHEATSHEETS_PLAN.md`, `knowledge-learning-plan.md`, `learning-ontology-spec.md`, `cheatsheet-v5-schema-spec.md`, `learningHub/`, `ML/`, `NeuralNetworks/`, `quick-inserts/`. Only `archive/elegoo-mega-kit/` remains (load-bearing per `.ava/learning-schema.sql`).

### Fixed
- `CLAUDE.md §Vault Export` section replaced with `§Session Export` — prior section referenced DAL `vault-export` + `vault sync` subcommands that were removed in the v7 template (retired vault continuity layer).

### Infrastructure
- PE template pulled from v6.0.0-rc1 to v7.0.0-rc1: new `continuity` DAL subcommand, new `session-export` subcommand replacing retired `vault-export`, new runtime libs (`consolidate.mjs`, `continuity.mjs`, `session-export.mjs`), new `session-export-on-close` hook, new `portfolio-generation` skill.
- New `/repo-release` skill installed locally (trio: `SKILL.md` + `MANUAL.md` + `.prompts/repo-release.md`), translated from GitHub-MCP design to `gh` CLI + local scanners (gitleaks/trufflehog/regex fallback). Open note: promote to PE template for ecosystem-wide availability.

## [7.7.0] — 2026-04-06

### Added
- Lesson completion flow: complete → unlock next → start → metadata (auto-plan)

## [7.6.0] — 2026-04-05

### Added
- PDF tutorial viewer: iframe-based, Chrome-native, `#page=N` fragment targeting

## [7.5.1] — 2026-04-04

### Added
- ContentPanel code viewer (syntax-highlighted `.ino` files for ELEGOO lessons)

## [7.5.0] — 2026-04-01

### Added
- Curriculum layer: `learning.db` alongside `brain.db`, seeded with the 34-lesson ELEGOO Mega 2560 Arduino starter kit including tutorial-PDF page ranges and code samples per lesson
- Curriculum auto-plan flow
