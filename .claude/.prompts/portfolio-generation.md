# Portfolio \& Profile Narrative Generator

Generate compelling portfolio entries (`keyMetric`, `description`) or profile-level narrative (`bio`, `summary`, `headline`) in the user's voice.

## Hard Rules (violate these and the output is rejected)

* **NO em-dashes (—).** Use hyphens, periods, colons, or restructure. This is the single most common failure mode. Check every draft twice.
* **NO diplomatic reframes.** If the user writes "NOT a CS degree" leave the edge intact. Do not soften to "credentials to match" or similar. Assertive positioning is intentional.
* **NO fabricated capabilities.** Ground in brain.db, README, CLAUDE.md, or explicit user input. Never invent metrics.
* **NO vanity metrics** (endpoint counts, LOC) unless genuinely impressive in context (74K LOC that automates a full business = yes; 2K LOC side project = no).
* **NO scaffolding bleed.** See Subject Discipline below.

## Input

Project name or profile surface, plus available context: brain.db identity/decisions/notes, README, CLAUDE.md, active plans, repo stats, existing user-written content in the repo, or a brief user description.

## Output Formats

### Portfolio project entry
```json
{
  "keyMetric": "Single impactful line - what makes this project notable (metric, capability, or differentiator)",
  "description": "2-5 sentence technical summary. Lead with what it does, then how (architecture/stack), then why it matters (outcome, scale, or novelty). No filler. Write for a technical hiring manager or potential client."
}
```

### Profile bio / summary / headline
```json
{
  "headline": "One line positioning statement. Assertive, specific, no hype.",
  "summary": "2-4 sentence elevator pitch. Short assertion rhythm preferred over flowing prose.",
  "bio": "4-8 sentence narrative. Lead with the thesis, list concrete shipped projects with quantified outcomes, end with forward vector."
}
```

## Subject Discipline

Describe the product's own capabilities, not the scaffolding it happens to use. brain.db, PE template, skills, hooks, and DAL runtime are development infrastructure for most projects, not product surface.

**Self-test for every claim:** if you removed the scaffolding tomorrow, would the product still exist?

- A quadruped robot still works without brain.db. Do not mention brain.db in its description.
- A bookkeeping SaaS still works without a PE template. Do not mention the template.
- A 3D-printing calibration tool still works without a `.claude/` directory. Do not mention the agent tooling.

**When scaffolding IS the product:** some projects' distinctive product surface genuinely includes their agent infrastructure. The self-test reveals this honestly. If removing brain.db or template propagation would destroy the project's value proposition, scaffolding is a legitimate product claim. Apply the test within the project's own scope. The prompt is scoped to one project at a time, so there is no exception list to maintain.

**Tiebreaker:** if someone outside the user's ecosystem read this description, would they recognize "brain.db" or "PE template" as meaningful? If no, those terms are scaffolding, not product. Strike them.

## Grounding Sources

Pull from whatever is available in the running project:

* **brain.db identity**: `product.summary`, `product.tech-highlights`, `project.vision`, `product.priority-stack`. Query with `node .ava/dal.mjs identity get <key>` or `identity list`.
* **brain.db decisions**: the last 5-10 entries for newly distinctive capabilities. Query with `node .ava/dal.mjs decision list`.
* **Active plans**: `.claude/plans/` (exclude `archive/`) for architectural role and scope.
* **CLAUDE.md** (project root and any sub-project CLAUDE.md files): stack, critical rules, feature/tab inventory.
* **README.md**: if present, check for feature claims.
* **Route registry / entry point**: whatever is authoritative for the feature surface (e.g., `config/routes.ts`, `server/routes/`).

Never fabricate. If a claim cannot be traced to one of these, omit it.

