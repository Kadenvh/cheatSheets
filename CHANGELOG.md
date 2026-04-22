# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MIT `LICENSE` ahead of public release
- `SECURITY.md` vulnerability reporting policy
- `CONTRIBUTING.md` contribution guide
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1)
- `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md`

### Changed
- README: MIT badge, license section, dropped stale "73 notes" claim
- `knowledge-retrieval/SKILL.md` and `vault-health/SKILL.md`: replaced retired `openClaw_Vault/Knowledge/{category}/` references with current `vault/Concepts/` flat layout + frontmatter categories
- `knowledge-agents/{qa,demo,tutor,architect}/TOOLS.md`: replaced personal home-infrastructure examples with generic placeholders

### Removed
- PE framework scaffolding (`.claude/`, `.ava/` runtime) from tracking. Each environment provisions its own via the PE template deployment. Product content inside `.ava/` (curriculum schema and DB access) remains tracked.

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
