# Knowledge Curator

**Version:** 2.1.0 | **Status:** All Phases Complete + Knowledge Graph | **Updated:** 2026-03-04

---

## Quick Reference

**Automated knowledge management system** that ingests learning cheat sheets, retrieves information via RAG, consolidates duplicates, and maintains itself through automated health checks.

**Commands:**
- `/process` — Process new cheat sheets from inbox
- `/consolidate` — Scan vault for duplicates, propose merges
- `/health` — Run vault health check
- Any other message — Knowledge Q&A (RAG retrieval with citations)

**Vault Location:** `C:\aiMain\cheatSheets\openClaw_Vault`
**Incoming Files:** `C:\aiMain\cheatSheets\new\`

---

## Critical Rules

### DO NOT

- ❌ **DO NOT skip obsidian-cli vault configuration** - Verify default vault is set before any vault operations:
  ```powershell
  obsidian-cli print-default
  # Must show: openClaw_Vault (ID: 60b06b30c9ce14c3)
  ```

- ❌ **DO NOT just archive without copying to vault** - Phase 1 requires TWO operations:
  1. Copy enhanced file TO vault (`openClaw_Vault/Knowledge/{Category}/`)
  2. Move original TO processed/ (archive)
  
- ❌ **DO NOT categorize without analyzing content** - Read full file content before categorizing:
  - **Python:** Contains code (`import`, `def`, `class`, `np.`, `pd.`, Python syntax)
  - **DataScience:** Theory without code (algorithms, statistics concepts, ML theory)
  - **Automation:** Testing (pytest, unittest), CI/CD, workflows, agents, OpenClaw
  - **Tools:** CLI usage (git, docker, kubectl), configuration, installation guides

- ❌ **DO NOT process without frontmatter enhancement** - Every processed file MUST have YAML frontmatter:
  ```yaml
  ---
  tags: [category, topic-tags, learning]
  created: YYYY-MM-DD
  processed: YYYY-MM-DD
  category: Category
  source: learning-session
  ---
  ```

- ❌ **DO NOT use `--vault` flag for default vault** - Once `obsidian-cli set-default` is configured, omit `--vault` parameter

- ❌ **DO NOT use `obsidian-cli search-content` programmatically** - It launches an interactive fuzzy UI that hangs in non-interactive shells. Use PowerShell `Select-String` for content search and `obsidian-cli frontmatter --print` for tag-based search instead.

- ❌ **DO NOT merge vault notes without user approval** - The consolidator ALWAYS presents candidates and waits for confirmation before modifying files.

- ❌ **DO NOT use `vault\` as a path shorthand** — Always use the full path `openClaw_Vault\`. The vault directory is `C:\aiMain\cheatSheets\openClaw_Vault\`, never `C:\aiMain\cheatSheets\vault\`.

### ALWAYS

- ✅ **ALWAYS verify file copy succeeded** - Check file exists in vault before archiving original
  ```powershell
  Test-Path "C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\Python\note.md"
  # Should return: True
  ```

- ✅ **ALWAYS update INDEX.md** - Add entry after copying to vault, update "Last Updated" date

- ✅ **ALWAYS use Windows path format** - Use backslashes `\` not forward slashes `/`
  ```
  ✓ C:\aiMain\cheatSheets\openClaw_Vault
  ✗ C:/aiMain/cheatSheets/openClaw_Vault
  ```

- ✅ **ALWAYS start gateway manually after restart** - Scheduled task fails, use:
  ```powershell
  openclaw gateway --port 18789
  ```

---

## File Structure

```
C:\aiMain\cheatSheets\
├── CLAUDE.md                         ← This file (agent reference)
├── documentation\
│   ├── .prompts\                     ← Lifecycle prompts
│   │   ├── documentation_bootstrap_prompt.md
│   │   ├── generic_init_prompt.md
│   │   ├── generic_closeout_prompt.md
│   │   └── discovery.md
│   ├── .skills\                      ← OpenClaw skills definitions
│   │   ├── bootstrap.md
│   │   ├── session-init.md
│   │   ├── session-closeout.md
│   │   └── validate-docs.md
│   ├── .agents\                      ← Agent definitions
│   ├── 2026_PROCESS_MANUAL.md        ← Documentation system reference
│   ├── PROJECT_ROADMAP.md            ← Strategic record (why, architecture, future)
│   └── IMPLEMENTATION_PLAN.md        ← Tactical playbook (tasks, debugging, handoff)
│
├── new\                              ← Incoming cheat sheets (unprocessed)
├── processed\                        ← Archived originals (post-processing)
│
├── openClaw_Vault\                   ← Obsidian vault (Knowledge base)
│   ├── .obsidian\                    ← Obsidian config (do not modify)
│   ├── Knowledge\
│   │   ├── Python\                   ← Code-focused notes (imports, functions, libraries)
│   │   ├── DataScience\              ← Theory-focused notes (algorithms, concepts, math)
│   │   ├── Automation\               ← Testing, CI/CD, workflows, agents
│   │   ├── Tools\                    ← CLI usage, configuration, setup guides
│   │   ├── INDEX.md                  ← Tracking index (updated by curator)
│   │   └── GRAPH.md                  ← Entity-relationship knowledge graph
│   ├── Archive\                      ← Merged/replaced notes (created by consolidator)
│   └── Welcome.md
│
├── Learning_Session_Configuration.md ← Template for Claude Chrome sessions
└── VARIANCE_CHEATSHEET.md            ← Example (processed - in vault now)
```

---

## Vault Categories (Categorization Rules)

### Python (Code-Focused)
**Triggers:** `import`, `def`, `class`, `np.`, `pd.`, Python syntax, code examples

**Contains:**
- Python libraries (NumPy, Pandas, matplotlib)
- Code snippets and implementations
- Function/class definitions
- Data manipulation with code

**Example:**
```python
import numpy as np
variance = np.var(data)  # ← Python category
```

---

### DataScience (Theory-Focused)
**Triggers:** Algorithms, statistics, ML concepts WITHOUT code

**Contains:**
- Statistical theory (variance, mean, distributions)
- ML algorithms explained conceptually
- Mathematical formulas and proofs
- Data science principles

**Example:**
```
Variance measures spread of data points...  # ← DataScience category
Formula: σ² = Σ(x - μ)² / N
```

---

### Automation (Workflows, Testing, CI/CD)
**Triggers:** `pytest`, `unittest`, `CI/CD`, `GitHub Actions`, `agent`, `workflow`

**Contains:**
- Testing frameworks and patterns
- CI/CD pipelines (GitHub Actions, Jenkins)
- OpenClaw agent development
- Workflow automation scripts

**Example:**
```python
def test_variance():  # ← Automation category
    assert np.var([1,2,3]) == expected
