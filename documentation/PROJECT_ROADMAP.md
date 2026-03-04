# Knowledge Curator - Project Roadmap

**Last Updated:** 2026-03-04
**Current Version:** 2.1.0
**Status:** All Phases Complete + Knowledge Graph — System Operational

---

## Vision & Goals

**Transform learning cheat sheets into an intelligent, searchable knowledge base that learns and maintains itself.**

The Knowledge Curator system addresses a fundamental problem: knowledge scattered across hundreds of learning sessions becomes lost or forgotten. Traditional note-taking systems require manual organization, linking, and maintenance—effort that compounds over time until the system breaks down.

This project creates an **autonomous knowledge management system** that:
- **Ingests** new learning cheat sheets automatically, categorizing and enhancing them with metadata and cross-references
- **Retrieves** information on-demand through context-aware search (RAG), answering questions by synthesizing content from the vault
- **Consolidates** duplicate or related concepts, merging similar notes and strengthening connections between ideas
- **Maintains** itself through automated health checks, proactively identifying broken links, structural issues, and knowledge gaps

The end state is a living knowledge base that grows smarter over time—not just storing information, but actively organizing, connecting, and surfacing it when needed.

---

## Version History

| Version | Date | Milestone |
|---------|------|-----------|
| 2.1.0 | 2026-02-12 | Knowledge Graph Integration — GRAPH.md with entity extraction, graph-aware retrieval, graph validation |
| 2.0.0 | 2026-02-11 | All Phases Complete — INGEST, RETRIEVE, CONSOLIDATE, MAINTAIN |
| 1.0.0 | 2026-02-11 | Phase 1 (INGEST) Complete — Automated categorization and vault filing |

---

## V2.1.0 — Knowledge Graph

### Completed
- ✅ GRAPH.md created and bootstrapped from existing vault content (8 entities, 10 relationships, 1 cluster)
- ✅ Phase 1 (INGEST) enhanced: entity/relationship extraction during `/process`, GRAPH.md auto-updated
- ✅ Phase 2 (RETRIEVE) enhanced: graph-aware query expansion (1-hop relationships) before keyword search
- ✅ Phase 4 (MAINTAIN) enhanced: Check 7 validates GRAPH.md integrity (entity counts, source references)
- ✅ Bug fixes: vault-health path shorthand, vault-health auto-fix without approval

### Architecture Decisions (V2.1.0)

**GRAPH.md (Flat File) vs. External Graph Database**
- **Decision:** Store the knowledge graph as a structured markdown file (GRAPH.md) inside the vault
- **Rationale:**
  - Consistent with the vault-first, markdown-only philosophy
  - Human-readable and editable in Obsidian
  - No external dependencies (Neo4j, etc.)
  - Adequate for <1000 entities — linear scan is fast enough
  - Graph grows automatically via `/process` entity extraction
- **Future:** Migrate to a proper graph database if entity count exceeds 1000 or query patterns require traversals deeper than 1 hop

**Entity Extraction via LLM (Not NLP/NER)**
- **Decision:** Use Claude's analysis to extract entities and relationships from cheat sheets, not a dedicated NER model
- **Rationale:**
  - Domain-specific entities (np.var, variance_formula) are poorly served by general NER
  - Claude understands the semantic relationships between concepts, not just named entities
  - No additional dependencies or model hosting required
  - Quality is high for structured learning content

**1-Hop Graph Expansion for Retrieval**
- **Decision:** During RAG, expand queries by following 1-hop relationships in GRAPH.md only
- **Rationale:**
  - 1-hop captures the most directly relevant connections (e.g., variance → standard_deviation, np.var)
  - Multi-hop risks introducing noise and expanding to irrelevant entities
  - Simple to implement — just parse related entities from the graph file
- **Future:** Add multi-hop traversal with confidence decay when graph is denser

---

## V2.0.0 — Full System

### Completed
- ✅ Phase 2 (RETRIEVE): knowledge-retrieval skill with RAG Q&A and command routing
- ✅ Phase 3 (CONSOLIDATE): knowledge-consolidator skill with similarity detection and merge workflow
- ✅ Phase 4 (MAINTAIN): vault-health skill with 6 health checks + HEARTBEAT.md monitoring
- ✅ Command routing: knowledge-retrieval serves as default handler, routes `/process`, `/consolidate`, `/health`
- ✅ All obsidian-cli commands verified and documented

### Architecture Decisions (V2.0.0)

