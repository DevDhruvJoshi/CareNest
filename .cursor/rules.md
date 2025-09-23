# Cursor Rules for CareNest (mirror)

This file mirrors the project rules so Cursor features can surface them inside the `.cursor` workspace. The canonical source is the repo‑root `.cursorrules`. Keep both in sync when updating.

## Environments
- Node 20 and npm 10 required.
- Do not downgrade npm; workspace protocol must be supported.

## Dependencies & Installs
- Prefer workspace-aware installs at repo root: `npm install --workspaces --include-workspace-root`.
- Lockfile policy: commit `package-lock.json` when aiming for reproducible CI; if not committed, do not enable cache in CI.
- Do not introduce `pnpm` or `yarn` unless discussed.

## Monorepo Linking
- If CI cannot resolve `workspace:*`, temporarily use `file:../../<path>` to unblock.
- Internal package `@carenest/db` must build `.d.ts` declarations.

## TypeScript
- Shared packages must enable `declaration: true`.
- Avoid `any`; never suppress type errors without justification.

## Formatting & EOL
- Respect `.editorconfig` and `.gitattributes` (LF endings, consistent indentation).

## CI
- GitHub Actions uses Node 20 and npm 10.
- With lockfile: use `npm ci`. Without lockfile: use `npm install` (no cache).

## Security
- No secrets in repo. Use `.env.local`; keep `env.sample` files updated.

## README/Docs
- Update `README.md` and `apps/*/env.sample` when adding env vars or endpoints.

