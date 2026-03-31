# Skills Reference

20 skills total: 19 invocable via `/command`, 1 always-on (non-invocable).

## How Skills Work

Each skill lives at `.claude/skills/<name>/SKILL.md` and reads its protocol from `.claude/.prompts/<name>.md`. The SKILL.md is the entry point; the prompt file is the source of truth for behavior. When you type `/skill-name`, Claude loads the SKILL.md, which directs it to the corresponding prompt.

The one exception is `documentation-awareness`, which has `user-invocable: false` -- Claude loads it automatically every session.

---

## Skill Tiers

### Core (every session)

| Skill | Command | When to use |
|-------|---------|-------------|
| `session-init` | `/session-init` | Starting any development session -- orients, reads state, verifies health |
| `session-closeout` | `/session-closeout` | Ending a session -- persists state, writes traces, ensures continuity |
| `documentation-awareness` | *always active* | Automatic -- enforces brain.db-first principles and content boundaries |

### Frequent (maintenance)

| Skill | Command | When to use |
|-------|---------|-------------|
| `cleanup` | `/cleanup` | Reconciling brain.db against docs, ingesting documentation, archiving originals |
| `validate` | `/validate` | Checking project health -- cross-file consistency, template drift, CLAUDE.md coverage |
| `dal-doctor` | `/dal-doctor` | First-run setup, ongoing health checks, template drift detection, remediation |

### On-Demand (development)

| Skill | Command | When to use |
|-------|---------|-------------|
| `code-review` | `/code-review` | Reviewing code for quality -- structured feedback with prioritized findings |
| `testing` | `/testing` | Defining test strategy, generating tests, or auditing existing coverage |
| `debugging` | `/debugging` | Investigating a bug -- systematic isolation and root cause analysis |
| `refactor` | `/refactor` | Restructuring code while preserving behavior -- extract, rename, simplify |
| `architecture` | `/architecture` | Designing systems, writing ADRs, or reviewing existing architecture |
| `requirements` | `/requirements` | Translating briefs into buildable specs with testable acceptance criteria |

### Situational

| Skill | Command | When to use |
|-------|---------|-------------|
| `explore` | `/explore` | Mid-project divergent thinking, pre-dev brainstorming, domain research |
| `frontier-research` | `/frontier-research` | Deep technology research and discovery. Standard/deep/ultra modes |
| `together` | `/together` | Shifting from execution to relationship mode -- human-first dialogue |
| `migration` | `/migration` | Planning data, schema, API, or infrastructure migrations with rollback safety |
| `triage` | `/triage` | Ecosystem-wide status assessment -- health beacons, vault notes, priorities |
| `plan-validator` | `/plan-validator` | Auditing plans for completeness and gaps; `--research` spawns investigation agents |
| `ui-dev` | `/ui-dev` | Building frontend UI -- components, pages, styling in React + Tailwind |
| `supabase` | `/supabase` | Supabase work -- schema design, RLS policies, auth, edge functions, storage |

---

## Customization

Add a skill: create `.claude/skills/<name>/SKILL.md` with frontmatter (name, description). It becomes available as `/<name>` immediately.

Modify a skill: edit the SKILL.md directly. Changes take effect on next invocation.
