# Knowledge & Learning System — Session-Based Redesign

**Status:** Phase 1-3 complete, Phase 4 in progress — audited Session 85 (2026-03-20)
**Version:** 2.1.0
**Supersedes:** Previous knowledge-learning-plan.md (Phase A-E model), cheatsheets-rebuild.md, learning-platform-research.md (archived to plans/archive/)
**Preserves:** learning-ontology-spec.md (schema), cheatsheet-v5-schema-spec.md (frontmatter extension)

---

## 1. Vision

A personal knowledge system that acts as Kaden's external brain. Topics get learned through curated agent-driven sessions. Knowledge gained is stored durably. The system knows what you know, what needs review, and what to learn next — minimizing re-learning and ambiguity.

**Competitive edge:** No platform connects learning to the user's actual codebase, project context, error patterns, and git history. Ava uniquely has all of these.

---

## 2. Architecture — The Session Model

### 2.1 Core Concepts

| Concept | Definition |
|---------|-----------|
| **Knowledge Store** | brain.db (concepts, mastery, prerequisites) + ChromaDB (cheatsheet content). The durable memory. |
| **Cheatsheet** | A structured markdown document that serves dual purpose: learning session artifact AND reference material. Sections carry status markers (unexplored/in-progress/complete). |
| **Learning Session** | A focused, temporary experience on a topic. Has a lifecycle: created → active → completed. Lives as a dynamic tab in the Learn sub-tab bar. |
| **Tutor Agent** | The agent you chat with in a session. Orchestrates teaching, calls Spark for content generation, updates cheatsheet state as sections progress. |
| **Reviews** | FSRS-driven daily practice across ALL completed concepts. Independent of sessions. |

### 2.2 System Flow

```
INGEST LAYER (Insert tab — feeds the store)
  Quick Insert → curator enriches → ChromaDB (reference)
  Cheatsheet Paste → curator validates → ChromaDB (learning) → auto-seed concept

LEARNING LAYER (Learn tab — uses the store)
  Overview (fixed) → knowledge dashboard, suggestions, session history
  Reviews (fixed) → FSRS daily practice, all completed concepts
  [+ New Session] → creates dynamic session tab
  "Docker Networking" (active session tab)
  "Python Async" (active session tab)

SESSION FLOW
  Create session (manual / agent-suggested / auto-from-insert)
    → Tutor generates cheatsheet skeleton (sections marked unexplored)
    → Tab appears in Learn sub-tabs

  Work through session
    → Chat with Tutor (left 50%), progress+demos (right 50%)
    → Tutor teaches section by section, calls Spark for demos/exercises
    → Sections progress: unexplored → in-progress → complete
    → Cheatsheet updates incrementally after each section completion

  Complete / Close
    → Cheatsheet inserted to ChromaDB via curator pipeline
    → Completed sections → concepts in brain.db → FSRS reviews scheduled
    → Unexplored sections → related_unexplored metadata → next session fuel
    → Tab removed from Learn tab
    → Session archived in Overview history

  Partial close (user closes before finishing)
    → Cheatsheet saved with current section statuses
    → Shows as "paused" in Overview
    → Resume = new session on same topic, agent reads existing cheatsheet
```

### 2.3 Learn Tab Structure

```
Learn Tab
├── Overview (fixed) — mastery dashboard, knowledge map, suggestions, session history
├── Reviews (fixed) — FSRS daily practice
├── [+] — create new learning session
├── "Docker Networking" (active session — in-progress)
├── "Python Async" (active session — 2/5 sections complete)
└── (sessions auto-remove on completion, viewable in Overview history)
```

**Overview absorbs:** KnowledgeMap (graph visualization), session history archive, agent suggestions ("You should learn X because Y"), coverage dashboard.

**Reviews stays:** Quick daily FSRS practice. Pulls from all completed concepts across all sessions.

**Dynamic sessions** are the core experience — each is a focused learning session with the Tutor agent.

### 2.4 Session Tab Layout

