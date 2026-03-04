# Knowledge/Tools

CLI tool usage, configuration, installation guides, and setup documentation for specific software tools.

## Category Definition

A note belongs in **Tools/** if it covers:
- CLI tool usage and commands (git, docker, kubectl, obsidian-cli)
- Software installation and setup
- Configuration guides
- Troubleshooting and debugging tools
- Development environment setup

## Typical Contents

- Command-line tool reference
- Installation procedures
- Configuration files and settings
- Setup guides for development tools
- Troubleshooting common issues
- Tool-specific tips and tricks

## Example Notes

- **git_commands.md** - Common git operations and workflows
- **docker_basics.md** - Docker CLI usage and container management
- **obsidian_cli_setup.md** - Installing and configuring obsidian-cli
- **vscode_setup.md** - Editor configuration and extensions

## Distinction from Automation

**Tools/** focuses on **using specific tools**, while **Automation/** focuses on **orchestrating workflows**.

Example:
```
✓ Tools/   "How to install Docker via Scoop"
✗ Automation/   (not a workflow)

✗ Tools/   "Docker-based CI/CD pipeline"
✓ Automation/   (workflow orchestration)

✓ Tools/   "kubectl commands reference"
✗ Automation/   (just tool usage)

✗ Tools/   "Kubernetes deployment automation"
✓ Automation/   (automated process)
```

## Future Structure (Planned)

When this category exceeds 20 notes, consider subcategories:
- `Tools/CLI/` - Command-line tools (git, docker, kubectl)
- `Tools/Config/` - Configuration and setup guides
- `Tools/Development/` - IDE, editor, development environment
