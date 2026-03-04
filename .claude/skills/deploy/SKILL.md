---
name: deploy
description: Build the project and deploy to the production server via systemd restart
disable-model-invocation: true
allowed-tools:
  - Bash
  - Read
---

# Deploy Skill

Build the project and restart the production service.

## Prerequisites

Before running, verify:
- You are on the correct branch (usually `main`)
- All changes are committed
- No unresolved merge conflicts

## Steps

1. **Pre-flight type check**
   - Run `npx tsc --noEmit` in the project directory
   - STOP and report if any type errors are found

2. **Pre-flight lint**
   - Run `npm run lint` in the project directory
   - STOP and report if any lint errors are found

3. **Build**
   - Run `npm run build`
   - Verify the output directory (usually `dist/`) was created with fresh timestamps

4. **Deploy to server**
   - Determine the service name from project configuration or ask the user
   - SSH to the server: `ssh ava@ava "systemctl --user restart <service-name>"`
   - Verify: `ssh ava@ava "systemctl --user status <service-name>"`
   - Confirm the service shows as active (running)

5. **Smoke test**
   - If a health URL is known, curl it and verify a 200 response
   - Report the result

## On Failure

- Report which step failed with the full command output
- Do NOT retry automatically — ask the user what they want to do
- Common fixes:
  - Type errors → fix the code first
  - Lint errors → run `npm run lint -- --fix`
  - Build failure → check for missing dependencies
  - Service restart failure → check `journalctl --user -u <service> -n 20`
