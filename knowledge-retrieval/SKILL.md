---
name: knowledge-retrieval
description: Answer questions using vault knowledge (RAG). Routes /commands to appropriate skills. Default handler for all non-command messages.
metadata:
  {
    "openclaw":
      {
        "emoji": "🔍"
      },
  }
---

# Knowledge Retrieval — RAG Q&A + Command Router

You are the default handler for all messages. Before answering a question, check if the user's message is actually a command that should be routed elsewhere.

## Command Routing

Check the user's message against these patterns **before** doing anything else:

| User Intent | Route To | Skill |
|---|---|---|
| `/process` or "process cheat sheets", "process the new files", "process new notes" | Phase 1 INGEST | `knowledge-curator` |
| `/consolidate` or "consolidate vault", "merge similar notes", "clean up duplicates", "deduplicate" | Phase 3 CONSOLIDATE | `knowledge-consolidator` |
| `/health` or "vault health", "health check", "check the vault", "how's the vault doing?", "vault status" | Phase 4 MAINTAIN | `vault-health` |

**Routing rules:**
- Match on intent, not exact strings. "process the new files" means `/process`. "run a health check" means `/health`.
- If a command match is detected, acknowledge it and hand off: "Routing to {skill name}..." then invoke that skill.
- If no command match, treat the message as a knowledge question and proceed with retrieval below.

## Paths

- Vault: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/`
- Knowledge: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/`
- Categories: `Python/`, `DataScience/`, `Automation/`, `Tools/`
- INDEX: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/INDEX.md`
- GRAPH: `/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/GRAPH.md`

## Retrieval Workflow

### Step 1: Extract Keywords

From the user's question, extract 3-5 substantive keywords.

**Good keywords** (use these): Nouns, concepts, technologies, specific terms
- "How do I calculate variance in Python?" → `variance calculate Python NumPy`
- "What testing frameworks have I studied?" → `testing framework pytest unittest`
- "Tell me about NumPy arrays" → `NumPy arrays Python`

**Bad keywords** (skip these): Generic verbs and conversational filler
- "discuss", "talk", "explain", "tell me about", "what is"
- "yesterday", "recently", "before"
- "thing", "stuff", "that"

**Leverage tag knowledge:** Notes in the vault have frontmatter tags like `[python, statistics, numpy, variance]`. When extracting keywords, think about what tags likely exist.

### Step 1.5: Graph-Aware Query Expansion

Read the knowledge graph to discover related concepts:

```bash
obsidian-cli print "GRAPH"
```

Look for entities in the graph that match your extracted keywords. For each match:
1. Note the entity type and description
2. Follow its relationships (1 hop only — don't go deeper than directly connected entities)
3. Add connected entity names to your search terms
4. Note which vault notes are sources for connected entities — these are strong candidates to read

**Example:** User asks "How do I calculate variance in Python?"
- Keywords: `variance, calculate, Python`
- Graph lookup finds entity "variance" with relationships:
  - `standard_deviation --[derived_from]--> variance`
  - `mean --[prerequisite_for]--> variance`
  - `np.var --[implements]--> variance`
- Expanded search includes: standard_deviation, mean, np.var
- Source notes for these entities become strong retrieval candidates

**If GRAPH.md is empty, missing, or has no matching entities, skip this step and proceed with keyword search only.** The graph is an enhancement, not a dependency.

### Step 2: Search the Vault

Use two search strategies in combination:

**Strategy A — Tag-based search (fast, precise):**
Check note frontmatter tags for keyword matches:
```bash
obsidian-cli frontmatter "{note-name}" --print
# Look at the tags array for keyword matches
```

First, list all notes across categories:
```bash
obsidian-cli list "Knowledge/Python"
obsidian-cli list "Knowledge/DataScience"
obsidian-cli list "Knowledge/Automation"
obsidian-cli list "Knowledge/Tools"
```

Then check frontmatter tags of each note. Notes with 2+ tag matches to your keywords are strong candidates.

**Strategy B — Content search (thorough):**
Search note content directly using PowerShell:
```bash
grep -r "/home/ava/Ava_Main/repos/cheatSheets/openClaw_Vault/Knowledge/*\*.md" "{keyword}"
```

This returns matching files with line numbers and context. Run once per keyword, then rank notes by how many keywords they match.

**If few or no results**, try these fallbacks in order:
1. Broader keywords — remove the most specific term and search again
2. Synonyms — try "array" instead of "list", "function" instead of "method"
3. Category-level terms — add "Python" or "statistics" as a keyword

### Step 3: Read Top Matches

For the top 3-5 matching notes, read their full content:

```bash
obsidian-cli print "{note-name}"
```

Use just the note name without the path or `.md` extension (e.g., `VARIANCE_CHEATSHEET`, not `Knowledge/Python/VARIANCE_CHEATSHEET.md`).

Extract the sections most relevant to the question.

### Step 4: Synthesize Answer

Combine retrieved context into a clear, practical answer.

**Rules for synthesis:**
- Answer the question directly using ONLY information from the retrieved notes
- Cite sources using `[[wikilinks]]` — e.g., "According to [[VARIANCE_CHEATSHEET]], variance measures..."
- Include code examples if the source notes contain them (use Discord code blocks)
- Acknowledge gaps — if the answer isn't fully covered, say so: "The vault has information about X but not Y. You might want to study Y next."
- Suggest related notes — if other notes in the results seem related but weren't directly asked about, mention them

**CRITICAL: NEVER make up answers.** If it's not in the vault, say so. The user trusts this system to surface what they've actually learned, not to hallucinate.

### Step 5: Handle "Not in Vault" Cases

If the search returns no relevant results, respond with:

```
I don't have information about {topic} in the vault yet.

This would be a good topic for your next learning session! You could add a cheat sheet by saving one to `new/` and running `/process`.
```

## Response Format

Format all answers for Discord:

```
**{Concise answer heading}**

{Answer text with [[wikilink]] citations}

{Code example if relevant, in Discord code blocks}

Sources: [[Note1]], [[Note2]]
```

**Discord formatting rules:**
- No markdown tables — use bullet lists instead
- Wrap multiple links in `<>` to suppress embeds
- Keep responses concise but complete
- Use `**bold**` for emphasis, not headers (unless the answer is long)

## Edge Cases

1. **Very short questions** ("variance?") — Still attempt search with available keywords. Ask for clarification if results are ambiguous.
2. **Multiple topics** ("compare variance and standard deviation") — Search for both terms, synthesize comparison from relevant notes.
3. **Questions about the vault itself** ("how many Python notes do I have?") — Use `obsidian-cli list "Knowledge/Python"` to answer directly.
4. **Questions about the system** ("what can you do?") — Briefly explain available commands:
   - `/process` — Process new cheat sheets from the inbox
   - `/consolidate` — Scan vault for duplicates and merge similar notes
   - `/health` — Run a vault health check
   - Or just ask any question — I'll search the vault and answer with citations

## Future Enhancements (Not Yet Implemented)
- Multi-hop graph traversal: Follow 2+ relationship hops for deeper connections
- Domain map retrieval: Consult category-level summaries before individual notes
- Confidence scoring: Rank results by graph centrality + keyword match strength
