#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) { return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim(); }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function writeHook(hooksDir, name, content) { const p = path.join(hooksDir, name); fs.writeFileSync(p, content, 'utf8'); try { fs.chmodSync(p, 0o755); } catch {} }

function main() {
  let root; try { root = run('git rev-parse --show-toplevel'); } catch { return; }
  const hooks = path.join(root, '.git', 'hooks'); ensureDir(hooks);
  const nodePath = process.execPath;
  const shared = `#!/usr/bin/env bash\n"${nodePath}" AutoSyncRepo/auto_sync.js --once --silent >/dev/null 2>&1 || true\n`;
  ;['commit-msg','post-commit','post-merge','post-checkout','post-rewrite'].forEach(h=>writeHook(hooks,h,shared));
}

try { main(); } catch {}


