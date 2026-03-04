# Knowledge Curator — GRAPH.md Integration & Phase 1 Enhancement

**For:** Claude Code (same session that built Phases 2-4)  
**From:** Project Manager (Claude Opus)  
**Date:** 2026-02-12  
**Working Directory:** `C:\aiMain\cheatSheets`  
**Continuation of:** V2.0.0 implementation session

---

## Context: What Happened Since Your Last Session

You built Phases 2-4 of the Knowledge Curator and updated docs to V2.0.0. Since then:

1. The system was tested end-to-end via Discord — `/process`, RAG questions, `/health`, `/consolidate` all work
2. Two cheat sheets were processed successfully (VARIANCE_CHEATSHEET, STANDARD_DEVIATION_CHEATSHEET) → both in `Knowledge/Python/`
3. A path bug was observed: `/health` referenced `C:\aiMain\cheatSheets\vault\` instead of `C:\aiMain\cheatSheets\openClaw_Vault\` — fix this
4. `/health` auto-fixed INDEX.md without asking for user approval — the SKILL.md says to ask first. Strengthen the wording

Those are minor fixes. **The main task for this session is bigger.**

---

## Your Mission

You are adding a **knowledge graph layer** to the system. This is the foundation that makes the vault evolve from a filing cabinet into an interconnected web of knowledge that gets smarter over time.

### What You're Building

1. **GRAPH.md** — A machine-readable relationship map living in the vault, maintained automatically
2. **Enhanced Phase 1 (`knowledge-curator`)** — Extract entities and relationships from every cheat sheet during `/process`, update GRAPH.md
3. **Enhanced Phase 2 (`knowledge-retrieval`)** — Consult GRAPH.md before searching to expand queries with related concepts
4. **Bug fixes** — Path issue in vault-health, auto-fix approval flow

### What You're NOT Building (Yet)

- Progressive summarization (topic summaries, domain maps) — deferred until ~30 notes
- Learning Session Configuration feedback loop — stubbed only
- Embeddings or vector search — not needed at current scale
- Cron jobs — deferred

---

## Read These Files First (In Order)

You already know the project, but refresh your context:

1. `C:\aiMain\cheatSheets\CLAUDE.md` — Current V2.0.0 state
2. `C:\aiMain\cheatSheets\documentation\IMPLEMENTATION_PLAN.md` — Current task state
3. `C:\aiMain\cheatSheets\documentation\PROJECT_ROADMAP.md` — Architecture decisions
4. `C:\Users\Kaden\.openclaw\skills\knowledge-curator\SKILL.md` — Phase 1 (you'll modify this)
5. `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md` — Phase 2 (you'll modify this)
6. `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md` — Phase 4 (bug fixes)
7. `C:\aiMain\cheatSheets\Learning_Session_Configuration.md` — Input format (cheat sheet schema)
8. `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\INDEX.md` — Current vault state
9. `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\GRAPH.md` — New file (may exist as empty scaffold or may not exist yet — create if missing)

Also check the vault contents to understand what's currently there:
```powershell
obsidian-cli list "Knowledge/Python"
obsidian-cli list "Knowledge/DataScience"
obsidian-cli list "Knowledge/Automation"
obsidian-cli list "Knowledge/Tools"
```

And read the existing processed notes to understand the content:
```powershell
obsidian-cli print "VARIANCE_CHEATSHEET"
obsidian-cli print "STANDARD_DEVIATION_CHEATSHEET"
```

---

## Task 1: Create GRAPH.md (If Not Already Present)

**Location:** `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\GRAPH.md`

This file is the knowledge graph — a machine-readable map of entities, relationships, and concept clusters that the agent reads and updates.

### GRAPH.md Specification

```markdown
# Knowledge Graph

Last Updated: YYYY-MM-DD
Entities: {count} | Relationships: {count} | Clusters: {count}

---

## Entities

Each entity is a concept, library, function, formula, or technique found in the vault.

Format: `- {entity_name}: [{type}] — {brief description} — Source: [[{note}]]`

Entity types:
- `concept` — A theoretical idea (variance, recursion, normalization)
- `library` — A software package (NumPy, Pandas, pytest)
- `function` — A specific callable (np.var, pd.DataFrame)
- `formula` — A mathematical expression (σ² = Σ(Xi - μ)² / N)
- `technique` — A practical method (Z-score normalization, unit testing)
- `tool` — A CLI or application (git, docker, obsidian-cli)

