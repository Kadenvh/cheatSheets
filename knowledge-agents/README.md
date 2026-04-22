# knowledge-agents/

OpenClaw agent workspaces for the CheatSheets knowledge system. Each subdirectory defines one agent, split across up to two surfaces: **identity pack** (who the agent is) and **SKILL.md** (what it does when invoked).

## Agents

| Agent | Role | Identity pack | Skill |
|---|---|:---:|:---:|
| `architect` | Curriculum planning | ✓ | |
| `consolidator` | Vault deduplication + merging | | ✓ |
| `curator` | Archivist — optional enrichment of stub notes | ✓ | ✓ |
| `demo` | Spark — exercise and lesson generation | ✓ | |
| `learning` | Compass — coverage analysis + learning paths | ✓ | |
| `qa` | Oracle — RAG retrieval with citations | ✓ | |
| `retrieval` | RAG Q&A + command router | | ✓ |
| `tutor` | Socratic teaching | ✓ | |
| `vault-health` | Vault health checks (broken links, frontmatter, categories) | | ✓ |
| `verifier` | Sentinel — data quality audit | ✓ | |

The asymmetry is intentional: not every agent has both surfaces yet. Some are purely identity-driven personas consulted by the system; others are purely invocation-driven skills. `curator` is the only one with both today.

## Directory Contract

### Identity pack (OpenClaw persona)

Six files define the agent's personality, role, and boundaries. Present when the agent has a persistent persona the orchestrator consults:

| File | Purpose |
|---|---|
| `AGENTS.md` | Agent configuration (model, tools, routing) |
| `IDENTITY.md` | Agent identity and domain |
| `SOUL.md` | Agent personality, tone, voice |
| `USER.md` | The user's context and preferences, as this agent understands them |
| `TOOLS.md` | Agent-specific tool notes and environment specifics |
| `HEARTBEAT.md` | Health / activity cadence |
| `MEMORY.md` | (Optional) durable memory notes curated by the agent |
| `memory/` | (Optional, gitignored) OpenClaw runtime memory — `.dreams/events.jsonl`, `dreaming/{light,rem,deep}/<date>.md` sleep-cycle logs |

### SKILL.md (invocation protocol)

A single file describing what the agent does when triggered:

```yaml
---
name: <agent-name>
description: <one-line description>
metadata:
  openclaw:
    emoji: "<emoji>"
---

# Title

## Trigger
- /<command>
- Fuzzy match: …

## Protocol
…
```

Present when the agent has a discrete callable capability (RAG Q&A, vault dedup, etc.). Absent on persona-only agents that are consulted through other flows.

## Adding a New Agent

1. Create `knowledge-agents/<name>/` (lowercase, hyphen-separated, single word preferred)
2. Decide: persona, skill, or both?
3. Scaffold the files from existing agents (copy from a similar agent and adapt)
4. Document the agent in the table above

## Runtime Memory

Each agent's `memory/` subdirectory is runtime-only — OpenClaw writes `dreaming/` sleep-cycle reflections and `.dreams/events.jsonl` there. These are gitignored (`knowledge-agents/*/memory/` in the root `.gitignore`). Curated long-term memory belongs in `MEMORY.md` at the agent root.
