---
name: frontier-research
description: "Deep technology research and discovery. Standard/deep/ultra modes for evaluating tools, frameworks, patterns, and competitive landscape before decisions are made."
allowed-tools:
  - Read
  - Bash
  - WebSearch
  - WebFetch
  - Glob
  - Grep
---

# Frontier Research - Technology Discovery & Competitive Analysis

Non-implementation research for evaluating tools, frameworks, patterns, and architectural approaches before decisions are made.

## Instructions

1. Load the research prompt:
   - Read `.prompts/frontier-research.md` (relative to project root)
2. Determine mode from arguments or context:
   - **`/frontier-research`** - Standard mode. 3 searches per topic, per-tool analysis, priority matrix.
   - **`/frontier-research --deep`** - Deep mode. 5-8 searches, competitive analysis, integration matrix, risk assessment.
   - **`/frontier-research --ultra`** - Ultra mode. 8+ searches, source code inspection, community recon, prototype testing.

## Key Rules

- **Research only.** No code changes, no DAL entries, no decisions. Produce analysis documents.
- **Every tool gets a full analysis.** Capability inventory, adoption metrics, pricing, limitations, possibilities.
- **Adjacent discovery protocol.** When searches reveal unexpected relevant tools, research them too.
- **Priority matrix is mandatory.** Every output ends with impact/effort rankings.
- **Be honest about unknowns.** Flag unverified claims and contradictions.

## Inline Fallback (if prompt file not found)

For each topic: (1) 3 web searches (official docs, architecture, adoption). (2) Per-tool analysis: what it is, capabilities, scale, pricing, limitations, possibilities for the ecosystem. (3) Cross-cutting themes. (4) Priority matrix (impact vs effort). (5) URL appendix.