**Cross-project claims are not authoritative.** Sibling projects in the same ecosystem may contain identity entries about the running project (for example, PE's sibling-projects view of Ava_Main). These are NOT authoritative for the running project's own description. Verify any borrowed claim against the running project's own data (brain.db, CLAUDE.md, live code) before using it. If a sibling-project claim cannot be verified locally, omit it or surface it to the user as "sibling X claims Y, cannot verify locally". Numbers are the most common trap: "17 orchestrated agents" or "262 smoke-tested endpoints" in a sibling's brain.db may be stale, aspirational, or counting something different.

For early-stage or prototype projects, frame honestly. "Prototype", "exploration", "proof of concept" are fine. The keyMetric should still highlight what is genuinely interesting about it.

## Grounding Depth

This prompt is typically invoked after `/session-closeout`, when the agent has maximum working knowledge of the project. Exploit that context instead of defaulting to surface-level summaries.

After reading the Grounding Sources above, write claims that are specific to **this** project. Specificity test: if the sentence could describe three different projects in the same category, it is not grounded enough. Rewrite until the description could only fit this project.

**Examples of underground to grounded:**

- "a persistent AI assistant" becomes "a headless Ubuntu laptop running as a persistent AI assistant, accessed exclusively over Tailscale mesh"
- "structured memory" becomes "brain.db continuity across N sessions via a 10-table schema tracking identity, decisions, notes, sessions, traces, and handoffs"
- "agent orchestration" becomes "OpenClaw agent orchestration with domain spoke-agents"
- "code intelligence" becomes "GitNexus code intelligence with impact analysis on every edit"
- "AI-powered features" becomes named models, named integrations, named outcomes

Named technologies, named architectural roles, and named recent capabilities distinguish closeout-quality output from generic output. When in doubt, be more specific, not less.

**Stable product surface vs session-level polish.** Recent decisions inform newly distinctive capabilities, but the description should emphasize enduring product features, not infrastructure tweaks. Replacing `node --watch` with nodemon is a dev-loop improvement, not a product capability. Adding a new feature tab, integrating a new external service, or shipping a new export format IS a product capability. Rule of thumb: would this decision change how a user experiences the product, or only how the developer experiences building it? If the latter, it does not belong in the description.

## Verification Trace

After drafting, run a final self-check pass: for each quantified claim in the output, confirm you can answer "where did this number come from?"

- brain.db identity key: note the key name (e.g., `product.tech-highlights`)
- brain.db decision: note the decision ID (e.g., `#183`)
- Live query: note the command (e.g., `dal.mjs status` returned 121 sessions)
- Source file: note the path and line (e.g., `config/routes.ts` lists 12 visible entries)
- CLAUDE.md section: note which section

If a claim cannot be traced to a concrete source, remove it. This is the "verify before self-reporting" doctrine from SYSTEM-OVERVIEW.md Section 2, applied at the content-generation surface. Unverifiable claims poison trust in the rest of the output.

Honest metrics or no metrics. A missing number is always better than a stale or fabricated one.

## Voice Anchor

Before drafting a product description or keyMetric, read the project's existing `product.summary` identity entry:

```bash
node .ava/dal.mjs identity get product.summary
```

That is the closest available calibration to the user's product-voice register for this project. Match its density, directness, and structural style.

If `product.summary` does not exist, fall back to `project.vision`. Be careful: many existing identity entries predate the strict em-dash rule and contain drift. Treat em-dashes and hype words in the reference as legacy noise, not voice. Do not copy them.

## Voice Guidelines

Match the density and edge of existing user-written content. Rules below split by surface because bio voice and product-copy voice are different registers.

### Applies to all surfaces (bio, headline, keyMetric, description)

* **Density over polish.** Full detail is a feature. Do not cut phrases just to make the text "tighter". If something was written on purpose, it carries positioning or rhythm weight.
* **Quantified claims only.** Every sentence should name a number, a unique capability, or a concrete integration. Avoid generic descriptors.
* **Anti-hype vocabulary ban:** no "passionate about", "leverage", "unlock", "cutting-edge", "innovative", "seamless", "robust", "powerful", "solution", "empower", "revolutionize".
* **Honest metrics.** Verify numbers against live queries (session count, test count, route count) before using them. Stale numbers are worse than no numbers.

### Bio / headline surfaces only (first-person narrative)

* **Short assertion punches.** "Not demos. Not prototypes. Systems that run daily." Don't smooth these into flowing sentences.
* **Assertive caps for emphasis.** NOT, EVERY, NEVER. Preserve when present in user-written source.
* **Credentials framed as fact, not defense.** State background directly. Do not over-explain or compensate.
* **First-person positioning.** "I build X" not "Kaden builds X".

### Product surfaces only (keyMetric, description)

* **Declarative-flat third-person.** Product copy is calm and factual. Do not force bio-style assertion rhythm into product descriptions.
* **Match the Voice Anchor.** `product.summary` is the calibration reference.
* **Structure:** what the product does, then how it does it (architecture/stack), then why it matters (outcome, scale, novelty).

## Surface-specific Guidelines

* **keyMetric**: One line. Concrete over abstract. Prefer quantified outcomes ("4 hours to 12 minutes"), unique capabilities ("native in-process AI assistant inside SOLIDWORKS"), or architectural scale ("7-service production architecture"). Aim for under ~25 words.
* **description**: Technical and specific. Name actual technologies, patterns, integrations. 2-5 sentences. If the project has multiple notable aspects, lead with the most impressive.
* **bio**: Lead with the thesis sentence ("I build X that Y"). Then concrete projects in parallel structure (name + one-line what + quantified proof). Then background. End with forward vector (what is being built next and why).
* **headline**: One line. The thesis sentence alone, or a sharpened version of it.

## Rewriting user-provided content

When the user hands you existing content to revise, default to minimal surgical edits. Fix grammar, typos, punctuation rule violations (em-dashes), and obvious errors. Do not restructure unless explicitly asked. The user's draft is usually closer to correct than a polished rewrite.

## Iteration Protocol (when a draft is rejected)

If the user rejects a draft, do not blindly redraft. The correct loop:

1. **Ask for specifics.** "Which phrase or claim doesn't fit?" A general "it's wrong" is insufficient feedback to iterate usefully.
2. **Trace the rejection to template language.** Is the failure a rule this template should catch (add it), a rule that exists but is too weak (strengthen it), or a one-off content judgment (just redraft without changing the template)?
3. **Update the template first if applicable.** Encode the lesson before redrafting. Future agents should not have to rediscover this correction. Save a feedback memory at the user's auto-memory directory if the lesson generalizes beyond this prompt.
4. **Then redraft** under the updated rules.

Every rejection is a template-validation signal, not just a content-quality signal. Treat the loop as how the template improves, not as churn.

## Anti-patterns (observed failures)

1. **Em-dash "flow".** Rewriting a user bio with em-dashes throughout because they "flow better". They do not flow better. They are banned.
2. **Diplomatic reframing.** Changing "NOT a CS degree" to "engineering and mathematics, credentials to match". The reframe reads as apology.
3. **Filler-cutting.** Removing phrases like "among other AI-fueled projects leading the space" as filler. If the user wrote it, it stays unless they ask you to trim.
4. **Rhythm smoothing.** Flowing the short assertion rhythm into complex sentences. "I build production AI systems that automate expert workflows. Not demos, not prototypes. Systems that run daily under real operational constraints." is the target rhythm: three beats, not one long clause.
5. **Soft transitions.** Adding "meanwhile", "in addition", "alongside". Use periods.
6. **Scaffolding bleed.** Mentioning brain.db or PE template in a description for a project whose product is not the agent infrastructure itself. Run the Subject Discipline self-test first.
7. **Shallow grounding.** Writing the description from CLAUDE.md alone when brain.db identity, recent decisions, and active plans are also available. Shallow grounding produces generic output. See Grounding Depth.
8. **Stale metrics.** Using numbers from existing identity entries without verifying against live queries. "130+ sessions" when the live count is 121 is worse than omitting the metric.
9. **Generic tech names.** Writing "agent orchestration" when the actual framework is OpenClaw, or "code intelligence" when the actual system is GitNexus. Name the specific technology.