### Concepts
- (entities listed here)

### Libraries
- (entities listed here)

### Functions
- (entities listed here)

### Formulas
- (entities listed here)

### Techniques
- (entities listed here)

### Tools
- (entities listed here)

---

## Relationships

Each relationship connects two entities. Format:
`- {entity_A} --[{relationship_type}]--> {entity_B}`

Relationship types:
- `implements` — Code that realizes a concept (np.var implements variance)
- `belongs_to` — Part of a larger whole (np.var belongs_to NumPy)
- `prerequisite_for` — Must understand A before B (mean prerequisite_for variance)
- `related_to` — Conceptually connected (variance related_to standard_deviation)
- `derived_from` — Mathematically/logically derived (standard_deviation derived_from variance)
- `used_in` — Applied within a technique (variance used_in hypothesis_testing)
- `alternative_to` — Serves similar purpose (np.var alternative_to manual_calculation)
- `extends` — Builds upon (sample_variance extends population_variance)

(relationships listed here)

---

## Clusters

Groups of tightly related entities that form a knowledge domain. These emerge naturally from relationship density.

Format:
```
### {Cluster Name}
Core entities: [entity1, entity2, entity3]
Related notes: [[note1]], [[note2]]
Strength: {weak|moderate|strong} (based on entity count and relationship density)
```

(clusters listed here)

---

## Meta

- Auto-maintained by knowledge-curator during `/process`
- Consulted by knowledge-retrieval during questions
- Analyzed by knowledge-consolidator during `/consolidate`
- Validated by vault-health during `/health`
- Entity count and relationship count updated on every modification
```

### Bootstrap: Populate GRAPH.md From Existing Vault

Before modifying any skills, read the existing vault notes and populate GRAPH.md with entities and relationships extracted from the current content. This gives the graph a foundation to build on.

Read each note:
```powershell
obsidian-cli print "VARIANCE_CHEATSHEET"
obsidian-cli print "STANDARD_DEVIATION_CHEATSHEET"
```

Extract entities and relationships. For example, from a variance cheat sheet you might extract:

**Entities:**
- variance: [concept] — Numerical measure of data spread from the mean — Source: [[VARIANCE_CHEATSHEET]]
- np.var: [function] — NumPy function to calculate variance — Source: [[VARIANCE_CHEATSHEET]]
- NumPy: [library] — Python library for numerical computation — Source: [[VARIANCE_CHEATSHEET]]
- σ² = Σ(Xi - μ)² / N: [formula] — Population variance formula — Source: [[VARIANCE_CHEATSHEET]]
- mean: [concept] — Average of data points — Source: [[VARIANCE_CHEATSHEET]]

**Relationships:**
- np.var --[implements]--> variance
- np.var --[belongs_to]--> NumPy
- mean --[prerequisite_for]--> variance
- variance --[derived_from]--> mean
- variance --[related_to]--> standard_deviation

Do this for ALL notes currently in the vault. This is a one-time bootstrap.

---

## Task 2: Update Phase 1 — knowledge-curator SKILL.md

**File:** `C:\Users\Kaden\.openclaw\skills\knowledge-curator\SKILL.md`

Add graph extraction to the processing workflow. The updated workflow should be:

### Updated Phase 1 Workflow

```
1. Scan: List files in new/
2. Read: Get full content of each file
3. Analyze Vault State: Read INDEX.md and GRAPH.md to understand existing content
4. Categorize: Determine Python/DataScience/Automation/Tools
5. Enhance: Add/update frontmatter tags
6. Extract Entities: Identify concepts, libraries, functions, formulas, techniques, tools
7. Extract Relationships: Identify how entities connect to each other AND to existing graph entities
8. Generate Wikilinks: Based on relationships to existing vault notes, add [[wikilinks]] to the cheat sheet
9. Copy: To vault Knowledge/{Category}/
10. Update GRAPH.md: Append new entities and relationships, update counts, identify new clusters
11. Update INDEX.md: Add entry for new note
12. Archive: Move original to processed/
```

### Key Addition: Steps 3, 6, 7, 8, 10

**Step 3 — Analyze Vault State:**

Before processing any file, the agent should:
```powershell
# Read current graph to know what entities already exist
obsidian-cli print "Knowledge/GRAPH"

