# CareNest Monorepo

Monorepo for CareNest backend (API), frontend (web), and shared packages.

## Structure

- `apps/api`: Express TypeScript API
- `apps/web`: Next.js web app
- `packages/db`: Prisma schema and client

## Requirements

- Node.js 20+
- npm 10+
- Docker (optional for local DB)
 - Optional: OpenAI account and API key if you use the AI planning endpoint

## Getting Started

- Install: `npm install --workspaces --include-workspace-root`
- Dev: `npm run dev` (API on 4000, Web on 3000)
- Docker: `docker compose up -d`

## Environment

- API (`apps/api`): `PORT`, `NODE_ENV`, `JWT_SECRET`, `DATABASE_URL`
- Web (`apps/web`): `NEXT_PUBLIC_API_URL`
 - API LLM (optional): `OPENAI_API_KEY`, `OPENAI_MODEL` (default: `gpt-4o-mini`)
- Alerts escalation (optional): `ALERT_ESCALATION_RECIPIENTS`
- Samples: `apps/api/env.sample`, `apps/web/env.sample`

### Env & Config Strategy

- Scope: Each workspace manages its own `.env` files in its directory. The API loads variables via `dotenv` from `apps/api/.env*`; the Web app follows Next.js conventions in `apps/web/.env*`.
- Recommended files per workspace:
  - `.env.local` for local-only, uncommitted values
  - `.env.development`, `.env.staging`, `.env.production` as needed
  - Keep `env.sample` up to date (document keys without secrets)
- Load order (effective):
  - API: process env → values from `apps/api/.env` (via `dotenv`) → runtime defaults validated by Zod in `apps/api/src/config.ts`.
  - Web: process env at build time. Only `NEXT_PUBLIC_*` keys are exposed to the browser.
- Central variables currently used:
  - API: `PORT`, `NODE_ENV`, `JWT_SECRET`, `DATABASE_URL`
  - Web: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000`)
  - Alerts (optional): `ALERT_SMS_PROVIDER`, `ALERT_SMS_TWILIO_ACCOUNT_SID`, `ALERT_SMS_TWILIO_AUTH_TOKEN`, `ALERT_SMS_FROM`, `ALERT_EMAIL_SMTP_HOST`, `ALERT_EMAIL_SMTP_PORT`, `ALERT_EMAIL_SMTP_USER`, `ALERT_EMAIL_SMTP_PASS`

### Examples

API `.env.local` (apps/api/.env.local):

```
PORT=4000
NODE_ENV=development
JWT_SECRET=dev-secret
DATABASE_URL=postgres://postgres:postgres@localhost:5432/carenest
# Alerts (optional)
# ALERT_SMS_PROVIDER=twilio
# ALERT_SMS_TWILIO_ACCOUNT_SID=...
# ALERT_SMS_TWILIO_AUTH_TOKEN=...
# ALERT_SMS_FROM=+10000000000
# ALERT_EMAIL_SMTP_HOST=smtp.example.com
# ALERT_EMAIL_SMTP_PORT=587
# ALERT_EMAIL_SMTP_USER=username
# ALERT_EMAIL_SMTP_PASS=password

# Optional LLM keys
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
```

## Database (Prisma)

- Generate Client: `npm run db:generate`
- Migrate (dev): `npm run db:migrate`
- Seed: `npm run db:seed`
- Full setup: `npm run db:setup`

Web `.env.local` (apps/web/.env.local):

```
NEXT_PUBLIC_API_URL=http://localhost:4000

### AI Planning Endpoint (optional)

- Route: `POST /ai/plan`
- Request body (all fields optional):

```
{
  "rpiHostname": "raspberrypi.local",
  "vpsHost": "your.vps.example.com",
  "vpsUser": "ubuntu",
  "remotePort": 5000,
  "localPort": 5000,
  "sshPort": 22
}
```

- Response: `{ plan: string }` generated using `Prompts/IDE_AI_IMPLEMENTATION_PROMPT.md` master prompt.
```

### Notes

- CI uses Node 20 with npm workspaces; it runs a single install at repo root, then builds `packages/db`, `apps/api`, and `apps/web`.
- Prisma reads `DATABASE_URL` at build/runtime. In Docker Compose, the API uses the `db` service URL.
- Only `NEXT_PUBLIC_*` keys appear in the browser. Keep secrets server-side.

## CI/CD

- GitHub Actions: `.github/workflows/ci.yml` builds API & Web
