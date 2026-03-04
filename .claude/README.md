# .claude Template — Personal Workflow Guide

**Version:** 1.2.0 | **Updated:** 2026-02-27

This folder is the Claude Code automation layer for the documentation system. It ships alongside `.prompts/` and the three core documents. When deploying to a project, **copy this folder to the project root** (same rule as CLAUDE.md).

---

## What Changed (Old Flow vs New Flow)

### Before (.prompts/ only)

```
1. Open project → CLAUDE.md auto-reads
2. Manually copy/paste init prompt from .prompts/init.md
3. Work
4. Manually copy/paste closeout prompt from .prompts/closeout.md
5. Close session (hope you remembered step 4)
```

### After (.claude + .prompts/)

```
1. Open project → CLAUDE.md auto-reads
2. session-context hook auto-fires (git branch, status, commits — no action needed)
3. documentation-awareness skill silently active (routing rule enforcement — no action needed)
4. Type /session-init (replaces pasting the prompt)
5. Work (hooks auto-run typecheck + lint on edits, protection hooks block dangerous ops)
6. Type /session-closeout (replaces pasting the prompt)
7. Stop hook catches you if you forget step 6 (warns if docs are >30min stale)
```

**Key differences:**
- Paste workflow → slash commands
- Manual memory → automatic hooks and safety nets
- No passive enforcement → documentation-awareness skill always active
- No protection → file protection + dangerous command blocking

---

## Deployment to a Project

When setting up a new project with the documentation system:

1. Copy `documentation/` to the target project (brings `.prompts/`, `PROJECT_ROADMAP.md`, `IMPLEMENTATION_PLAN.md`)
2. Copy `.claude/` to the **target project root** (Claude Code only detects it at root)
3. Move `CLAUDE.md` to the target project root (same existing rule)
4. Run `/bootstrap` to create the three core documents
5. Begin the Init → Work → Closeout loop

The `.prompts/` templates stay inside `documentation/`. The `.claude/` folder moves to root. CLAUDE.md moves to root. Everything else stays in `documentation/`.

---

## Slash Command Cheatsheet

| Command | When | What It Does |
|---------|------|-------------|
| `/session-init` | Start of every session | Reads all docs, verifies state, orients you |
| `/session-closeout` | End of every session | Updates all docs, version bump, handoff notes |
| `/bootstrap` | Once per project | Creates the three core documents from scratch |
| `/discovery` | Before a project/feature | Brainstorm or research → produces a brief |
| `/validate-docs` | Anytime | Runs the 5-check consistency audit |
| `/validate-setup` | After deployment | Verifies the template was copied correctly |
| `/readme` | When directories change | Audit/create/update directory READMEs |
| `/deploy` | When deploying | Pre-flight → build → deploy → smoke test |

**Note:** When you invoke a skill via `/command`, the skill's instructions load into Claude's context but you don't see the raw instructions — you see the output. If you want to see what's happening under the hood, you can always read the SKILL.md files directly.

---

## What's Automatic vs What You Invoke

### Automatic (no action needed)

| Component | What It Does | When It Fires |
|-----------|-------------|---------------|
| `session-context.js` hook | Loads git branch, status, recent commits into Claude's context | Every session start/resume |
| `documentation-awareness` skill | Enforces routing rule, document boundaries, "no silent decisions" | Always active (Claude-only) |
| `typecheck-on-edit.js` hook | Runs `tsc --noEmit` after editing TS/TSX files | After every Edit/Write |
| `lint-on-edit.js` hook | Runs `eslint` on the edited file | After every Edit/Write |
| `block-protected-files.js` hook | Blocks edits to .env, lock files, secrets, keys | Before every Edit/Write |
| `block-dangerous-commands.js` hook | Blocks rm -rf /, force push main, etc. | Before every Bash command |
| `Stop` hook | Warns if documentation files haven't been updated in >30 minutes | When Claude tries to end the session |

### Manual (you invoke)

All the slash commands listed above. These replace your old paste workflow.

---

## Customization Per Project

### Permissions

The template ships with minimal permissions. Each project should add its own in `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(your-project-specific-command:*)"
    ]
  }
}
```

### Deploy Skill

The deploy skill (`skills/deploy/SKILL.md`) is a generic template with placeholder commands. Each project fills in its own build/deploy/health-check commands.

### Hooks

The typecheck and lint hooks auto-detect `tsconfig.json` and `eslint.config.*`. If your project doesn't use TypeScript or ESLint, they silently do nothing. No configuration needed.

---

## Important Caveats

### Context Window

The `documentation-awareness` skill is always loaded into Claude's context. In very long sessions with heavy code context, this consumes space. If you notice context pressure, the skill could be compacted. Currently ~85 lines.

### TypeScript Cold Start

First `tsc --noEmit` invocation per session takes 5-10 seconds (Node + TypeScript compiler init). Subsequent runs are faster due to OS caching. This is noticeable but the 30-second timeout handles it.

### Notification Hooks (Windows-only)

The permission and idle notification hooks use `powershell.exe` for system beeps. They run `async: true` so they silently fail on non-Windows machines. If you work from Linux, these just don't fire — no errors, no side effects.

### The Closeout Worker Agent vs /session-closeout Skill

Both exist for different situations:
- `/session-closeout` — Interactive. Runs in your current conversation. You see every step, can intervene, can answer questions. **This is your default.**
- `closeout-worker` agent — Autonomous. Dispatched as a subagent. Runs independently, returns a summary. Use when you want hands-off closeout ("just handle it, I'm done").

---

## Template Version

This template tracks the Process Manual version (currently 1.2.0). When copying to projects, the template version travels with it. To check if a project's template is current, compare its README version against the canonical source at `repos/Prompt_Engineering/documentation/.claude/README.md`.

---

## See Also

- `hooks/README.md` — What each hook does and how to customize
- `agents/README.md` — What each agent does and when to use them
- `skills/README.md` — Detailed skill reference and invocation guide
- `../.prompts/` — The raw prompt templates (skills reference these)
- `../../2026_PROCESS_MANUAL.md` — The full documentation system reference
