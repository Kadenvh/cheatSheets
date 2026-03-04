# Phase 2: RETRIEVE — Knowledge Retrieval Skill

**Skill Name:** `knowledge-retrieval`  
**Install Path:** `C:\Users\Kaden\.openclaw\skills\knowledge-retrieval\SKILL.md`  
**Emoji:** 🔍  
**Trigger:** Any Discord message to @OpenClaw that is NOT a recognized `/command`

---

## What This Skill Does

When a user asks a question (anything that isn't a `/command`), the agent:

1. Extracts keywords from the question
2. Searches the Obsidian vault using `obsidian-cli search-content`
3. Reads the top matching notes
4. Synthesizes an answer using the retrieved context
5. Cites sources with `[[wikilinks]]`
6. Admits when the answer isn't in the vault (no hallucination)

Think of it as the librarian answering your question by pulling relevant books off the shelf, reading the relevant pages, and giving you a synthesized answer with citations.

---

## Routing Logic

The skill needs to handle command routing for the entire agent. This is the default handler — it catches everything that isn't a specific command.

### Recognized Commands (Route Away)

These should be detected and routed to their respective skills:

| Pattern | Routes To | Skill |
|---------|-----------|-------|
| `/process` or messages closely matching "process cheat sheets" | Phase 1 INGEST | `knowledge-curator` |
| `/consolidate` or messages closely matching "consolidate vault" | Phase 3 CONSOLIDATE | `knowledge-consolidator` |
| `/health` or messages closely matching "vault health" / "health check" | Phase 4 MAINTAIN | `vault-health` |

### Fuzzy Matching Guidance

The routing should be intent-based, not strict string matching. Examples:

- "process cheat sheets" → `/process`
- "process the new files" → `/process`
- "can you consolidate similar notes?" → `/consolidate`
- "run a health check" → `/health`
- "how's the vault doing?" → `/health`
- "what do I know about variance?" → Knowledge question (this skill)
- "explain NumPy arrays" → Knowledge question (this skill)

**Implementation approach:** The SKILL.md should instruct the agent to first check if the user's message matches a known command intent. If it does, acknowledge and hand off to that skill. If not, treat it as a knowledge question and proceed with retrieval.

**Important:** This routing logic should be documented in the SKILL.md as instructions the agent follows. OpenClaw skills are markdown instructions — the agent reads them and follows the logic. You are NOT writing code; you are writing clear instructions for an LLM agent.

---

## Retrieval Workflow (Step by Step)

### Step 1: Extract Keywords

From the user's question, extract 3-5 substantive keywords:

**Good keywords:** Nouns, concepts, technologies, specific terms
- "How do I calculate variance in Python?" → `variance calculate Python NumPy`
- "What testing frameworks have I studied?" → `testing framework pytest unittest`

**Bad keywords (skip these):** Generic verbs, conversational filler
- ❌ "discuss", "talk", "explain", "tell me about"
- ❌ "yesterday", "recently", "before"
- ❌ "thing", "stuff", "that"

**Leverage frontmatter knowledge:** Notes in the vault have tags like `[python, statistics, numpy, variance]`. When extracting keywords, consider what tags likely exist.

### Step 2: Search the Vault

```powershell
obsidian-cli search-content "{keywords}"
```

This returns a list of matching notes with line numbers and content snippets. If the first search returns few/no results, try:
- Broader keywords (remove the most specific term)
- Synonyms (e.g., "array" → "list", "function" → "method")
- Category-level terms (e.g., add "Python" or "statistics")

### Step 3: Read Top Matches

For the top 3-5 matching notes:

```powershell
obsidian-cli print "{note-name}"
```

This returns the full content of each note. Extract the sections most relevant to the question.

### Step 4: Synthesize Answer

Combine the retrieved context into a clear, practical answer. The synthesis should:

- **Answer the question directly** using ONLY information from the retrieved notes
- **Cite sources** using `[[wikilinks]]` — e.g., "According to [[VARIANCE_CHEATSHEET]], variance measures..."
- **Include code examples** if the source notes contain them
- **Acknowledge gaps** — if the answer isn't fully covered, say so: "The vault has information about X but not Y. You might want to study Y next."
- **Suggest related notes** — if other notes in the results seem related but weren't directly asked about, mention them

### Step 5: Handle "Not in Vault" Cases

If the search returns no relevant results:

```
I don't have information about {topic} in the vault yet. 

This would be a good topic for your next learning session! You could add a cheat sheet by saving one to `new/` and running `/process`.
```

**Critical: NEVER make up answers.** If it's not in the vault, say so. The user trusts this system to surface what they've actually learned, not to hallucinate.

---

## SKILL.md Template

The actual skill file should follow this structure (matching the `knowledge-curator` format):

```yaml
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

## Command Routing

Before answering a question, check if the user's message matches a command:

[... routing table and fuzzy matching instructions ...]

If no command match, proceed with knowledge retrieval below.

## Paths
[... vault paths ...]

## Retrieval Workflow
[... the 5-step workflow above, written as clear agent instructions ...]

## Response Format
[... how to format answers with citations ...]

## When Answer Not Found
[... the "not in vault" response template ...]
```

---

## Response Format

Answers should be formatted for Discord (the primary interaction surface):

```
**{Concise answer heading}**

{Answer text with [[wikilink]] citations}

{Code example if relevant, in Discord code blocks}

📚 Sources: [[Note1]], [[Note2]]
```

**Discord formatting rules:**
- No markdown tables (Discord renders them poorly) — use bullet lists
- Wrap multiple links in `<>` to suppress embeds
- Keep responses concise but complete
- Use `**bold**` for emphasis, not headers (unless the answer is long)

---

## Edge Cases to Handle

1. **Very short questions** ("variance?") — Still attempt search with available keywords, ask for clarification if results are ambiguous
2. **Multiple topics** ("compare variance and standard deviation") — Search for both terms, synthesize comparison from relevant notes
3. **Questions about the vault itself** ("how many Python notes do I have?") — Use `obsidian-cli list "Knowledge/Python"` to answer
4. **Questions about the system** ("what can you do?") — Briefly explain available commands: `/process`, `/consolidate`, `/health`, and natural language questions

---

## Testing Scenarios

After implementation, verify these scenarios work correctly:

| Question | Expected Behavior |
|----------|-------------------|
| "How do I calculate variance?" | Finds VARIANCE_CHEATSHEET, cites it |
| "What Python libraries have I studied?" | Searches Python category, lists what's there |
| "Tell me about Docker setup" | Should return "not in vault" (unless Tools notes exist) |
| "process cheat sheets" | Routes to `/process` (knowledge-curator skill) |
| "consolidate the vault" | Routes to `/consolidate` (consolidator skill) |
| "What notes do I have?" | Uses `obsidian-cli list` to enumerate vault contents |

---

## Success Criteria

- ✅ Routes `/commands` correctly to other skills
- ✅ Answers questions accurately when info exists in vault
- ✅ Always cites sources with `[[wikilinks]]`
- ✅ Admits when answer is not in vault (no hallucination)
- ✅ Response time is acceptable (search + synthesis)
- ✅ Handles edge cases gracefully
- ✅ Discord formatting is clean
