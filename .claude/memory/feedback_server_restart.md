---
name: Server restart autonomy
description: User expects me to restart ava-hub.service myself instead of asking them to do it
type: feedback
---

Restart the Ava server yourself using `systemctl --user restart ava-hub.service` instead of asking the user to do it.

**Why:** User asked "can you not do this yourself?" when told the server needed a restart. They want autonomous execution.

**How to apply:** After backend changes to Ava_Main server code (routes, middleware, etc.), restart the service directly. No need to ask or wait.
