---
name: ship
description: "Secure commit, push, and release pipeline — enforces contribution attribution, secret scanning, security checks, and release checklists before any code leaves the local machine"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - Agent
---

# /ship — Secure Release Pipeline

Comprehensive pre-flight checks before committing, pushing, or releasing code. This skill enforces security, attribution, and quality gates.

## Usage

```
/ship                    # Commit + push with all checks
/ship --commit           # Commit only (no push)
/ship --release v1.2.0   # Full release: version bump, changelog, tag, push
/ship --audit            # Run security checks only (no commit)
/ship --dry-run          # Show what would happen without doing it
```

## What It Does

### Phase 1: Pre-Flight Security Scan
1. **Secret scan** — grep staged files for API keys, tokens, passwords, private keys
2. **Env file check** — verify .env, .env.test, .env.local are NOT staged
3. **Credential check** — scan for hardcoded emails, passwords in staged files
4. **Dependency check** — flag new dependencies added in this commit

### Phase 2: Contribution Attribution Policy
Check repo attribution policy (per-repo, compliance-first, default: transparency):
- **Default**: Include `Co-Authored-By` trailer in commit messages
- **Suppressed**: If repo/client policy requires, omit public attribution but ALWAYS record agent involvement in brain.db
- Internal provenance is always preserved regardless of public attribution

### Phase 3: Quality Gates
1. **TypeScript** — `tsc --noEmit` must pass (if applicable)
2. **Lint** — ESLint must pass on changed files (if applicable)
3. **Tests** — `npm test` must pass (if applicable)
4. **Build** — `npm run build` must succeed (if applicable)
5. **Diff review** — show staged changes summary for confirmation

### Phase 4: Commit
1. Analyze staged changes
2. Draft commit message (semantic: feat/fix/chore/refactor)
3. Apply attribution policy
4. Commit with appropriate trailers

### Phase 5: Push (unless --commit)
1. Verify remote branch exists
2. Push to origin

### Phase 6: Release (--release only)
1. Bump version in package.json and version references
2. Update CLAUDE.md version
3. Update CHANGELOG.md with release notes
4. Create git tag
5. Push with tags
6. Record in brain.db

## Instructions

Read `.claude/.prompts/ship.md` for the full execution protocol.

## Security Rules (Non-Negotiable)

These checks BLOCK the commit if they fail. No override.

### Secrets Patterns
```
eyJ[A-Za-z0-9_-]{20,}          # JWT tokens
sk[-_]live[-_][A-Za-z0-9]{20,}  # Stripe live keys
AKIA[0-9A-Z]{16}                # AWS access keys
service_role                     # Supabase service role references
password\s*[:=]\s*['"][^'"]+    # Hardcoded passwords
private.key|BEGIN.*PRIVATE       # Private key files
```

### Files That Must NEVER Be Committed
```
.env, .env.local, .env.test, .env.production
credentials.json, serviceAccountKey.json
*.pem, *.key (except public keys)
brain.db, .mcp.json
```

## Error Handling

If ANY security check fails:
1. **STOP** — do not commit
2. **REPORT** — show exactly what failed and where
3. **SUGGEST** — provide the fix
4. **RECORD** — `node .ava/dal.mjs action record "ship: BLOCKED — <reason>" --type deployment --outcome failure`