**PowerShell Search Instead of obsidian-cli search-content**
- **Decision:** Use PowerShell `Select-String` and `obsidian-cli frontmatter --print` for vault searching
- **Rationale:** `obsidian-cli search-content` launches an interactive fuzzy UI that hangs in non-interactive shells. PowerShell `Select-String` provides equivalent functionality with programmatic output.
- **Impact:** None — search works correctly, documented in skill instructions

**obsidian-cli print Uses Note Name Only**
- **Decision:** Use just the note name (e.g., `"VARIANCE_CHEATSHEET"`) with `obsidian-cli print`, not the full path
- **Rationale:** Including the path (e.g., `"Knowledge/Python/VARIANCE_CHEATSHEET"`) causes "Cannot find note in vault" error. The CLI resolves note names globally.

**Lightweight HEARTBEAT.md (No Cron Yet)**
- **Decision:** HEARTBEAT.md performs only inbox check and INDEX sync check. Full health checks run on-demand via `/health`.
- **Rationale:** Heartbeat runs every ~30 minutes, consuming API tokens each time. Expensive checks (wikilink validation, frontmatter scanning) should only run when requested. Keeps token cost minimal.
- **Future:** Add cron jobs for daily/weekly/monthly automated checks when warranted by vault size.

**knowledge-retrieval as Command Router**
- **Decision:** The retrieval skill doubles as the command router, checking for `/process`, `/consolidate`, `/health` intent before performing RAG
- **Rationale:** Simplest architecture — one default handler that either routes or answers. No separate routing skill needed.
- **Alternative Considered:** Separate routing skill — rejected as unnecessary complexity for 3 commands

**User Approval Required for All Merges**
- **Decision:** The consolidator NEVER auto-merges, always presents candidates for approval
- **Rationale:** Merging notes is destructive and irreversible (even with archiving). False positive similarity detection could destroy useful distinctions between notes. User judgment is essential.

---

## V1.0.0 — Foundation

### Completed
- ✅ OpenClaw gateway configured and connected to Discord (vhTech server)
- ✅ Obsidian vault created with category structure (Python/DataScience/Automation/Tools)
- ✅ obsidian-cli installed via Scoop and configured with default vault
- ✅ knowledge-curator skill created for Phase 1 (INGEST)
- ✅ Vault structure established with INDEX.md tracking system
- ✅ First cheat sheet (VARIANCE_CHEATSHEET.md) successfully processed:
  - Categorized as Python (contains NumPy code)
  - Frontmatter added with tags
  - Copied to openClaw_Vault/Knowledge/Python/
  - INDEX.md updated with entry
  - Original archived to processed/

### Architecture Decisions

**OpenClaw vs. Other Agent Frameworks**
- **Decision:** Use OpenClaw for agent orchestration
- **Rationale:** 
  - Persistent daemon with proactive capabilities (heartbeat system)
  - Discord integration already established
  - Skills system allows modular phase development
  - Heartbeat + cron enable Phase 4 maintenance automation
- **Alternatives Considered:** Claude Code (session-based, no persistence), standalone Python scripts (no conversational interface)

**Obsidian + obsidian-cli vs. Custom Database**
- **Decision:** Use Obsidian vault (markdown files) with obsidian-cli for automation
- **Rationale:**
  - Human-readable plain text (markdown)
  - No vendor lock-in—files are portable
  - Obsidian's wikilink system enables graph relationships
  - obsidian-cli provides programmatic access (search, create, move)
  - Scales to thousands of notes without performance issues
- **Key Discovery:** `obsidian-cli move` automatically updates ALL wikilinks in vault—crucial for Phase 3 consolidation

**Categorization: 4 Categories vs. Subcategories**
- **Decision:** Start with flat 4-category structure (Python/DataScience/Automation/Tools)
- **Rationale:**
  - Simple to implement and validate in Phase 1
  - Forces clear categorization decisions
  - Easier to migrate to subcategories later than to start complex
- **Future:** Migrate to hierarchical structure (e.g., Python/Libraries/, Python/Concepts/) in Phase 4 optimization

**Manual Trigger vs. Auto-Detection**
- **Decision:** Manual Discord trigger (`@OpenClaw process cheat sheets`)
- **Rationale:**
  - User retains control over processing timing
  - Avoids accidental processing of incomplete files
  - Clear signal when categorization should happen
- **Alternatives Considered:** File watcher (complex, prone to race conditions), scheduled cron (misses urgency)

**Frontmatter Format: YAML vs. JSON**
- **Decision:** YAML frontmatter for metadata
- **Rationale:**
  - Obsidian native format
  - Human-readable
  - Supports arrays for tags
  - Compatible with obsidian-cli

