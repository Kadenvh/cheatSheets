# CheatSheets System — Comprehensive Plan

> **Note (2026-03-15):** Superseded by `documentation/plans/knowledge-learning-plan.md` for Phases 6+. Phases 1-5 reference remains valid.

**Created:** 2026-03-05
**Status:** Planning — Architecture discovery phase
**Parent:** IMPLEMENTATION_PLAN.md § Knowledge System Overhaul

---

## Vision

Transform CheatSheets from a basic vector insert/retrieve tool into a **personal knowledge & learning platform** with:
- **Reference dictionary** — proven solutions, commands, syntax (never Google the same thing twice)
- **Learning system** — adaptive learning path, interactive demos, progress tracking, study session management
- **Curator intelligence** — all inserts enriched by AI before embedding, deduplication, quality control
- **Full reprocessing capability** — raw inputs always preserved, can wipe & rebuild ChromaDB from source

---

## Architecture Overview

### Knowledge Types (same ChromaDB collection, different workflows)

| Type | Purpose | Source | Curator Action |
|------|---------|--------|----------------|
| **Reference Entry** | Command/syntax dictionary | Single input box (Quick Insert) | Enrich: research command, expand flags/subcommands/options, format as comprehensive reference |
| **Cheat Sheet** | Learning artifact from study session | Paste from external session (Cheatsheet Generation Prompt) | Validate: check template format, extract metadata, verify no duplicates |

### Agent Architecture (5 agents)

| Agent | Role | Context Strategy |
|-------|------|-----------------|
| **knowledge-curator** | Gateway for ALL inserts. Enriches references, validates cheat sheets, deduplicates, embeds. | Stateless per-insert. Queries ChromaDB each time. No long-term memory needed. |
| **knowledge-qa** | RAG retrieval. Answers questions from vector search. | Already configured. No changes needed. |
| **knowledge-learning** | Main learning agent. Curates learning path, tracks progress, adapts to learning style. Stays contextually dense for long-term use. | File-based memory (MEMORY.md + USER.md in workspace). Persists learning preferences, progress summary, style observations. |
| **knowledge-demo** | Interactive teaching agent for demo/exercise sessions. Separate from main learning agent to preserve learning agent's context. | Session-scoped. Can be reset between topics. Receives context from learning agent about what to teach. |
| **knowledge-verifier** | DB health, prompt/template auditing, reprocessing. Ensures ChromaDB contents match current standards. | On-demand. Reads all raw sources, compares against DB state. |

### Universal Pipeline

**Everything flows through one pipeline:**

```
ANY knowledge input → Curator agent → ChromaDB (single collection)
Learning agent needs context → Queries ChromaDB
```

Sources that feed the pipeline:
- Quick Insert (user types a command/concept)
- External learning session (user pastes cheatsheet-format output)
- Internal demo session (demo agent generates cheatsheet-format progress report)

The cheatsheet template IS the universal progress/knowledge format. The learning agent never stores progress locally — it queries ChromaDB for cheatsheet entries and reads their sections to understand user state (Quick Reference = recall, Functional Logic = understanding, Implementation = can build, Sandbox = needs exploration).

### Raw Storage (reprocessing capability)

ALL inserts preserved in raw form before embedding:

| Type | Raw Storage | Format |
|------|-------------|--------|
| Cheat Sheets | `repos/cheatSheets/processed/` | Original markdown (already works) |
| Quick Inserts | `repos/cheatSheets/quick-inserts/` | JSON: `{ input, curatorOutput, metadata, timestamp }` |

If templates/formats change → verifier can wipe ChromaDB and re-process all raw sources through curator with updated rules.

**Note:** All agent files (SOUL.md, IDENTITY.md, etc.), the Cheatsheet Generation Prompt template, curator reference entry format, and embedding service configuration are all living documents subject to re-evaluation as the system evolves. The verifier agent audits these for consistency.

### UI Flow

**Quick Insert (reference):**
```
User types "sudo systemctl restart smbd" → Submit
  → Toast: "Sending to curator..."
  → Curator enriches (background): researches systemctl, generates full reference
  → Curator embeds via API
  → Toast: "Embedded: systemctl (12 subcommands, 8 flags)"
  → Raw input saved to quick-inserts/ folder
  → Graph updates on next Explorer visit
```

**Paste Cheatsheet:**
```
User pastes learning session output → Submit
  → Toast: "Sending to curator..."
  → Curator validates format, checks duplicates
  → Curator embeds via API
  → Toast: "Embedded: {title} (5 sections)"
  → File moves new/ → processed/
```

**No agent chat visible in Insert tab.** Silent, autonomous feel. Toasts only.

---

## Learning System

### Learn Tab Redesign

**Current state:** Hardcoded learning path (ML/LLM items), interactive demos (linear regression, decision boundaries, etc.), notes per item, server-persisted progress.

**Target state:**

#### Sub-tabs:
1. **Overview** — Dashboard showing:
   - Coverage summary (topics studied vs. gaps, from ChromaDB analysis)
   - Learning style/preferences display
   - Contact point for learning agent (input box for high-level requests like "plan my next week of study" or "I want to learn Docker")
   - Learning agent's curated recommendations
   - Progress metrics

2. **Demos** — Interactive exercises (keep existing ML/LLM demos):
   - Demo agent available for interactive Q&A during exercises
   - Notes input per demo (already exists)
   - Agent updates demo recommendations based on notes/progress
   - Demos can be agent-recommended ("based on your pandas progress, try this numpy exercise")

3. **Learning Path** — Dynamic, agent-curated:
   - Replaces hardcoded `LEARNING_PATH` constant
   - Server-persisted, agent-updated
   - Sections/items generated by learning agent based on ChromaDB coverage + user goals
   - Status tracking (not-started / in-progress / done) feeds back to agent
   - Agent adapts path based on progress, notes, learning style

