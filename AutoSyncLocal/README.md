## AutoSyncLocal — Personal Background Sync

This utility keeps a private branch per developer up to date with local changes, without PRs or CI. It helps recover work if a developer machine fails.

### What it does
- Creates/uses a branch: `sync/<username>-<hostname>` on `origin`.
- Snapshots the workspace (excluding heavy/secret files) into a hidden mirror `.carenest-sync/`, commits with `[skip ci]`, and pushes directly.
- Runs silently via Git hooks on commit/merge/checkout. Optional watcher/daemon for continuous syncing.

### Triggers
- Git hooks: `commit-msg`, `post-commit`, `post-merge`, `post-checkout`, `post-rewrite`.
- Watcher (optional): debounced file-change sync.
- Daemon (optional): interval-based sync (default 60s).

### Commands
```
# one-time: install hooks (also runs on postinstall)
npm run sync:setup

# manual one-off sync (logs)
npm run sync:once

# continuous: file watcher (recommended during development)
npm run sync:watch

# continuous: interval daemon (headless environments)
npm run sync:daemon
```

### Safety and privacy
- Commits include `[skip ci]` to avoid CI.
- No PRs are created; pushes go straight to the personal `sync/*` branch.
- Offline-safe: short git timeouts prevent hangs; retries are non-blocking.
- Concurrency-safe: a lightweight lock avoids overlapping runs.

### Excludes (not synced)
- Build/system/IDE: `node_modules`, `dist`, `build`, `.next`, `__pycache__`, `.idea`, `.vscode`.
- Secrets/keys/env: `.env*`, `*.pem`, `*.key`, `*.pfx`, `*.jks`, `*.keystore`.
- Large/binaries/media/archives: `*.zip`, `*.7z`, `*.rar`, `*.gz`, `*.tar`, `*.iso`, `*.img`, `*.exe`, `*.dll`, `*.so`, `*.dylib`, `*.bin`, `*.mp4`, `*.mp3`, `*.png`, `*.jpg`, etc.

Note: Extra ignores are also in repo `.gitignore` and mirrored by the sync tool.

### Branch discovery
```
git ls-remote --heads origin | findstr sync/
# or
git branch -r | findstr sync/
```

### How it works (internals)
1. Ensure mirror clone at `.carenest-sync/` from `origin`.
2. Ensure `sync/<user>-<host>` exists and is checked out in mirror.
3. Copy filtered workspace into mirror, commit `[skip ci]`, push.

### Troubleshooting
- Hooks not firing: run `npm run sync:setup` then make a commit or use `npm run sync:watch`.
- Nothing pushes: try `npm run sync:once` and check for network/offline. The tool will skip pushing when offline.
- Stuck runs: remove lock file if present: `.carenest-sync.lock` in repo root.


