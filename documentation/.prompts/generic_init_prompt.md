# Generic Init Prompt Generator

```
Generate a project-specific initialization prompt that establishes full context for any new agent session.

---

## 1. YOUR TASK

Create `{project_name}_init_prompt.md` in the project root. This file will be pasted at the start of every new session to establish context. It must be:

- **Self-sufficient:** Contains enough inline context to prevent critical mistakes before reading full docs
- **Current:** Reflects the actual project state, not a stale snapshot
- **Compact:** Optimized for token efficiency (~300-400 words)
- **Actionable:** Tells the agent exactly what to read and in what order

**Claude Code Note:** CLAUDE.md is auto-read when the agent enters the project directory. The init prompt should supplement CLAUDE.md, not duplicate it. Focus the init prompt on: current task state, session-specific context, version verification, and the engagement protocol — things CLAUDE.md doesn't cover.

---

## 2. ANALYZE FIRST

Before writing, read and extract from:

**CLAUDE.md:**
- Current version and status
- Critical anti-patterns ("DO NOT" rules)
- Variable naming conventions
- Schema/data structure essentials
- Key technical constraints

**PROJECT_ROADMAP.md:**
- Project vision (1-2 sentences)
- Current phase name
- Technology stack summary

**IMPLEMENTATION_PLAN.md:**
- Active blockers or critical issues
- Current focus areas
- Key handoff context

---

## 3. INIT PROMPT STRUCTURE

Generate the file with this exact structure:

```markdown
# {Project Name} — Agent Initialization

You're continuing development on {Project Name}, a {one-sentence description}.

**CORE PRINCIPLE:** {engagement rule, e.g., "Always plan and discuss before implementing."}

---

## 1. VERSION CHECK

Verify documentation consistency before proceeding:
- `CLAUDE.md` version should be: V{X.Y.Z}
- `PROJECT_ROADMAP.md` version should be: V{X.Y.Z}
- `IMPLEMENTATION_PLAN.md` version should be: V{X.Y.Z}

If any version is mismatched or dates are stale, flag it before starting work.

---

## 2. CRITICAL RULES (Memorize Before Reading Docs)

{3-5 most important anti-patterns that cause immediate errors. These go FIRST because agents often start working before finishing documentation.}

**Schema/Data:**
- {Critical rule}
- {Critical rule}

**Anti-Patterns:**
- NEVER {action} — {why}
- NEVER {action} — {why}

**Always:**
- {Required practice}

---

## 3. CURRENT STATE (V{X.Y.Z})

**Version:** {X.Y.Z} | **Status:** {status} | **Updated:** {date}

**Recent Work (V{X.Y.Z}):**
- {What was just completed}
- {What was just completed}

{If blockers exist, list them prominently here}

**Key Facts:**
- {Important context, e.g., "4 tabs: A, B, C, D"}
- {Important context}

---

## 4. READ DOCUMENTATION (In Order)

| File | Focus On |
|------|----------|
| `CLAUDE.md` | {Specific sections — already auto-loaded, but review these areas} |
| `PROJECT_ROADMAP.md` | {Specific sections} |
| `IMPLEMENTATION_PLAN.md` | {Current sprint, handoff notes} |

---

## 5. QUICK REFERENCE

**Key Files:**
- `path/to/main` — {purpose}
- `path/to/other` — {purpose}

**Run:**
```bash
{command to run the project}
```

---

## 6. ENGAGEMENT PROTOCOL

Before ANY implementation:
1. State your understanding of the task
2. Identify affected files/components
3. Flag potential concerns or impacts
4. Propose approach and get confirmation
5. Only then proceed

**No Silent Decisions:** Every deviation from established patterns — naming choices, architectural shortcuts, edge case handling — must be documented. If you make a judgment call, note it explicitly so the next session knows what actually happened vs. what was planned.

Questions encouraged. Concerns should be voiced. Let's begin!
```

---

## 4. CONTENT GUIDELINES

### What to Inline (Section 2)
Rules where violation causes immediate problems:
- Schema mistakes (wrong columns, wrong tables)
- Naming conventions that break systems
- Anti-patterns that corrupt data
- Path/directory errors

### What to Summarize (Section 3)
- Essential status information
- Lead with blockers if any exist
- Include version for doc verification

### What to Reference (Section 4)
- Point to specific doc sections, don't duplicate
- Guide to most relevant parts for current work
- Note that CLAUDE.md is already auto-loaded — point to sections worth re-reading, not everything

### What to Include for Convenience (Section 5)
- Commands needed immediately
- Just enough to orient without opening docs

---

## 5. QUALITY CHECKLIST

Before saving:

- [ ] New agent reading ONLY this prompt would not make critical mistakes
- [ ] Version matches across all documentation
- [ ] Version check section (Section 1) has correct expected versions
- [ ] Status accurately reflects project state (especially blockers)
- [ ] Documentation table points to specific sections
- [ ] Build/run commands are current and correct
- [ ] File is under 400 words (excluding the version check section)
- [ ] No placeholder text like {example} remains
- [ ] Engagement protocol includes "No Silent Decisions" principle

---

## 6. EXECUTE NOW

1. Read all three documentation files completely
2. Extract critical rules, current state, quick reference info
3. Generate `{project_name}_init_prompt.md` following structure above
4. Verify against quality checklist
5. Save to project root directory

The quality of this prompt impacts every future session. Take time to get it right.
```
