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

In scope:

- The Node.js curriculum engine (`.ava/learning-schema.sql`, `.ava/learning-db.mjs`, `.ava/curriculum-export.mjs`)
- The vault sync pipeline and related content handling
- The OpenClaw agent definitions in `knowledge-agents/`

Out of scope:

- Third-party dependencies (report upstream)
- Local misconfiguration of Obsidian or ChromaDB
- Issues that require local filesystem access that is not otherwise escalated