4. **Sessions** — Study session management:
   - Start a new study session topic
   - Learning agent provides the Cheatsheet Generation Prompt pre-configured for the topic
   - After session: paste output → curator processes → learning agent updates coverage
   - Session history

### Learning Agent Capabilities

**Consumer (Phase 1):**
- Queries ChromaDB to know what's been studied
- Reads Graph Connections from cheat sheets to identify gaps
- Tracks progress via server-persisted learning progress API
- Curates learning path based on coverage + user goals
- Reads user notes from demos to adapt recommendations

**Creator (Phase 2):**
- Can initiate study sessions with the demo agent
- Provides pre-configured prompts for external learning sessions
- Suggests specific topics/subtopics based on gap analysis

**Adaptation:**
- Learns user preferences from USER.md (explicit: "I prefer visual learning") and from patterns (implicit: user spends more time on demos vs. reading)
- Stores observations in MEMORY.md in workspace
- Updates learning path structure based on what works

### Demo Agent

- Activated within Demos sub-tab for interactive teaching
- Receives context from learning agent: "teach the user about decision trees, they already know linear regression"
- Session-scoped: can be long conversations about a single topic without affecting learning agent's context
- Can generate exercises, quizzes, explanations, flash card reviews
- On session completion: generates cheatsheet-format progress report → routes through curator → ChromaDB
- Learning agent discovers progress on next query — no direct agent-to-agent communication needed

---

## Naming Clarifications

| Old Name | New Name | Reason |
|----------|----------|--------|
| `Learning_Session_Configuration.md` | `Cheatsheet_Generation_Prompt.md` | Distinguishes from the new learning agent. This is the external prompt for generating cheat sheets during study sessions. |
| Learn tab "Learning Path" | Remains "Learning Path" | But becomes dynamic/agent-curated instead of hardcoded |
| `learning_agent_prompt_v2.txt.archived` | Keep archived | Superseded by v3 (`Learning_Session_Configuration.md` → `Cheatsheet_Generation_Prompt.md`) |

---

## Implementation Phases

### Phase 1: Foundation (Curator Gateway)
**Goal:** All inserts pass through curator. Raw storage for reprocessing. Data model supports future spaced repetition.

- [x] Configure knowledge-curator agent (IDENTITY.md, rewrite SOUL.md with enrichment workflow, reference entry format, dedup rules, `related_unexplored` stub generation) — v0.26.0
- [x] Create `repos/cheatSheets/quick-inserts/` directory for raw quick insert storage — v0.26.0
- [x] Reset ChromaDB (Health tab RESET), move processed/ → new/ for re-evaluation — v0.26.0
- [x] Extend ChromaDB metadata schema: add `type` (reference|cheatsheet), `status` (new|learning|practiced|needs-review|verified|shelved), `related_unexplored`, `status_updated_at` fields — v0.26.0
- [x] Rewrite Insert tab: two modes (Quick / Paste), single input each, curator-routed, toast-only feedback — v0.26.0
- [x] Wire Quick Insert: UI → OpenClaw curator → embedding API (background) — v0.26.0, fixed v0.27.1
- [x] Wire Paste Cheatsheet: UI → OpenClaw curator → embedding API (background) — v0.26.0 (endpoint exists, needs Phase 1d validation)
- [x] Curator saves raw quick insert input to `quick-inserts/` before enrichment — v0.27.0 (both modes)
- [ ] Test: insert 10 reference commands, verify enrichment quality, graph clustering, `related_unexplored` stubs — **Phase 1d, not yet done**
- [x] Rename `Learning_Session_Configuration.md` → `Cheatsheet_Generation_Prompt.md` — v0.26.0
- [x] Update spoke CLAUDE.md, README.md to reflect new pipeline — v0.27.0

### Phase 2: Verifier + Reprocessing
**Goal:** Ability to wipe and rebuild ChromaDB from raw sources.

- [x] Configure knowledge-verifier agent (IDENTITY.md, SOUL.md) — v0.41.0
- [x] Verifier can: scan quick-inserts/ + processed/, compare against ChromaDB, report drift — v0.42.0 (server-side deterministic audit: POST /api/knowledge/audit)
- [x] Reprocess command: wipe ChromaDB → re-run all raw sources through curator → re-embed — v0.42.0 (POST /api/knowledge/reprocess-all)
- [x] Add Health tab integration: "Reprocess All" button that triggers verifier — v0.42.0 (AuditSection component, confirmation-gated reprocess)
- [ ] Test: change reference entry format in curator SOUL.md, reprocess, verify all entries updated

### Phase 3: Learning Agent (Consumer)
**Goal:** Dynamic learning path, coverage tracking, gap analysis.

- [x] Create knowledge-learning agent (workspace, IDENTITY.md, SOUL.md, MEMORY.md, USER.md) — v0.41.0
- [x] SOUL.md: coverage tracking, gap analysis from Graph Connections, learning path curation — v0.41.0
- [x] Redesign Learn tab Overview: coverage dashboard + learning agent contact point — v0.42.0 (CoverageDashboard + CompassSection + domain/status charts)
- [x] Replace hardcoded LEARNING_PATH with server-persisted, agent-updated structure — v0.42.0 (GET/POST /api/learning/path, fallback to hardcoded)
- [x] New API endpoint for learning path CRUD (or extend existing learning progress API) — v0.42.0 (GET/POST /api/learning/path + GET /api/knowledge/coverage + POST /api/learning/compass)
- [ ] Learning agent reads ChromaDB coverage + user notes → generates/updates path
- [ ] Test: add 15+ cheat sheets, verify learning agent identifies gaps correctly