# Read index to know what notes exist
obsidian-cli print "Knowledge/INDEX"

# List vault contents for structural awareness
obsidian-cli list "Knowledge/Python"
obsidian-cli list "Knowledge/DataScience"
obsidian-cli list "Knowledge/Automation"
obsidian-cli list "Knowledge/Tools"
```

This gives the agent context: "I already know about variance, NumPy, and mean. Now I'm processing a note about standard deviation — I should connect it to the existing variance entity."

**Step 6 — Extract Entities:**

For each cheat sheet, identify:
- What concepts does this teach? → `concept` entities
- What libraries/packages does it reference? → `library` entities
- What specific functions/methods does it demonstrate? → `function` entities
- What formulas does it contain? → `formula` entities
- What techniques/patterns does it describe? → `technique` entities
- What tools does it use? → `tool` entities

**Step 7 — Extract Relationships:**

For each pair of entities (including existing graph entities), determine:
- Does one implement the other? (code → concept)
- Does one require understanding the other first? (prerequisite)
- Are they derived from each other? (mathematical/logical derivation)
- Are they related but independent? (same domain)
- Does one belong to the other? (part-whole)

**Critical: Cross-reference against existing GRAPH.md entities.** If the new cheat sheet mentions "variance" and "variance" already exists in the graph, create relationships between the new entities and the existing variance entity. This is how the web grows.

**Step 8 — Generate Wikilinks:**

Based on discovered relationships to existing vault notes, add `[[wikilinks]]` to the cheat sheet's `## Related To` section. If the cheat sheet already has a Related To section from the Learning Session Configuration template, enhance it — don't replace it.

**Step 10 — Update GRAPH.md:**

Append new entities and relationships to GRAPH.md. Update the counts in the header. If a cluster of 3+ tightly related entities emerges, add it to the Clusters section.

```powershell
# Read current graph
obsidian-cli print "Knowledge/GRAPH"

# Append new entities and relationships to the appropriate sections
# Rewrite GRAPH.md with updated content
obsidian-cli create "Knowledge/GRAPH" --content "{updated_graph}" --overwrite
```

**Deduplication:** Before adding an entity, check if it already exists in the graph. If it does, add the new note as an additional source. Don't create duplicate entities.

### Updated Report Format

The processing report should now include graph information:

```
✅ Processed [N] files:
- filename.md → openClaw_Vault/Knowledge/Category/filename.md
  Category: Python
  Tags: [python, topic, learning]
  Entities extracted: 5 (2 new, 3 existing)
  Relationships added: 4
  Wikilinks generated: [[Note1]], [[Note2]]
  INDEX updated: ✓
  GRAPH updated: ✓
  Archived: ✓
```

---

## Task 3: Update Phase 2 — knowledge-retrieval SKILL.md

**File:** `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md`

Add graph-aware retrieval. The key change: before doing keyword search, consult GRAPH.md to expand the query with related concepts.

### Updated Retrieval Workflow

```
1. Command Routing (unchanged — check for /process, /consolidate, /health)
2. Extract Keywords from question (unchanged)
3. NEW: Consult GRAPH.md
   - Read GRAPH.md
   - Find entities matching the extracted keywords
   - Follow relationships to discover connected entities
   - Add connected entity names to the search terms
4. Search the vault using expanded keywords (existing strategies A & B)
5. Read top matches (unchanged)
6. Synthesize answer with citations (unchanged, but now can reference graph connections)
```

### Step 3 Detail: Graph-Aware Query Expansion

Example: User asks "How do I calculate variance in Python?"

**Without graph awareness (current):**
Keywords: `variance, calculate, Python, NumPy`
→ Searches for those exact terms
→ Finds VARIANCE_CHEATSHEET

**With graph awareness (new):**
Keywords: `variance, calculate, Python, NumPy`
→ Consults GRAPH.md
→ Finds entity "variance" with relationships:
  - standard_deviation --[derived_from]--> variance
  - mean --[prerequisite_for]--> variance
  - np.var --[implements]--> variance
