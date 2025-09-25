#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
}

function tryRun(cmd, opts = {}) {
  try { return run(cmd, opts); } catch (e) { return ''; }
}

function log(...args) {
  if (!global.__silent) console.log('[sync]', ...args);
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getUserId() {
  const envUser = process.env.USER || process.env.USERNAME || process.env.LOGNAME;
  const hostname = os.hostname();
  return `${slugify(envUser || 'user')}-${slugify(hostname || 'host')}`;
}

function getRepoRoot() {
  const cwd = process.cwd();
  const dotgit = path.join(cwd, '.git');
  if (fs.existsSync(dotgit)) return cwd;
  // fallback to git rev-parse
  try { return run('git rev-parse --show-toplevel'); } catch { return cwd; }
}

function getOriginUrl() {
  const url = tryRun('git config --get remote.origin.url');
  return url;
}

function ensureMirrorClone(mirrorDir, originUrl) {
  if (!fs.existsSync(mirrorDir)) {
    fs.mkdirSync(mirrorDir, { recursive: true });
    run(`git clone ${originUrl} ${mirrorDir}`);
  }
}

function ensureSyncBranch(mirrorDir, branchName) {
  // fetch and create/switch branch
  tryRun(`git -C ${mirrorDir} fetch origin`);
  const branches = tryRun(`git -C ${mirrorDir} branch --list ${branchName}`);
  const remotes = tryRun(`git -C ${mirrorDir} branch -r --list origin/${branchName}`);
  if (!branches) {
    if (remotes) {
      run(`git -C ${mirrorDir} checkout -B ${branchName} origin/${branchName}`);
    } else {
      run(`git -C ${mirrorDir} checkout -B ${branchName}`);
      tryRun(`git -C ${mirrorDir} push -u origin ${branchName}`);
    }
  } else {
    run(`git -C ${mirrorDir} checkout ${branchName}`);
  }
}

function shouldExclude(relPath) {
  const parts = relPath.split(/\\|\//g);
  const name = parts[0];
  const excludedTop = new Set([
    '.git',
    '.carenest-sync',
    '.sync-mirror',
    'node_modules',
    '.next',
    'dist',
    'build',
    'coverage',
    '.venv',
    'venv',
    '__pycache__'
  ]);
  if (excludedTop.has(name)) return true;
  // nested node_modules and dist
  if (parts.includes('node_modules') || parts.includes('dist') || parts.includes('build') || parts.includes('__pycache__') || parts.includes('.next')) return true;
  return false;
}

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const rel = path.relative(process.cwd(), s);
    if (shouldExclude(rel)) continue;
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      // ensure parent
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function syncOnce({ silent = false } = {}) {
  global.__silent = silent;
  const repoRoot = getRepoRoot();
  const originUrl = getOriginUrl();
  if (!originUrl) {
    log('No origin remote found. Skipping.');
    return;
  }
  const userId = getUserId();
  const branchName = `sync/${userId}`;
  const mirrorDir = path.join(repoRoot, '.carenest-sync');

  ensureMirrorClone(mirrorDir, originUrl);
  ensureSyncBranch(mirrorDir, branchName);

  // Copy files (snapshot) to mirror working tree
  log('Snapshotting workspace to mirror...');
  // Clean mirror except .git
  const mirrorEntries = fs.readdirSync(mirrorDir);
  for (const e of mirrorEntries) {
    if (e === '.git') continue;
    const p = path.join(mirrorDir, e);
    fs.rmSync(p, { recursive: true, force: true });
  }
  copyDir(repoRoot, mirrorDir);

  // Commit and push
  tryRun(`git -C ${mirrorDir} add -A`);
  const hasDiff = tryRun(`git -C ${mirrorDir} status --porcelain`);
  if (hasDiff) {
    const now = new Date().toISOString();
    const msg = `[sync] ${userId} ${now} [skip ci]`;
    try {
      run(`git -C ${mirrorDir} commit -m "${msg}"`);
    } catch (e) {
      // no-op if nothing to commit
    }
    try {
      run(`git -C ${mirrorDir} push -u origin ${branchName}`);
      log('Pushed', branchName);
    } catch (e) {
      // retry with force-with-lease if diverged
      tryRun(`git -C ${mirrorDir} push -u --force-with-lease origin ${branchName}`);
    }
  } else {
    log('No changes to sync');
  }
}

function daemonLoop(intervalMs) {
  const tick = () => {
    try { syncOnce({ silent: true }); } catch (_) {}
  };
  tick();
  setInterval(tick, intervalMs);
}

function main() {
  const args = new Set(process.argv.slice(2));
  const once = args.has('--once');
  const silent = args.has('--silent');
  const daemon = args.has('--daemon');
  const intervalArg = [...args].find(a => a.startsWith('--interval='));
  const intervalMs = intervalArg ? parseInt(intervalArg.split('=')[1], 10) : 60_000;

  if (once) return syncOnce({ silent });
  if (daemon) {
    if (!silent) console.log('[sync] daemon started');
    return daemonLoop(intervalMs);
  }
  // default: single run
  return syncOnce({ silent });
}

main();


