# Prompt Engineering System Manifest
Generated: 2026-02-28T16:29:53.386Z | Tools: 26 | Layers: 6

## System Architecture
| Layer | Count | Purpose |
|-------|-------|--------|
| Identity | 3 | SOUL.md, IDENTITY.md, USER.md |
| Constitution | 2 | CLAUDE.md (root), CLAUDE.md (ava_hub) |
| Lifecycle | 7 | Session protocols |
| Capabilities | 9 | Invocable slash commands |
| Delegation | 3 | Subagent definitions |
| Guardrails | 7 | Automated enforcement |

## Tool Inventory
### Skills (9)
| Name | Lines | ~Tokens | Version | Modified | Usage (30d) |
|------|-------|---------|---------|----------|-------------|
| bootstrap | 42 | ~375 | unknown | unknown | 0 |
| deploy | 54 | ~388 | unknown | unknown | 0 |
| discovery | 34 | ~284 | unknown | unknown | 1 |
| documentation-awareness | 46 | ~562 | unknown | unknown | 0 |
| readme | 36 | ~309 | unknown | unknown | 0 |
| session-closeout | 40 | ~350 | unknown | unknown | 0 |
| session-init | 35 | ~305 | unknown | unknown | 0 |
| validate-docs | 61 | ~491 | unknown | unknown | 0 |
| validate-setup | 53 | ~439 | unknown | unknown | 0 |

### Agents (3)
| Name | Lines | ~Tokens | Version | Modified | Usage (30d) |
|------|-------|---------|---------|----------|-------------|
| closeout-worker | 130 | ~1247 | unknown | unknown | 0 |
| doc-validator | 98 | ~1062 | unknown | unknown | 0 |
| security-reviewer | 60 | ~515 | unknown | unknown | 0 |

### Prompts (7)
| Name | Lines | ~Tokens | Version | Modified | Usage (30d) |
|------|-------|---------|---------|----------|-------------|
| MANIFEST | 186 | ~1695 | unknown | unknown | 0 |
| METRICS | 30 | ~210 | unknown | unknown | 0 |
| bootstrap | 459 | ~3148 | unknown | unknown | 0 |
| closeout | 177 | ~1662 | unknown | unknown | 0 |
| discovery | 133 | ~1379 | unknown | unknown | 1 |
| init | 93 | ~1155 | unknown | unknown | 0 |
| readme | 151 | ~1213 | unknown | unknown | 0 |

### Hooks (7)
| Name | Lines | ~Tokens | Version | Modified | Usage (30d) |
|------|-------|---------|---------|----------|-------------|
| block-dangerous-commands | 43 | ~380 | unknown | unknown | 0 |
| block-protected-files | 44 | ~311 | unknown | unknown | 0 |
| lint-on-edit | 77 | ~430 | unknown | unknown | 0 |
| log-util | 24 | ~162 | unknown | unknown | 0 |
| session-context | 58 | ~357 | unknown | unknown | 0 |
| stop-closeout-check | 69 | ~478 | unknown | unknown | 0 |
| typecheck-on-edit | 70 | ~402 | unknown | unknown | 0 |

### Constitution (2)
| Name | Lines | ~Tokens | Version | Modified |
|------|-------|---------|---------|----------|
| CLAUDE.md (root) | 201 | ~2745 | 32f217a | 2026-02-28 |
| CLAUDE.md (ava_hub) | 48 | ~705 | unknown | unknown |

### Identity (3)
| Name | Lines | ~Tokens | Version | Modified |
|------|-------|---------|---------|----------|
| SOUL.md | 37 | ~416 | unknown | unknown |
| IDENTITY.md | 24 | ~159 | unknown | unknown |
| USER.md | 18 | ~119 | unknown | unknown |