---

## Architecture

### System Overview

```
User Workflow:
┌─────────────────────┐
│ Claude Chrome       │
│ Learning Session    │
│ "next" → summaries  │
│ Request cheat sheet │  ← Learning_Session_Configuration.md defines output format
└──────────┬──────────┘
           │ (Save .md file)
           ▼
┌─────────────────────┐
│ cheatSheets/new/    │  ← Incoming staging area
└──────────┬──────────┘
           │ @OpenClaw process cheat sheets
           ▼
┌─────────────────────────────────────────┐
│ OpenClaw Agent (knowledge-curator)      │
│ - Read file content                     │
│ - Analyze for category (Python code vs  │
│   DataScience theory vs Tools/Automation)│
│ - Add frontmatter (tags, dates, category)│
│ - Copy to vault/Knowledge/{Category}/   │
│ - Update INDEX.md                       │
│ - Archive to processed/                 │
└──────────┬──────────────────────────────┘
           ▼
┌─────────────────────┐
│ Obsidian Vault      │
│ openClaw_Vault/     │
│ Knowledge/          │
│   Python/           │
│   DataScience/      │
│   Automation/       │
│   Tools/            │
│   INDEX.md          │
└─────────────────────┘
```

### 4-Phase Architecture

The system evolves through four distinct phases, each building on the previous:

#### Phase 1: INGEST (✅ Complete + Graph)
**Purpose:** Transform raw cheat sheets into structured, categorized knowledge with entity extraction

**Flow:**
1. User saves cheat sheet to `new/` folder
2. User triggers: `@OpenClaw process cheat sheets`
3. Agent reads file content and analyzes vault state (GRAPH.md, INDEX.md, existing notes)
4. Agent analyzes content to determine category:
   - **Python:** Contains code (`import`, `def`, `class`, `np.`, `pd.`)
   - **DataScience:** Theory without code (algorithms, statistics concepts)
   - **Automation:** Testing, CI/CD, workflows, agents
   - **Tools:** CLI usage, configuration, installation guides
5. Agent adds YAML frontmatter (tags, dates, category)
6. Agent extracts entities (concepts, libraries, functions, formulas, techniques, tools)
7. Agent extracts relationships between new entities and existing GRAPH.md entities
8. Agent generates wikilinks based on relationships to existing vault notes
9. Agent copies file to `openClaw_Vault/Knowledge/{Category}/`
10. Agent updates GRAPH.md with new entities, relationships, clusters
11. Agent updates INDEX.md with new entry
12. Agent archives original to `processed/`

**Output:** Organized vault with categorized, tagged, graph-connected notes

#### Phase 2: RETRIEVE (✅ Complete + Graph)
**Purpose:** Answer questions using vault knowledge (RAG) with graph-aware query expansion

**Implementation:**
- User asks question via Discord
- Agent extracts keywords (3-5 substantive terms)
- Agent consults GRAPH.md for related entities (1-hop expansion)
- Agent searches vault: tag matching (`obsidian-cli frontmatter --print`) + content search (PowerShell `Select-String`)
- Agent reads top 3-5 matching notes
- Agent synthesizes answer with [[wikilink]] citations
- Agent responds with context-aware answer

**Technology:**
- GRAPH.md for query expansion (1-hop entity relationships)
- obsidian-cli frontmatter for tag search, PowerShell Select-String for content search
- Claude synthesis (no embeddings needed for <1000 notes)

**Output:** Context-aware answers citing vault sources, enhanced by graph connections

#### Phase 3: CONSOLIDATE (✅ Complete)
**Purpose:** Merge duplicate/similar notes, strengthen connections

**Implementation:**
- Agent scans vault for similarity using heuristics:
  - Tag overlap (3+ shared tags → similar)
  - Title similarity (fuzzy string matching)
  - Category + tag combinations
- Agent presents merge candidates to user for approval
- If approved:
  - Read both notes
  - Synthesize merged version (Claude)
  - Overwrite target note
  - Move old note to Archive/
  - **obsidian-cli move auto-updates ALL wikilinks**
- Agent reports merge results

**Limitations:**
- Rule-based similarity (no semantic embeddings)
- User approval required (not fully automatic)
- Depends on good tagging from Phase 1

**Output:** Cleaner vault with reduced redundancy

#### Phase 4: MAINTAIN (✅ Complete + Graph)
**Purpose:** Automated health checks and proactive maintenance including graph validation

**Implementation:**

