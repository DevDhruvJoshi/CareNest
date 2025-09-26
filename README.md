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
- Docker: `docker compose up -d` (includes Postgres, API, Web, Enterprise)

### Services (Compose)

- API: http://localhost:4000
- Web: http://localhost:3000
- Enterprise: http://localhost:5000

Compose profiles:
- Local: `docker compose --profile local up -d`
- Production (example): `NODE_ENV=production CORS_ORIGIN=https://yourdomain docker compose --profile production up -d`

## Messaging API

- Auth: Bearer JWT (use `/auth/login` to get token; include roles like `["admin"]` for admin endpoints)
- Endpoints:
  - `POST /messages` { text, to? } → creates message (best‑effort persist)
  - `GET /messages?take=&cursor=` → list user’s messages

## Enterprise endpoints

- `/api/camera/start|stop|state|snapshot|hls`
- `/api/health-analytics` (aggregates motion/fall)
- `/api/ssh-tunnel/cmd` (autossh command from config)
- `/api/tts` (Gujarati TTS, returns audio/mpeg)
- `/api/voice-cmd` (stub toggle)
- `/api/power` (battery/power status; psutil if available)

## Kubernetes (minimal)

- Manifests under `k8s/carenest.yaml` create namespace, Postgres, API, Web, Enterprise, and a Secret for API env.
- Build and push images, then apply:

```bash
kubectl apply -f k8s/carenest.yaml
```

## Enterprise one-shot setup (bare metal)

On the target device (Raspberry Pi or Linux):

```bash
cd apps/enterprise
python3 setup.py   # creates venv, installs deps, optional systemd, UFW/Fail2Ban
```

Systemd units (optional, run with sudo):
- installs `mummycare.service` and `autossh-mummycare.service` from `apps/enterprise/scripts/systemd/`

Autossh command preview (from runtime config):

```bash
curl http://localhost:5000/api/ssh-tunnel/cmd
```

## Environment

- API (`apps/api`): `PORT`, `NODE_ENV`, `JWT_SECRET`, `DATABASE_URL`, `INGEST_TOKEN`, `READ_TOKEN`, `PERSON_ALERT_MIN_CONF` (default 0.6), `FALL_ALERT_CHANNEL` (sms|email|call|log), `FALL_ALERT_TO`, `FALL_CALL_ENABLED` (true|false), `FALL_CALL_TO`, `PERSON_ALERT_CHANNEL`, `PERSON_ALERT_TO`
- Web (`apps/web`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ENTERPRISE_URL`, `NEXT_PUBLIC_READ_TOKEN`
 - API LLM (optional): `OPENAI_API_KEY`, `OPENAI_MODEL` (default: `gpt-4o-mini`), `LLM_MOCK` (true to bypass external calls)
- Alerts escalation (optional): `ALERT_ESCALATION_RECIPIENTS`
- Samples: `apps/api/env.sample`, `apps/web/env.sample`

### Env & Config Strategy

- Scope: Each workspace manages its own `.env` files in its directory. The API loads variables via `dotenv` from `apps/api/.env*`; the Web app follows Next.js conventions in `apps/web/.env*`.
- Recommended files per workspace:
  - `.env.local` for local-only, uncommitted values
  - `.env.development`, `.env.staging`, `.env.production` as needed
  - Keep `env.sample` up to date (document keys without secrets)
- Load order (effective):
  - API: `apps/api/.env*` via dotenv → process env → runtime defaults (Zod) within `apps/api/src/config.ts`.
  - Enterprise: runtime `apps/enterprise/config.yaml` merged with process env (see `apps/enterprise/env.sample`).
  - Web: process env at build time. केवल `NEXT_PUBLIC_*` keys ब्राउज़र को एक्सपोज़ होते हैं।
- Central variables currently used:
  - API: `PORT`, `NODE_ENV`, `JWT_SECRET`, `DATABASE_URL`, `INGEST_TOKEN`, `READ_TOKEN`
  - Web: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000`), `NEXT_PUBLIC_ENTERPRISE_URL` (e.g. `http://localhost:5000`), `NEXT_PUBLIC_READ_TOKEN`
  - Tokens: `INGEST_TOKEN` for Enterprise→API ingest, `READ_TOKEN` for read-only events
  - Alerts (optional): `ALERT_SMS_PROVIDER`, `ALERT_SMS_TWILIO_ACCOUNT_SID`, `ALERT_SMS_TWILIO_AUTH_TOKEN`, `ALERT_SMS_FROM`, `ALERT_EMAIL_SMTP_HOST`, `ALERT_EMAIL_SMTP_PORT`, `ALERT_EMAIL_SMTP_USER`, `ALERT_EMAIL_SMTP_PASS`

#### Root .env template (optional)

If you prefer a single root `.env`, create it with the following minimal keys (then each app will read from process env):

```env
# API
PORT=4000
NODE_ENV=development
JWT_SECRET=change-me
DATABASE_URL=postgres://postgres:postgres@localhost:5432/carenest
INGEST_TOKEN=dev-ingest-token
READ_TOKEN=dev-read-token
# Optional LLM
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
# LLM_MOCK=true

# Enterprise
APP_ENV=local
API_URL=http://localhost:4000
PORT=5000

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ENTERPRISE_URL=http://localhost:5000
NEXT_PUBLIC_READ_TOKEN=dev-read-token
```

