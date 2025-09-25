# Contributing

Thank you for contributing to CareNest!

## Branch Strategy

- Feature branches: `feature/<short-name>` or `feat/<short-name>`
- Flow:
  1. Create feature branch from `dev`
  2. Open PR → base `dev`
  3. After review + green CI, merge (squash or rebase preferred)
  4. Periodically, open PR from `dev` → `main` for releases
- No direct pushes to `main` or `dev`.

## Pull Requests

- Use Conventional Commits in titles: `feat:`, `fix:`, `docs:`, `ci:`, `refactor:`, `test:`, `chore:`
- Ensure CI “build-and-test” is green
- Update docs and env samples as needed
- Link issues in PR description

## Reviews

- At least 1 approval required on `dev` and `main`
- Keep PRs small and focused

## CI/CD

- CI runs on all branches and PRs
- Required checks: `build-and-test`

## Security

- Never commit secrets. Use `.env.local` and GitHub Actions Secrets
- Follow repository rules in `.cursor/rules.md` or `README.md`


