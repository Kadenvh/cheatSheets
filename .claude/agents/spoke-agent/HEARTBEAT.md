# {Domain Name} — Heartbeat

Run at session start and periodically during long sessions.

<!--
Every check should be:
1. A runnable command (not prose)
2. A clear healthy/concern threshold
3. A concrete action when unhealthy
Reference: Ava_Main/2 - 3D_Printing/HEARTBEAT.md
-->

## 1. {Primary Domain Metric}

```bash
# {command that checks the key metric for this domain}
```

**Healthy:** {threshold}. **Concern:** {threshold}.
**Action:** {what to do when unhealthy}

## 2. {Integration/Sync Health}

```bash
# {command that checks external integrations}
```

**Healthy:** {threshold}. **Concern:** {threshold}.
**Action:** {what to do}

## 3. Note Queue

```bash
cd "{spoke path}" && node .ava/dal.mjs note list && node .ava/dal.mjs note counts
```

**Healthy:** Notes exist and being actively worked. **Concern:** Stale notes > 7 days, or empty queue.
**Action:** Stale → re-evaluate. Empty → run self-assessment, look for improvements.

## 4. Data Health

```bash
# {domain-specific data integrity queries}
```

**Healthy:** {what clean looks like}. **Concern:** {what broken looks like}.
**Action:** {how to fix}

## 5. Brain Health

```bash
cd "{spoke path}" && node .ava/dal.mjs status && node .ava/dal.mjs verify
```

**Healthy:** Schema current, verify passes.
**Action:** Close abandoned sessions. Review architecture entries for staleness.

## 6. Self-Assessment

After each work session, answer:
- What notes did I work? What code changed?
- Did the target metric improve?
- What should I do differently next time?
- Did I hit any PE friction? (Record as `pe.friction.*` fact)

Record as: `node .ava/dal.mjs action record "self-assessment summary" --type investigation --outcome success`