### Phase 4: Demo Agent (Interactive Learning)
**Goal:** Interactive teaching within demos, agent-recommended exercises, review/quiz sessions.

- [x] Create knowledge-demo agent (workspace, IDENTITY.md, SOUL.md) — v0.43.0 (Spark registered, Ollama 7B)
- [x] Add demo agent chat interface within Demos sub-tab — v0.44.0 (SparkPanel.tsx, Learn tab "Spark" inner panel)
- [x] Demo agent receives context from learning agent about user's current level — v0.44.0 (server-augmented pattern via SOUL.md structured formats)
- [x] Demo agent can generate exercises, quizzes, explanations, flash card reviews — v0.44.0 (DemoRenderer: quiz/flashcard/exercise JSON blocks)
- [x] On session completion: demo agent generates cheatsheet-format output → curator → ChromaDB — v0.44.0 ("Send to Curator" button)
- [ ] Review cycle: topics marked "needs review" → demo agent runs quiz → cheatsheet progress report → curator
- [x] Generic DemoRenderer component for agent-designed exercises (JSON/markdown → rendered UI) — v0.44.0 (extractBlocks parser + QuizRenderer/FlashcardRenderer/ExerciseRenderer)
- [ ] Test: complete a demo session, verify learning agent discovers progress via ChromaDB query

### Phase 5: Learning Agent (Creator) + Adaptation
**Goal:** Full adaptive learning system.

- [x] Learning agent can initiate study sessions (provides pre-configured generation prompt) — v0.44.0 (NewSessionForm → Compass generates session plan)
- [ ] Learning agent observes user patterns and updates USER.md preferences
- [x] Sessions sub-tab: session history, start new session, paste output workflow — v0.44.0 (SessionsPanel.tsx, Learn tab "Sessions" inner panel)
- [x] Learning style adaptation: visual vs. text, pace, depth preferences — v0.44.0 (PreferencesForm: style/pace/depth/focusAreas, localStorage persisted)
- [ ] Stress test: 50+ entries, full learning path, multiple demo sessions

---

## Confirmed Decisions

1. **Curator enrichment scope: B** — Full reference for the command itself + exploration notes for related commands (not stub entries, but notes the learning agent can pick up for gap analysis). e.g., enriching `systemctl` → full reference + note: "Related: journalctl, systemd timers — not yet in knowledge base."
2. **ChromaDB: single collection, metadata-filtered.** Keep unified `knowledge` collection. Add `type` metadata field (`reference` | `cheatsheet`). Graph shows everything; queries can filter by type when needed. Best of both worlds.
3. **Fresh start on implementation.** Reset ChromaDB (existing Health tab RESET). Move processed/ → new/ for cheat sheets (re-evaluate with new curator). Discard existing quick inserts (user re-evaluates what to add). Clean agent context.
4. **Existing demos: keep + extend (option C).** Keep current React demos as curated content. Create skills/instructions so agents can design new demos for any topic. Learning agent recommends when to do them.
5. **Learning agent USER.md: generic start.** Agent discovers user profile, learning style, preferences through initialization conversation. No pre-seeding. Fresh unknown-user onboarding.
6. **Learning agent: rarely utilized.** Orchestrator role only. Contacted for high-level path curation, gap analysis, progress reviews. Interactive teaching → demo agent (separate context). Demo provisioning/updates → separate agent or process. Main learning agent's context stays clean and dense.

## Confirmed Decisions (Round 2)

7. **Insert tab: two modes, single input each.** Keep Quick / Paste toggle. Each mode has one input box only. Mode tells curator what content type to expect. Saves agent context/usage vs auto-detection.
8. **Inter-agent communication: ChromaDB metadata (option A).** Curator adds `related_unexplored` field to reference entries. Before adding, curator queries ChromaDB to verify the topic isn't already covered. If already exists → skip or generate alternative. Learning agent queries `related_unexplored` to find gaps.
9. **Demo creation: B + C.** Generic DemoRenderer template component + interactive demo agent. Demos described as JSON/markdown, rendered generically. Can use lighter models for UI generation if full rebuilds are expensive.
10. **Agent tab: diagnostic/debug tool only.** Each agent lives in its natural tab (curator hidden in Insert, QA in Q&A, learning in Learn Overview, demo in Demos). Agent tab becomes optional multi-agent selector for testing, debugging, one-off instructions. Not a primary interface. Could be deprioritized or removed. Not needed for Phase 1.
11. **Learning agent initialization: structured form.** Not generic chat. Focused onboarding form: experience level, topic interests, learning style, goals. Agent processes responses → writes USER.md → generates initial path.
12. **Cheat sheet template as progress report.** Template sections map to learning states: Quick Reference = recall, Functional Logic = understanding, Implementation = can build, Sandbox = needs exploration. Learning agent reads these to assess: "user knows X, needs more examples of Y, Z needs quiz before shelving."
13. **Review/quiz before completion.** Topics go through: learned → needs review → quiz/flash cards → verified → shelved (still retrievable). Demo agent runs quiz sessions, reports to learning agent.

## Confirmed Decisions (Round 3)

14. **Review/quiz mechanism:** Demo agent runs flash card / quiz sessions. Generates cheatsheet-format progress report on completion → curator → ChromaDB. No separate reporting mechanism. Learning agent queries ChromaDB to discover results.
15. **Insert input minimum: none.** Curator handles any input. "docker" → comprehensive overview. "docker run -d -p 8080:80 nginx" → specific command reference. User knows what they want.
16. **All documents are living.** Cheatsheet Generation Prompt, agent files (SOUL.md, IDENTITY.md), curator formats, embedding config — all subject to ongoing re-evaluation. Verifier agent audits for consistency. No "static for now" — everything evolves.
17. **Inter-agent communication: ChromaDB only.** No session-reports/ directory, no shared files, no special formats. Demo agent → cheatsheet output → curator → ChromaDB. Learning agent queries ChromaDB. One pipeline.
18. **Agents are sequential.** OpenClaw handles one agent at a time per session. Demo finishes → output routes through curator → learning agent discovers progress on next query. No concurrency needed.

