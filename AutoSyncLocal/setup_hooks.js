#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) { return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim(); }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function writeHook(hooksDir, name, content) {
  const p = path.join(hooksDir, name);
  fs.writeFileSync(p, content, { encoding: 'utf8' });
  try { fs.chmodSync(p, 0o755); } catch (_) {}
}

function main() {
  let repoRoot;
  try { repoRoot = run('git rev-parse --show-toplevel'); } catch { return; }
  const gitDir = path.join(repoRoot, '.git');
  const hooksDir = path.join(gitDir, 'hooks');
  ensureDir(hooksDir);

  const nodePath = process.execPath;
  const shared = `#!/usr/bin/env bash\n"${nodePath}" AutoSyncLocal/auto_sync.js --once --silent >/dev/null 2>&1 || true\n`;

  const hookNames = ['commit-msg', 'post-commit', 'post-merge', 'post-checkout', 'post-rewrite'];
  hookNames.forEach(h => writeHook(hooksDir, h, shared));
}

try { main(); } catch (_) {}