**On-Demand Health Check (7 checks):**
- Check for broken wikilinks (parse `[[links]]`, verify files exist)
- Validate all notes have frontmatter
- Verify category matches folder location
- Check INDEX.md drift (unlisted/orphaned entries)
- Vault metrics (note counts, inbox status)
- Auto-fix offer (INDEX.md drift only, with explicit approval)
- GRAPH.md validation (entity counts, relationship integrity, source references)

**Heartbeat (Continuous - every 30 min):**
- Check inbox for new files
- INDEX.md sync check
- **Action:** Message user if issues found, otherwise silent HEARTBEAT_OK

**Daily Cron (9 AM isolated session):**
- Generate comprehensive health report:
  - Total notes and distribution
  - New notes this week
  - Broken wikilinks (if any)
  - Categorization errors
  - Recommended actions

**Weekly Cron (Sunday 10 AM isolated session):**
- Scan for consolidation candidates
- Suggest merge opportunities

**Monthly Cron (1st day 9 AM isolated session):**
- Deep vault analysis
- Suggest subcategory splits if categories grow large
- Identify orphan notes (no incoming wikilinks)
- Generate learning recommendations

**Output:** Proactive maintenance, vault health reports

---

## Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Agent Framework** | OpenClaw | Persistent daemon, heartbeat + cron scheduling, Discord integration, skills system for modular development |
| **Knowledge Storage** | Obsidian Vault (Markdown) | Plain text portability, wikilinks, human-readable, no vendor lock-in, scales to thousands of notes |
| **Automation Bridge** | obsidian-cli (Yakitrak) | Programmatic vault access: create, move (auto-updates wikilinks), print, list, frontmatter |
| **Categorization** | Claude 4.5 Sonnet | Content analysis for Python/DataScience/Automation/Tools classification |
| **Synthesis** | Claude 4.5 Sonnet | RAG answer generation, note consolidation, health report generation |
| **Package Manager** | Scoop (Windows) | obsidian-cli installation, dependency management |
| **Messaging** | Discord (vhTech server) | User interaction, triggers, notifications, health reports |
| **Scheduling** | OpenClaw heartbeat + cron | Heartbeat for continuous monitoring, cron for precise schedules |

### Why Not Alternative Approaches?

**Embeddings / Vector Search:**
- Not needed for small vaults (<1000 notes)
- Keyword search with good tagging is sufficient
- Adds complexity without proportional benefit at current scale
- **Future:** Add if vault exceeds 1000 notes or retrieval quality degrades

**Custom Python Scripts:**
- No conversational interface
- Requires manual execution
- No persistence or heartbeat capabilities
- **Verdict:** OpenClaw provides superior user experience

**Database (PostgreSQL, SQLite):**
- Lock-in risk
- Not human-readable
- Migration complexity
- **Verdict:** Markdown files provide portability and simplicity

---

## Data Flow

### Phase 1 (INGEST)

```
cheatSheet.md (new/)
    ↓ [Read]
Content Analysis (Claude)
    ↓ [Categorize]
Frontmatter Enhancement
    ↓ [Add tags, dates, category]
Entity Extraction (Claude)
    ↓ [concepts, libraries, functions, formulas, techniques, tools]
Relationship Extraction (Claude + GRAPH.md)
    ↓ [Cross-reference existing entities]
Wikilink Generation
    ↓ [Based on relationships to existing notes]
Copy to Vault (obsidian-cli)
    ↓ [openClaw_Vault/Knowledge/{Category}/]
Update GRAPH.md (obsidian-cli create --overwrite)
    ↓ [Append entities, relationships, clusters]
Update INDEX.md
    ↓ [Add entry]
Archive Original (processed/)
```

### Phase 2 (RETRIEVE)

```
User Question (Discord)
    ↓ [Extract keywords]
Graph Expansion (GRAPH.md)
    ↓ [1-hop: find related entities]
Vault Search (frontmatter tags + Select-String)
    ↓ [Returns matching notes]
Read Top 3-5 Notes (obsidian-cli print)
    ↓ [Full content]
Synthesize Answer (Claude)
    ↓ [Generate response with [[wikilinks]]]
Respond to User (Discord)
```

### Phase 3 (CONSOLIDATE)

```
Scan Vault (obsidian-cli list)
    ↓ [All notes]
Calculate Similarity (Tag overlap, title matching)
    ↓ [Candidate pairs]
User Approval (Discord)
    ↓ [Confirm merge]
Read Both Notes (obsidian-cli print)
    ↓ [Full content]
Synthesize Merged (Claude)
    ↓ [Combined version]
Overwrite Target (obsidian-cli create --overwrite)
    ↓ [Updated note]
Move Old to Archive (obsidian-cli move)
    ↓ [Auto-updates ALL wikilinks!]
Report Results (Discord)
```

