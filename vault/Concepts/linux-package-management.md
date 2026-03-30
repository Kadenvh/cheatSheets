---
category: Linux
tags: [linux, packages, apt, dnf, system-administration, learning]
title: Linux Package Management
created: 2026-03-30
type: cheatsheet
difficulty: 3
exercise_hints:
  recall: "apt vs dnf commands, repository structure, dependency resolution, dpkg/rpm for low-level ops, snap/flatpak for sandboxed"
  understanding: "how dependency resolution prevents broken installs, why apt update and apt upgrade are separate steps, and the tradeoffs between distro packages and universal formats"
  application: "add a third-party repository, install a package, pin its version to prevent upgrades, then remove it cleanly with config files"
---

# Linux Package Management

## Quick Reference
- `apt update` : Refresh package index // Must run before install/upgrade
- `apt upgrade` : Upgrade all installed packages // `apt full-upgrade` handles dependency changes
- `apt install pkg` : Install package // -y auto-confirm, --no-install-recommends minimal
- `apt remove pkg` : Remove package (keep config) // `apt purge pkg` removes config too
- `apt search term` : Search package names and descriptions // `apt list --installed` for installed
- `apt show pkg` : Package details // Version, dependencies, size, description
- `apt autoremove` : Remove unused dependencies // Clean up orphaned packages
- `dpkg -i pkg.deb` : Install local .deb file // Low-level, doesn't resolve dependencies
- `dpkg -l | grep pkg` : List installed matching pattern // `dpkg -L pkg` lists installed files
- `dnf install pkg` : Install (Fedora/RHEL) // `yum` is the older equivalent
- `dnf search term` : Search packages // `dnf info pkg` for details
- `dnf update` : Upgrade all packages // Combined update+upgrade in dnf
- `rpm -qa | grep pkg` : List installed RPMs // `rpm -ql pkg` lists files
- `snap install pkg` : Install sandboxed snap // `snap list`, `snap remove pkg`
- `flatpak install app` : Install sandboxed Flatpak // Flathub is the main repository
- `apt-mark hold pkg` : Pin version // Prevents upgrades. `apt-mark unhold pkg` to release
- `add-apt-repository ppa:user/repo` : Add PPA (Ubuntu) // Third-party package source

## Functional Logic
- **Concept:** [[Linux Package Management]] // Installing, updating, removing, and auditing software packages on Linux distributions.
- **Dependency:** [[Linux File System]] // Packages install files across the FHS tree. [[Linux CLI Essentials]] for running package commands.
- **Repository Model:** Packages live in remote repos // `apt update` downloads the index (what's available), `apt upgrade` downloads+installs newer versions.
- **Dependency Resolution:** Package managers resolve the dependency tree automatically // apt/dnf calculate what else needs installing/removing to satisfy requirements.
- **dpkg vs apt:** dpkg is low-level (install single .deb, no deps) // apt is high-level (resolves deps, manages repos). Same relationship as rpm vs dnf.
- **Package Naming:** `name_version-release_arch.deb` // `nginx_1.24.0-1_amd64.deb`. Version comparison follows semantic rules.
- **Security Updates:** Repos are GPG-signed // `apt-key` (deprecated) or `/etc/apt/trusted.gpg.d/` stores trusted keys. Never add untrusted repos.
- **Universal Formats:** Snap (Canonical) and Flatpak (Red Hat) sandbox apps // Larger than native packages but distro-independent and auto-updating.
- **Version Pinning:** `apt-mark hold` or `/etc/apt/preferences.d/` for priority-based pinning // Prevents critical packages from upgrading unexpectedly.
- **Cleanup:** `apt autoremove` cleans orphaned deps, `apt clean` clears download cache // Keeps /var/cache/apt/ from growing unbounded.

## Implementation
```bash
# Full system update (Debian/Ubuntu)
apt update && apt upgrade -y && apt autoremove -y

# Install from a third-party repo
curl -fsSL https://example.com/gpg.key | gpg --dearmor -o /etc/apt/trusted.gpg.d/example.gpg
echo "deb https://example.com/repo stable main" > /etc/apt/sources.list.d/example.list
apt update && apt install example-pkg

# Pin a package to prevent upgrade
apt-mark hold postgresql-16
apt-mark showhold  # Verify it's pinned

# Find which package owns a file
dpkg -S /usr/bin/curl  # Debian: curl
rpm -qf /usr/bin/curl  # RHEL: curl

# List packages sorted by installed size
dpkg-query -W --showformat='${Installed-Size}\t${Package}\n' | sort -rn | head -20

# Clean up disk space
apt clean          # Remove cached .deb files
apt autoremove -y  # Remove orphaned dependencies
```

## Sandbox
- Compare the output of `apt list --installed` count vs `dpkg -l` count — why might they differ?
- Add a PPA, install a package from it, then cleanly remove both the package and the PPA
- Use `apt-mark hold` to pin your kernel version, verify with `apt upgrade --dry-run`, then unhold
