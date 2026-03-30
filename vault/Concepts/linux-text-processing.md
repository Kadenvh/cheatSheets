---
category: Linux
tags: [linux, text-processing, awk, sed, grep, learning]
title: Linux Text Processing
created: 2026-03-30
type: cheatsheet
difficulty: 5
exercise_hints:
  recall: "grep flags (-rniP), sed substitution syntax (s/old/new/g), awk field syntax ($1, $NF, -F), cut/sort/uniq pipeline"
  understanding: "how awk processes records (lines) and fields (columns), the difference between grep's BRE/ERE/PCRE modes, and when sed beats awk"
  application: "parse a CSV log file to extract the top 10 error types by frequency using a single pipeline of grep, awk, sort, and uniq"
---

# Linux Text Processing

## Quick Reference
- `grep -rn "pattern" dir/` : Recursive search with line numbers // -i case-insensitive, -v invert
- `grep -P "\d{3}-\d{4}"` : Perl-compatible regex // Lookahead, \d, \w, non-greedy
- `grep -c "ERROR" log.txt` : Count matching lines // Not matches — lines containing match
- `grep -l "TODO" *.py` : List files containing match // -L for files NOT matching
- `sed 's/old/new/g' file` : Replace all occurrences // Without g, only first per line
- `sed -n '10,20p' file` : Print lines 10-20 // -n suppresses auto-print
- `sed -i.bak 's/foo/bar/g' file` : In-place edit with backup // .bak creates file.bak
- `sed '/^#/d' config` : Delete comment lines // d command removes matching lines
- `awk '{print $1, $3}' file` : Print columns 1 and 3 // Space-delimited by default
- `awk -F',' '{print $2}' file.csv` : CSV column extraction // -F sets field separator
- `awk '$3 > 100' data.txt` : Filter rows by condition // Print lines where col 3 > 100
- `awk '{sum+=$1} END{print sum}'` : Sum a column // BEGIN/END blocks run once
- `cut -d',' -f2,4 file.csv` : Extract specific CSV columns // -d delimiter, -f fields
- `sort -t',' -k2 -n file` : Sort by column 2 numerically // -r reverse, -u unique
- `uniq -c` : Count consecutive duplicates // Always `sort` first — uniq only collapses adjacent
- `tr 'A-Z' 'a-z'` : Translate characters // Lowercase, `tr -d '\r'` removes carriage returns
- `wc -l file` : Count lines // -w words, -c bytes, -m characters
- `head -20` / `tail -20` : First/last N lines // `tail -f` follows live updates
- `tee output.log` : Split stdout to file and screen // `cmd | tee log | grep ERROR`
- `paste file1 file2` : Merge files column-wise // -d',' for CSV merge

## Functional Logic
- **Concept:** [[Linux Text Processing]] // Transforming, filtering, and analyzing text streams using command-line tools.
- **Dependency:** [[Linux CLI Essentials]] // Pipes and redirection connect text tools. [[Shell Scripting with Bash]] for scripting pipelines.
- **Pipeline Philosophy:** Small tools composed via pipes // `cat log | grep ERROR | awk '{print $4}' | sort | uniq -c | sort -rn`
- **grep Modes:** BRE (default), ERE (-E), PCRE (-P) // ERE adds +, ?, |, () without escaping. PCRE adds \d, lookahead, non-greedy.
- **sed Model:** Stream editor — reads line, applies commands, outputs // Doesn't load whole file into memory. Two buffers: pattern space, hold space.
- **awk Model:** Record-oriented — splits input into records (lines) and fields (columns) // `$0` = whole line, `$1` = first field, `$NF` = last field, `NR` = record number.
- **awk Programs:** `pattern { action }` // Pattern selects lines, action processes them. Multiple rules applied in order.
- **Sort Stability:** `sort` is stable — equal elements keep original order // `-k2,2 -k1,1n` sorts by col 2 alpha, then col 1 numeric.
- **uniq Gotcha:** Only deduplicates adjacent lines // Always pipe through `sort` first: `sort | uniq -c`

## Implementation
```bash
# Top 10 IPs from Apache access log
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Extract and sum request times from JSON-ish logs
grep '"duration":' app.log | grep -oP '"duration":\K[\d.]+' | \
  awk '{sum+=$1; n++} END{printf "avg: %.2fms (n=%d)\n", sum/n, n}'

# Convert CSV to TSV, skip header
tail -n +2 data.csv | tr ',' '\t' > data.tsv

# Find lines in file1 not in file2 (set difference)
comm -23 <(sort file1.txt) <(sort file2.txt)

# Multi-column report from /etc/passwd
awk -F: '$3 >= 1000 {printf "%-20s UID:%-6s %s\n", $1, $3, $6}' /etc/passwd
```

## Sandbox
- Parse /etc/passwd to list all human users (UID >= 1000) with their home directories
- Write a one-liner that finds the 5 most common words in a text file
- Use sed to strip all HTML tags from a downloaded web page
