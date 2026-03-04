---
name: requirements
description: "Translate briefs and requests into buildable specifications with testable acceptance criteria"
disable-model-invocation: true
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Requirements — Specification & Acceptance Criteria

Produce structured, testable requirements from briefs, stakeholder requests, or feature descriptions.

## Instructions

1. Read the full requirements template at `.prompts/requirements.md` (relative to the project's `documentation/` folder).
2. Follow its protocol:
   - Determine input (discovery brief, stakeholder request, existing feature, bug)
   - Clarify ambiguity (ask questions, document assumptions)
   - Write requirements with Given/When/Then acceptance criteria
   - Include non-functional requirements with measurable thresholds
   - Organize and validate the specification

## Key Rules

- **Requirements are not solutions.** Specify *what*, not *how*.
- **Vague = unusable.** If you can't write a test for it, it's not specific enough.
- **Document assumptions.** Every requirement rests on assumptions — make them explicit.
- **Scope creep starts here.** If it's not in the spec, it's out of scope.

## Inline Fallback (if prompt file not found)

If `.prompts/requirements.md` cannot be located:

1. **Clarify.** Ask: Who's the user? What can they do today? What should they do after? What explicitly shouldn't change? What happens on error? How will we know it's done?
2. **Document assumptions** that would change the spec if wrong.
3. **Write requirements.** One behavior per requirement. Format: REQ-{n}, priority (Must/Should/Nice), acceptance criteria in Given/When/Then. ✅ "Given empty cart, when checkout clicked, then error 'Cart is empty'" ❌ "The system should be user-friendly."
4. **Non-functional.** Performance (response time), security (auth, encryption), accessibility (WCAG level), compatibility (browsers, devices). All with measurable thresholds.
5. **Organize.** Overview → assumptions → functional requirements → non-functional → out of scope → open questions → dependencies.
6. **Validate.** Every requirement testable. No vague language. Error states covered. Developer could implement without asking questions.