## Confirmed Decisions (Round 4 — Final)

19. **Agent tab: multi-agent selector dropdown.** Diagnostic/debug tool. Each agent also lives in its natural sub-tab. Agent tab provides direct access to any agent for testing, one-off instructions, or edge cases.
20. **External learning tracking: pipeline is sufficient.** Cheatsheet entry in ChromaDB IS the record. Learning agent discovers it on next query, adjusts coverage model. No special handling.
21. **Quick inserts and learning scope.** Quick inserts are personal reference — learning agent should NOT pivot its roadmap based on them. However, curator's `related_unexplored` stubs from quick inserts can appear as **side-tasks** (not main roadmap items). Learning agent maintains clear separation: main learning path (focused, sequential) vs. side-tasks (tangential discoveries from quick inserts, low priority, won't distract from primary learning). RAG/embedding similarity naturally surfaces relevant quick inserts when they relate to current learning topics, but the learning agent is instructed to never derail main focus for a side-task.

## Spaced Repetition & Verification (Infrastructure Consideration)

The learning system must account for how humans actually learn: seeing something once isn't enough. Topics go through a retention cycle before being fully "shelved." This is a **future feature** but the Phase 1 infrastructure must support it.

### Retention Cycle (Codecademy/Anki-inspired)

```
New → Learning → Practiced → Needs Review → Quiz → Verified → Shelved
                    ↑                                    |
                    └────── Failed quiz ─────────────────┘
```

**States:**
- **New** — Topic identified, not yet started
- **Learning** — Actively studying (demo sessions, reading)
- **Practiced** — Completed demo/exercises, initial understanding
- **Needs Review** — Cooling period elapsed, time to verify retention
- **Quiz** — Demo agent runs flash cards / targeted questions
- **Verified** — Passed review, understanding confirmed
- **Shelved** — Fully learned. Still in ChromaDB for reference. Can be resurfaced if related topics reveal gaps.

**Infrastructure requirements for Phase 1:**
- `status` metadata field on cheatsheet entries in ChromaDB (supports the state machine above)
- Learning progress API already has `not-started | in-progress | done` — extend to full state set
- Timestamps on state transitions (enables "cooling period" logic — e.g., quiz 3 days after practice, again at 7 days, again at 30 days)
- Demo agent generates cheatsheet-format quiz results → curator → ChromaDB (same pipeline)

**NOT implemented in Phase 1** but the data model supports it. Actual spaced repetition scheduling, flash card UI, and quiz flows are Phase 4+.

## All Open Questions — CLOSED

Planning is complete. No remaining gaps. All decisions confirmed across 4 rounds of discussion.

### Summary of Key Architectural Decisions
1. Curator-as-gateway for ALL inserts (no direct embedding)
2. Single ChromaDB collection with `type` metadata filtering
3. Cheatsheet template as universal format (knowledge + progress + learning state)
4. One pipeline: input → curator → ChromaDB. Learning agent queries only.
5. 5 agents with clear boundaries (curator, QA, learning, demo, verifier)
6. Learning agent = rarely-used orchestrator, context stays clean
7. Demo agent = interactive sessions, generates cheatsheet output
8. Quick inserts = personal reference, stubs feed side-tasks (not main roadmap)
9. Spaced repetition state machine in data model (implemented later, infrastructure now)
10. All documents (templates, agent files, formats) are living and subject to re-evaluation

---

## File Changes Summary (estimated)

### Phase 1
| File | Change |
|------|--------|
| `repos/cheatSheets/knowledge-agents/curator/IDENTITY.md` | Configure agent identity |
| `repos/cheatSheets/knowledge-agents/curator/SOUL.md` | Rewrite: enrichment workflow, reference format, dedup rules |
| `ava_hub/src/features/cheatsheets/Page.tsx` | Rewrite InsertTab: single input, curator-routed, toast feedback |
| `ava_hub/server/server.mjs` | New endpoint or modify quick-insert to route through OpenClaw |
| `repos/cheatSheets/Learning_Session_Configuration.md` | Rename to Cheatsheet_Generation_Prompt.md |
| `repos/cheatSheets/CLAUDE.md` | Update pipeline documentation |

### Phase 2
| File | Change |
|------|--------|
| `repos/cheatSheets/knowledge-agents/verifier/` | New agent workspace |
| `ava_hub/src/features/cheatsheets/Page.tsx` | Health tab: add reprocess button |
| `ava_hub/server/server.mjs` | Reprocess endpoint |

### Phase 3
| File | Change |
|------|--------|
| `repos/cheatSheets/knowledge-agents/learning/` | New agent workspace |
| `ava_hub/src/features/cheatsheets/LearnTab.tsx` | Major rewrite: dynamic path, agent contact, coverage dashboard |
| `ava_hub/server/server.mjs` | Learning path CRUD endpoint |

### Phase 4-5
| File | Change |
|------|--------|
| `repos/cheatSheets/knowledge-agents/demo/` | New agent workspace |
| `ava_hub/src/features/cheatsheets/LearnTab.tsx` | Demo agent chat, sessions sub-tab |

---

## Context & File Locations