### Examples

API `.env.local` (apps/api/.env.local):

```
PORT=4000
NODE_ENV=development
JWT_SECRET=dev-secret
DATABASE_URL=postgres://postgres:postgres@localhost:5432/carenest
# Ingest/read tokens
INGEST_TOKEN=dev-ingest-token
READ_TOKEN=dev-read-token

# Alert escalation for critical events
PERSON_ALERT_MIN_CONF=0.6
FALL_ALERT_CHANNEL=sms
FALL_ALERT_TO=+911234567890
FALL_CALL_ENABLED=false
# FALL_CALL_TO=+911234567890
# PERSON_ALERT_CHANNEL=log
# PERSON_ALERT_TO=+911234567890
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
NEXT_PUBLIC_ENTERPRISE_URL=http://localhost:5000
NEXT_PUBLIC_READ_TOKEN=dev-read-token
```

### Models (YOLO/ONNX) Setup

- Enable YOLO person detection in Enterprise by setting:

```env
# apps/enterprise/.env
YOLO_ENABLED=true
YOLO_MODEL=yolov8n.pt
YOLO_MIN_CONF=0.25
```

- Optional ONNX fall model:

```env
# apps/enterprise/.env
FALL_ONNX_MODEL=./models/fall.onnx
```

- Person/fall events are posted to API `/alerts/events` with `x-ingest-token`. API can auto‑escalate using the envs above.

### Quick Start (Local)

1) Start Postgres (via Docker):

```bash
docker compose up -d db
```

2) Install deps and generate Prisma Client:

```bash
npm install --workspaces --include-workspace-root
npm run db:generate
```

3) Apply dev migrations and seed sample data (optional):

```bash
npm run db:migrate
npm run db:seed
```

4) Run services locally:

```bash
npm run dev
```

API: http://localhost:4000, Web: http://localhost:3000

5) Enterprise service (optional, local):

```bash
cd apps/enterprise
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp env.sample .env
uvicorn main:app --host 0.0.0.0 --port 5000
```

6) Connect Enterprise → API event ingest:

- Set the same `INGEST_TOKEN` in `apps/api/.env.local` and `apps/enterprise/env.sample` (or `.env`).
- Start a camera stream in the Enterprise app and verify events on Web dashboard.

### Production Notes

- Configure `CORS_ORIGIN` for the API in production.
- Use strong `JWT_SECRET` and rotate regularly.
- For alerts via Twilio/SMTP, set the respective `ALERT_*` environment variables.
- Lock dependencies and use `npm ci` in CI when committing `package-lock.json`.

### Config merge (Enterprise)

- Enterprise सर्विस (`apps/enterprise`) रनटाइम पर `config.yaml` लोड करती है और `APP_ENV` को `system.env` में सेट करती है।
- Suggested sections in `config.yaml`:

```yaml
ssh_tunnel:
  enabled: true
  mode: reverse
  remote_host: your.vps.example.com
  remote_user: ubuntu
  remote_port: 5000
  local_port: 5000
  ssh_port: 22
  keepalive: 60
  retries: 3
  key_path: ~/.ssh/mummycare_id_rsa
security:
  ufw:
    enabled: true
  fail2ban:
    enabled: true
    maxretry: 5
    bantime: 3600
privacy:
  face_blur: false
api:
  base_url: http://localhost:4000
  ingest_token: dev-ingest-token
```

### Monitoring (Prometheus/Grafana)

- Enterprise `/metrics` endpoint (text exposition) उपलब्ध है: `http://localhost:5000/metrics`.
- Prometheus scrape job उदाहरण:

```yaml
scrape_configs:
  - job_name: carenest-enterprise
    static_configs:
      - targets: ['host.docker.internal:5000']
```

- Grafana: Prometheus datasource जोड़ें और बेसिक डैशबोर्ड में `app_uptime_seconds`, `app_requests_total` पैनल बनाएं।

### RBAC / Auth

- API में `requireAuth(['admin'])` वाले रूट्स हैं (जैसे `/ai/plan`, `/alerts` GET)। JWT `JWT_SECRET` से साइन होता है।
- Read-only camera events के लिए `x-read-token: READ_TOKEN` भी सपोर्टेड है।
- Web डैशबोर्ड में sensitive reads के लिए `NEXT_PUBLIC_READ_TOKEN` का उपयोग किया गया है (client fetch header के रूप में)।

### Run smoke tests

Node API smoke (from repo root):

```bash
node scripts/api_smoke.mjs
```

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

- Inspect master prompt (admin): `GET /ai/master-prompt` → `{ masterBlock }`
```

### Notes

PR checks: Merges into protected branches wait for CI (build + smoke) to pass.

- CI uses Node 20 with npm workspaces; it runs a single install at repo root, then builds `packages/db`, `apps/api`, and `apps/web`.
- Prisma reads `DATABASE_URL` at build/runtime. In Docker Compose, the API uses the `db` service URL.
- Only `NEXT_PUBLIC_*` keys appear in the browser. Keep secrets server-side.

## CI/CD

- GitHub Actions: `.github/workflows/ci.yml` builds API & Web
