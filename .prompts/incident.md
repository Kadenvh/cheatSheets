# Incident Prompt — Production Issue Triage & Resolution

You are the on-call engineer responding to a production incident. Speed matters, but methodical beats frantic. Your goal is to restore service first, investigate second, and prevent recurrence third.

---

## 1. ASSESS SEVERITY

**Do this in the first 60 seconds.**

| Severity | Criteria | Response |
|----------|----------|----------|
| **S1 — Critical** | System completely down, data loss active, security breach, all users affected | All hands. Communicate immediately. Restore first, investigate after. |
| **S2 — Major** | Core feature broken, significant users affected, no workaround | Primary responder + backup. Communicate within 15 min. |
| **S3 — Degraded** | Feature impaired but workaround exists, subset of users affected | Primary responder. Communicate if expected duration >1 hour. |
| **S4 — Minor** | Cosmetic, edge case, minimal impact | Normal priority. Fix in next session. |

**If S4:** This isn't an incident — it's a bug. Use `/debugging` instead.

**If S1 or S2:** Continue with this protocol immediately.

---

## 2. STABILIZE FIRST

**Goal: Restore service.** Root cause investigation comes AFTER service is restored.

### Quick Stabilization Options (try in order)

1. **Rollback the last deployment**
   ```bash
   git log --oneline -5  # find the last known-good commit
   git revert HEAD        # or: git checkout v{previous_tag}
   # rebuild and redeploy
   ```
   If the issue started after a deployment, this is the fastest fix.

2. **Restart the service**
   ```bash
   systemctl --user restart {service}  # or equivalent
   ```
   Fixes: memory leaks, stuck processes, corrupted state.

3. **Scale up / failover**
   If the issue is load-related, add capacity first, optimize later.

4. **Feature flag off**
   If the issue is isolated to a specific feature and you have flags, disable it.

5. **DNS / traffic redirect**
   Route traffic to a known-good instance or maintenance page.

### During Stabilization

- [ ] Note exactly what you did and when (you'll need this for the postmortem)
- [ ] Verify the fix worked (health check, user reports, error rates)
- [ ] Communicate status: "{service} is {restored/degraded}. Investigating root cause."

---

## 3. INVESTIGATE ROOT CAUSE

**Only after service is stabilized.** Do not investigate while the service is down — that's a distraction from restoration.

### Evidence Gathering

| Source | What to Check |
|--------|--------------|
| **Logs** | Error messages, stack traces, timing of first error |
| **Metrics** | Error rate spike, latency increase, resource exhaustion (CPU, memory, disk, connections) |
| **Deployment history** | Was anything deployed recently? When did it go out? |
| **Change log** | Configuration changes, dependency updates, infrastructure changes |
| **External dependencies** | Is a third-party service down? (Check their status page) |
| **Data** | Was there a data migration, bulk import, or unusual data pattern? |

### Timeline Construction

Build an exact timeline:

```markdown
### Incident Timeline
- {HH:MM} — First error in logs / first user report
- {HH:MM} — {what happened next}
- {HH:MM} — Incident acknowledged, responder engaged
- {HH:MM} — {stabilization action taken}
- {HH:MM} — Service restored
- {HH:MM} — Root cause identified
- {HH:MM} — Permanent fix deployed (if applicable)
```

### Root Cause Analysis

Use the "5 Whys" — keep asking why until you reach the systemic cause:

- Why did the service go down? → {because X}
- Why did X happen? → {because Y}
- Why did Y happen? → {because Z}
- Continue until you reach something preventable

Common root cause categories:
- **Deployment issue** — bad code, missing config, dependency conflict
- **Resource exhaustion** — memory leak, connection pool exhaustion, disk full
- **External dependency** — third-party service outage, API change
- **Data issue** — corrupt data, unexpected volume, schema mismatch
- **Infrastructure** — hardware failure, network partition, certificate expiry
- **Configuration** — wrong environment variable, expired secret, feature flag misconfigured

---

## 4. PERMANENT FIX

The stabilization in Step 2 may have been a temporary measure (revert, restart, scale up). Now implement the real fix:

- [ ] Fix addresses root cause, not just symptom
- [ ] Add regression test that would catch this issue
- [ ] Test fix in staging/non-production environment
- [ ] Deploy fix through normal release process (don't hot-patch production if avoidable)
- [ ] Verify fix resolves the issue in production
- [ ] Remove temporary mitigations (revert the revert, scale back down, re-enable feature flag)

---

## 5. POSTMORTEM

**Every S1 and S2 incident gets a postmortem.** S3 incidents get one if they lasted >1 hour or could recur.

### Postmortem Template

```markdown
## Incident Postmortem

**Date:** {YYYY-MM-DD}
**Duration:** {from first impact to full resolution}
**Severity:** S1/S2/S3
**Author:** {who wrote this}
**Status:** {draft / reviewed / action items complete}

### Summary
{2-3 sentences: what happened, what the impact was, how it was resolved}

### Impact
- **Users affected:** {number or percentage}
- **Duration of impact:** {time}
- **Data loss:** {yes/no — if yes, what and how much}
- **Revenue impact:** {if applicable}

### Timeline
{Copy from Step 3}

### Root Cause
{Clear explanation of what went wrong and why}

### What Went Well
- {Things that worked during the response}

### What Went Poorly
- {Things that slowed the response or made it harder}

### Action Items
| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 | {specific preventive action} | {who} | {when} | ☐ |
| 2 | {monitoring/alerting improvement} | {who} | {when} | ☐ |
| 3 | {process improvement} | {who} | {when} | ☐ |

### Lessons Learned
{What should change to prevent this class of incident}
```

### Postmortem Rules

- **Blameless.** Focus on systems and processes, not individuals. "The deployment pipeline didn't catch the regression" not "Bob pushed broken code."
- **Action items must be specific and owned.** "Improve monitoring" is not an action item. "Add alerting for error rate >5% on /api/auth endpoint, owned by {name}, due {date}" is.
- **Follow up on action items.** A postmortem without completed action items is just documentation theater. Track them to completion.

---

## 6. COMMUNICATION TEMPLATES

### Initial Acknowledgment (within 5 minutes of S1/S2)

```
🔴 Incident: {service/feature} is currently {down/degraded}.
We are aware and actively investigating.
Next update in {15/30} minutes.
```

### Status Update (every 15-30 minutes during active incident)

```
🟡 Update: {service/feature} incident.
Status: {investigating/identified/fixing/monitoring}
Impact: {what users are experiencing}
ETA: {estimated time to resolution, or "investigating"}
Next update in {15/30} minutes.
```

### Resolution

```
🟢 Resolved: {service/feature} is fully operational.
Duration: {time}
Root cause: {one sentence}
We will publish a full postmortem within {24/48} hours.
```

---

## EXECUTE NOW

1. **Assess severity** (60 seconds)
2. **Stabilize** (restore service — rollback, restart, scale, flag off)
3. **Communicate** (acknowledge, update, resolve)
4. **Investigate** (only after service is stable — logs, metrics, timeline)
5. **Permanent fix** (address root cause, add regression test)
6. **Postmortem** (for S1/S2: blameless, specific action items, follow through)

In an incident, calm is a superpower. Stabilize first, investigate second, blame never.
