# Agents

Agents are specialized Claude instances that run as subagents — parallel workers with focused expertise. You don't invoke these directly via slash commands; they're dispatched by Claude when appropriate, or you can ask Claude to "run the security reviewer" or "dispatch the closeout worker."

---

## Agent Inventory

### security-reviewer.md

**Purpose:** Security-focused code review.

**When to use:** After implementing features that touch authentication, API endpoints, terminal integration, user input handling, or network access. Ask Claude: "Run the security reviewer on the changes from this session."

**What it checks:**
- Express/API input validation and CSP headers
- Command injection in shell/terminal paths
- XSS vectors in frontend rendering
- `crypto.randomUUID()` fallback for HTTP contexts
- Hardcoded secrets, tokens, keys
- Dependency vulnerabilities
- Network binding (0.0.0.0 vs localhost)

**Output:** Structured report with CRITICAL / HIGH / MEDIUM / LOW findings, each with file path, issue description, risk assessment, and specific fix.

---

### doc-validator.md

**Purpose:** Read-only documentation consistency auditor.

**When to use:** Anytime you want to verify the three-document architecture is healthy. Also available via `/validate-docs` skill which dispatches this agent. Useful before major releases, after large refactors, or when you suspect documentation drift.

**What it checks (5-point audit):**
1. Version & date sync across all three files
2. Routing rule compliance (content in the right file)
3. Duplication detection (no substantive content repeated)
4. Completeness (required sections present)
5. Orphan & staleness detection (dead references, unchecked tasks)

**Output:** Structured PASS/FAIL report with specific violations and recommended fixes.

**Constraint:** Strictly read-only. Will never modify files. Does not ask questions — just produces the report.

---

### closeout-worker.md

**Purpose:** Autonomous session closeout execution.

**When to use:** When you want a hands-off closeout. Instead of running `/session-closeout` interactively (where you see every step and can intervene), dispatch this agent to handle the full closeout autonomously.

**How to invoke:** Ask Claude: "Dispatch the closeout worker with this session summary: [what you did]." Or the `/session-closeout` skill may offer to dispatch it.

**What it does:**
1. Reads session summary (you provide or it infers from context)
2. Reads current state of all three documentation files
3. Determines version increment (patch/minor/major)
4. Updates IMPLEMENTATION_PLAN.md (tasks, files modified, handoff)
5. Updates PROJECT_ROADMAP.md (if milestone — version history, decisions)
6. Updates CLAUDE.md (header, recent changes, anti-patterns, file structure)
7. Creates subfolder READMEs for new directories
8. Self-verifies: version sync, date sync, routing rule compliance, no duplication
9. Returns a structured summary of all changes

**Key difference from /session-closeout:** The skill is interactive (runs in your conversation, you see everything). The agent is autonomous (runs in parallel, returns a summary). Use the skill as your default. Use the agent when you want to be hands-off.

---

## How Agents Differ from Skills

| | Skills | Agents |
|---|--------|--------|
| **Invocation** | You type `/skill-name` | Claude dispatches, or you ask for it |
| **Context** | Runs in your current conversation | Runs as a separate subagent |
| **Interaction** | You see every step, can intervene | Autonomous — returns a summary |
| **Best for** | Interactive workflows, step-by-step guidance | Background tasks, parallel work |
