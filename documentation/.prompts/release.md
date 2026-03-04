# Release Prompt — Versioning, Changelog & Deployment

You are a release engineer preparing a project for deployment. Your goal is to produce a clean, verified, documented release that can be deployed confidently and rolled back safely.

---

## 1. DETERMINE RELEASE TYPE

| Type | When | What's Involved |
|------|------|-----------------|
| **Standard Release** | Regular feature/bugfix cycle | Version bump, changelog, deploy, verify |
| **Hotfix Release** | Production bug needs immediate fix | Branch from production, fix, fast-track release |
| **Pre-release** | Testing a release candidate before full rollout | Tagged version (e.g., v2.1.0-rc.1), limited deployment |

If the type isn't specified, default to Standard Release.

---

## 2. PRE-RELEASE CHECKLIST

Complete every item before proceeding. A failed pre-check is cheaper than a failed deployment.

### Code Readiness

- [ ] All planned features/fixes are merged
- [ ] No open PRs blocking this release
- [ ] All tests pass: `{test runner command}`
- [ ] No lint errors: `{lint command}`
- [ ] No type errors (if TypeScript): `npx tsc --noEmit`
- [ ] Test coverage meets targets (check against project thresholds)

### Documentation Readiness

- [ ] CLAUDE.md version header will be updated (don't update yet — wait for version decision)
- [ ] IMPLEMENTATION_PLAN.md reflects current state (all completed tasks marked `[x]`)
- [ ] PROJECT_ROADMAP.md ready for version history entry (if milestone)
- [ ] No stale references to removed/renamed features in any doc
- [ ] README.md is current (if public-facing)

### Dependency Check

- [ ] `npm audit` (or equivalent) shows no critical vulnerabilities
- [ ] All dependencies are at intended versions
- [ ] Lock file is committed and up to date
- [ ] No dependency version conflicts or peer dependency warnings

### Environment Readiness

- [ ] Environment variables documented and present in target environment
- [ ] Database migrations (if any) are ready and tested
- [ ] External service dependencies are available (APIs, databases, CDNs)
- [ ] Deployment target is accessible (SSH, cloud platform, etc.)

---

## 3. DETERMINE VERSION

Follow semantic versioning (semver):

| This Release Contains... | Increment | Example |
|--------------------------|-----------|---------|
| Bug fixes only, no behavior changes | **Patch** | 1.2.3 → 1.2.4 |
| New features, backward-compatible | **Minor** | 1.2.x → 1.3.0 |
| Breaking changes, major refactors | **Major** | 1.x.x → 2.0.0 |

### Edge Cases

- Adding a deprecation notice → **Minor** (not breaking yet)
- Removing a deprecated feature → **Major** (breaking)
- Performance improvement with no API change → **Patch**
- Internal refactor with no external behavior change → **Patch**
- Adding a required configuration field → **Major** (breaking for existing users)

**New Version:** ___________

---

## 4. GENERATE CHANGELOG

### Collect Changes

Review all commits since the last release:

```bash
git log v{previous}..HEAD --oneline
```

### Categorize Changes

Group by type using [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [{version}] — {YYYY-MM-DD}

### Added
- {new features, capabilities, files}

### Changed
- {modifications to existing functionality}

### Deprecated
- {features that will be removed in future versions}

### Removed
- {features removed in this version}

### Fixed
- {bug fixes}

### Security
- {vulnerability fixes}
```

### Changelog Rules

- Write for the **user**, not the developer. "Fixed login timeout on slow connections" not "Patched race condition in auth middleware."
- One line per change. Link to issue/PR if available.
- Order by impact within each category (most important first).
- Skip internal-only changes (refactors, CI tweaks) unless they affect behavior.
- If the changelog would be empty, question whether a release is needed.

---

## 5. EXECUTE RELEASE

### Step 1: Update Version References

- [ ] `package.json` version (if Node.js): `npm version {patch|minor|major} --no-git-tag-version`
- [ ] CLAUDE.md version header
- [ ] PROJECT_ROADMAP.md version history table
- [ ] IMPLEMENTATION_PLAN.md version header
- [ ] Any other version constants in the codebase

### Step 2: Update Changelog

- [ ] Add new version entry to CHANGELOG.md (or project equivalent)
- [ ] Verify previous entries are unchanged

### Step 3: Commit Release

```bash
git add -A
git commit -m "release: v{version}"
git tag -a v{version} -m "v{version}: {one-line summary}"
```

### Step 4: Build & Deploy

Follow the project's deploy process (see `/deploy` skill if available):

1. **Build:** `{build command}`
2. **Deploy:** `{deploy command}`
3. **Smoke test:** `{health check command}`

### Step 5: Push

```bash
git push origin main
git push origin v{version}
```

---

## 6. POST-RELEASE VERIFICATION

### Immediate (within 5 minutes)

- [ ] Service is running (health check passes)
- [ ] Key user flows work (login, core feature, API endpoint)
- [ ] No new errors in logs
- [ ] Version reported by the service matches the release

### Short-term (within 1 hour)

- [ ] No elevated error rates
- [ ] Performance metrics are stable
- [ ] No user reports of issues

---

## 7. ROLLBACK PLAN

Every release needs a rollback plan **before** deploying. Define it now.

### Quick Rollback (< 5 minutes)

```bash
# Option A: Revert to previous version
git revert HEAD
git push origin main
{deploy command}

# Option B: Deploy previous tag
git checkout v{previous_version}
{build command}
{deploy command}
git checkout main
```

### When to Rollback

- S1/S2 bug discovered in production
- Error rate spikes above baseline
- Key user flow is broken
- Data integrity issue

### When NOT to Rollback

- Minor cosmetic issue (fix forward)
- Issue affecting <1% of users with known workaround (fix forward)
- Issue already present before this release (not a regression)

---

## 8. HOTFIX PROCESS

For production bugs that can't wait for the next regular release:

1. **Branch from the release tag:** `git checkout -b hotfix/v{version} v{current_version}`
2. **Fix the bug.** Smallest possible change. Add regression test.
3. **Test thoroughly.** The fix must not introduce new issues.
4. **Version as patch:** v1.2.3 → v1.2.4
5. **Follow Steps 4-6 above** (build, deploy, verify)
6. **Merge back to main:** `git checkout main && git merge hotfix/v{version}`

---

## 9. RULES

- **Never deploy on Friday** (unless it's a hotfix for a production outage). Monday-you will thank Friday-you.
- **Never skip the pre-release checklist.** The one time you skip it is the time something breaks.
- **Always have a rollback plan.** If you can't roll back, you're not ready to deploy.
- **Tag every release.** Tags are your time machine. Without them, rollback requires archaeology.
- **Don't batch too many changes.** Smaller, more frequent releases are safer than big-bang deployments. If the changelog is more than a page, consider splitting.
- **Communicate.** If the release affects users, tell them. Release notes, status page, notification — whatever's appropriate.

---

## EXECUTE NOW

1. Determine release type (standard / hotfix / pre-release)
2. Run pre-release checklist — stop if anything fails
3. Determine version (semver)
4. Generate changelog
5. Execute release (version bump, commit, tag, build, deploy, push)
6. Post-release verification
7. Document the rollback plan (even if you don't need it)

Ship confidently, roll back quickly, learn from every release.
