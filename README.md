# KINKEEPER

Local-first family AI protection platform built on [QVAC](https://qvac.tether.io/) for the QVAC hackathon.

**Full release documentation:** [MASTER_RELEASE_DOCUMENT.md](./MASTER_RELEASE_DOCUMENT.md) — architecture, APIs, deployment, security, and hackathon demo guide.

## What's real

| Capability | Status |
|---|---|
| Local LLM inference (Qwen3-600M, MedPsy, Whisper) | **REAL** — via local `apps/qvac-node` |
| Sentinel scam detection | **REAL** — audio → alert → evidence → Telegram |
| Cognoscente cognitive check-ins | **REAL** — baselines, trends, drift alerts |
| Hash-chained evidence bundles | **REAL** — Archivist SHA-256 chain |
| Telegram caregiver bot | **REAL** — when `TELEGRAM_ENABLED=true` |
| Web dashboard + Privy auth | **REAL** — Vite/React SPA |
| Cloud deployment manifests | **NOT YET** — see master doc deployment section |

## Quick start

**Requirements:** Node.js ≥ 22.17 · Supabase Postgres · Upstash Redis · ~4 GB for QVAC models

```powershell
npm install
copy .env.example .env
# Edit .env: DATABASE_URL, REDIS_URL, PRIVY_*, QVAC_NODE_SECRET, JWT keys

npm run db:push
npm run download:medpsy

# Terminal 1 — local QVAC inference (never deploy to cloud)
npm run dev:qvac-node

# Terminal 2 — API + workers + Telegram bot
npm run dev:api

# Terminal 3 — web dashboard
npm run dev:web
```

Open http://localhost:5173 · API http://localhost:3000 · QVAC node http://localhost:3001

## Hackathon demo

See [DEMO_RUNBOOK.md](./DEMO_RUNBOOK.md) for judge reproduction steps.

```powershell
npm run qvac:runtime
npm run e2e:verify
```

Proof artifacts: `GET http://localhost:3000/public/proof`

## Architecture

```
┌─────────────┐     HTTPS     ┌──────────────┐     HTTP      ┌─────────────┐
│  apps/web   │ ────────────► │  apps/api    │ ────────────► │apps/qvac-node│
│  Vite/React │               │  Fastify     │  (local only) │  @qvac/sdk  │
│  Privy auth │               │  BullMQ+Bot  │               │  GGUF models│
└─────────────┘               └──────────────┘               └─────────────┘
                                     │
                              Supabase · Redis
```

**Important:** QVAC cognition node runs **locally only** — not on Render/Vercel. See [MASTER_RELEASE_DOCUMENT.md](./MASTER_RELEASE_DOCUMENT.md) §18.

## Monorepo

| Package | Role |
|---------|------|
| `apps/api` | REST API, BullMQ workers, Telegram bot |
| `apps/qvac-node` | Local QVAC inference server |
| `apps/web` | Dashboard + marketing |
| `packages/db` | Prisma schema |
| `packages/qvac` | QVAC client + service |
| `packages/shared` | Shared types/schemas |

## License

Apache-2.0
