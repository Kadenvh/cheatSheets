---
category: Linux
tags: [linux, permissions, security, users, learning]
title: Linux Permissions and Ownership
created: 2026-03-30
type: cheatsheet
difficulty: 4
exercise_hints:
  recall: "octal permission values (r=4, w=2, x=1), chmod/chown/chgrp syntax, special bits (setuid, setgid, sticky)"
  understanding: "how the kernel checks permissions (owner→group→other), why setuid is dangerous, and how umask controls default permissions"
  application: "set up a shared project directory where a group can read/write but others cannot, using setgid for consistent group ownership"
---

# Linux Permissions and Ownership

## Quick Reference
- `ls -la` : Show permissions and ownership // -rwxr-xr-- user group size date name
- `chmod 755 file` : Set octal permissions // rwx=7, r-x=5, r--=4, ---=0
- `chmod u+x file` : Add execute for owner // u=user, g=group, o=others, a=all
- `chmod -R g+rw dir/` : Recursive group read+write // -R applies to all contents
- `chown user:group file` : Change owner and group // -R for recursive
- `chgrp group file` : Change group only // Shorthand for chown :group
- `umask 022` : Default permission mask // Files get 644, dirs get 755
- `umask 077` : Restrictive mask // Files get 600, dirs get 700 (private)
- `chmod u+s file` : Set SUID bit // Runs as file owner regardless of who executes
- `chmod g+s dir/` : Set SGID on directory // New files inherit directory's group
- `chmod +t dir/` : Set sticky bit // Only file owner can delete (used on /tmp)
- `stat -c '%a %U:%G' file` : Show octal + owner:group // Scriptable permission check
- `getfacl file` : Extended ACL permissions // Beyond basic owner/group/other
- `setfacl -m u:ava:rw file` : Grant user-specific access // Fine-grained without changing group
- `id` : Show current user's UID, GID, groups // `id ava` for another user
- `groups ava` : List user's group memberships // Primary + supplementary groups

## Functional Logic
- **Concept:** [[Linux Permissions and Ownership]] // Access control model governing who can read, write, and execute files.
- **Dependency:** [[Linux File System]] // Permissions are stored in inodes. [[Linux CLI Essentials]] for chmod/chown commands.
- **Permission Check Order:** Kernel checks: is user the owner? → check owner bits. In file's group? → group bits. Neither? → other bits. // First match wins — owner permissions apply even if group is more permissive.
- **Octal Math:** r=4, w=2, x=1, sum per role // 750 = rwx (7) + r-x (5) + --- (0). Directories need x (execute) to enter.
- **Directory Execute:** `x` on a directory means "can traverse" // Without x, can't cd into or access files inside, even with r.
- **SUID (4xxx):** Process runs as file owner // `/usr/bin/passwd` is SUID root — lets users change their own password. Security risk if misused.
- **SGID on dirs (2xxx):** Files created inside inherit the directory's group // Essential for shared project directories.
- **Sticky Bit (1xxx):** Only file owner (or root) can delete // `/tmp` has sticky bit — prevents users deleting each other's files.
- **umask:** Subtracts from max permissions (666 files, 777 dirs) // umask 022 → files 644, dirs 755. Set in ~/.bashrc or /etc/profile.
- **ACLs:** When owner/group/other is too coarse // `setfacl` grants per-user or per-group permissions. Filesystem must support it (ext4, xfs do).

## Implementation
```bash
# Shared project directory with SGID
mkdir /srv/project
chown :developers /srv/project
chmod 2775 /srv/project
# New files: inherit 'developers' group, group-writable

# Find all SUID binaries (security audit)
find / -perm -4000 -type f 2>/dev/null | sort

# Find world-writable files (security risk)
find /home -perm -o+w -type f 2>/dev/null

# Set restrictive defaults for a user
echo "umask 077" >> ~/.bashrc  # Private by default

# Grant specific user access without changing groups
setfacl -m u:contractor:rx /srv/project
getfacl /srv/project  # Verify ACL applied

# Recursive fix: dirs 755, files 644 (common web deploy pattern)
find /var/www -type d -exec chmod 755 {} \;
find /var/www -type f -exec chmod 644 {} \;
```

## Sandbox
- Calculate the octal permission for: owner full access, group read+execute, others no access
- Create a shared directory with SGID and verify new files inherit the correct group
- Audit your system for SUID binaries and identify which ones are expected vs suspicious
