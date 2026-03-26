---
name: dependency-audit
description: "Audit dependencies for security vulnerabilities, outdated packages, and supply chain risks"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# Dependency Audit — Security, Updates & Compatibility

Audit project dependencies for vulnerabilities, outdated packages, and health risks.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/dependency-audit.md`.

### Protocol
   - Scan dependencies (inventory, outdated, security audit)
   - Assess security (CVEs prioritized by severity + exploitability in context)
   - Assess updates (categorize by risk, detail major version changes)
   - Check dependency health (abandoned, single maintainer, duplicates)
   - Produce prioritized report with specific actions

## Key Rules

- **Context over CVSS.** A Critical CVE that's not exploitable in your usage is less urgent than a Medium one that's directly exposed.
- **One update at a time.** Don't batch dependency updates — isolate changes to isolate breakage.
- **Read changelogs before major updates.** `npm update` is not a strategy.
- **Lock files are mandatory.** Commit them. Non-reproducible builds are a production risk.

## Full Protocol

Detailed steps:

1. **Scan.** Run: `npm ls --depth=0` (inventory), `npm outdated` (versions behind), `npm audit` (vulnerabilities). Adapt commands for Python/Go/Rust.
2. **Security.** For each CVE: severity, affected package+version, fixed version, exploitability in this project's context. Prioritize: Critical → fix today, High → fix this week, Medium → plan, Low → track.
3. **Updates.** Categorize: patch (update freely), minor (update + test), major (read changelog, plan migration, estimate effort).
4. **Health.** Check for: no commits >12 months (abandoned), single maintainer, excessive transitive deps, unpinned versions, duplicates in tree.
5. **Report.** Security summary table → critical/high CVE details → outdated packages table → health concerns → prioritized action list → next audit date (30/60/90 days).
