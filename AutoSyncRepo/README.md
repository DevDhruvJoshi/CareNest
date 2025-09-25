# AutoSync

Per-developer background sync branch utility. Creates and maintains `sync/<username>-<hostname>` with `[skip ci]` commits for backup/recovery.

## Install in an existing repo
Copy the `AutoSyncRepo/` folder into your repository root (rename as desired), then:
```
npm install --no-fund --no-audit
npm run sync:setup
```

## Usage
```
# one-off sync
npm run sync:once

# continuous (file watcher)
npm run sync:watch

# continuous (interval daemon)
npm run sync:daemon

# custom CLI
npx joshi start sync
npx joshi status
npx joshi stop sync
```

## Safety
- Skips CI with `[skip ci]`.
- No PRs; direct push to personal `sync/*` branch.
- Offline-safe timeouts; non-blocking.
- Lock to avoid concurrent runs.

## Excludes
- Build/system/IDE: `node_modules`, `dist`, `build`, `.next`, `__pycache__`, `.idea`, `.vscode`.
- Secrets/keys/env: `.env*`, `*.pem`, `*.key`, `*.pfx`, `*.jks`, `*.keystore`.
- Large/binaries/media/archives (`*.zip`, `*.mp4`, `*.png`, `*.exe`, etc.).

## License
MIT