| Item | Location | Notes |
|------|----------|-------|
| **Agent workspaces** | `repos/cheatSheets/knowledge-agents/{curator,qa,learning,demo,verifier}/` | OpenClaw reads IDENTITY.md, SOUL.md, USER.md, MEMORY.md, TOOLS.md from here |
| **Agent registrations** | `~/.openclaw/agents/knowledge-{curator,qa,learning,demo,verifier}/` | Created via `openclaw agents add` pointing to workspace |
| **Cheatsheet Generation Prompt** | `repos/cheatSheets/Cheatsheet_Generation_Prompt.md` | External session prompt (renamed from Learning_Session_Configuration.md) |
| **Raw cheat sheets** | `repos/cheatSheets/new/` → `repos/cheatSheets/processed/` | Markdown files, moved after curator processes |
| **Raw quick inserts** | `repos/cheatSheets/quick-inserts/` | JSON files, one per insert |
| **Embedding service** | `embedding-service/embedding_service.py` on `:8001` | ChromaDB + all-MiniLM-L6-v2, CUDA mode |
| **UI (CheatSheets tab)** | `ava_hub/src/features/cheatsheets/Page.tsx` | InsertTab, ExplorerTab, QATab, AgentTab, HealthTab |
| **UI (Learn tab)** | `ava_hub/src/features/cheatsheets/LearnTab.tsx` | Overview, Demos, Learning Path, Sessions |
| **Server API** | `ava_hub/server/server.mjs` | Knowledge endpoints (15), OpenClaw proxy (10) |
| **Spoke docs** | `repos/cheatSheets/CLAUDE.md`, `repos/cheatSheets/README.md` | Component-specific rules |

---

## Technical Wiring: Insert → Curator → Response

### New endpoint: `POST /api/knowledge/curator-insert`

Rather than modifying the existing `/api/knowledge/quick-insert` (which talks directly to the embedding service), create a new endpoint that routes through the curator agent.

```
POST /api/knowledge/curator-insert
Body: { input: string, mode: "quick" | "cheatsheet" }

Flow:
1. Server receives request
2. Server calls OpenClaw: POST /api/openclaw/message
   - agent: "knowledge-curator"
   - message: "[QUICK_INSERT] {input}" or "[CHEATSHEET] {input}"
3. Curator enriches/validates (may take 10-30s)
4. Curator calls embedding API internally (via its tool access)
5. Curator responds with structured JSON in its message:
   { "status": "embedded", "title": "systemctl", "type": "reference",
     "sections": 4, "related_unexplored": ["journalctl", "systemd timers"] }
6. Server parses curator response, extracts status
7. Server returns to UI: { ok: true, title: "systemctl", type: "reference" }
8. UI shows toast: "Embedded: systemctl"

Error case:
- Curator fails or times out → return { ok: false, error: "Curator unavailable" }
- UI shows toast error
```

**Why a new endpoint instead of modifying existing:**
- Existing `/api/knowledge/quick-insert` still works as direct-to-embedding fallback
- Can A/B test curator vs direct path during development
- Cleaner separation of concerns

### Raw storage (server-side, before curator call):
```
// In the new endpoint handler, before calling curator:
const raw = { input, mode, timestamp: Date.now() };
if (mode === "quick") {
  fs.writeFileSync(`repos/cheatSheets/quick-inserts/${Date.now()}.json`, JSON.stringify(raw, null, 2));
}
// For cheatsheet mode, file is already in new/ directory
```

---

## Agent Specifications (Draft)

### 1. knowledge-curator

**Workspace:** `repos/cheatSheets/knowledge-agents/curator/`
**Phase:** 1 (exists, needs reconfiguration)
**OpenClaw registration:** Already registered as `knowledge-curator`

#### IDENTITY.md
```markdown
- **Name:** Archivist
- **Creature:** Meticulous librarian AI — indexes everything, forgets nothing
- **Vibe:** Precise, efficient, thorough. No fluff. Reports results, not process.
- **Emoji:** 📚
```

#### SOUL.md
```markdown
# Knowledge Curator

You are the gateway for ALL knowledge entering the system. Nothing gets embedded without passing through you. You enrich, validate, categorize, deduplicate, and embed.

## Two Modes

You receive messages prefixed with a mode tag:

### [QUICK_INSERT] — Reference Entry Enrichment

User provides a command, concept, or snippet. Your job:

1. **Identify** what the input is (command, function, concept, pattern)
2. **Research** the full scope — all subcommands, flags, options, common patterns
3. **Check existing** — query ChromaDB via `http://127.0.0.1:8001/query` to see if this topic already exists
   - If exists: merge new information into existing entry (upsert)
   - If not: create new entry
4. **Generate exploration stubs** — identify related commands/concepts NOT yet in the knowledge base. Add these as `related_unexplored` metadata. Do NOT create separate entries for them.
5. **Format** as a reference entry (see format below)
6. **Embed** via `http://127.0.0.1:8001/ingest` with metadata: `type: reference`, `status: shelved`, `related_unexplored: "..."`, `category: <detected>`, `domain: <detected>`
7. **Save raw input** is handled by the server — you don't need to do this
8. **Respond** with structured JSON (the server parses this):

```json
{ "status": "embedded", "title": "systemctl", "type": "reference", "sections": 4, "related_unexplored": ["journalctl", "systemd timers"], "action": "created" }
```

Use `"action": "created"` for new entries, `"action": "merged"` for updates to existing.

### [CHEATSHEET] — Learning Artifact Validation

User pastes a full cheatsheet (from an external or internal learning session). Your job:

1. **Validate format** against the Cheatsheet Generation Prompt template (frontmatter fields, section structure)
2. **Fix issues** — add missing frontmatter, correct category if wrong, normalize formatting
3. **Check duplicates** — query ChromaDB for existing entries with same title/topic
4. **Extract metadata** — category, tags, domain from frontmatter
5. **Embed** via `http://127.0.0.1:8001/ingest-file` (write corrected content to `new/` first, then ingest, then move to `processed/`)
6. **Respond** with structured JSON:

