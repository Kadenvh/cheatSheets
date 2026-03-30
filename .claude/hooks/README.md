# Hooks

Hooks are automatic actions that fire on Claude Code events. You don't invoke these — they run on their own based on what's happening in the session.

All hook scripts are Node.js (`.js`) for cross-platform compatibility. They read JSON from stdin, make a decision, and exit. Exit code 0 = allow, exit code 2 = block/warn.

---

## Hook Inventory

### PreToolUse (fires BEFORE an action)

| Hook | Matcher | What It Does |
|------|---------|-------------|
| `block-protected-files.js` | Edit, Write | Blocks edits to `.env`, lock files, `.git/`, credentials, secrets, SSH keys, `.pem`, `.key`, `.sqlite` |
| `block-dangerous-commands.js` | Bash | Blocks `rm -rf /`, `git push --force main`, `git reset --hard`, `git clean`, fork bombs, `curl \| sh`, `dd`, `mkfs` |

These are safety nets. If Claude tries to edit your `.env` or run a destructive command, the hook denies the action and tells Claude why. You never see a prompt — it just doesn't happen.

### PostToolUse (fires AFTER an action)

| Hook | Matcher | What It Does |
|------|---------|-------------|
| `typecheck-on-edit.js` | Edit, Write | Runs `npx tsc --noEmit` after editing `.ts`/`.tsx` files. Auto-detects `tsconfig.json` by walking up from the edited file. If no TypeScript config found, silently skips. Feeds type errors directly to Claude so it can fix them immediately. 30-second timeout. |
| `lint-on-edit.js` | Edit, Write | Runs `npx eslint` on the specific edited file. Auto-detects ESLint config (`eslint.config.js`, `.eslintrc.*`) by searching from project root. If no config found, silently skips. Feeds lint errors to Claude. 15-second timeout. |
| `gitnexus-post-commit.js` | Bash (git commit, git merge) | Re-indexes the GitNexus knowledge graph after commits. Runs `npx gitnexus analyze` (with `--embeddings` if embeddings exist). Silently skips if GitNexus is not installed. |

**Cold start note:** First `tsc` invocation per session takes 5-10 seconds. Subsequent runs are faster due to OS caching.

### Notification (fires on Claude Code events)

| Hook | Matcher | What It Does |
|------|---------|-------------|
| Permission beep | `permission_prompt` | Plays a terminal bell (`printf '\a'`) when Claude asks for permission. Async — won't block anything. |
| Idle beep | `idle_prompt` | Plays a terminal bell (`printf '\a'`) when Claude goes idle waiting for input. Async. |

Cross-platform via terminal bell. Actual sound depends on terminal emulator settings.

### SessionStart (fires when session begins)

| Hook | Matcher | What It Does |
|------|---------|-------------|
| `session-context.js` | startup, resume | Injects brain.db context (via `dal.mjs context`), git branch, uncommitted changes, and 5 most recent commits. Adds a reminder about `/session-closeout`. Runs on every session start and resume. |

### Stop (fires when session is ending)

| Hook | Matcher | What It Does |
|------|---------|-------------|
| Closeout reminder | — | Checks modification timestamps on CLAUDE.md, PROJECT_ROADMAP.md, and IMPLEMENTATION_PLAN.md. If the most recent edit to any of them is **more than 120 minutes (2 hours) ago**, warns that documentation may be stale and suggests running `/session-closeout`. This catches the case where you worked for a while, changed code, but forgot to persist state to docs. |
| `completion-check.js` | — | Checks brain.db for actions with partial outcomes in the last 7 days. If any exist, warns that incomplete work needs attention. |

---

## How to Customize

### Disable a specific hook

Remove it from `settings.json` under the appropriate event. Or comment it out (JSON doesn't support comments — you'd need to rename the entry).

### Disable ALL hooks

Add `"disableAllHooks": true` to `settings.json`.

### Add project-specific hooks

Add new entries to the hooks arrays in `settings.json`. The hook scripts can live in `.claude/hooks/` and reference `$CLAUDE_PROJECT_DIR` for the project root.

### Adjust timeouts

Each hook has a `timeout` field in `settings.json` (in seconds). The typecheck hook defaults to 30s, lint to 15s. Increase these if your project is large.

---

## How Hooks Receive Data

Every hook script receives a JSON payload on stdin containing:
- `session_id` — current session identifier
- `tool_input` — what Claude is about to do (file path, command, etc.)
- `cwd` — current working directory
- `hook_event_name` — which event fired

The PreToolUse hooks extract `tool_input.file_path` or `tool_input.command` to make their decisions. The PostToolUse hooks also receive `tool_response` with the result.