## Dependency Graph
- bootstrap → CLAUDE.md
- discovery → bootstrap
- documentation-awareness → session-closeout
- documentation-awareness → session-init
- documentation-awareness → closeout
- documentation-awareness → init
- documentation-awareness → CLAUDE.md
- session-closeout → closeout-worker
- session-closeout → closeout
- session-closeout → CLAUDE.md
- session-init → init
- session-init → CLAUDE.md
- validate-docs → doc-validator
- validate-docs → CLAUDE.md
- validate-setup → bootstrap
- validate-setup → deploy
- validate-setup → discovery
- validate-setup → readme
- validate-setup → closeout
- validate-setup → init
- validate-setup → block-dangerous-commands
- validate-setup → block-protected-files
- validate-setup → lint-on-edit
- validate-setup → session-context
- validate-setup → stop-closeout-check
- validate-setup → typecheck-on-edit
- validate-setup → CLAUDE.md
- closeout-worker → closeout
- closeout-worker → CLAUDE.md
- doc-validator → CLAUDE.md
- security-reviewer → deploy
- MANIFEST → bootstrap
- MANIFEST → deploy
- MANIFEST → discovery
- MANIFEST → documentation-awareness
- MANIFEST → readme
- MANIFEST → session-closeout
- MANIFEST → session-init
- MANIFEST → validate-docs
- MANIFEST → validate-setup
- MANIFEST → closeout-worker
- MANIFEST → doc-validator
- MANIFEST → security-reviewer
- MANIFEST → METRICS
- MANIFEST → closeout
- MANIFEST → init
- MANIFEST → block-dangerous-commands
- MANIFEST → block-protected-files
- MANIFEST → lint-on-edit
- MANIFEST → log-util
- MANIFEST → session-context
- MANIFEST → stop-closeout-check
- MANIFEST → typecheck-on-edit
- MANIFEST → CLAUDE.md
- METRICS → discovery
- bootstrap → deploy
- bootstrap → readme
- bootstrap → init
- closeout → bootstrap
- closeout → discovery
- closeout → readme
- closeout → init
- closeout → CLAUDE.md
- init → bootstrap
- init → discovery
- init → readme
- init → closeout
- init → CLAUDE.md
- readme → closeout
- readme → CLAUDE.md
- block-dangerous-commands → log-util
- block-protected-files → log-util
- lint-on-edit → log-util
- session-context → closeout
- session-context → log-util
- stop-closeout-check → session-closeout
- stop-closeout-check → closeout
- stop-closeout-check → log-util
- stop-closeout-check → CLAUDE.md
- typecheck-on-edit → log-util

## Staleness Check
- [WARN] bootstrap — 0 usage in 30d, may be orphaned
- [WARN] deploy — 0 usage in 30d, may be orphaned
- [WARN] documentation-awareness — 0 usage in 30d, may be orphaned
- [WARN] readme — 0 usage in 30d, may be orphaned
- [WARN] session-closeout — 0 usage in 30d, may be orphaned
- [WARN] session-init — 0 usage in 30d, may be orphaned
- [WARN] validate-docs — 0 usage in 30d, may be orphaned
- [WARN] validate-setup — 0 usage in 30d, may be orphaned
- [WARN] closeout-worker — 0 usage in 30d, may be orphaned
- [WARN] doc-validator — 0 usage in 30d, may be orphaned
- [WARN] security-reviewer — 0 usage in 30d, may be orphaned
- [WARN] MANIFEST — 0 usage in 30d, may be orphaned
- [WARN] METRICS — 0 usage in 30d, may be orphaned
- [WARN] bootstrap — 0 usage in 30d, may be orphaned
- [WARN] closeout — 0 usage in 30d, may be orphaned
- [WARN] init — 0 usage in 30d, may be orphaned
- [WARN] readme — 0 usage in 30d, may be orphaned
- [WARN] block-dangerous-commands — 0 usage in 30d, may be orphaned
- [WARN] block-protected-files — 0 usage in 30d, may be orphaned
- [WARN] lint-on-edit — 0 usage in 30d, may be orphaned
- [WARN] log-util — 0 usage in 30d, may be orphaned
- [WARN] session-context — 0 usage in 30d, may be orphaned
- [WARN] stop-closeout-check — 0 usage in 30d, may be orphaned
- [WARN] typecheck-on-edit — 0 usage in 30d, may be orphaned

## System Totals
| Metric | Value |
|--------|-------|
| Total tools | 26 |
| Total lines | ~2,303 |
| Total tokens | ~19,309 |
| Avg tool size | 89 lines |
| Most used | discovery (1 uses) |
| Least used | bootstrap (0 uses) |
