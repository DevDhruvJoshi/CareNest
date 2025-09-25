#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function repoRoot() { try { return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim(); } catch { return process.cwd(); } }

function runOnce() {
  const p = spawn(process.execPath, [path.join('AutoSyncRepo', 'auto_sync.js'), '--once'], { stdio: 'inherit', cwd: repoRoot() });
  p.on('exit', code => process.exit(code ?? 0));
}

function start(mode) {
  const args = [path.join('AutoSyncRepo', 'auto_sync.js')];
  if (mode === 'watch') args.push('--watch', '--silent'); else args.push('--daemon', '--interval=60000', '--silent');
  const child = spawn(process.execPath, args, { cwd: repoRoot(), detached: true, stdio: 'ignore' });
  child.unref();
  const pidFile = path.join(repoRoot(), '.autosync-repo.pid');
  try { fs.writeFileSync(pidFile, String(child.pid), 'utf8'); } catch {}
  console.log(`joshi: started ${mode} with PID ${child.pid}`);
}

function stop() {
  const pidFile = path.join(repoRoot(), '.autosync-repo.pid');
  if (!fs.existsSync(pidFile)) { console.log('joshi: no running sync'); return; }
  const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
  if (!pid) { console.log('joshi: invalid pid file'); try { fs.unlinkSync(pidFile); } catch {}; return; }
  try { if (process.platform === 'win32') execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' }); else process.kill(pid, 'SIGTERM'); } catch {}
  try { fs.unlinkSync(pidFile); } catch {}
  console.log(`joshi: stopped PID ${pid}`);
}

function status() {
  const pidFile = path.join(repoRoot(), '.autosync-repo.pid');
  if (fs.existsSync(pidFile)) { const pid = fs.readFileSync(pidFile, 'utf8').trim(); console.log(`joshi: running (PID ${pid})`); }
  else { console.log('joshi: not running'); }
}

function help() { console.log(`Usage:\n  joshi start sync\n  joshi start daemon\n  joshi stop sync\n  joshi once\n  joshi status\n`); }

function main() {
  const [cmd, sub] = process.argv.slice(2);
  if (cmd === 'start' && (sub === 'sync' || sub === 'watch')) return start('watch');
  if (cmd === 'start' && sub === 'daemon') return start('daemon');
  if (cmd === 'stop' && sub === 'sync') return stop();
  if (cmd === 'once') return runOnce();
  if (cmd === 'status') return status();
  return help();
}

main();


