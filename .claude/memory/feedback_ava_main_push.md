---
name: Don't push Ava_Main without asking
description: User denied git push to Ava_Main remote — do not push Ava_Main unless explicitly asked
type: feedback
---

Do not push to Ava_Main remote without explicit permission. CheatSheets repo can be pushed freely, but Ava_Main pushes require confirmation.

**Why:** User rejected the push — Ava_Main has other uncommitted work from other sessions/projects, and the user wants control over when that remote is updated.

**How to apply:** When committing cross-repo changes, push the spoke repo (cheatSheets) but only commit locally in Ava_Main. Ask before pushing Ava_Main.
