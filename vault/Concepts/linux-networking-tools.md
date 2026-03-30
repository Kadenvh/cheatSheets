---
category: Linux
tags: [linux, networking, diagnostics, firewall, learning]
title: Linux Networking Tools
created: 2026-03-30
type: cheatsheet
difficulty: 5
exercise_hints:
  recall: "ip addr, ss, ping, traceroute, dig, curl, netstat, iptables/nftables, /etc/hosts, /etc/resolv.conf"
  understanding: "how DNS resolution works (resolver → cache → recursive → authoritative), how iptables chains process packets, and the difference between ss and netstat"
  application: "diagnose a connectivity issue using ping, traceroute, dig, and ss to identify whether the problem is DNS, routing, or a closed port"
---

# Linux Networking Tools

## Quick Reference
- `ip addr` : Show interfaces and IPs // Replaces ifconfig. `ip -br a` for brief output
- `ip route` : Show routing table // `ip route get 8.8.8.8` traces path to destination
- `ss -tlnp` : List listening TCP ports with PIDs // Replaces netstat. -u for UDP
- `ss -s` : Socket statistics summary // Established, closed, orphaned connections
- `ping -c 4 host` : Test connectivity // -c limits count, -i interval, -W timeout
- `traceroute host` : Show network path // `mtr host` for live continuous trace
- `dig domain` : DNS lookup // `dig +short domain A` for just the IP
- `dig @8.8.8.8 domain` : Query specific DNS server // Bypass local resolver
- `nslookup domain` : Simple DNS query // `dig` is more powerful but nslookup is quicker
- `host domain` : Quick DNS resolution // Simplest DNS tool
- `curl -sS url` : HTTP request // -I headers only, -X POST, -d data, -H header
- `wget -q url -O file` : Download file // -r recursive, --mirror for site copy
- `nc -zv host port` : Test if port is open // -z scan mode, -v verbose
- `nmap -sT host` : Port scan // -sV version detection, -O OS detection (needs root)
- `tcpdump -i eth0 port 80` : Packet capture // -w file.pcap to save, -n no DNS resolution
- `iptables -L -n` : List firewall rules // -t nat for NAT table, -v for verbose
- `ufw status` : Simple firewall status // `ufw allow 22/tcp`, `ufw deny 3306`
- `/etc/hosts` : Local DNS overrides // Checked before DNS server
- `/etc/resolv.conf` : DNS server configuration // `nameserver 8.8.8.8`
- `resolvectl status` : systemd-resolved DNS config // Shows per-interface DNS servers

## Functional Logic
- **Concept:** [[Linux Networking Tools]] // Command-line tools for network configuration, diagnostics, and security on Linux.
- **Dependency:** [[Networking Basics]] // IP, DNS, TCP/UDP concepts. [[TCP/IP]] for protocol stack. [[Linux CLI Essentials]] for piping output.
- **DNS Resolution Order:** /etc/hosts → NSS config → systemd-resolved cache → configured nameserver → recursive resolution // `nsswitch.conf` controls the order.
- **ss vs netstat:** `ss` reads directly from kernel socket tables (fast) // `netstat` parses /proc/net (slower, deprecated). Same flags mostly compatible.
- **iptables Chains:** PREROUTING → INPUT (incoming), FORWARD (routed), OUTPUT (outgoing) → POSTROUTING // Rules evaluated top-down, first match wins.
- **Connection States:** NEW, ESTABLISHED, RELATED, INVALID // Stateful firewall tracks connections: `iptables -A INPUT -m state --state ESTABLISHED -j ACCEPT`
- **MTU and Fragmentation:** Default MTU 1500 bytes // `ping -M do -s 1472 host` tests path MTU. Mismatched MTU causes mysterious drops.
- **Ephemeral Ports:** Client connections use ports 32768-60999 (sysctl configurable) // `ss -tn` shows source ports in this range.
- **Network Namespaces:** Containers use separate network stacks // `ip netns` manages them. Each namespace has its own interfaces, routes, iptables.

## Implementation
```bash
# Diagnose connectivity issue (systematic approach)
ping -c 2 8.8.8.8          # Layer 3: IP connectivity?
ping -c 2 google.com        # DNS resolution working?
dig google.com               # DNS details
traceroute google.com        # Where does it break?
ss -tlnp | grep :443        # Is the local service listening?

# Find what's using port 8080
ss -tlnp | grep :8080
# Or with more detail
lsof -i :8080

# Capture HTTP traffic for debugging
tcpdump -i any -A -s0 'port 80 and host 10.0.0.5' -c 100

# Basic firewall setup with ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Test connectivity to a specific port
nc -zv database.local 5432 2>&1 | grep -q succeeded && echo "DB reachable" || echo "DB unreachable"
```

## Sandbox
- Diagnose why a web server isn't reachable: is it DNS, routing, firewall, or the service itself?
- Use ss and tcpdump to observe a TCP three-way handshake in real-time
- Set up ufw rules that allow SSH and HTTP but block everything else, then verify with nmap
