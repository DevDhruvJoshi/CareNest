# CareNest Monorepo

Monorepo for CareNest backend (API), frontend (web), and shared packages.

## Structure

- `apps/api`: Express TypeScript API
- `apps/web`: Next.js web app
- `packages/db`: Prisma schema and client

## Requirements

- Node.js 18+
- npm 9+
- Docker (optional for local DB)

## Getting Started

- Install: `npm install`
- Dev: `npm run dev` (API on 4000, Web on 3000)
- Docker: `docker compose up -d`

## Environment

- API (`apps/api`): `PORT`, `NODE_ENV`, `JWT_SECRET`, `DATABASE_URL`
- Web (`apps/web`): `NEXT_PUBLIC_API_URL`
- Samples: `apps/api/env.sample`, `apps/web/env.sample`

## CI/CD

- GitHub Actions: `.github/workflows/ci.yml` builds API & Web
