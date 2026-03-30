# Agents

Agents are specialized Claude instances that run as subagents — parallel workers with focused expertise. You don't invoke these directly via slash commands; they're dispatched by Claude when appropriate, or you can ask Claude to "dispatch the closeout worker."

---

## Agent Inventory

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
