# Plan Validator — Completeness Audit & Gap Research

Audit project plans for structural completeness, identify gaps and unknowns, classify them by type, and optionally spawn research agents to investigate.

---

## 1. PLAN DISCOVERY

Locate all plan files in the project:

### 1.1 Active Plans (project root)
```bash
find plans/ -maxdepth 2 -name "*.md" -type f ! -path "*/archive/*" 2>/dev/null
```

All active plans live at project-root `plans/`. Superseded plans are under `plans/archive/<event>/` with `ARCHIVE_RECEIPT.md` — audit archives only when the user explicitly requests it.

### 1.2 Specific Plan (with `<path>` argument)
If a specific file path was provided, audit only that file. Skip discovery.

### 1.3 Report Discovery
List all discovered plans with their path, frontmatter or `**Status:**` header if present, and file size. If more than one active plan exists, note that the Phase 4 validator warns at 2+ and fails at 4+ — recommend consolidation.

---

## 2. COMPLETENESS CHECKS

For each discovered plan, read the full content and check:

| Check | What to Look For | Severity |
|-------|-----------------|----------|
| **Frontmatter** | YAML frontmatter with `type`, `project`, `status` | FAIL |
| **Problem Statement** | Section defining what problem the plan solves, why it matters | FAIL |
| **Scope** | What's in-scope and out-of-scope; clear boundaries | PARTIAL |
| **Technical Approach** | How the solution works — architecture, data flow, key decisions | FAIL |
| **Risks & Dependencies** | Known risks, external dependencies, unknowns acknowledged | PARTIAL |
| **Next Actions** | Concrete next steps (not just aspirational goals) | PARTIAL |
| **Evidence / Validation** | How to verify the plan worked; acceptance criteria | PARTIAL |
| **Status Accuracy** | If `completion_pct` in frontmatter, does it match actual content? | INFO |

**Scoring:**
- **PASS** — All checks pass (no FAIL or PARTIAL)
- **PARTIAL** — Has problem statement and technical approach, but missing secondary checks
- **FAIL** — Missing problem statement OR technical approach

---

## 3. GAP CLASSIFICATION

After checking all plans, classify every gap found:

| Category | Description | Example |
|----------|-------------|---------|
| **Technical Unknown** | "We don't know how X works" or missing technical approach | No architecture diagram, undecided tech choice |
| **Dependency Unknown** | External systems, people, timelines not confirmed | "Needs API from team Y" with no timeline |
| **Design Unknown** | Alternatives not evaluated, trade-offs not documented | Two approaches mentioned, neither chosen |
| **Missing Evidence** | Claims without validation, hypotheses without tests | "This will improve performance" with no benchmarks |

Count gaps per category. A plan with 0 gaps across all categories is healthy.

---

## 4. AGENT RESEARCH DELEGATION

> **Only when `--research` flag is set.** Without this flag, report gaps and stop.

For each gap category that has entries, spawn a focused research sub-agent:

### 4.1 Agent Dispatch Pattern
```
For each gap category with 1+ entries:
  1. Compose a focused research question from the gap description
  2. Spawn an Agent (subagent_type: Explore) with:
     - The specific question to investigate
     - Context about the plan and project
     - Instruction to produce findings in 3-5 bullet points
     - Read-only constraint — no file modifications
  3. Collect findings when agent returns
```

Spawn agents in parallel where gaps are independent. Limit to 3 concurrent agents.

### 4.2 Agent Fallback
When the Agent tool is not available (permission denied or not in allowed-tools):
- Research inline within the main thread
- Process gap categories sequentially
- Note in output: "Research was serial (Agent tool unavailable)"

### 4.3 Synthesis
After all agents return:
- Merge findings with original gap descriptions
- Assess confidence: high (strong evidence found), medium (partial), low (inconclusive)
- Produce recommendations based on findings

---

## 4b. CURATION AUDIT (--curate mode)

> **Only when `--curate` flag is set.** Runs after completeness checks. Checks plan ecosystem health.

### 4b.1 Cross-Reference Validation
For each plan, check its Cross-References section:
- Do referenced plans exist in `.claude/plans/`?
- Do referenced brain.db entries exist? (`node .ava/dal.mjs arch get <key>`)
- Are there dependency relationships that should exist but aren't documented?
- Flag plans with zero cross-references as "orphaned" — they may need linking.

### 4b.2 Staleness Detection
For each plan, check the "Updated" date in the header:
- **Stale (5+ sessions old):** Flag for review — either archive or update
- **Active but untouched:** Compare plan domain against recent brain.db actions — was work done in this domain without updating the plan?
- **Missing "Sessions Contributing":** Flag — no audit trail of which sessions curated this plan

### 4b.3 Convention Compliance
Check each plan against the plan structure convention (from SYSTEM-OVERVIEW.md):
- Has header with Created, Status, Updated, Depends on?
- Has Known Items section with checkboxes?
- Has Open Questions section?
- Has Sessions Contributing table?
- Has Cross-References section?
- Status is one of: Active, Curating, Stabilized?

### 4b.4 Ecosystem Coherence
Check the plan set as a whole:
- Are there domain gaps? (e.g., active work areas with no corresponding plan)
- Are there redundant plans covering the same domain?
- Does the primary direction document (ava-direction.md or equivalent) index all plans?
- Are archived plans properly moved out of `.claude/plans/`?

---

## 5. OUTPUT FORMAT

```
## Plan Validation Report

**Date:** {date}
**Plans scanned:** {n} active (plans/), {m} archived (plans/archive/)
**Mode:** Audit / Audit+Research

### Per-Plan Results

#### {Plan Title} ({path})
- **Path:** {file path}
- **Status:** PASS / PARTIAL / FAIL
- **Frontmatter:** {status, priority, completion_pct — or "missing"}
- **Completeness:**
  - [PASS/FAIL/PARTIAL] Problem Statement — {details}
  - [PASS/FAIL/PARTIAL] Scope — {details}
  - [PASS/FAIL/PARTIAL] Technical Approach — {details}
  - [PASS/FAIL/PARTIAL] Risks & Dependencies — {details}
  - [PASS/FAIL/PARTIAL] Next Actions — {details}
  - [PASS/FAIL/PARTIAL] Evidence / Validation — {details}
- **Gaps:** {n} ({technical: x, dependency: y, design: z, evidence: w})

### Gap Summary

| Category | Count | Plans Affected |
|----------|-------|----------------|
| Technical unknowns | {n} | {plan names} |
| Dependency unknowns | {n} | {plan names} |
| Design unknowns | {n} | {plan names} |
| Missing evidence | {n} | {plan names} |

### Research Findings (if --research)

For each researched gap:
- **Gap:** {description}
- **Finding:** {what was discovered}
- **Confidence:** high / medium / low
- **Recommendation:** {specific action}

### Recommendations
1. {Highest priority gap to resolve}
2. {Next priority}
3. ...

### Curation Report (if --curate)

**Cross-References:**
- {n} plans with valid cross-refs
- {n} orphaned plans (no cross-refs)
- {n} broken references

**Staleness:**
- {list of plans not updated in 5+ sessions}
- {list of plans whose domain had recent work but plan wasn't updated}

**Convention Compliance:**
| Plan | Header | Known Items | Open Qs | Sessions | Cross-Refs | Status |
|------|--------|-------------|---------|----------|------------|--------|

**Ecosystem:**
- Coverage gaps: {domains without plans}
- Redundancies: {overlapping plans}
- Direction index: {up to date / missing plans}
```
