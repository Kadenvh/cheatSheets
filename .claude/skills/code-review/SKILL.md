---
name: code-review
description: "Conduct a structured code review with prioritized, actionable feedback"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Code Review

Conduct a structured code review with prioritized, categorized feedback.

## Instructions

Follow the protocol below. For the full detailed version, read `.claude/.prompts/code-review.md`.

### Protocol
   - Determine scope (PR diff / full file / architecture)
   - Read project rules (CLAUDE.md) and full context before judging
   - Run the 6-dimension checklist (correctness, security, design, readability, performance, testing)
   - Categorize findings (🔴 Must Fix / 🟡 Should Fix / 🟢 Suggestion / 💬 Question / 👍 Praise)
   - Produce a formatted summary with verdict

## Key Rules

- **Read context first.** Check CLAUDE.md for project-specific anti-patterns and conventions.
- **At least one 👍.** Every review includes praise. If you can't find anything good, look harder.
- **Be specific.** File, line, issue, suggested fix. "This is confusing" is not actionable.
- **Review the code, not the person.**

## Full Protocol

Detailed steps:

1. **Read CLAUDE.md** for project conventions and anti-patterns.
2. **Read the full diff/file** — understand intent before judging.
3. **Check 6 dimensions:** correctness (bugs, edge cases, types), security (injection, secrets, auth), design (patterns, abstraction, simplicity), readability (naming, flow, comments), performance (obvious issues only), testing (coverage of new behavior).
4. **Categorize:** 🔴 Must Fix (bugs, security), 🟡 Should Fix (design, maintainability), 🟢 Suggestion (style, alternatives), 💬 Question (unclear intent), 👍 Praise (done well).
5. **Format:** Summary with finding counts + verdict (Approve / Request Changes / Needs Discussion), then detailed findings with file:line and suggested fix.

## Error Handling

If any step fails (command errors, file not found, brain.db unreachable):
1. Record the failure: `node .ava/dal.mjs action record "code-review: <what failed>" --type investigation --outcome failure`
2. Do NOT continue silently — report the error to the user with what failed, the error message, and suggested fix.
3. If brain.db is unreachable, note the failure in the session summary for closeout.

## After Completion

- Record the review action: `node .ava/dal.mjs action record "code-review: <summary>" --type investigation --outcome success`
