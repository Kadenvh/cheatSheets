---
name: release
description: "Prepare and execute a versioned release with changelog, deployment, and rollback plan"
disable-model-invocation: true
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Release — Versioning, Changelog & Deployment

Prepare, execute, and verify a project release.

## Instructions

1. Read the full release template at `.prompts/release.md` (relative to the project's `documentation/` folder).
2. Follow its protocol:
   - Determine release type (standard / hotfix / pre-release)
   - Run pre-release checklist (tests, docs, deps, environment)
   - Determine version (semver)
   - Generate changelog (Keep a Changelog format)
   - Execute: version bump → commit → tag → build → deploy → push
   - Post-release verification
   - Document rollback plan

## Key Rules

- **Never skip the pre-release checklist.** The one time you skip it is the time something breaks.
- **Always have a rollback plan** defined before deploying.
- **Tag every release.** Tags are your time machine.
- **Communicate** to affected users if the release changes behavior.

## Inline Fallback (if prompt file not found)

If `.prompts/release.md` cannot be located:

1. **Pre-check.** Verify: all tests pass, no lint/type errors, `npm audit` clean, docs current, environment ready.
2. **Version.** Bug fixes only → patch. New features → minor. Breaking changes → major.
3. **Changelog.** `git log v{prev}..HEAD --oneline`, group by Added/Changed/Fixed/Removed. Write for users, not developers.
4. **Execute.** Update version in package.json + all docs. `git commit -m "release: v{version}"`. `git tag -a v{version}`. Build, deploy, push.
5. **Verify.** Health check passes, key flows work, no new errors in logs, version matches.
6. **Rollback plan.** Document: `git revert HEAD && {deploy}` or deploy previous tag. Define when to rollback (S1/S2 bugs, error spike) vs fix forward (cosmetic, <1% impact).