```

---

### Tools (CLI, Configuration, Setup)
**Triggers:** CLI commands, `install`, `configure`, setup guides

**Contains:**
- CLI tool usage (git, docker, kubectl, obsidian-cli)
- Software installation guides
- Configuration tutorials
- Troubleshooting and setup

**Example:**
```bash
# Install Docker
scoop install docker  # ← Tools category
```

---

## obsidian-cli Configuration

**Default Vault:**
- Name: `openClaw_Vault`
- ID: `60b06b30c9ce14c3`
- Path: `C:\aiMain\cheatSheets\openClaw_Vault`

**Verify Configuration:**
```powershell
obsidian-cli print-default
# Expected output:
# Default Vault: openClaw_Vault
# Vault Path: C:\aiMain\cheatSheets\openClaw_Vault
```

**Key Commands:**
```powershell
# Read note content (use note name without path or .md extension)
obsidian-cli print "note-name"

# Read note frontmatter/tags
obsidian-cli frontmatter "note-name" --print

# Create/update note
obsidian-cli create "note-name" --content "..." --overwrite

# Move/rename note (auto-updates ALL wikilinks!)
obsidian-cli move "old-path" "new-path"

# List vault contents
obsidian-cli list "path"

# Search file content (use PowerShell instead of obsidian-cli search-content)
Select-String -Path "C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\*\*.md" -Pattern "keyword" -SimpleMatch
```

---

## Phase Status

### ✅ Phase 1: INGEST (Complete)
**What it does:** Categorizes cheat sheets, adds frontmatter, extracts entities/relationships for GRAPH.md, files to vault, updates INDEX.md and GRAPH.md

**Trigger:** `/process` or "process cheat sheets"

**Skill:** `C:\Users\Kaden\.openclaw\skills\knowledge-curator\SKILL.md`

---

### ✅ Phase 2: RETRIEVE (Complete)
**What it does:** Answers questions using vault knowledge (RAG) with [[wikilink]] citations. Also serves as the command router for all messages.

**Trigger:** Any non-command message to @OpenClaw

**Skill:** `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md`

*See PROJECT_ROADMAP.md for detailed workflow and data flow.*

---

### ✅ Phase 3: CONSOLIDATE (Complete)
**What it does:** Scans vault for duplicate/similar notes, proposes merges, executes with user approval

**Trigger:** `/consolidate` or "merge similar notes"

**Skill:** `C:\Users\Kaden\.openclaw\skills\knowledge-consolidator\SKILL.md`

*See PROJECT_ROADMAP.md for detailed workflow and data flow.*

---

### ✅ Phase 4: MAINTAIN (Complete)
**What it does:** 7 health checks (wikilinks, frontmatter, category consistency, INDEX drift, metrics, auto-fix offer, GRAPH.md validation) + passive HEARTBEAT.md monitoring.

**Trigger:** `/health` or "vault health check"

**Skill:** `C:\Users\Kaden\.openclaw\skills\vault-health\SKILL.md`
**Heartbeat:** `C:\Users\Kaden\.openclaw\workspace\HEARTBEAT.md`

*See PROJECT_ROADMAP.md for detailed check descriptions and data flow.*

---

## Knowledge Graph

**GRAPH.md** (`C:\aiMain\cheatSheets\openClaw_Vault\Knowledge\GRAPH.md`) is a machine-readable relationship map of all entities in the vault.

**What it contains:**
- **Entities** — concepts, libraries, functions, formulas, techniques, tools extracted from cheat sheets
- **Relationships** — how entities connect (implements, prerequisite_for, derived_from, related_to, etc.)
- **Clusters** — groups of tightly related entities forming knowledge domains

**How it's maintained:**
- `/process` extracts entities and relationships from new cheat sheets and appends to GRAPH.md
- Knowledge retrieval consults GRAPH.md to expand queries with related concepts
- `/health` validates GRAPH.md consistency (counts, source references)

**Read it with:** `obsidian-cli print "GRAPH"`

---

## Common Tasks

### Discord Commands
```
@OpenClaw /process              → Process new cheat sheets from inbox
@OpenClaw /consolidate          → Scan vault for duplicates, propose merges
@OpenClaw /health               → Run vault health check
@OpenClaw "any question here"   → Knowledge Q&A with citations
```

### Verify Vault Status
```powershell
obsidian-cli print-default          # Check vault is configured
obsidian-cli list "Knowledge"       # List vault contents
obsidian-cli list "Knowledge/Python"  # Check specific category
```

### Manually Restart Gateway
```powershell
openclaw gateway --port 18789   # After system restart
openclaw status                 # Verify running
```

---

## Known Issues

### Gateway Scheduled Task Auto-Closes
**Symptom:** Scheduled task starts then immediately completes without running gateway

**Impact:** Low - Gateway stays running once started manually

**Workaround:**
```powershell
# After restart, manually run:
openclaw gateway --port 18789
```

**Future Fix:** Investigate Windows service installation or task scheduler configuration

**Tracked in:** `documentation/IMPLEMENTATION_PLAN.md` → Debugging Notes

---

## Links & Resources

- **PROJECT_ROADMAP.md:** Architecture, decisions, version history, future phases
- **IMPLEMENTATION_PLAN.md:** Current tasks, debugging notes, handoff for next session
- **OpenClaw Docs:** https://docs.openclaw.ai/
- **obsidian-cli GitHub:** https://github.com/Yakitrak/obsidian-cli
- **Obsidian Help:** https://help.obsidian.md/

---

## Quick Start for New Session

1. **Verify gateway running:**
   ```powershell
   openclaw status
   # If not running: openclaw gateway --port 18789
   ```

2. **Check vault configuration:**
   ```powershell
   obsidian-cli print-default
   # Should show: openClaw_Vault
   ```

3. **All phases complete** — system is fully operational:
   - `/process` → Ingest new cheat sheets
   - `/consolidate` → Deduplicate vault
   - `/health` → Run health check
   - Ask any question → RAG retrieval with citations

4. **Process cheat sheets (if any in new/):**
   ```
   Discord → @OpenClaw /process
   ```

5. **For future development:**
   - See IMPLEMENTATION_PLAN.md for enhancement ideas
   - See PROJECT_ROADMAP.md for architecture decisions

---

*This file is auto-read by agents entering the project. Keep it current with each phase.*
