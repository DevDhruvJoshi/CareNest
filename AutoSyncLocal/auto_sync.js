#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function run(cmd, opts = {}) {
  const timeoutMs = opts.timeout ?? 10_000;
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', timeout: timeoutMs, ...opts }).trim();
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
  try { return run('git rev-parse --show-toplevel'); } catch { return process.cwd(); }
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
    '.git', '.carenest-sync', '.sync-mirror', 'node_modules', '.next', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__',
    '.idea', '.vscode', '.DS_Store', 'Thumbs.db',
    '.terraform', '.gradle', '.cache',
    'tmp', 'temp',
  ]);
  if (excludedTop.has(name)) return true;
  if (parts.includes('node_modules') || parts.includes('dist') || parts.includes('build') || parts.includes('__pycache__') || parts.includes('.next')) return true;
  // Secrets and env files
  const base = parts[parts.length - 1] || '';
  if (base.match(/^\.env(\..*)?$/)) return true;
  if (base.match(/id_rsa|id_ed25519|\.pem|\.key$/)) return true;
  if (base.match(/\.pfx$|\.keystore$|\.jks$/)) return true;
  // Large/binary extensions not useful for review backups
  if (base.match(/\.(zip|7z|rar|gz|tar|bz2|xz|iso|img)$/i)) return true;
  if (base.match(/\.(mp4|mkv|avi|mov|mp3|wav|flac|ogg)$/i)) return true;
  if (base.match(/\.(png|jpg|jpeg|gif|bmp|tiff|psd|ai)$/i)) return true;
  if (base.match(/\.(exe|dll|so|dylib|bin|apk|ipa)$/i)) return true;
  return false;
}

function copyDir(src, dst, repoRoot) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const rel = path.relative(repoRoot, s);
    if (shouldExclude(rel)) continue;
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, repoRoot);
    } else if (entry.isFile()) {
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
  // Single instance locks
  const lockPath = path.join(repoRoot, '.carenest-sync.lock');
  if (fs.existsSync(lockPath)) {
    const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
    if (ageMs < 120_000) return; // another sync is likely running
  }
  try { fs.writeFileSync(lockPath, String(process.pid)); } catch (_) {}
  const userId = getUserId();
  const branchName = `sync/${userId}`;
  const mirrorDir = path.join(repoRoot, '.carenest-sync');

  ensureMirrorClone(mirrorDir, originUrl);
  ensureSyncBranch(mirrorDir, branchName);

  log('Snapshotting workspace to mirror...');
  const mirrorEntries = fs.readdirSync(mirrorDir);
  for (const e of mirrorEntries) {
    if (e === '.git') continue;
    const p = path.join(mirrorDir, e);
    fs.rmSync(p, { recursive: true, force: true });
  }
  copyDir(repoRoot, mirrorDir, repoRoot);

  tryRun(`git -C ${mirrorDir} add -A`);
  const hasDiff = tryRun(`git -C ${mirrorDir} status --porcelain`);
  if (hasDiff) {
    const now = new Date().toISOString();
    const msg = `[sync] ${userId} ${now} [skip ci]`;
    try { run(`git -C ${mirrorDir} commit -m "${msg}"`); } catch {}
    // Push with network-safe timeouts to avoid hangs offline
    const pushOpts = { timeout: 10_000 };
    try { run(`git -C ${mirrorDir} push -u origin ${branchName}`, pushOpts); }
    catch { tryRun(`git -C ${mirrorDir} push -u --force-with-lease origin ${branchName}`, pushOpts); }
  } else {
    log('No changes to sync');
  }
  try { fs.unlinkSync(lockPath); } catch (_) {}
}

function daemonLoop(intervalMs) {
  const tick = () => { try { syncOnce({ silent: true }); } catch (_) {} };
  tick();
  setInterval(tick, intervalMs);
}

function main() {
  const args = new Set(process.argv.slice(2));
  const once = args.has('--once');
  const silent = args.has('--silent');
  const daemon = args.has('--daemon');
  const watch = args.has('--watch');
  const intervalArg = [...args].find(a => a.startsWith('--interval='));
  const intervalMs = intervalArg ? parseInt(intervalArg.split('=')[1], 10) : 60_000;

  if (once) return syncOnce({ silent });
  if (daemon) return daemonLoop(intervalMs);
  if (watch) {
    // Use chokidar for reliable cross-platform watching
    try {
      const chokidar = require('chokidar');
      const repoRoot = getRepoRoot();
      const ignored = (p) => shouldExclude(path.relative(repoRoot, p));
      const watcher = chokidar.watch(repoRoot, {
        ignored,
        ignoreInitial: true,
        persistent: true,
        depth: 99,
        awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 200 }
      });
      let timer = null;
      const trigger = () => {
        clearTimeout(timer);
        timer = setTimeout(() => { try { syncOnce({ silent: true }); } catch (_) {} }, 5000);
      };
      watcher.on('all', trigger);
      if (!silent) console.log('[sync] watch mode started');
    } catch (e) {
      if (!silent) console.log('[sync] chokidar not installed; falling back to 60s daemon');
      return daemonLoop(60000);
    }
    return;
  }
  return syncOnce({ silent });
}

main();


