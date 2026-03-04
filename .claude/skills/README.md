# Skills

Skills are packaged workflows invoked via `/skill-name` slash commands. They replace the old workflow of manually copy/pasting prompt templates from `.prompts/`.

---

## Skill Inventory

### Session Lifecycle (replaces your paste workflow)

| Skill | Command | Old Workflow | New Workflow |
|-------|---------|-------------|-------------|
| `session-init` | `/session-init` | Paste `.prompts/init.md` | Type `/session-init` |
| `session-closeout` | `/session-closeout` | Paste `.prompts/closeout.md` | Type `/session-closeout` |
| `bootstrap` | `/bootstrap` | Paste `.prompts/bootstrap.md` | Type `/bootstrap` |
| `discovery` | `/discovery` | Paste `.prompts/discovery.md` | Type `/discovery` |
| `readme` | `/readme` | Paste `.prompts/readme.md` | Type `/readme` |

These are thin wrappers that point Claude to the corresponding `.prompts/` template. The skill loads the instructions; Claude follows them. The prompt templates remain the source of truth — skills just provide discoverability and convenience.

**What you won't see:** When you invoke a skill, the instructions load into Claude's context but you don't see the raw prompt text. You see Claude's output (the work it does). If you want to see what instructions Claude is following, read the SKILL.md or the referenced `.prompts/` file directly.

### Validation & Quality

| Skill | Command | Purpose |
|-------|---------|---------|
| `validate-docs` | `/validate-docs` | Runs the 5-check consistency audit (can dispatch the doc-validator agent) |
| `validate-setup` | `/validate-setup` | Verifies the template was deployed correctly (all prompts present, hooks scripts exist, settings.json parses, skills registered) |

### Operations

| Skill | Command | Purpose |
|-------|---------|---------|
| `deploy` | `/deploy` | Generic deploy template: pre-flight checks → build → deploy → smoke test. Each project fills in its own commands. |

### Always-On (Claude-Only)

| Skill | Command | Purpose |
|-------|---------|---------|
| `documentation-awareness` | *None — always active* | Passively enforces the routing rule, document boundaries, front-loading convention, "no silent decisions" principle. Activates automatically when Claude detects the three-document architecture. You never invoke this. |

---

## How Skills Work

### User-invoked skills

When you type `/skill-name`, Claude Code loads the skill's `SKILL.md` file into context. The SKILL.md contains instructions that Claude follows. Most of the session lifecycle skills say "read `.prompts/X.md` and follow it" — keeping the prompt templates as the single source of truth.

Skills have frontmatter that controls behavior:

```yaml
---
name: skill-name
description: What this skill does
disable-model-invocation: true   # User-only (Claude can't auto-invoke)
allowed-tools:                   # Restrict what tools the skill can use
  - Read
  - Edit
---
```

`disable-model-invocation: true` means only YOU can invoke the skill. Claude won't trigger it on its own. This is set on all action-oriented skills (session-closeout, deploy, bootstrap) to prevent Claude from running closeout or deploy without being asked.

### Claude-only skills

`documentation-awareness` has `user-invocable: false` — meaning you can't invoke it, Claude loads it automatically. It provides background knowledge that shapes how Claude works, without requiring any action from you.

### Skills vs Pasting Prompts — Trade-offs

| | Pasting Prompts | Slash Commands |
|---|----------------|----------------|
| **Visibility** | You see the full prompt text | Instructions are hidden (Claude sees them, you see output) |
| **Convenience** | Find file → copy → paste | Just type `/command` |
| **Consistency** | Depends on pasting the right version | Always uses the current SKILL.md |
| **Customization** | You can edit before pasting | You'd need to edit the SKILL.md |
| **Context cost** | Same — prompt enters context either way | Same |

If you want the visibility of the old paste workflow for a specific prompt, you can always read the `.prompts/` file directly and paste it. The slash commands are a convenience layer, not a replacement.

---

## Customization

### Adding project-specific skills

Create a new directory in `.claude/skills/your-skill/SKILL.md` with the frontmatter shown above. The skill automatically becomes available as `/your-skill`.

### Modifying existing skills

Edit the SKILL.md directly. Changes take effect on the next invocation.

### The deploy skill

The deploy skill ships as a generic template with placeholder steps:
1. Pre-flight (typecheck + lint)
2. Build (`{BUILD_COMMAND}`)
3. Deploy (`{DEPLOY_COMMAND}`)
4. Smoke test (`{HEALTH_CHECK}`)

Each project fills in its own commands. For example, Ava uses `npm run build`, `ssh ava@ava "systemctl --user restart ava-hub"`, and `curl http://100.77.143.109:4173/`.