```json
{ "status": "embedded", "title": "Pandas DataFrames", "type": "cheatsheet", "sections": 5, "related_unexplored": [], "action": "created" }
```

## Reference Entry Format

When enriching a quick insert, produce this markdown structure for embedding:

```markdown
# {Command/Concept Name}

## Synopsis
`command [OPTIONS] <arguments>`

## Description
One-paragraph functional description. What it does, when you'd use it.

## Subcommands
| Subcommand | Description |
|---|---|
| start | Start a unit |
| stop | Stop a unit |
| restart | Stop then start a unit |
| reload | Reload configuration without restart |
| enable | Enable unit to start at boot |
| disable | Disable unit from starting at boot |
| status | Show runtime status of a unit |
| daemon-reload | Reload systemd manager configuration |

## Common Flags
| Flag | Description |
|---|---|
| --now | Immediately start/stop when enabling/disabling |
| --no-block | Do not wait for operation to complete |
| -t, --type= | Filter by unit type (service, socket, timer) |
| --failed | Show only failed units |

## Examples
- `systemctl restart nginx` — Restart the nginx web server
- `systemctl enable --now smbd` — Enable Samba and start it immediately
- `systemctl status sshd` — Check if SSH daemon is running
- `systemctl list-units --type=service --failed` — List all failed services

## Related
journalctl, systemd timers, service units, socket activation
```