→ Expands search to also check for standard_deviation, mean connections
→ Finds VARIANCE_CHEATSHEET (primary) AND STANDARD_DEVIATION_CHEATSHEET (related)
→ Answer includes: "Variance is calculated with `np.var()`. Related: standard deviation (the square root of variance) is covered in [[STANDARD_DEVIATION_CHEATSHEET]]."

**Important:** Graph expansion should ADD to results, not replace keyword search. If the graph is empty or doesn't have relevant entities, fall back to pure keyword search. The graph is an enhancement, not a dependency.

### Implementation in SKILL.md

Add a new section to the retrieval skill between "Extract Keywords" and "Search the Vault":

```markdown
### Step 2.5: Graph-Aware Query Expansion

Read the knowledge graph:
```powershell
obsidian-cli print "Knowledge/GRAPH"
```

Look for entities in the graph that match your extracted keywords. For each match:
1. Note the entity type and description
2. Follow its relationships (1 hop — don't go deeper than directly connected entities)
3. Add connected entity names to your search terms
4. Note which vault notes are sources for connected entities — these are strong candidates

If GRAPH.md is empty, missing, or has no matching entities, skip this step and proceed with keyword search only.
```

---

## Task 4: Bug Fixes

### Fix A: vault-health Path Bug

**File:** `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md`

During testing, the health check referenced `C:\aiMain\cheatSheets\vault\Knowledge\INDEX.md` instead of the correct path `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\INDEX.md`.

**Action:** Search the vault-health SKILL.md for any occurrence of `\vault\` that should be `\openClaw_Vault\`. Ensure all paths are fully qualified and correct. Also check if any path is being constructed by the agent at runtime — if so, make the full path explicit and unambiguous.

### Fix B: Health Check Auto-Fix Approval

**File:** `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md`

During testing, `/health` auto-fixed INDEX.md without asking the user first. The skill says to ask, but the agent ignored it.

**Action:** Strengthen the wording. Change the auto-fix section to be more forceful:

```markdown
## Auto-Fix Rules — APPROVAL REQUIRED

**STOP.** Do NOT auto-fix anything without explicit user approval. 

When INDEX.md drift is detected:
1. Report the issue clearly
2. State what you WOULD fix
3. Ask: "React ✅ to approve this fix, or ❌ to skip."
4. WAIT for the user's response
5. Only then apply the fix

You must NOT fix INDEX.md, rename files, or modify any vault content without the user explicitly approving.
```

### Fix C: Add GRAPH.md to Health Checks

While you're in the vault-health skill, add a new check:

**Check 7: GRAPH.md Validation**
- Verify GRAPH.md exists
- Count entities and relationships
- Check that entity counts in the header match actual entity counts in the file
- Verify all `Source: [[note]]` references point to existing vault notes
- Report any orphaned graph entries (entities whose source notes have been deleted)

Add this to the combined health report format:
```
🕸️ Graph: ✅ {N} entities, {M} relationships, all sources valid
```

---

## Task 5: Update CLAUDE.md

Add these items to CLAUDE.md:

### New DO NOT Rule:
```
- ❌ **DO NOT use `vault\` as a path shorthand** — Always use the full path `openClaw_Vault\`. The vault directory is `C:\aiMain\cheatSheets\openClaw_Vault\`, never `C:\aiMain\cheatSheets\vault\`.
```

### Update File Structure:
Add GRAPH.md and Archive/ to the file structure tree:
```
│   ├── Knowledge\
│   │   ├── Python\
│   │   ├── DataScience\
│   │   ├── Automation\
│   │   ├── Tools\
│   │   ├── INDEX.md          ← Tracking index
│   │   └── GRAPH.md          ← Entity-relationship knowledge graph
│   ├── Archive\              ← Merged/replaced notes
```

### New Section: Knowledge Graph
Add a brief section explaining GRAPH.md — what it is, how it's maintained, and how it's used by the skills.

---

## Task 6: Update Documentation (Closeout)

Follow the same closeout protocol from your last session:

1. **`CLAUDE.md`** — Add GRAPH.md, new DO NOT rule, update version to 2.1.0
2. **`IMPLEMENTATION_PLAN.md`** — Document the graph integration work, update handoff notes
3. **`PROJECT_ROADMAP.md`** — Add V2.1.0 to version history, document the graph architecture decision

**Version increment:** This is a minor version bump (new feature, no breaking changes): `2.0.0 → 2.1.0`

