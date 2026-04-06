# /ship — Secure Release Pipeline

Execute the full secure commit/push/release pipeline. Read the skill definition at `.claude/skills/ship/SKILL.md` for complete rules.

## Execution Protocol

### Step 0: Parse Arguments
- `--commit` — commit only, skip push
- `--release <version>` — full release flow with version bump
- `--audit` — security scan only, no commit
- `--dry-run` — simulate without executing

### Step 1: Contribution Attribution Policy
Check repo attribution policy:
- **Default (transparency)**: Include `Co-Authored-By` trailer
- **Suppressed (per-repo/client policy)**: Omit public trailer, but ALWAYS record in brain.db
- Internal provenance preserved regardless of public attribution

### Step 2: Security Scan (BLOCKING)

Run these checks against staged files (`git diff --cached --name-only`):

```bash
# 1. Check for staged .env files
git diff --cached --name-only | grep -E '^\.(env|env\..*)$'

# 2. Scan for secrets in staged content
git diff --cached -U0 | grep -iE '(eyJ[A-Za-z0-9_-]{20,}|sk[-_](live|test)[-_]|AKIA[0-9A-Z]{16}|service_role|BEGIN.*PRIVATE)'

# 3. Scan for hardcoded credentials
git diff --cached -U0 | grep -iE '(password\s*[:=]\s*['\''"][^'\''"]+|apiKey\s*[:=]\s*['\''"][^'\''"]+)'

# 4. Check for real email addresses in docs (warn)
git diff --cached -- '*.md' | grep -iE '[a-z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.(com|net|org)'

# 5. npm audit
npm audit --audit-level=high 2>/dev/null
```

If ANY blocking check fails: STOP, report, suggest fix. Do NOT proceed.

### Step 3: Quality Gates

```bash
# TypeScript
npx tsc --noEmit

# Tests
npm test

# Build
npm run build
```

All must pass. If any fail: STOP, report, fix or ask user.

### Step 4: Prepare Commit

1. `git status` — review what's staged
2. `git diff --cached --stat` — summary of changes
3. `git log --oneline -5` — match commit style
4. Draft commit message:
   - Use semantic prefix: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `security:`
   - First line under 72 chars
   - Body explains WHY, not WHAT
5. Check undercover mode for trailer

### Step 5: Commit

```bash
git commit -m "$(cat <<'EOF'
<message>

<trailer if not undercover>
EOF
)"
```

### Step 6: Push (unless --commit)

```bash
git push origin <branch>
```

### Step 7: Release (--release only)

1. Update version in: `package.json`, `src/lib/version.ts`, `CLAUDE.md`, `IMPLEMENTATION_PLAN.md`
2. Update `CHANGELOG.md` with release notes
3. Commit version bump
4. Tag: `git tag -a v<version> -m "Release v<version>"`
5. Push with tags: `git push origin main --follow-tags`
6. Record: `node .ava/dal.mjs action record "release: v<version>" --type deployment --outcome success`

### Step 8: Record

```bash
node .ava/dal.mjs action record "ship: <summary>" --type deployment --outcome success
```

## Failure Protocol

If a security check catches something:
```bash
node .ava/dal.mjs action record "ship: BLOCKED — <reason>" --type deployment --outcome failure
```
Then report to user with exact file, line, and remediation.