```
┌──────────────────────────┬──────────────────────────┐
│                          │   Progress Summary        │
│   Agent Chat             │   (cheatsheet → visual    │
│   (Tutor agent,          │    progress graph/tree)   │
│    conversational         ├──────────────────────────┤
│    teaching)             │   Learning Demos           │
│                          │   (interactive, generated  │
│   Left 50%               │    by Spark sub-agent)    │
│                          │   Right 50%               │
│                          │   (top/bottom resizable)  │
└──────────────────────────┴──────────────────────────┘
```

- **Left panel:** Agent chat interface. User talks to the Tutor agent who teaches, asks questions, generates exercises, assesses understanding.
- **Right top:** Progress summary — cheatsheet rendered as a visual tree/graph showing section statuses (color-coded: unexplored=zinc, in-progress=amber, complete=emerald).
- **Right bottom:** Interactive demos/exercises generated by Spark. Quizzes, flashcards, code exercises, visualizations.
- **Resizable:** Right panel splits are adjustable based on content.

### 2.5 Agent Architecture

**Tutor Agent** (new — the session chat interface):
- The agent the user talks to in a learning session
- Orchestrates: reads cheatsheet state, teaches current section, assesses understanding
- Has a "generate_content" tool that calls Spark server-side for demos/exercises
- Updates cheatsheet section statuses as sections complete
- On session completion: triggers curator insert of the final cheatsheet

**Spark Agent** (existing — content sub-agent):
- Called by server on Tutor's behalf (tool call, not inter-agent chat)
- Generates: quizzes, flashcards, exercises, code demos
- Returns structured JSON (lesson_content format from ontology spec)
- Results cached in brain.db lessons table

**Compass Agent** (existing — planner/advisor):
- Suggests new sessions based on knowledge gaps
- Analyzes coverage, recommends topics
- Used by Overview panel for "suggested next" content

**Curator Agent** (existing — insert pipeline):
- Processes completed cheatsheets into ChromaDB
- Enriches, validates, deduplicates
- Creates concepts + prerequisites in brain.db via auto-sync

### 2.6 Cheatsheet as Session Artifact

The cheatsheet format extends to carry section-level status:

```yaml
---
title: Docker Networking
difficulty: 5
prerequisites: [docker-basics]
session_status: in-progress  # overall: active | paused | completed
session_id: abc123           # links to brain.db learning_sessions
---

## Bridge Networks <!-- status: complete -->
...content generated by Tutor/Spark...

## Host Networking <!-- status: in-progress -->
...partial content, exercises attempted...

## Overlay Networks <!-- status: unexplored -->
...agent identified as part of topic, not yet covered...

## Network Security <!-- status: unexplored -->
...related subtopic for future exploration...
```

**Status markers** (`<!-- status: X -->`) are invisible in rendered markdown but parseable by the system. The curator processes these on insert:
- `complete` sections → create/update concepts in brain.db → schedule FSRS reviews
- `in-progress` sections → create concept stubs (no mastery state yet)
- `unexplored` sections → `related_unexplored` metadata → fuel for next session suggestions

### 2.7 Session Creation Modes

1. **Manual:** User clicks [+], enters topic → Tutor generates cheatsheet skeleton
2. **Agent-suggested:** Compass detects gap → proposes session in Overview → user approves → tab created
3. **Auto-from-insert:** User pastes a cheatsheet in Insert tab → system treats completed sections as learned → offers: "Create a session for the unexplored sections?"

**Externally inserted cheatsheets** (paste mode in Insert tab): Treated as completed sessions. All sections assumed complete. Concepts created, FSRS reviews scheduled. If the cheatsheet has `related_unexplored` in frontmatter, those become suggestions.

---

## 3. Schema Changes

### 3.1 Extend `learning_sessions` Table

The existing table needs evolution for session-tab integration:

```sql
-- Extend existing learning_sessions table
ALTER TABLE learning_sessions ADD COLUMN topic TEXT;
ALTER TABLE learning_sessions ADD COLUMN session_type TEXT DEFAULT 'interactive'
    CHECK (session_type IN ('interactive', 'suggested', 'auto', 'external'));
ALTER TABLE learning_sessions ADD COLUMN cheatsheet_doc_id TEXT;  -- ChromaDB doc reference
ALTER TABLE learning_sessions ADD COLUMN status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed'));
ALTER TABLE learning_sessions ADD COLUMN sections_total INTEGER DEFAULT 0;
ALTER TABLE learning_sessions ADD COLUMN sections_complete INTEGER DEFAULT 0;
ALTER TABLE learning_sessions ADD COLUMN cheatsheet_content TEXT;  -- markdown snapshot
```