Ensure version numbers match across all three files.

### Architecture Decision to Document in PROJECT_ROADMAP.md:

**GRAPH.md vs. External Graph Database (Zep/Graphiti/Mem0)**
- **Decision:** Use a markdown-based knowledge graph (GRAPH.md) maintained by the agent
- **Rationale:**
  - No external dependencies or infrastructure
  - Human-readable and editable
  - Portable (plain text in Obsidian vault)
  - Sufficient for <1000 notes with well-structured entities
  - Agent can read and reason about the graph directly
  - Scales to progressive summarization layer without architectural change
- **Tradeoff:** No semantic similarity, no vector embeddings. Relationships are explicitly defined, not inferred.
- **Future:** If vault exceeds 1000 notes or relationship inference becomes necessary, evaluate adding Graphiti or vector embeddings as a complementary layer (not replacement).

---

## Task 7: Future Enhancement Stubs

Add these as documented stubs (comments/notes, NOT implementations) in the appropriate skill files:

### In knowledge-curator SKILL.md:
```markdown
## Future Enhancements (Not Yet Implemented)
- Progressive summarization: Generate topic summaries when a cluster reaches 5+ notes
- Learning Session Configuration feedback: Analyze processing patterns to suggest template improvements
- Multi-category tagging: Allow notes to have primary and secondary categories
```

### In knowledge-retrieval SKILL.md:
```markdown
## Future Enhancements (Not Yet Implemented)
- Multi-hop graph traversal: Follow 2+ relationship hops for deeper connections
- Domain map retrieval: Consult category-level summaries before individual notes
- Confidence scoring: Rank results by graph centrality + keyword match strength
```

### In knowledge-consolidator SKILL.md:
```markdown
## Future Enhancements (Not Yet Implemented)
- Graph-aware consolidation: Use GRAPH.md relationships to detect conceptual overlap beyond tag matching
- Topic summary generation: When consolidating, produce a summary note for the cluster
- Learning Session feedback: Suggest template changes based on consolidation patterns
```

---

## Deliverables Checklist

When you're done:

- [ ] `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\GRAPH.md` — Created and bootstrapped with existing vault content
- [ ] `C:\Users\Kaden\.openclaw\skills\knowledge-curator\SKILL.md` — Updated with graph extraction (Steps 3, 6, 7, 8, 10)
- [ ] `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md` — Updated with graph-aware query expansion
- [ ] `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md` — Path bug fixed, approval flow strengthened, GRAPH.md validation added
- [ ] `C:\aiMain\cheatSheets\CLAUDE.md` — Updated to V2.1.0 with GRAPH.md docs, new DO NOT rule
- [ ] `C:\aiMain\cheatSheets\documentation\IMPLEMENTATION_PLAN.md` — Updated with graph work, new handoff
- [ ] `C:\aiMain\cheatSheets\documentation\PROJECT_ROADMAP.md` — V2.1.0 entry, graph architecture decision
- [ ] Future enhancement stubs added to all three skill files
- [ ] Version numbers match across all documentation files (2.1.0)

**Final output:** Respond with a complete summary of everything you built, the current GRAPH.md contents (bootstrapped from existing vault), any issues encountered, and recommendations for next steps.

---

## Important Reminders

- **Windows paths:** Always backslashes. `C:\aiMain\cheatSheets\openClaw_Vault\` not `C:/aiMain/...`
- **obsidian-cli print:** Uses note name, not full path. `obsidian-cli print "VARIANCE_CHEATSHEET"` not `obsidian-cli print "Knowledge/Python/VARIANCE_CHEATSHEET.md"`
- **obsidian-cli search-content is interactive:** It launches a fuzzy UI. Use `Select-String` for programmatic content search and `obsidian-cli frontmatter --print` for tag search.
- **GRAPH.md lives in Knowledge/**, not in the project root. Path: `C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\GRAPH.md`
- **Don't over-engineer the graph.** At 2 notes, the graph will be small. That's fine. The structure matters more than the volume. It will grow naturally as more cheat sheets are processed.
- **Match the existing skill format.** Your Phase 1 skill is the reference. New additions should feel like natural extensions, not bolted-on afterthoughts.

Good luck. This is the evolution from filing cabinet to knowledge web.