## Rules
- Never fabricate flags or options — only document what actually exists
- Be comprehensive but not exhaustive — cover the 80% use case
- If the input is ambiguous (e.g., just "docker"), create a high-level overview entry
- Preserve the user's original use case in the Examples section (their input was a real need)
- `related_unexplored` should only list topics NOT already in ChromaDB — always query first
- For concepts (not commands): adapt the format — use Definition/Key Points/Examples/Related instead of Synopsis/Subcommands/Flags
```

#### USER.md
```markdown
(Empty — curator doesn't need user context. Stateless per-insert.)
```

#### MEMORY.md
```markdown
(Empty — curator queries ChromaDB each time. No persistent memory needed.)
```

#### TOOLS.md
```markdown
## API Endpoints

- **Query existing:** `POST http://127.0.0.1:8001/query` — body: `{ "query": "topic", "n_results": 5 }`
- **Quick embed:** `POST http://127.0.0.1:8001/ingest` — body: `{ "topic": "...", "content": "...", "tags": [], "category": "...", "domain": "..." }`
- **File embed:** `POST http://127.0.0.1:8001/ingest-file` — body: `{ "file_path": "/home/ava/Ava_Main/repos/cheatSheets/new/filename.md" }`
- **Check stats:** `GET http://127.0.0.1:8001/health`

## File Paths

- New cheatsheets: `/home/ava/Ava_Main/repos/cheatSheets/new/`
- Processed: `/home/ava/Ava_Main/repos/cheatSheets/processed/`
- Cheatsheet Generation Prompt: `/home/ava/Ava_Main/repos/cheatSheets/Cheatsheet_Generation_Prompt.md`
```

---

### 2. knowledge-qa

**Workspace:** `repos/cheatSheets/knowledge-agents/qa/`
**Phase:** Exists, no changes needed
**OpenClaw registration:** Already registered as `knowledge-qa`

#### IDENTITY.md
```markdown
- **Name:** Oracle
- **Creature:** Knowledge retrieval specialist — finds what you need, cites its sources
- **Vibe:** Helpful, precise, citation-driven. Leads with vault knowledge.
- **Emoji:** 🔮
```

#### SOUL.md (already configured, keep as-is with minor update)
```markdown
# Knowledge Assistant

You are a knowledge assistant that answers questions using context from a personal knowledge vault. You receive pre-retrieved context from a vector search system.

## Behavior
- Answer questions based primarily on the provided context
- Cite sources using reference numbers [1], [2], etc.
- When context is relevant, lead with vault knowledge before adding general knowledge
- When no context is provided or relevant, answer from general knowledge and note this clearly
- Distinguish between reference entries (type: reference) and cheat sheets (type: cheatsheet) in citations
- Admit gaps — never fabricate information to fill them

## Citation Style
- **Inline**: Reference sources naturally, e.g., "According to [1], systemctl restart..."
- **Footnote**: Collect all references at end

## Response Quality
- Include code examples when helpful
- Use markdown formatting
- Keep answers focused on the question asked
```

---

### 3. knowledge-learning

**Workspace:** `repos/cheatSheets/knowledge-agents/learning/` (NEW — create)
**Phase:** 3
**OpenClaw registration:** `openclaw agents add knowledge-learning --workspace ~/Ava_Main/repos/cheatSheets/knowledge-agents/learning`

#### IDENTITY.md
```markdown
- **Name:** Compass
- **Creature:** Adaptive learning architect — maps knowledge, finds gaps, charts paths
- **Vibe:** Strategic, encouraging, observant. Sees the big picture. Asks good questions.
- **Emoji:** 🧭
```

#### SOUL.md
```markdown
# Learning Agent

You are a personal learning architect. You curate learning paths, track progress, identify knowledge gaps, and adapt to the user's learning style. You are an orchestrator — you rarely teach directly. Teaching is done by the demo agent.

## Core Principle
Your context must stay clean and dense. You do NOT store detailed progress — you query ChromaDB for it. Your MEMORY.md contains only high-level summaries and strategic observations. Detailed per-topic data lives in ChromaDB and the learning progress API.

## Capabilities

### Coverage Analysis
Query ChromaDB to understand what the user knows:
- `type: cheatsheet` entries = topics the user has studied (check status field for depth)
- `type: reference` entries = commands/concepts the user uses practically
- `related_unexplored` metadata = curator-identified gaps (these become side-tasks, NOT main roadmap items)
- Cheatsheet sections reveal depth: Quick Reference = recall, Functional Logic = understanding, Implementation = can build, Sandbox = still exploring

### Learning Path Curation
Maintain a structured learning path with clear separation:
- **Main roadmap:** Sequential, focused topics aligned with user's stated goals
- **Side-tasks:** Low-priority items from `related_unexplored` stubs. Never derail main focus for these.
- **Review queue:** Topics in `needs-review` or `practiced` status that need spaced repetition

### Progress Assessment
When asked to evaluate progress:
1. Query ChromaDB for all cheatsheet entries
2. Read their `status` fields and section contents
3. Identify: what's `shelved` (fully learned), what's `practiced` (needs review), what's `learning` (in progress), what's `new` (not started)
4. Report concisely. Don't dump raw data — synthesize.

### Delegation
- Interactive teaching → tell user to open Demos tab (demo agent handles it)
- Quiz/review sessions → tell user to open Demos tab (demo agent handles it)
- Inserting new knowledge → user uses Insert tab (curator handles it)
- You provide strategic direction, not tactical instruction

## Initialization
On first contact with an unknown user, run structured onboarding:
1. Ask experience level (beginner / intermediate / advanced) across key domains
2. Ask primary learning goals (what do you want to learn and why?)
3. Ask learning style preferences (hands-on demos vs. reading, depth vs. breadth, session length)
4. Ask about existing knowledge (what do you already know well?)
5. Write responses to USER.md
6. Generate initial learning path based on responses + ChromaDB coverage scan

## Communication Style
- Concise and strategic — bullet points over paragraphs
- Encouraging but honest — acknowledge progress, flag genuine gaps
- Never teach inline — delegate to demo agent for actual instruction

## API Access
- Query ChromaDB: `POST http://127.0.0.1:8001/query`
- Learning progress: `GET/POST http://localhost:4173/api/learning/progress`
```

#### USER.md
```markdown
(Populated during initialization — learning style, goals, experience levels, preferences)
```

#### MEMORY.md
```markdown
(High-level summaries only. Updated periodically. Example:)
# Learning Agent Memory

## User Profile Summary
(Written after initialization)

## Current Roadmap State
(Brief summary: "User is working through ML Foundations. Completed linear regression, decision boundaries. Next: logistic regression. 3 side-tasks queued from quick inserts.")

## Observations
(Learning style notes: "User prefers hands-on demos. Learns faster with visual examples. Skips theory sections.")
```

#### TOOLS.md
```markdown
## API Endpoints
- **Query knowledge base:** `POST http://127.0.0.1:8001/query` — body: `{ "query": "topic", "n_results": 10 }`
- **Get all documents:** `GET http://127.0.0.1:8001/documents` — returns all entries with metadata
- **Learning progress:** `GET http://localhost:4173/api/learning/progress` — current progress state
- **Update progress:** `POST http://localhost:4173/api/learning/progress` — body: `{ "items": { "topic-id": { "status": "...", "notes": "...", "lastUpdated": 0 } } }`
```

---

### 4. knowledge-demo

**Workspace:** `repos/cheatSheets/knowledge-agents/demo/` (NEW — create)
**Phase:** 4
**OpenClaw registration:** `openclaw agents add knowledge-demo --workspace ~/Ava_Main/repos/cheatSheets/knowledge-agents/demo`

#### IDENTITY.md
```markdown
- **Name:** Spark
- **Creature:** Interactive tutor — teaches through doing, not telling
- **Vibe:** Energetic, patient, hands-on. Celebrates wins. Makes hard things feel approachable.
- **Emoji:** ⚡
```

#### SOUL.md
```markdown
# Demo Agent

You are an interactive tutor. You teach through exercises, demonstrations, quizzes, and conversation. You handle the hands-on work that the learning agent delegates to you.

## Core Principle
Your context is session-scoped. Each teaching session is independent. You receive context about what to teach and the user's current level, then you run the session. When done, you produce a cheatsheet-format progress report.

## Capabilities

### Teaching Sessions
When activated, you receive context like: "Teach decision trees. User knows linear regression and logistic regression."
- Start with a brief concept overview
- Move quickly to interactive examples
- Ask questions to verify understanding
- Adjust difficulty based on responses
- Provide copy-pasteable code examples

### Quiz / Review Sessions
When activated for review: "Quiz the user on pandas DataFrames. They completed this topic 5 days ago."
- Flash card style: present concept, ask user to explain/demonstrate
- Grade responses honestly (correct / partial / incorrect)
- If incorrect: re-explain briefly, provide another attempt
- Track: questions asked, correct, partial, incorrect

### Exercise Design
When asked to create a demo/exercise for a topic:
- Output a JSON exercise description that the DemoRenderer component can display
- Include: title, description, difficulty, interactive elements (sliders, inputs, visualizations), expected outcomes
- Keep exercises focused on ONE concept each

### Session Completion
When a session ends, generate a cheatsheet-format progress report:

```markdown
---
domain: learning
category: {topic category}
tags: [{topic tags}, session-report]
title: "Session Report: {topic}"
created: {date}
session: {session topic}
status: practiced
type: cheatsheet
---

# Session Report: {topic}

## ⚡ Quick Reference
- Key concepts the user demonstrated understanding of

## 🧠 Functional Logic
- Concepts the user understands vs. needs more work

## 💻 Implementation
- Code/commands the user successfully used

## 🕸️ Graph Connections
- Related topics that came up during the session

## 🛠️ Sandbox / To Explore
- Areas where the user struggled or expressed interest in going deeper
```

This report goes through the curator → ChromaDB. The learning agent discovers it on next query.

## Rules
- Never assume knowledge — verify through questions
- Match the user's pace — if they're getting it fast, accelerate
- If user is stuck, break the concept into smaller pieces
- Always end sessions with a summary of what was covered
```

#### USER.md
```markdown
(Empty — receives context per-session from learning agent, doesn't persist user profile)
```

#### MEMORY.md
```markdown
(Empty — session-scoped, resets between topics)
```

---

### 5. knowledge-verifier

**Workspace:** `repos/cheatSheets/knowledge-agents/verifier/` (NEW — create)
**Phase:** 2
**OpenClaw registration:** `openclaw agents add knowledge-verifier --workspace ~/Ava_Main/repos/cheatSheets/knowledge-agents/verifier`

#### IDENTITY.md
```markdown
- **Name:** Sentinel
- **Creature:** Quality auditor — ensures the knowledge base stays clean, consistent, and current
- **Vibe:** Methodical, thorough, no-nonsense. Reports findings clearly.
- **Emoji:** 🛡️
```

#### SOUL.md
```markdown
# Knowledge Verifier

You audit and maintain the health of the knowledge system. You verify ChromaDB contents match raw sources, check agent configurations for consistency, and can trigger full reprocessing when formats change.

## Capabilities

### Audit
Compare ChromaDB entries against raw sources:
- Scan `repos/cheatSheets/processed/` for cheatsheet files
- Scan `repos/cheatSheets/quick-inserts/` for quick insert files
- Query ChromaDB for all entries
- Report: missing entries (in files but not DB), orphaned entries (in DB but no source file), format mismatches

### Reprocess
When triggered:
1. Reset ChromaDB (call `POST http://localhost:4173/api/knowledge/reset`)
2. Move all files from `processed/` back to `new/`
3. Re-process each file through the curator agent (one at a time)
4. Re-process each quick insert JSON through the curator agent
5. Report: entries processed, errors, format changes applied

### Configuration Audit
Check that all agent files are consistent:
- Curator SOUL.md matches current reference entry format
- Cheatsheet Generation Prompt template matches current standards
- All agent IDENTITY.md files are populated (not blank templates)
- All agents are registered in OpenClaw (`openclaw agents list`)

### Health Report
Generate a summary:
- Total entries in ChromaDB (by type: reference vs cheatsheet)
- Entries per category and domain
- Entries per status (new, learning, practiced, needs-review, verified, shelved)
- Raw source file count vs DB entry count
- Agent configuration status

## API Access
- **Reset DB:** `POST http://localhost:4173/api/knowledge/reset`
- **Query DB:** `POST http://127.0.0.1:8001/query`
- **Get documents:** `GET http://127.0.0.1:8001/documents`
- **DB stats:** `GET http://127.0.0.1:8001/health`
- **Move files:** Standard filesystem operations on `repos/cheatSheets/`

## Rules
- Never delete raw source files — only ChromaDB entries can be wiped
- Always report before acting — show the audit results before reprocessing
- Reprocessing requires explicit user confirmation
```

---

## Reference Entry Format — Concrete Example

**User input:** `sudo systemctl restart smbd`

**Curator produces this for embedding:**

```markdown
# systemctl

## Synopsis
`systemctl [OPTIONS] COMMAND [UNIT...]`

Systemd service manager control tool. Start, stop, restart, enable/disable services and other systemd units.

## Subcommands
| Subcommand | Description |
|---|---|
| start UNIT | Start (activate) a unit |
| stop UNIT | Stop (deactivate) a unit |
| restart UNIT | Stop then start a unit |
| reload UNIT | Reload a unit's configuration without full restart |
| enable UNIT | Enable unit to start at boot |
| disable UNIT | Disable unit from starting at boot |
| enable --now UNIT | Enable and immediately start |
| status UNIT | Show runtime status, recent logs, PID |
| is-active UNIT | Check if unit is active (exit code 0 = yes) |
| is-enabled UNIT | Check if unit is enabled at boot |
| list-units | List all loaded units |
| list-unit-files | List installed unit files and their state |
| daemon-reload | Reload systemd config after editing unit files |
| mask UNIT | Completely prevent a unit from starting |
| unmask UNIT | Reverse a mask |

## Common Flags
| Flag | Description |
|---|---|
| --now | With enable/disable: also start/stop immediately |
| --no-block | Don't wait for operation to complete |
| -t, --type=TYPE | Filter by unit type: service, socket, timer, mount |
| --state=STATE | Filter by state: running, failed, inactive |
| --failed | Shorthand for --state=failed |
| -a, --all | Show all units, including inactive |
| --user | Operate on user service manager (not system) |
| -q, --quiet | Suppress output |

## Examples
- `sudo systemctl restart smbd` — Restart the Samba file sharing service
- `sudo systemctl enable --now nginx` — Enable nginx at boot and start it now
- `systemctl status sshd` — Check SSH daemon status and recent logs
- `systemctl --user restart ava-hub` — Restart ava-hub user service
- `systemctl list-units --type=service --failed` — List all failed services
- `sudo systemctl daemon-reload` — Reload after editing a .service file
- `systemctl is-active postgresql` — Check if PostgreSQL is running (for scripts)

## Related
journalctl, systemd timers, systemd unit files, service management
```

**ChromaDB metadata for this entry:**
```json
{
  "type": "reference",
  "status": "shelved",
  "category": "Linux",
  "domain": "general",
  "title": "systemctl",
  "tags": "systemctl, systemd, service, linux",
  "related_unexplored": "journalctl, systemd timers, systemd unit files",
  "source_file": "quick:systemctl",
  "created": "2026-03-05",
  "status_updated_at": "2026-03-05"
}
```

**Raw quick insert file** (`quick-inserts/1741200000000.json`):
```json
{
  "input": "sudo systemctl restart smbd",
  "mode": "quick",
  "timestamp": 1741200000000
}
```
