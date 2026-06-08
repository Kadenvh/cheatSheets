# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please do **not** open a public issue. Instead, report it privately via GitHub's [private vulnerability reporting](https://github.com/Kadenvh/cheatSheets/security/advisories/new) feature, or email the maintainer.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce
- Any proof-of-concept code, if applicable
- Your assessment of severity

We will acknowledge the report within 48 hours and work with you on a coordinated disclosure timeline before any public release.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | Yes |
| older tagged releases | No — please upgrade |

## Scope

This repo is in a design phase (see `SPEC.md`); most components are documents, not running code.

In scope:

- The design server (`exploration/design/design-server.py`) — note it is intended for trusted LAN/Tailscale use only and ships no authentication; binding it to an untrusted network is a misconfiguration, not a vulnerability
- The Node.js curriculum-engine product files (`.ava/learning-schema.sql`, `.ava/learning-db.mjs`, `.ava/course-import.mjs`) — stalled but present
- The OpenClaw agent definitions in `knowledge-agents/`

Out of scope:

- Third-party dependencies (report upstream)
- Local misconfiguration (e.g. exposing the design server to an untrusted network, Obsidian setup)
- Anything requiring local filesystem access not otherwise escalated
- `PLANNED`/`SPECULATIVE` components that do not yet exist as code