### 3.2 New `session_sections` Table

Track individual section progress for fast querying:

```sql
CREATE TABLE session_sections (
    id              TEXT PRIMARY KEY,
    session_id      TEXT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'unexplored'
                    CHECK (status IN ('unexplored', 'in-progress', 'complete')),
    sort_order      INTEGER DEFAULT 0,
    content_md      TEXT,           -- section content (markdown)
    concept_id      TEXT REFERENCES concepts(id),  -- linked concept once created
    started_at      TEXT,
    completed_at    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_session_sections_session ON session_sections(session_id);
CREATE INDEX idx_session_sections_status ON session_sections(status);
```

### 3.3 API Endpoints (New/Modified)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/learning/sessions` | GET | List sessions (add status filter, active/paused/completed) |
| `/api/learning/sessions/start` | POST | Create session (add topic, session_type fields) |
| `/api/learning/sessions/:id` | GET | Get session with sections |
| `/api/learning/sessions/:id/sections` | GET | List sections for a session |
| `/api/learning/sessions/:id/sections/:sectionId` | PATCH | Update section status/content |
| `/api/learning/sessions/:id/complete` | POST | Complete session → trigger curator insert |
| `/api/learning/sessions/:id/pause` | POST | Pause session (save cheatsheet state) |
| `/api/learning/sessions/suggested` | GET | Get agent-suggested sessions from Compass |

---

## 4. Implementation Phases

### Phase 1: Foundation (Session 78) — COMPLETE

1. ~~Doc consolidation~~ ✓
2. ~~Schema migration~~ ✓ — session_sections table, learning_sessions extended (migration 011)
3. ~~LearnTab redesign~~ ✓ — 8 hardcoded panels removed, Overview + Reviews + dynamic session tabs
4. ~~Session tab component~~ ✓ — SessionTab.tsx (592 lines), 50/50 split layout
5. ~~API extensions~~ ✓ — 8 new endpoints (sessions CRUD, sections CRUD)

### Phase 2: Agent Wiring (Session 79) — COMPLETE

1. ~~Tutor agent~~ ✓ — learning-tutor registered in OpenClaw, workspace at knowledge-agents/tutor/
2. ~~Architect agent~~ ✓ — learning-architect for background plan generation
3. ~~Server integration~~ ✓ — Tutor wired to SessionTab left panel
4. ~~Cheatsheet section parser~~ ✓ — section status markers parsed

### Phase 3: Content Pipeline (Session 79-80) — COMPLETE

1. ~~Section-to-concept sync~~ ✓ — syncSectionToConcept auto-creates brain.db concepts
2. ~~Suggestion engine~~ ✓ — gap suggestions in Overview (frontier concepts)
3. ~~Lesson generation~~ ✓ — ReviewPanel fetches generated lessons via Spark agent
4. ~~Shared renderers~~ ✓ — LessonRenderers.tsx (quiz/flashcard/exercise/demo)

### Phase 4: Polish & Content — IN PROGRESS (Session 85 audit findings)

**Completed:**
- ✓ Demo rendering — LessonRenderers.tsx with interactive exercises
- ✓ Lesson caching — brain.db lessons table, 30-day cache
- ✓ TopicEditorModal — click-to-edit concepts (name, domain, priority)

**Remaining (from Session 85 comprehensive audit):**

Critical:
- [ ] **Verify Tutor agent deployment** — SessionTab left panel may hang if agent not responding
- [ ] **Fix SparkPanel send-to-curator** — button not rendered (line ~85)
- [ ] **Add error boundaries** — component crashes kill entire tab

UI gaps:
- [ ] **Prerequisite management UI** — no way to set prerequisites (graph stays empty, 0 edges)
- [ ] **Lesson cache invalidation** — no "Regenerate" button in ReviewPanel
- [ ] **KnowledgeMap endpoint fix** — /api/learning/knowledge-map may return empty/fail
- [ ] **Learning path UI** — /api/learning/path endpoint exists, not in UI
- [ ] **Daily plan UI** — /api/learning/plan endpoint exists, not in UI
- [ ] **Session pause/resume UI** — endpoint exists, no buttons in SessionTab
- [ ] **Audit result persistence** — HealthTab audit results not saved, no history

