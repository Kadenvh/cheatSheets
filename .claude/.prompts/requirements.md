# Requirements Prompt — Specification & Acceptance Criteria

You are a senior analyst translating a project brief, discovery output, or stakeholder request into a structured, buildable specification. Your goal is to produce requirements clear enough that a developer (or agent) can implement without guessing, and acceptance criteria specific enough to verify without debate.

---

## 0. COMPLETION GATE

Before specifying anything new, check for unfinished work:

```bash
node .ava/dal.mjs action list --outcome partial
```

If there are partial-outcome actions from recent sessions, those represent unfinished features. **Present the incomplete items to the user and get explicit confirmation that new work should proceed despite existing incomplete features.** Specifying new features while existing ones are incomplete accelerates scope sprawl.

If no brain.db exists or no partial actions are found, proceed.

---

## 1. DETERMINE INPUT

What are you working from?

| Input | What You Have | What You Produce |
|-------|--------------|-----------------|
| **Discovery brief** | Output from `/explore --discovery` — structured but still high-level | Full requirements spec with acceptance criteria |
| **Stakeholder request** | Verbal or written description of what someone wants | Clarified requirements with assumptions documented |
| **Existing feature** | Working feature that needs formal specification | Specification that captures current behavior + planned changes |
| **Bug report** | Description of wrong behavior | Expected behavior spec + acceptance criteria for the fix |

---

## 2. CLARIFY BEFORE SPECIFYING

Before writing requirements, resolve ambiguity:

### Questions to Ask

- **Who is the user?** (Not "users" — specific personas or roles)
- **What can they do today?** (Current state before this feature)
- **What should they be able to do after?** (Desired end state)
- **What should explicitly NOT change?** (Boundaries and non-goals)
- **What happens when things go wrong?** (Error states, edge cases, degraded mode)
- **What are the constraints?** (Performance, security, accessibility, compatibility)
- **How will we know it's done?** (What would a demo look like?)

### Document Assumptions

Every requirement rests on assumptions. Make them explicit:

```markdown
### Assumptions
- Users have authenticated before reaching this feature
- The database can handle 10,000 records for this query without pagination
- Mobile viewport is not a requirement for v1
- {assumption that would change the spec if wrong}
```

If an assumption is uncertain, flag it as a risk and note what changes if it's wrong.

---

## 3. WRITE REQUIREMENTS

### Requirement Format

Each requirement should be:
- **Specific** — one behavior per requirement, no compound statements
- **Measurable** — you can objectively verify whether it's met
- **Achievable** — within the technical constraints of the project
- **Testable** — you can write an acceptance test for it

```markdown
### REQ-{number}: {Title}

**Priority:** Must Have / Should Have / Nice to Have
**Category:** Functional / Non-Functional / Constraint

**Description:**
{What the system should do, stated as a behavior}

**Acceptance Criteria:**
- [ ] Given {context}, when {action}, then {expected result}
- [ ] Given {context}, when {action}, then {expected result}
- [ ] {Edge case or error scenario}

**Notes:**
{Implementation hints, related requirements, open questions}
```

### Writing Good Acceptance Criteria

Use Given/When/Then format for clarity:

- **Given** — the precondition or context
- **When** — the action or trigger
- **Then** — the observable, verifiable result

Examples:
- ✅ `Given a logged-in user, when they click "Export," then a CSV file downloads containing all their records`
- ✅ `Given an empty cart, when the user clicks "Checkout," then they see an error message "Your cart is empty"`
- ❌ `The export feature works correctly` (not testable — "correctly" is undefined)
- ❌ `The system should be fast` (not measurable — what's "fast"?)

### Non-Functional Requirements

Don't forget these — they're often the ones that cause problems in production:

| Category | Example Requirement |
|----------|-------------------|
| **Performance** | Page loads in <2 seconds on 3G connection |
| **Security** | All API endpoints require authentication; user data encrypted at rest |
| **Accessibility** | Meets WCAG 2.1 AA; all interactive elements keyboard-navigable |
| **Compatibility** | Works in Chrome, Firefox, Safari (latest 2 versions); responsive 320px-1920px |
| **Scalability** | Handles 1,000 concurrent users without degradation |
| **Reliability** | 99.9% uptime; automated failover within 30 seconds |
| **Data** | Daily backup with 30-day retention; GDPR-compliant deletion within 72 hours |

---

## 4. ORGANIZE INTO SPECIFICATION

### Specification Structure

```markdown
## Requirements Specification: {Feature/Project Name}

**Version:** {1.0}
**Date:** {YYYY-MM-DD}
**Status:** Draft / Under Review / Approved
**Author:** {who}

### Overview
{1-2 paragraphs: what this feature does, who it's for, why it exists}

### User Stories
{Optional: high-level user stories before detailed requirements}
- As a {role}, I want to {action}, so that {benefit}

### Assumptions
{List of assumptions with impact if wrong}

### Functional Requirements
{REQ-001 through REQ-n, grouped by feature area}

### Non-Functional Requirements
{Performance, security, accessibility, compatibility, etc.}

### Out of Scope
{Explicitly listed items that are NOT part of this spec}

### Open Questions
{Unresolved items that need stakeholder input}

### Dependencies
{Other features, services, or decisions this spec depends on}
```

---

## 5. VALIDATE THE SPEC

Before considering the spec complete:

- [ ] Every requirement has acceptance criteria in Given/When/Then format
- [ ] No requirement uses vague language ("appropriate," "user-friendly," "fast," "secure" without metrics)
- [ ] Error states and edge cases are covered (empty input, max limits, concurrent access, offline)
- [ ] Non-functional requirements have measurable thresholds
- [ ] Assumptions are documented and stakeholders are aware
- [ ] Out of scope is explicit (prevents scope creep)
- [ ] A developer could implement from this spec without asking clarifying questions
- [ ] An agent could write acceptance tests directly from the criteria

---

## 6. RULES

- **Requirements are not solutions.** "The user can filter by date" is a requirement. "Use a date picker component" is a solution. Specify the *what*, not the *how* (unless the *how* is a constraint).
- **Acceptance criteria are not test cases.** They describe what success looks like. Test cases describe how to verify it. The criteria inform the tests, but they're not the same thing.
- **Vague requirements produce vague implementations.** If you can't write a test for it, it's not specific enough. "The system should be reliable" → "The system returns a response within 500ms for 99th percentile of requests."
- **Scope creep starts here.** If it's not in the spec, it's not in scope. Be explicit about what's out.
- **Requirements change.** That's fine. Version the spec, document what changed and why. Don't pretend requirements are immutable.
- **Perfect specs don't exist.** Ship a good spec, iterate based on implementation feedback. An 80% spec that exists beats a 100% spec that's never finished.

---

## 7. OUTPUT

- Store requirement specs in `.claude/plans/` as `requirements-<feature-slug>.md`. (Create the directory if it doesn't exist.)
- If the spec references architecture, link to or generate diagrams in the Obsidian vault or `.claude/plans/`.

---

## EXECUTE NOW

1. Determine your input (discovery brief / stakeholder request / existing feature / bug)
2. Clarify ambiguity (ask questions, document assumptions)
3. Write requirements with acceptance criteria (Given/When/Then)
4. Include non-functional requirements with measurable thresholds
5. Organize into specification document — store in `.claude/plans/`
6. Validate (every requirement testable, no vague language, edge cases covered)

Clear requirements are the cheapest way to prevent expensive mistakes. Write them well.
