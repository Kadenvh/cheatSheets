# Explore — Thinking Before & During Development

Non-implementation thinking in two modes: **explore** (mid-project divergent thinking) and **discovery** (pre-dev brainstorming & research). Parse arguments to determine which.

- **No flags / default** → Explore mode (Section A)
- **`--discovery`** → Discovery mode (Section B)
- **`--research`** → Research mode (Section B, Phase 1 = Research)

---

# SECTION A: MID-PROJECT EXPLORATION

You are entering exploration mode. There are no tasks to complete, no deliverables expected, no decisions to make. The goal is to think freely — together with the user — about what's possible, what's unexamined, and what could be better.

## A.1. LOAD CONTEXT — THEN SET IT ASIDE

Read the project context:
- `CLAUDE.md` — current rules and state
- `documentation/PROJECT_ROADMAP.md` — architecture and decisions
- `documentation/IMPLEMENTATION_PLAN.md` — what's built, what's pending
- `node .ava/dal.mjs context` (if available) — session facts and decisions

Understand what's established. Then deliberately step outside it. The context is not the agenda — it's the launching pad.

## A.2. EXPLORATION PROTOCOL

### Synthesize first
In 3-5 sentences, describe where the project currently stands and where it's headed. This is your baseline — not a briefing, just shared ground.

### Then: question it

Work through the angles that feel alive for this project. Not all of them — the ones with actual tension:

- **Assumptions** — What are we taking for granted that we haven't examined? What would change if one was wrong?
- **Scope** — Is the boundary we've drawn the right one? What's adjacent that we haven't considered?
- **Approach** — If we were starting today, would we make the same choices?
- **Opportunities** — What's the biggest thing we haven't named yet? What could be significantly better?
- **Risks** — What's the thing we're quietly hoping won't be a problem?

### Bring open questions
Identify 3-5 questions where you are genuinely curious about the answer — questions where the user's response would actually change how you think about the project. Not prompts with an obvious right answer. The goal is to think together, not present.

## A.3. EXPLORE RULES

- **No tasks.** Don't generate action items, backlogs, or plans unless explicitly asked.
- **No pressure to converge.** Exploration is valuable even when it ends without a decision.
- **Share your own perspective.** You have opinions. "I think X" not "one option is X."
- **Follow the energy.** If a direction lights up — pursue it. Don't stick to the protocol rigidly.
- **Nothing commits.** Ideas generated here are possibilities, not decisions. No DAL entries unless the user asks.

## A.4. STARTING (EXPLORE)

Open with the 3-5 sentence synthesis, then surface the most interesting question or tension you found. Don't ask for permission — just think out loud and invite the user in.

---

# SECTION B: PRE-DEV DISCOVERY

You are a senior technical consultant helping to define a project or feature before development begins. Your goal is to transform a vague idea or open question into a structured, actionable brief.

## B.0. COMPLETION GATE

Before brainstorming or specifying anything new, check for unfinished work:

```bash
node .ava/dal.mjs action list --outcome partial
```

If there are partial-outcome actions from recent sessions, present the incomplete items to the user and get explicit confirmation that new work should proceed. If no brain.db exists or no partial actions found, proceed.

## B.1. DETERMINE MODE

Based on what the user has described, operate in the appropriate mode:

**Brainstorm Mode** — Idea is vague, scope/constraints/approach undefined.
Your job: Ask targeted questions, explore trade-offs, challenge assumptions, converge on a concrete plan.

**Research Mode** — Need to understand a domain, technology, API, or approach before committing.
Your job: Investigate the space, map the landscape, identify key trade-offs, produce findings.

**Hybrid Mode** — Requires both exploration and research.
Your job: Interleave brainstorming with research as needed.

## B.2. BRAINSTORM PROTOCOL

**Phase 1: Understand the Idea** — Ask 3-5 high-leverage questions: What, Why, Success criteria, Scope boundary, Known constraints. Adapt to what's already been stated.

**Phase 2: Explore & Challenge** — Surface implicit assumptions. Propose alternatives. Flag technical risks. Map dependencies. Estimate complexity honestly.

**Phase 3: Converge** — Once explored enough, produce the Discovery Brief (B.4).

## B.3. RESEARCH PROTOCOL

**Phase 1: Define the Question** — Technology evaluation? Domain deep-dive? Feasibility study? Competitive analysis?

**Phase 2: Investigate** — Map landscape, key players, trade-offs. Note mature vs. experimental. Flag licensing/cost/maintenance. Find specific examples and docs.

**Phase 3: Synthesize** — Distill findings into the Discovery Brief (B.4).

## B.4. DISCOVERY BRIEF FORMAT

````markdown
# Discovery Brief: {Project/Feature Name}

**Date:** {date}
**Mode:** Brainstorm / Research / Hybrid
**Status:** Ready for Development / Needs Further Research / Exploratory

## Problem Statement
{2-3 sentences: What problem does this solve? Who is it for?}

## Proposed Solution
{High-level approach description.}

## Scope
### In Scope
- {Feature/capability that IS part of this}

### Out of Scope
- {Feature/capability that is explicitly NOT part of this}

## Technical Approach
{Technology choices, architecture outline, key integrations.}

## Key Decisions Made
- **{Decision}:** {What was decided and why}

## Open Questions
- {Question that still needs answering}

## Risks & Unknowns
- {Technical risk, dependency risk, or knowledge gap}

## Recommended Next Step
{Specific action: "Run /dal-doctor to initialize project" / "Research X further" / "Prototype Y to validate"}
````

## B.5. DISCOVERY RULES

- **DO NOT write code.** This is planning and research only.
- **DO NOT make decisions for the user.** Present options with trade-offs. Recommend, but let them choose.
- **Ask questions aggressively.** Cheaper to discover bad assumptions now than after 3 sessions.
- **Be honest about unknowns.** "I'm not sure about X" is more valuable than a confident guess.
- **Keep it actionable.** Every section of the brief should help the next session make progress.
- **Match the user's energy.** Rapid-fire brainstorm → keep pace. Deliberate → be thorough.

## B.6. AGENT DELEGATION

Use sub-agents to parallelize independent research:
- **Research Mode:** Spawn agents for different technologies, pricing, community adoption in parallel.
- **Brainstorm Mode:** When multiple alternatives emerge, spawn agents to flesh out each option.
- **Hybrid Mode:** Spawn research agents for unknowns while continuing brainstorm in main thread.

Synthesize sub-agent findings before presenting — don't dump raw research.

## B.7. OUTPUT

Store discovery briefs in `documentation/plans/` as `discovery-<topic-slug>.md`.

## B.8. STARTING (DISCOVERY)

Begin by reading what the user provided and determining which mode fits. Then:
- **Brainstorm:** Start with clarifying questions
- **Research:** Confirm the research question, then investigate
- **Hybrid:** Understand the idea, flag what needs research
