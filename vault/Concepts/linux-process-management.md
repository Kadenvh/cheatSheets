---
category: Linux
tags: [linux, processes, signals, systemd, learning]
title: Linux Process Management
created: 2026-03-30
type: cheatsheet
difficulty: 4
exercise_hints:
  recall: "process states (R/S/D/Z/T), signal numbers (SIGTERM 15, SIGKILL 9, SIGHUP 1), PID 1 role, nice values"
  understanding: "how fork/exec creates processes, why zombie processes exist, and how systemd manages service lifecycles"
  application: "use ps, top, kill, nice, and systemctl to find a runaway process, adjust its priority, and configure it as a systemd service"
---

# Linux Process Management

## Quick Reference
- `ps aux` : All processes with details // USER, PID, %CPU, %MEM, COMMAND
- `ps -ef --forest` : Process tree // Shows parent-child relationships
- `top -o %MEM` : Live monitor sorted by memory // Press 'k' to kill, 'r' to renice
- `htop` : Interactive process viewer // F5 tree view, F6 sort, F9 kill
- `kill PID` : Send SIGTERM (15) // Polite — process can cleanup and exit
- `kill -9 PID` : Send SIGKILL (9) // Forced — kernel terminates immediately, no cleanup
- `kill -HUP PID` : Send SIGHUP (1) // Convention: reload config without restart
- `killall name` : Kill by process name // `killall -9 python3`
- `nice -n 10 cmd` : Start with lower priority // Range: -20 (highest) to 19 (lowest)
- `renice -n 5 -p PID` : Change running priority // Only root can decrease nice value
- `nohup cmd &` : Run immune to hangup // Survives terminal close, output to nohup.out
- `jobs` / `bg` / `fg` : Job control // Ctrl+Z suspends, `bg` resumes in background
- `systemctl status svc` : Service status // Active, inactive, failed, loaded
- `systemctl restart svc` : Restart service // stop + start
- `systemctl enable svc` : Start on boot // Creates symlink in multi-user.target
- `journalctl -u svc -f` : Follow service logs // -n 50 for last 50 lines

## Functional Logic
- **Concept:** [[Linux Process Management]] // Creating, monitoring, signaling, and scheduling processes on a Linux system.
- **Dependency:** [[Linux CLI Essentials]] // Process commands are core CLI tools. [[Linux File System]] /proc exposes process state.
- **Fork/Exec Model:** `fork()` clones the parent, `exec()` replaces with new program // Every process except PID 1 (init/systemd) is forked from a parent.
- **Process States:** R (running), S (sleeping/interruptible), D (uninterruptible I/O), Z (zombie), T (stopped) // `D` state processes can't be killed — they're waiting on disk/network.
- **Zombies:** Child exited but parent hasn't read exit status via `wait()` // Harmless individually, but accumulated zombies indicate buggy parent code.
- **Orphans:** Parent exits before child // Orphans are reparented to PID 1 (systemd), which reaps them automatically.
- **Signal Delivery:** Signals are asynchronous notifications to processes // SIGTERM is catchable (graceful), SIGKILL is not (forced). SIGINT = Ctrl+C.
- **Systemd:** PID 1 on modern Linux — manages services, targets, timers // Unit files in /etc/systemd/system/ define service behavior.
- **Cgroups:** Kernel feature for resource limits // systemd uses cgroups to cap CPU, memory, I/O per service. `systemd-cgtop` monitors.
- **Nice vs Priority:** Nice value is user-space hint // Kernel maps nice → priority. IO scheduling is separate (ionice).

## Implementation
```bash
# Find top 5 memory consumers
ps aux --sort=-%mem | head -6

# Find all processes by a user
ps -u ava -o pid,ppid,ni,%cpu,%mem,cmd --sort=-%cpu

# Trace a zombie: find zombie, then its parent
ps aux | awk '$8 ~ /Z/ {print $2, $11}'  # Find zombies
ps -o ppid= -p <ZOMBIE_PID>              # Get parent PID

# Create a simple systemd service
cat << 'EOF' > /etc/systemd/system/myapp.service
[Unit]
Description=My Application
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/myapp/server.js
Restart=on-failure
RestartSec=5
User=ava
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable --now myapp

# Monitor a service in real-time
journalctl -u myapp -f --no-pager
```

## Sandbox
- Write a script that forks a background process, waits for it, and reports its exit code
- Find all zombie processes on your system and trace them to their parent
- Create a systemd timer that runs a cleanup script every 6 hours