Cleanup:
- [ ] **Remove SessionsPanel.tsx** — orphaned (548 lines, never imported)
- [ ] **Remove AgentTab.tsx** — orphaned (252 lines, not in Page.tsx)

Data population:
- [ ] **Create 10-15 quality cheatsheets** across domains
- [ ] **Seed prerequisite graph** — 5-10 edges minimum
- [ ] **End-to-end agent verification** — test all 7 knowledge agents from UI
- [ ] **Add Vitest tests** for ReviewPanel, LearnTab, SessionTab

**Current data state (sparse):**
- 6 concepts, 16 reviews, 23 sessions (mostly inactive), 0 prerequisite edges
- 101 docs (knowledge collection) + 6 docs (knowledge-learning collection)
- 2/7 agents verified working from UI (curator, qa)

---

## 5. Files Affected

### New Files
- `ava_hub/src/features/cheatsheets/SessionTab.tsx` — session tab component (50/50 split layout)
- `0 - cheatSheets/knowledge-agents/tutor/` — Tutor agent workspace (IDENTITY.md, SOUL.md, etc.)

### Modified Files
- `ava_hub/src/features/cheatsheets/LearnTab.tsx` — complete rewrite (remove 8 hardcoded panels, add dynamic session tabs)
- `ava_hub/src/features/cheatsheets/Page.tsx` — may need adjustment for session tab routing
- `ava_hub/server/routes/learning.mjs` — add session section endpoints
- `.ava/migrations/` — new migration for session_sections + learning_sessions extension

### Archived/Removed
- `ava_hub/src/features/cheatsheets/SessionsPanel.tsx` — replaced by SessionTab
- Hardcoded demos in LearnTab (RegressionDemo, BoundaryDemo, GradientDescentDemo, TokenizationDemo, AttentionDemo, PositionalDemo) — removed, interactive content now generated by Spark
- `0 - cheatSheets/ARCHITECTURE.md` — stale (says Ollama, wrong), rewrite later

### Documentation
- `0 - cheatSheets/CHEATSHEETS_PLAN.md` — already marked superseded, add pointer to this doc
- `documentation/plans/cheatsheet-v5-schema-spec.md` — merged into this plan (section 2.6)
- `0 - cheatSheets/CLAUDE.md` — update to reflect session model

---

## 6. Success Criteria

| Milestone | Criteria |
|-----------|---------|
| **Phase 1 done** | LearnTab shows Overview + Reviews + [+] button. Session tab component renders 50/50 split. Schema migration applied. |
| **Phase 2 done** | Tutor agent responds in session chat. Session sections update from agent conversation. Cheatsheet inserted on completion. |
| **Phase 3 done** | Completed sessions create concepts + schedule reviews. Compass suggests next topics. Overview shows real knowledge state. |
| **Phase 4 done** | 20+ sessions completed. 50+ concepts with mastery data. FSRS reviews working daily. Knowledge map visualizes real graph. |

---

## 7. Reference Documents

| Document | Location | Status |
|----------|----------|--------|
| Learning ontology spec | `documentation/plans/learning-ontology-spec.md` | Active — 8-entity schema |
| Cheatsheet v5.0 schema | `documentation/plans/cheatsheet-v5-schema-spec.md` | Active — merged into this plan §2.6 |
| Platform research | `documentation/plans/learning-platform-research.md` | Archived — research findings valid |
| CheatSheets original plan | `0 - cheatSheets/CHEATSHEETS_PLAN.md` | Superseded — Phases 1-5 reference only |
| Spoke rules | `0 - cheatSheets/CLAUDE.md` | Active — needs update for session model |
| Generation prompt | `0 - cheatSheets/Cheatsheet_Generation_Prompt.md` | Active — needs section-status extension |

---

*This is the canonical plan for the Knowledge & Learning system. All previous phase plans (A-E) are superseded by this session-based model.*
