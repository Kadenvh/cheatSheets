# Dependency Audit Prompt — Security, Updates & Compatibility

You are auditing the project's dependencies for security vulnerabilities, outdated packages, and compatibility risks. Your goal is to produce a clear, prioritized report with specific actions — not just a list of warnings.

---

## 1. SCAN DEPENDENCIES

### Step 1: Inventory

Run the appropriate commands for the ecosystem:

**Node.js:**
```bash
npm ls --depth=0            # Direct dependencies
npm ls --all                # Full dependency tree
npm outdated                # Versions behind
npm audit                   # Security vulnerabilities
```

**Python:**
```bash
pip list                    # Installed packages
pip list --outdated         # Versions behind
pip-audit                   # Security vulnerabilities (install: pip install pip-audit)
safety check                # Alternative security scanner
```

**Go:**
```bash
go list -m all              # All modules
go list -m -u all           # Available updates
govulncheck ./...           # Security vulnerabilities
```

**General:**
```bash
# Check for known vulnerabilities in any ecosystem
# Use the project's lock file for accuracy
```

### Step 2: Categorize Results

For each dependency, record:

| Package | Current | Latest | Type | Vulnerabilities | Update Risk |
|---------|---------|--------|------|-----------------|-------------|
| {name} | {version} | {version} | direct/transitive | {CVE count + severity} | low/medium/high |

---

## 2. SECURITY ASSESSMENT

### Vulnerability Prioritization

| Severity | CVSS Score | Action | Timeline |
|----------|-----------|--------|----------|
| **Critical** | 9.0-10.0 | Fix immediately | Today |
| **High** | 7.0-8.9 | Fix this session | Within 1 week |
| **Medium** | 4.0-6.9 | Plan fix | Within 1 month |
| **Low** | 0.1-3.9 | Track | Next audit cycle |

### For Each Vulnerability

```markdown
### {CVE-ID}: {Title}

**Package:** {name}@{version}
**Severity:** Critical/High/Medium/Low (CVSS {score})
**Affected versions:** {range}
**Fixed in:** {version}
**Exploitability:** {is this exploitable in this project's context?}

**Description:** {what the vulnerability allows}

**Fix:**
- Update to {version}: `npm install {package}@{version}`
- OR: {alternative mitigation if update isn't possible}
- Breaking changes in update: {yes/no — if yes, what}
```

### Context Matters

Not every vulnerability is equally dangerous in every project:
- A server-side vulnerability in a client-only dependency → lower priority
- A prototype pollution CVE in a library you only use for build tooling → lower priority
- A remote code execution in a runtime dependency → highest priority regardless of CVSS

**Always assess: "Is this vulnerability exploitable in how we use this package?"**

---

## 3. UPDATE ASSESSMENT

### Update Categories

| Category | What Changed | Risk | Approach |
|----------|-------------|------|----------|
| **Patch** (1.2.3 → 1.2.4) | Bug fixes only | Low | Update freely |
| **Minor** (1.2.x → 1.3.0) | New features, backward compatible | Low-Medium | Update, run tests |
| **Major** (1.x → 2.0) | Breaking changes | High | Read changelog, plan migration |
| **Multiple majors behind** (1.x → 4.x) | Significant breaking changes | Very High | Dedicated migration session |

### For Each Major Update

```markdown
### {package}: {current} → {target}

**Breaking changes:**
- {list from changelog}

**Migration steps:**
1. {specific step}
2. {specific step}

**Effort estimate:** {hours/days}
**Risk:** {what could break}
**Recommendation:** Update now / Defer to {milestone} / Skip (reason)
```

---

## 4. DEPENDENCY HEALTH CHECK

Beyond security and versions, assess overall dependency health:

### Red Flags

| Signal | What to Check | Risk |
|--------|--------------|------|
| **Abandoned** | No commits in >12 months, unresponded issues | Vulnerabilities won't be patched |
| **Single maintainer** | One person maintaining a critical dependency | Bus factor risk |
| **Excessive transitive deps** | One package pulling in 200+ transitive dependencies | Supply chain risk |
| **Typosquatting risk** | Package name similar to a popular package | Malicious package risk |
| **Unpinned versions** | `*` or `latest` in dependency spec | Non-reproducible builds |
| **Duplicate packages** | Same package at multiple versions in tree | Bundle bloat, potential conflicts |

### Check

```bash
# Node.js: Find duplicate packages
npm ls --all 2>&1 | grep "deduped" | wc -l

# Node.js: Count transitive dependencies
npm ls --all --parseable | wc -l

# Check if a package is maintained
npm info {package} time.modified    # Last publish date
npm info {package} maintainers      # Maintainer count
```

---

## 5. PRODUCE REPORT

```markdown
## Dependency Audit Report

**Project:** {name}
**Date:** {YYYY-MM-DD}
**Direct dependencies:** {count}
**Transitive dependencies:** {count}

### Security Summary
| Severity | Count | Action Required |
|----------|-------|-----------------|
| Critical | {n} | Immediate fix |
| High | {n} | Fix this week |
| Medium | {n} | Plan fix |
| Low | {n} | Track |

### Critical/High Vulnerabilities
{Detailed CVE entries from Section 2}

### Outdated Packages
| Package | Current | Latest | Behind | Risk | Recommendation |
|---------|---------|--------|--------|------|----------------|

### Major Version Updates Available
{Detailed entries from Section 3}

### Health Concerns
{Red flags from Section 4}

### Recommended Actions (Prioritized)
1. {Highest priority — usually critical CVE fix}
2. {Second priority}
3. ...

### Deferred Items
{Items tracked but not actioned this cycle, with rationale}

### Next Audit
Recommended: {date — typically 30/60/90 days based on project activity}
```

---

## 6. RULES

- **Don't update everything at once.** One dependency update at a time, with tests between each. Batch updates make it impossible to isolate breakage.
- **Read the changelog before major updates.** `npm update` is not a strategy. Know what's changing.
- **Lock files are mandatory.** `package-lock.json`, `poetry.lock`, `go.sum` — commit them. Without lock files, builds are non-reproducible.
- **Audit regularly.** Monthly for active projects, quarterly for stable ones. Don't wait for an incident to discover a critical CVE.
- **Context over CVSS.** A Critical-rated CVE that's not exploitable in your usage is less urgent than a Medium-rated CVE that's directly exposed. Always assess exploitability.
- **Track deferred items.** If you decide not to update something, document why and when to revisit. "We'll do it later" without a date means "never."

---

## EXECUTE NOW

1. Scan dependencies (inventory, outdated, audit)
2. Assess security (prioritize vulnerabilities by severity + exploitability)
3. Assess updates (categorize by risk, detail major version changes)
4. Check dependency health (abandoned, single maintainer, typosquatting, duplicates)
5. Produce report with prioritized actions
6. Schedule next audit

Dependencies are your supply chain. Audit them like your production depends on it — because it does.
