---
name: testing
description: "Define test strategy, generate tests, or audit existing test coverage for the project"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Testing — Strategy, Generation & Coverage

Define, generate, and verify tests for this project.

## Instructions

Follow the protocol below. For the full detailed version, read `.claude/.prompts/testing.md`.
### Protocol:
   - **Strategy** → Analyze codebase, classify testable surface, recommend framework, produce test plan
   - **Generation** → Write tests by priority, follow Arrange-Act-Assert, verify all pass
   - **Audit** → Measure coverage, score 6 quality dimensions, recommend improvements

## Mode Selection

If the user didn't specify, determine mode automatically:
- **No tests exist** → Strategy first, then offer to generate
- **Tests exist, user wants more** → Generation
- **Tests exist, user wants evaluation** → Audit

## Full Protocol

Detailed steps:

1. **Strategy:** Map testable surface into P0 (critical paths), P1 (business logic + integrations), P2 (edge cases + UI), P3 (config). Recommend the ecosystem-standard framework. Set coverage targets: 80%+ lines for services, 70%+ for apps, 50%+ critical paths for MVPs.

2. **Generation:** Read existing test patterns first. Name tests as behavior descriptions. Use Arrange-Act-Assert. Mock external dependencies at boundaries. Verify all tests pass 3x before finishing.

3. **Audit:** Run coverage, score Coverage/Meaningfulness/Isolation/Naming/Speed/Flakiness each 1-5, report overall average, prioritize gaps as Critical/Quick Wins/Debt.

## Key Rules

- **Tests that always pass test nothing.** Verify by breaking the code.
- **Flaky tests are worse than no tests.** Fix or delete, never ignore.
- **Test behavior, not implementation.** Tests should survive refactors.
- **Run all tests before finishing.** Never leave with a red suite.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "testing: <what failed>" --type testing --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- Update CLAUDE.md with the test runner command if not already present
- If a test plan was produced, note its location in IMPLEMENTATION_PLAN.md
