# spoke-dev — Heartbeat

Run at session start and periodically during long sessions.

## 1. Note Queue

```bash
node .ava/dal.mjs note list && node .ava/dal.mjs note counts
```

**Healthy:** Notes exist and being actively worked. **Concern:** Stale notes > 7 days, or empty queue.
**Action:** Stale → re-evaluate priority. Empty → run self-assessment, look for improvements.

## 2. Brain Health

```bash
node .ava/dal.mjs status && node .ava/dal.mjs verify
```

**Healthy:** Schema current, verify passes (target 7+ PASS).
**Action:** Close abandoned sessions. Review architecture entries for staleness.

## 3. Domain Data Health

<!-- Customize: domain-specific integrity queries -->

```bash
# Example: check for orphaned records, null foreign keys, stale data
sqlite3 {domain db} "SELECT COUNT(*) FROM {table} WHERE {integrity check}"
```

**Healthy:** {what clean looks like}. **Concern:** {what broken looks like}.
**Action:** {how to fix}

## 4. Integration Health

<!-- Customize: external service checks, sync status, API health -->

```bash
curl -s localhost:{port}/health
```

**Healthy:** 200 OK. **Concern:** Timeout or error.
**Action:** Check service status, logs, restart if needed.

## 5. Learning Loop

```bash
node .ava/dal.mjs loop summary
```

**Healthy:** Actions recorded, success rate stable or improving.
**Concern:** Rising failure rate, no actions recorded (agent not tracking work).
**Action:** Review recent failures, adjust approach. If no actions, start recording.

## 6. Self-Assessment

After each work session, answer:
- What notes did I work? What changed?
- Did the target metric improve?
- What should I do differently next time?
- Did I hit any PE friction?

Record as: `node .ava/dal.mjs action record "self-assessment" --type investigation --outcome success|partial`
