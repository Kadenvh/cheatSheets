# Rename Checklist: cheatSheets -> cortex-design

**Created:** 2026-06-06 (Session 17, decision #18) | **Execute:** at a session boundary, NEVER mid-session (the live session's cwd, transcript dir, and hooks hold the old absolute path)

Goal state: `/home/ava/cortex-design` (this repo, the design home) + `/home/ava/cortex` (build home, intentionally empty) + GitHub repo `Kadenvh/cortex-design`.

## Order of operations

### 1. Close the session cleanly
- [ ] Commit + push everything; verify `git status` clean and `git log -1 origin/main` matches local

### 2. GitHub rename (before or after local move; auto-redirect makes order safe)
- [ ] `gh repo rename cortex-design -R Kadenvh/cheatSheets`
- [ ] GitHub auto-redirects old URLs and git operations; still update the local remote after the move: `git remote set-url origin git@github.com:Kadenvh/cortex-design.git`

### 3. Local moves
- [ ] `mv /home/ava/cheatSheets /home/ava/cortex-design`
- [ ] `mkdir /home/ava/cortex` — optionally drop a one-paragraph README: "Cortex build home. Intentionally empty (decision #18). The system is being designed at ../cortex-design; nothing lands here until the design phase yields a buildable Loop 1 charter."

### 4. Path-reference repairs (the blast radius)
- [ ] **OpenClaw gateway** `~/.openclaw/openclaw.json`: tutor agent `workspace: /home/ava/cheatSheets/tutor` -> `/home/ava/cortex-design/tutor` (or retire the registration; consolidation already deferred to Loop 2)
- [ ] **Claude Code project dir**: `~/.claude/projects/-home-ava-cheatSheets/` holds transcripts + auto-memory. New sessions in the renamed dir create `-home-ava-cortex-design/`. Copy memory: `cp -r ~/.claude/projects/-home-ava-cheatSheets/memory ~/.claude/projects/-home-ava-cortex-design/memory` (after first new session creates the dir, or pre-create)
- [ ] **Ava_Main registry** `Ava_Main/.ava/agents/dal-doctor/projects.json`: `cheatSheets.local_path` — update or remove the entry (DAL frozen here anyway; removal is honest). Cross-project write: Kaden executes or explicitly confirms
- [ ] **GitNexus**: re-index after move (`npx gitnexus analyze` in the new path); old `.gitnexus/` index travels with the dir but records old paths
- [ ] **Obsidian**: re-open the vault from the new path (`/home/ava/cortex-design/vault`); no embedded caches to fix (smart-* never indexed)
- [ ] **Syncthing** (session hook mentions a health check): if this dir is a synced folder, update the folder path in Syncthing config
- [ ] **learning.db refs**: `doc_ref`/`source_ref` use repo-relative `archive/...` paths (fine) + dead absolute `/home/ava/SPDRbot/...` refs (already dead; untouched)
- [ ] **`.claude/settings.local.json`**: check for absolute paths (autoMemoryDirectory is relative `.claude/memory` per convention; verify)
- [ ] **Health beacons** `~/.pe-health/cheatsheets.json`: stale by design (DAL frozen); optionally delete the beacon

### 5. Verify
- [ ] New Claude session in `/home/ava/cortex-design`: CLAUDE.md auto-loads, identity reads "Cortex Design"
- [ ] `git fetch && git status` clean against the renamed remote
- [ ] `gh repo view` shows `Kadenvh/cortex-design`
- [ ] OpenClaw gateway starts without workspace-path errors

### 6. Post-rename docs touch-up (first session in the new home)
- [ ] README badge/links if any still say cheatSheets; SPEC §9 naming section confirms the executed state
- [ ] Disable the DAL session-context hook (decision #17's boundary action): remove/comment its registration in `.claude/settings.json`