### Phase 4 (MAINTAIN)

```
On-Demand (/health)
    ↓
Check Wikilinks, Frontmatter, Categories
Check INDEX.md drift
Check GRAPH.md integrity
Vault metrics
    ↓
Issues Found? → Report + offer auto-fix (INDEX only, with approval)
No Issues? → HEALTHY report

Heartbeat (every 30 min)
    ↓
Inbox check + INDEX sync
    ↓
Issues? → Notify | Clean? → HEARTBEAT_OK
```

---

## Future Roadmap

### Completed Phases
- ✅ Phase 1: INGEST — `knowledge-curator` skill (+ entity/relationship extraction)
- ✅ Phase 2: RETRIEVE — `knowledge-retrieval` skill (RAG + command router + graph expansion)
- ✅ Phase 3: CONSOLIDATE — `knowledge-consolidator` skill
- ✅ Phase 4: MAINTAIN — `vault-health` skill + HEARTBEAT.md (+ GRAPH.md validation)
- ✅ Knowledge Graph: GRAPH.md with entities, relationships, clusters

### Next: Operational Enhancements

**Vault Structure Optimization:**
- Migrate to subcategories (Python/Libraries/, Python/Concepts/)
- Add Templates/ folder for note templates

**Advanced Retrieval:**
- Multi-hop graph traversal (2+ hops with confidence decay)
- Domain map retrieval (category-level summaries)
- Add embeddings for semantic search (if vault >1000 notes)
- Confidence scoring (graph centrality + keyword match strength)

**Advanced Consolidation:**
- Graph-aware consolidation (use GRAPH.md relationships to identify merge candidates)
- Topic summary generation (auto-summaries when clusters reach 5+ notes)
- Automatic merge with confidence scores (>95% = auto-merge)
- Semantic similarity using embeddings (when vault exceeds 1000 notes)

**Graph Enhancements:**
- Migrate to graph database if entity count exceeds 1000
- Graph visualization (Mermaid diagrams or D3.js)
- Dashboard showing vault metrics over time

---

## Alternatives Considered

### Approach 1: Notion API Integration
**Pros:**
- Rich UI for humans
- Built-in database features
- Mobile app access

**Cons:**
- Vendor lock-in
- API rate limits
- Not markdown-native
- Requires internet connection

**Decision:** Rejected in favor of local-first markdown approach

---

### Approach 2: Roam Research / Logseq
**Pros:**
- Built for networked thought
- Daily notes system
- Graph view

**Cons:**
- Proprietary format (Roam)
- Less programmatic access
- Obsidian + obsidian-cli provides equivalent features with better automation

**Decision:** Rejected - Obsidian offers better CLI automation

---

### Approach 3: Full Custom Python Application
**Pros:**
- Complete control
- Custom UI possible
- No dependency on external tools

**Cons:**
- Massive development effort
- No conversational interface
- Reinventing the wheel (Obsidian already solves visualization)

**Decision:** Rejected - leverage existing tools (OpenClaw + Obsidian)

---

## Success Metrics

### Phase 1 (INGEST) - ✅ Operational
- ✅ 100% of cheat sheets successfully filed
- ⏳ <5% miscategorization rate (needs more testing with diverse content)
- ✅ All notes have proper frontmatter

### Phase 2 (RETRIEVE) - ✅ Implemented
- ✅ Skill created with dual search strategy (tags + content)
- ✅ [[wikilink]] citations in all responses
- ✅ "Not in vault" honesty (no hallucination)
- ⏳ Needs end-to-end Discord testing with diverse questions

### Phase 3 (CONSOLIDATE) - ✅ Implemented
- ✅ Similarity detection via tag overlap + title matching
- ✅ User approval required (no auto-merge)
- ✅ obsidian-cli move handles wikilink updates
- ⏳ Needs testing with larger vault (currently 1 note)

### Phase 4 (MAINTAIN) - ✅ Implemented
- ✅ 7 health checks covering all vault integrity concerns (including GRAPH.md validation)
- ✅ Lightweight HEARTBEAT.md for passive monitoring
- ✅ Auto-fix limited to safe operations (INDEX.md only, with explicit approval)
- ⏳ Cron jobs for automated scheduling not yet configured

---

*This roadmap will be updated at each major milestone. Version history above reflects all releases.*
