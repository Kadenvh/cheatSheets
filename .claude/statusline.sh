#!/usr/bin/env node
// PE Template StatusLine — model, context %, cost, DAL state, git branch
// Receives JSON session data via stdin

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name || '?';
    const pct = Math.round(data.context_window?.used_percentage || 0);
    const cost = (data.cost?.total_cost_usd || 0).toFixed(2);
    const projectDir = data.workspace?.project_dir || data.cwd || '.';

    // Color based on context usage
    const clr = pct >= 80 ? '\x1b[31m' : pct >= 50 ? '\x1b[33m' : '\x1b[32m';
    const rst = '\x1b[0m';

    // DAL notes count (cached 30s)
    let dalInfo = '';
    const brainDb = path.join(projectDir, '.ava', 'brain.db');
    if (fs.existsSync(brainDb)) {
      const cacheKey = Buffer.from(projectDir).toString('base64').slice(0, 16);
      const cacheFile = path.join(require('os').tmpdir(), `sl-dal-${cacheKey}`);
      let notes = '?';
      try {
        const stat = fs.statSync(cacheFile);
        if (Date.now() - stat.mtimeMs < 30000) {
          notes = fs.readFileSync(cacheFile, 'utf8').trim();
        } else { throw 0; }
      } catch {
        try {
          const out = execSync(`node "${path.join(projectDir, '.ava', 'dal.mjs')}" status`, {
            cwd: projectDir, encoding: 'utf8', timeout: 5000
          });
          const m = out.match(/Notes:\s+(\d+)\s+open/);
          notes = m ? m[1] : '0';
          fs.writeFileSync(cacheFile, notes);
        } catch { notes = '?'; }
      }
      dalInfo = ` | ${notes}n`;
    }

    // Git branch (cached 5s)
    let gitInfo = '';
    const gitCacheKey = Buffer.from(projectDir).toString('base64').slice(0, 16);
    const gitCache = path.join(require('os').tmpdir(), `sl-git-${gitCacheKey}`);
    let branch = '';
    try {
      const stat = fs.statSync(gitCache);
      if (Date.now() - stat.mtimeMs < 5000) {
        branch = fs.readFileSync(gitCache, 'utf8').trim();
      } else { throw 0; }
    } catch {
      try {
        branch = execSync('git branch --show-current', {
          cwd: projectDir, encoding: 'utf8', timeout: 3000
        }).trim();
        fs.writeFileSync(gitCache, branch);
      } catch { branch = ''; }
    }
    if (branch) gitInfo = ` ${branch}`;

    process.stdout.write(`[${model}] ${clr}${pct}%${rst} | $${cost}${dalInfo}${gitInfo}\n`);
  } catch {
    process.stdout.write('[statusline error]\n');
  }
});
