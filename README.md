# CheatSheets Knowledge System

Personal learning system built on Obsidian vault authoring, FSRS spaced repetition (brain.db), and ChromaDB semantic search. Part of Project Ava.

## How It Works

```
Obsidian note  -->  vault-sync  -->  brain.db (scheduling)
                                 -->  ChromaDB (search)
                                 -->  Learn tab (reviews)
```

1. **Author** cheat sheet notes in Obsidian (`vault/Concepts/`)
2. **Sync** vault to system (`POST /api/learning/vault-sync`)
3. **Review** via FSRS scheduling in the Learn tab
4. **Search** semantically via Q&A tab

## User Workflow

### Creating a New Concept

1. Open the `vault/` folder in Obsidian
2. Create a new note in `Concepts/` using the **Cheatsheet** template (`vault/Templates/Cheatsheet.md`)
3. Fill in the frontmatter:
   - `category`: Python | DataScience | Tools | Linux | General
   - `tags`: lowercase, hyphenated topic tags
   - `title`: human-readable concept title
   - `difficulty`: 1-10 scale
   - `exercise_hints`: recall / understanding / application prompts
4. Write the content using these sections:
   - **Quick Reference** — key-value definitions, concise facts
   - **Functional Logic** — `[[wiki-links]]` to related concepts (these become prerequisite edges)
   - **Implementation** — code examples, diagrams, applied scenarios
   - **Sandbox** — hands-on exercises
5. Wiki-link liberally: `[[Concept Name]]` creates prerequisite relationships automatically

### Syncing Content

After creating or editing notes, sync to the system:

```bash
# Via API (production server on port 4173)
curl -X POST http://localhost:4173/api/learning/vault-sync

# Via API (dev server on port 3001, if DEV_MODE=1)
curl -X POST http://localhost:3001/api/learning/vault-sync
```

Vault-sync:
- Parses frontmatter and wiki-links from every note in `vault/Concepts/`
- Upserts concepts and mastery state in brain.db
- Creates prerequisite edges from wiki-links
- Chunks and embeds content into ChromaDB for semantic search

### Reviewing (Learn Tab)

Open ava_hub > CheatSheets > **Learn** tab:
- **Overview** shows stats (topics, due today, domains), today's plan, suggested next concepts, and domain coverage
- **Reviews** tab shows concepts due for review — rate each recall attempt and FSRS schedules the next review
- **+** button creates a learning session for focused study

The FSRS algorithm schedules reviews at expanding intervals. Concepts move through mastery levels: novice > familiar > proficient > expert > legendary.

### Searching (Q&A Tab)

Open ava_hub > CheatSheets > **Q&A** tab:
- Type a question in natural language
- RAG-powered retrieval searches ChromaDB for relevant chunks
- Returns answers with citations from your vault notes

### Exploring (Explorer Tab)

Open ava_hub > CheatSheets > **Explorer** tab:
- 3D force-directed graph of all knowledge chunks
- Filter by category (General, Python, Tools, Linux, DataScience)
- Semantic search highlights relevant nodes
- Click any node to see its content

### System Health (Health Tab)

Open ava_hub > CheatSheets > **Health** tab:
- ChromaDB service status (model, device, document count)
- Quality gates (content length, duplicate detection, domain balance)
- Knowledge agent status

## Architecture

| Layer | Tool | Owns |
|-------|------|------|
| Content | Obsidian vault (`vault/`) | Note text, wiki-link graph, exercise hints |
| Scheduling | brain.db (`.ava/brain.db`) | Concepts, mastery, FSRS state, reviews, prerequisites |
| Search | ChromaDB (`:8001`) | Embeddings, vector search, chunked content |
| API | Ava_Main Express (`:4173`) | 45 learning endpoints at `/api/learning/*` |
| UI | ava_hub React app | CheatSheets tab with Explorer, Q&A, Learn, Health sub-tabs |

## Concept Identity

- Filename slug = concept ID: `typescript-generics.md` becomes concept `typescript-generics`
- One note = one concept
- Wiki-links (`[[Concept Name]]`) generate prerequisite edges during sync

## Categories

| Category | Use When |
|----------|----------|
| `Python` | Code-focused: imports, functions, libraries, code examples |
| `DataScience` | Theory-focused: algorithms, statistics, formulas |
| `Tools` | CLI tools, configuration, installation guides |
| `Linux` | OS-level: shell scripting, sysadmin, networking |
| `General` | Cross-domain, meta-learning, or doesn't fit above |

## Agents

7 OpenClaw agents in `knowledge-agents/`:

| Agent | Name | Role |
|-------|------|------|
| curator | Archivist | Optional enrichment of stub notes |
| qa | Oracle | RAG retrieval with citations |
| verifier | Sentinel | ChromaDB audit and data quality |
| learning | Compass | Coverage analysis, gap detection, learning paths |
| demo | Spark | Exercise and lesson generation |
| tutor | Tutor | Socratic teaching in sessions |
| architect | Architect | Curriculum planning |

## System Maintenance

```bash
# Check brain.db health
node .ava/dal.mjs status

# Verify learning data
sqlite3 .ava/brain.db "SELECT COUNT(*) FROM concepts;"

# Check ChromaDB
curl http://localhost:8001/health

# Run vault-sync
curl -X POST http://localhost:4173/api/learning/vault-sync

# Check learning stats
curl http://localhost:4173/api/learning/stats
```

## File Structure

```
/home/ava/cheatSheets/
├── CLAUDE.md                        # Project rules (auto-loaded by Claude Code)
├── plans/                           # Active strategy (learning-system, resilience)
├── sessions/                        # Curated session notes (session-export)
├── README.md                        # This file
├── Cheatsheet_Generation_Prompt.md  # Template spec for generating notes
├── vault/                           # Obsidian vault (content layer)
│   ├── Concepts/                    # One .md per concept (73 notes)
│   ├── Templates/Cheatsheet.md     # Note template
│   └── .obsidian/                   # Obsidian config
├── .ava/                            # brain.db (scheduling layer)
│   ├── brain.db                     # SQLite: concepts, mastery, reviews, prereqs
│   ├── dal.mjs                      # DAL CLI runtime
│   └── lib/                         # DAL libraries
├── knowledge-agents/                # 7 OpenClaw agent workspaces
└── archive/                         # Superseded plans and legacy content
```

## Links

- **Project repo:** https://github.com/Kadenvh/cheatSheets
- **Learning plan:** `plans/learning-system.md`
- **Project rules:** `CLAUDE.md`
- **Template spec:** `Cheatsheet_Generation_Prompt.md`
