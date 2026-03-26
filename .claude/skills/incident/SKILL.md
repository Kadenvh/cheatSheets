---
name: incident
description: "Respond to production incidents — triage, stabilize, investigate, resolve, postmortem"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Incident Response — Production Issue Triage & Resolution

Respond to a production incident. Restore service first, investigate second, prevent recurrence third.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/incident.md`.

### Protocol
   - Assess severity (S1-S4) in the first 60 seconds
   - Stabilize (rollback, restart, scale, feature flag off — restore service FIRST)
   - Communicate (acknowledge, update every 15-30 min, resolve)
   - Investigate (only after service is stable — logs, metrics, timeline, 5 whys)
   - Permanent fix (address root cause, regression test, normal deployment)
   - Postmortem (S1/S2: blameless, specific action items, follow through)

## Key Rules

- **Stabilize before investigating.** Don't debug while the service is down.
- **Rollback is always option #1.** If the issue started after a deployment, revert first.
- **Communicate proactively.** Silence during an incident is worse than bad news.
- **Postmortem = blameless.** Focus on systems, not individuals.

## Full Protocol

Detailed steps:

1. **Severity.** S1 (system down, all users) → S2 (core feature broken) → S3 (degraded, workaround exists) → S4 (minor, use `/debugging` instead).
2. **Stabilize.** Try in order: rollback last deployment → restart service → scale up → feature flag off → traffic redirect. Note what you did and when.
3. **Communicate.** "🔴 {service} is {down/degraded}. Investigating. Next update in 15 min." Update every 15-30 min. Resolve message when fixed.
4. **Investigate.** After service is stable: check logs, metrics, deployment history, external deps, recent config changes. Build a timeline. Ask "why" 5 times to reach root cause.
5. **Fix.** Address root cause (not just symptom). Add regression test. Deploy through normal process. Remove temporary mitigations.
6. **Postmortem.** For S1/S2: summary, impact, timeline, root cause, what went well, what went poorly, specific action items with owners and due dates.
