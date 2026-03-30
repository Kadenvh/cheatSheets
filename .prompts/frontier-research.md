# Frontier Research - Technology Discovery & Competitive Analysis

Non-implementation research for evaluating tools, frameworks, patterns, and architectural approaches before decisions are made. Output is analysis documents and priority matrices, not code.

---

## 1. TRIGGER

This skill activates when the user asks to research, explore, discover, scout, investigate, or analyze tools, frameworks, patterns, or technologies.

Key phrases: "research this", "explore what's out there", "what are the possibilities", "deep dive into", "frontier scout", "find tools for", "what's new in", "competitive analysis", "integration matrix".

---

## 2. MODES

### Standard Mode (default)
- 3 searches per topic
- Per-tool analysis template (7 sections)
- Cross-cutting themes
- Priority matrix

### Deep Mode (`--deep`, "go deep", "thorough mode")
- 5-8 searches per topic
- Primary documentation fetching via web_fetch
- Competitive landscape analysis
- Integration matrix (tool pairs)
- Risk assessment per tool
- Adjacent discovery protocol
- Second-order possibilities

### Ultra Mode (`--ultra`, "maximum depth")
- 8+ searches per topic
- Source code inspection
- Issue tracker analysis
- Community reconnaissance (forums, Discord)
- Historical trajectory analysis
- Prototype building where feasible
- Raw notes export
- Contradiction mapping

---

## 3. METHODOLOGY

### Step 1: Scope Definition

Parse the user's request:
- Identify explicit topics
- Identify implied interests from project context and memory
- Determine output format (report, handoff, comparison, brief)
- Confirm scope with user ONLY if genuinely ambiguous
- Set mode (standard/deep/ultra) based on flags or language

### Step 2: Search Strategy

FOR EACH topic in scope:

**Standard mode** (3 searches):
1. `[topic] official docs features capabilities`
2. `[topic] architecture how it works technical`
3. `[topic] reviews adoption GitHub stars 2026`

**Deep mode** (5-8 searches):
4. `[topic] vs alternatives comparison`
5. `[topic] changelog release notes roadmap`
6. `[topic] integration [user's stack keywords]`
7. `[topic] limitations known issues`
8. `[topic] pricing license enterprise`
Also: `web_fetch` primary documentation pages

**Ultra mode** (8+ searches):
9+. Issue tracker queries, Discord/forum posts, source code file reads, historical versions
Also: Install and test where feasible. Produce raw notes document.

**Adjacent discovery protocol:** After each search, scan results for unexpected tools/patterns. If an adjacent discovery scores > 7/10 on relevance, add it to scope and research it fully. Flag as "[Adjacent Discovery]" in output.

### Step 3: Per-Tool Analysis Template

For each tool/pattern discovered:

```
## [Tool Name] - [One-Line Description]

### What It Is
[1 paragraph. What problem does it solve?]

### Technical Architecture
[How it works. Diagrams if helpful.]

### Complete Capability Inventory
[Enumerate ALL features. Do not summarize. Sub-sections for categories.]

### Scale & Adoption
- GitHub stars: [N]
- npm downloads: [N/week]
- Notable users: [list]
- Funding: [if applicable]

### Pricing & Licensing
[Free tier limits, paid costs, license type.]

### Limitations & Open Questions
[What doesn't work? What's missing?]

### Possibilities for [User's Ecosystem]
[Map to specific projects, workflows, architectural patterns.
 Focus on what this UNLOCKS, not just what it DOES.]

--- DEEP MODE ADDITIONS ---

### Competitive Landscape
[Alternatives and why choose this one.]

### Recent Trajectory
[What shipped recently? What's coming?]

### Integration Points
[Concrete connections to other tools in scope.]

### Risk Assessment
[Single-maintainer? License? Vendor lock-in? Privacy?]

--- ULTRA MODE ADDITIONS ---

### Source Code Notes
[Key architectural observations from reading the code.]

### Community Sentiment
[What are real users saying?]

### Prototype Results
[First-hand testing observations.]
```

### Step 4: Synthesis

After all tools are analyzed:

- **Cross-Cutting Themes** - 3-5 patterns spanning multiple findings
- **Connection Map** - Which tools feed into each other? What stacks emerge?
- **Priority Matrix** - Ranked by impact-to-effort ratio:

| Priority | Tool | Impact | Effort | Why |
|----------|------|--------|--------|-----|

- **Gaps Identified** - Areas where no good tool exists (custom dev needed)

Deep mode additions:
- **Integration Matrix** - For every tool pair: can they work together? How?
- **Second-Order Possibilities** - What does Tool A + Tool B enable that neither enables alone?

Ultra mode additions:
- **Contradictions & Open Questions** - Where do sources disagree?
- **Raw Notes Export** - Every URL visited, every query run, every dead end

### Step 5: Output Formatting

- Linked Table of Contents
- Lead sections with "what" and "why it matters"
- Complete URL/reference appendix
- Tables for comparisons, not prose
- ASCII architecture diagrams where they add clarity
- Concrete commands/configs where applicable
- Priority Matrix at the end - this is the action trigger

---

## 4. QUALITY CHECKLIST

Before delivering output, verify:

- [ ] Every tool has a complete capability inventory (not a summary)
- [ ] Every tool has adoption metrics (stars, downloads, users)
- [ ] Every tool has pricing/licensing information
- [ ] Every tool has a "Possibilities for [ecosystem]" section
- [ ] Every tool has limitations documented
- [ ] Adjacent discoveries flagged and researched
- [ ] Cross-cutting themes identified
- [ ] Priority matrix included with impact/effort ratings
- [ ] All URLs collected in appendix
- [ ] Table of contents links to all sections
- [ ] Output format matches user agreement
