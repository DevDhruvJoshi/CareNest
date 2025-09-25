#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeHook(hooksDir, name, content) {
  const p = path.join(hooksDir, name);
  fs.writeFileSync(p, content, { encoding: 'utf8' });
  try { fs.chmodSync(p, 0o755); } catch (_) {}
}

function main() {
  const repoRoot = run('git rev-parse --show-toplevel');
  const gitDir = path.join(repoRoot, '.git');
  const hooksDir = path.join(gitDir, 'hooks');
  ensureDir(hooksDir);

  // Install lightweight hooks that run fast and silently, and never block
  const nodePath = process.execPath;

  const shared = `#!/usr/bin/env bash\n"${nodePath}" scripts/auto_sync.js --once --silent >/dev/null 2>&1 || true\n`;

  // Run on: commit-msg, post-commit, post-merge, post-checkout, post-rewrite
  const hookNames = [
    'commit-msg',
    'post-commit',
    'post-merge',
    'post-checkout',
    'post-rewrite'
  ];
  hookNames.forEach(h => writeHook(hooksDir, h, shared));

  // Also configure a background daemon via npm script if desired (not a hook)
  // No-op here; user can run `npm run sync:daemon`.
}

try { main(); } catch (e) { /* ignore */ }


