# Portfolio Key Metric \& Description Generator

Generate a compelling `keyMetric` and `description` for a portfolio project entry.

## Input

The project name and any available context: brain.db identity/architecture entries, README, CLAUDE.md, repo stats, or a brief user description.

## Output Format

```json
{
  "keyMetric": "Single impactful line - what makes this project notable (metric, capability, or differentiator)",
  "description": "2-5 sentence technical summary. Lead with what it does, then how (architecture/stack), then why it matters (outcome, scale, or novelty). No filler. No vanity metrics (endpoint counts, LOC unless genuinely impressive). Write for a technical hiring manager or potential client."
}
```

## Guidelines

* **keyMetric**: One line. Concrete over abstract. Prefer quantified outcomes ("4 hours to 12 minutes"), unique capabilities ("native in-process AI assistant"), or architectural scale ("7-service production architecture"). Avoid generic descriptors ("full-stack web app").
* **description**: Technical and specific. Name the actual technologies, patterns, and integrations. Show the user built something real - not a tutorial project. If the project has multiple notable aspects, use the most impressive as the lead.
* Match the voice and density of existing portfolio entries - professional, precise, no hype.
* If the project has a brain.db, pull identity and architecture entries for grounding. If it has a README or CLAUDE.md, use those. Don't fabricate capabilities.
* For early-stage or prototype projects, frame honestly - "prototype", "exploration", "proof of concept" are fine. The keyMetric should still highlight what's genuinely interesting about it.
* NO M-Dashes (-)

