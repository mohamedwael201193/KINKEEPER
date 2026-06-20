# ENV REQUIREMENTS — KINKEEPER × AETHER

Complete environment variable reference. **No placeholders in code** — features disable gracefully when optional vars are missing (with explicit logging).

**Setup order (recommended):** Supabase → Upstash → Cloudflare R2 → JWT keys → QVAC local → Resend → (optional) Sentry → (optional) Stripe/Twilio

---

## Database (Supabase)

### `DATABASE_URL`

| Field | Value |
|---|---|
| **Why it exists** | Pooled Postgres connection for the Fastify API (Prisma queries at runtime). All family data, alerts, bundles, inference logs. |
| **Where to get it** | Supabase Dashboard → Project → **Settings** → **Database** → **Connection string** → URI → **Transaction pooler** (port 6543) |
| **Signup** | https://supabase.com/dashboard/sign-in |
| **Free or paid** | Free: 500MB DB, 2 projects. Pro: $25/mo. |
| **Setup** | 1) Create project `kinkeeper-staging`. 2) Save DB password in password manager. 3) Copy pooler URI. 4) Replace `[YOUR-PASSWORD]`. |
| **Example** | `postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| **Docs** | https://supabase.com/docs/guides/database/connecting-to-postgres |

---

### `DATABASE_DIRECT_URL`

| Field | Value |
|---|---|
| **Why it exists** | Direct Postgres connection (port 5432) for Prisma migrations — pooler cannot run all migration DDL. |
| **Where to get it** | Same page → **Direct connection** URI (not pooler) |
| **Signup** | Same Supabase project |
| **Free or paid** | Included in Supabase free tier |
| **Setup** | Use session mode / direct host `db.xxxxx.supabase.co:5432` |
| **Docs** | https://www.prisma.io/docs/guides/database/supabase |

---

### `SUPABASE_URL`

| Field | Value |
|---|---|
| **Why it exists** | Supabase project API URL — Realtime subscriptions (frontend), optional Supabase Auth fallback, storage API if used. |
| **Where to get it** | Dashboard → **Settings** → **API** → **Project URL** |
| **Signup** | https://supabase.com |
| **Free or paid** | Free tier included |
| **Example** | `https://abcdefghijklmnop.supabase.co` |
| **Docs** | https://supabase.com/docs/guides/api |

---

### `SUPABASE_ANON_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Public anon key for client-side Supabase Realtime (safe with RLS). Used by frontend `VITE_SUPABASE_ANON_KEY`. |
| **Where to get it** | Dashboard → **Settings** → **API** → **anon public** |
| **Signup** | Same project |
| **Free or paid** | Free |
| **Security** | Safe in frontend; RLS must protect all tables. |
| **Docs** | https://supabase.com/docs/guides/api/api-keys |

---

### `SUPABASE_SERVICE_ROLE_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Server-side admin access bypassing RLS — use sparingly (migrations, admin jobs). **Never expose to frontend.** |
| **Where to get it** | Dashboard → **Settings** → **API** → **service_role** (click Reveal) |
| **Signup** | Same project |
| **Free or paid** | Free |
| **Security** | Backend only. Rotate if leaked. |
| **Docs** | https://supabase.com/docs/guides/api/api-keys |

---

## Authentication

### `JWT_PRIVATE_KEY`

| Field | Value |
|---|---|
| **Why it exists** | RS256 private key PEM for signing access JWTs. Master prompt listed `JWT_SECRET` — use PEM key pair for RS256 per spec. |
| **Where to get it** | Generate locally — not from a vendor |
| **Signup** | N/A |
| **Free or paid** | Free |
| **Setup** | `openssl genrsa -out jwt-private.pem 4096` then paste PEM contents (include `-----BEGIN/END-----` lines) or base64-encode for single-line env |
| **Docs** | https://github.com/fastify/fastify-jwt |

---

### `JWT_PUBLIC_KEY`

| Field | Value |
|---|---|
| **Why it exists** | RS256 public key for verifying JWTs (API + optional Supabase custom JWT). |
| **Where to get it** | `openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem` |
| **Signup** | N/A |
| **Free or paid** | Free |
| **Setup** | Pair with `JWT_PRIVATE_KEY` |
| **Docs** | Same as above |

---

### `JWT_ACCESS_EXPIRES_IN`

| Field | Value |
|---|---|
| **Why it exists** | Access token TTL |
| **Where to get it** | You define it |
| **Recommended** | `15m` |
| **Free or paid** | N/A |

---

### `JWT_REFRESH_EXPIRES_IN`

| Field | Value |
|---|---|
| **Why it exists** | Refresh token TTL stored hashed in DB |
| **Recommended** | `30d` |
| **Free or paid** | N/A |

---

### `WEBAUTHN_RP_ID`

| Field | Value |
|---|---|
| **Why it exists** | WebAuthn Relying Party ID — must match registrable domain (no protocol/port) |
| **Where to get it** | Your production domain |
| **Dev value** | `localhost` |
| **Prod value** | `kinkeeper.app` or `app.kinkeeper.app` (pick one, consistent with `WEBAUTHN_ORIGIN`) |
| **Signup** | N/A — your domain |
| **Free or paid** | N/A |
| **Docs** | https://simplewebauthn.dev/docs/packages/server |

---

### `WEBAUTHN_RP_NAME`

| Field | Value |
|---|---|
| **Why it exists** | Human-readable name shown in passkey prompts |
| **Recommended** | `KINKEEPER` |
| **Free or paid** | N/A |

---

### `WEBAUTHN_ORIGIN`

| Field | Value |
|---|---|
| **Why it exists** | Full origin for WebAuthn verification |
| **Dev** | `http://localhost:5173` |
| **Prod** | `https://app.kinkeeper.app` |
| **Docs** | https://simplewebauthn.dev/docs/packages/server |

---

## Object Storage (Cloudflare R2)

### `R2_ACCOUNT_ID`

| Field | Value |
|---|---|
| **Why it exists** | Cloudflare account identifier for S3-compatible R2 API |
| **Where to get it** | Cloudflare Dashboard → R2 → overview URL contains account ID, or **R2** → **Manage R2 API Tokens** page sidebar |
| **Signup** | https://dash.cloudflare.com/sign-up |
| **Free or paid** | Free tier: 10GB storage, 10M Class A ops/mo |
| **Docs** | https://developers.cloudflare.com/r2/ |

---

### `R2_ACCESS_KEY_ID`

| Field | Value |
|---|---|
| **Why it exists** | S3-compatible access key for presigned uploads (call recordings, check-ins) |
| **Where to get it** | Cloudflare → **R2** → **Manage R2 API Tokens** → Create API token → Object Read & Write → scope to bucket |
| **Signup** | Cloudflare account |
| **Free or paid** | Free tier |
| **Setup** | Create token → copy Access Key ID + Secret once |
| **Docs** | https://developers.cloudflare.com/r2/api/s3/tokens/ |

---

### `R2_SECRET_ACCESS_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Secret paired with `R2_ACCESS_KEY_ID` |
| **Where to get it** | Shown once at token creation |
| **Security** | Backend only. Never commit. |
| **Docs** | Same as above |

---

### `R2_BUCKET_NAME`

| Field | Value |
|---|---|
| **Why it exists** | Target bucket for audio/transcripts/exports |
| **Where to get it** | R2 → **Create bucket** → e.g. `kinkeeper-staging` |
| **Recommended** | `kinkeeper-staging` / `kinkeeper-prod` |
| **Free or paid** | Free tier |

---

### `R2_ENDPOINT`

| Field | Value |
|---|---|
| **Why it exists** | S3 API endpoint (added — required for AWS SDK v3) |
| **Format** | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| **Docs** | https://developers.cloudflare.com/r2/api/s3/api/ |

---

### `R2_PUBLIC_URL`

| Field | Value |
|---|---|
| **Why it exists** | Optional custom domain for public assets — KINKEEPER uses **presigned URLs only** (bucket private). Used as base for CDN if configured. |
| **Where to get it** | R2 bucket → **Settings** → Custom domain (optional) OR leave empty and use presigned only |
| **Hackathon** | Can leave unset; presigned URLs sufficient |
| **Docs** | https://developers.cloudflare.com/r2/buckets/public-buckets/ |

---

## Redis (Upstash)

### `REDIS_URL`

| Field | Value |
|---|---|
| **Why it exists** | BullMQ job queues (Sentinel/Cognoscente workers), rate limiting, optional WS pub/sub |
| **Where to get it** | Upstash Console → Redis database → **Connect** → copy `rediss://` URL |
| **Signup** | https://console.upstash.com/login |
| **Free or paid** | Free: 10K commands/day. Pay-as-you-go ~$0.2/100K commands. |
| **Setup** | Create database in same region as Render (e.g. `us-east-1`) → enable TLS |
| **Docs** | https://upstash.com/docs/redis/overall/getstarted |

---

## QVAC (Local Cognition Node)

### `QVAC_MODELS_CACHE_DIR`

| Field | Value |
|---|---|
| **Why it exists** | Directory where `@qvac/sdk` downloads and caches model weights (multi-GB) |
| **Where to get it** | Local filesystem path on inference machine — **not** from a vendor |
| **Linux/Mac** | `/data/qvac-models` or `~/.cache/qvac/models` |
| **Windows** | `D:\qvac-models` (avoid spaces) |
| **Setup** | Create dir → ensure 20GB+ free space → set env before first `loadModel` |
| **Docs** | https://docs.qvac.tether.io/sdk/get-started/ |

---

### `QVAC_HYPERSWARM_SEED`

| Field | Value |
|---|---|
| **Why it exists** | 64-char hex seed for backend/local node's stable Hyperswarm identity (P2P provider key derivation) |
| **Where to get it** | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| **Security** | Treat as secret; determines mesh identity |
| **Docs** | https://docs.qvac.tether.io/ai-capabilities/p2p/ |

---

### `QVAC_SWARM_RELAYS`

| Field | Value |
|---|---|
| **Why it exists** | JSON array of blind relay public keys for NAT traversal |
| **Where to get it** | QVAC docs / Discord announcements for public relays, or run your own |
| **Example** | `["relay_pubkey_1","relay_pubkey_2"]` |
| **Hackathon** | Optional if demo devices on same LAN |
| **Docs** | https://docs.qvac.tether.io/ |

---

### `QVAC_NODE_PUBLIC_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Stored after `startQVACProvider()` — other devices use for delegated inference (added for clarity) |
| **Where to get it** | Output of cognition node startup log — persist to env or DB `devices.mesh_public_key` |
| **Free or paid** | N/A |

---

### `QVAC_API_URL`

| Field | Value |
|---|---|
| **Why it exists** | If cognition node runs as separate process, API worker calls it for inference (added for split architecture) |
| **Dev** | `http://localhost:3001` |
| **Prod** | Tailscale/LAN URL or same-machine `http://127.0.0.1:3001` on Render **sidecar not recommended** — run node on laptop |
| **Hackathon** | Local only |

---

## Email (Resend)

### `RESEND_API_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Transactional email: verification, password reset, family invites, alert notifications |
| **Where to get it** | https://resend.com/api-keys → Create API Key |
| **Signup** | https://resend.com/signup |
| **Free or paid** | Free: 100 emails/day. Pro: $20/mo for 50K. |
| **Setup** | Verify domain for production `noreply@kinkeeper.app` |
| **Docs** | https://resend.com/docs/introduction |

---

### `EMAIL_FROM`

| Field | Value |
|---|---|
| **Why it exists** | From header for all outbound email |
| **Format** | `KINKEEPER <noreply@kinkeeper.app>` |
| **Setup** | Must match verified domain in Resend |

---

### `EMAIL_REPLY_TO`

| Field | Value |
|---|---|
| **Why it exists** | Reply-to for support responses |
| **Example** | `support@kinkeeper.app` |

---

## SMS (Twilio) — OPTIONAL for hackathon

### `TWILIO_ACCOUNT_SID`

| Field | Value |
|---|---|
| **Why it exists** | Twilio account identifier for SMS alert channel |
| **Where to get it** | https://console.twilio.com → Dashboard → **Account SID** |
| **Signup** | https://www.twilio.com/try-twilio |
| **Free or paid** | Trial credit ~$15. SMS ~$0.0079/msg US. |
| **If missing** | SMS notifications disabled; email/in-app only |
| **Docs** | https://www.twilio.com/docs/usage/api |

---

### `TWILIO_AUTH_TOKEN`

| Field | Value |
|---|---|
| **Why it exists** | Twilio API authentication |
| **Where to get it** | Twilio Console → Dashboard → **Auth Token** (Reveal) |
| **Security** | Backend only |

---

### `TWILIO_FROM_NUMBER`

| Field | Value |
|---|---|
| **Why it exists** | Sender phone number E.164 |
| **Where to get it** | Twilio → Phone Numbers → Buy a number (trial includes one) |
| **Example** | `+15551234567` |
| **Docs** | https://www.twilio.com/docs/messaging/quickstart |

---

## Web Push (VAPID) — OPTIONAL for hackathon

### `VAPID_PUBLIC_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Web Push protocol public key for browser notifications |
| **Where to get it** | Generate with `web-push` CLI: `npx web-push generate-vapid-keys` |
| **Signup** | N/A |
| **Free or paid** | Free |
| **Docs** | https://github.com/web-push-libs/web-push |

---

### `VAPID_PRIVATE_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Signs push notification payloads |
| **Where to get it** | Same generation command as public key |
| **Security** | Backend only |

---

### `VAPID_SUBJECT`

| Field | Value |
|---|---|
| **Why it exists** | Contact URI for push service (RFC 8292) |
| **Example** | `mailto:admin@kinkeeper.app` |

---

## Stripe (Billing) — OPTIONAL for hackathon

### `STRIPE_SECRET_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Server-side Stripe API for checkout, portal, subscriptions |
| **Where to get it** | https://dashboard.stripe.com/apikeys → **Secret key** (use Test mode for hackathon) |
| **Signup** | https://dashboard.stripe.com/register |
| **Free or paid** | No monthly fee; 2.9% + 30¢ per transaction |
| **Docs** | https://stripe.com/docs/keys |

---

### `STRIPE_WEBHOOK_SECRET`

| Field | Value |
|---|---|
| **Why it exists** | Verifies Stripe webhook signatures (`POST /billing/webhook`) |
| **Where to get it** | Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret |
| **Setup** | Point webhook to `https://api.kinkeeper.app/billing/webhook` |
| **Docs** | https://stripe.com/docs/webhooks/signatures |

---

### `STRIPE_PRICE_FAMILY`

| Field | Value |
|---|---|
| **Why it exists** | Price ID for Family plan |
| **Where to get it** | Stripe → Products → Create product → copy **Price ID** (`price_...`) |
| **Hackathon** | Skip if billing deferred |

---

### `STRIPE_PRICE_FAMILY_PLUS`

| Field | Value |
|---|---|
| **Why it exists** | Price ID for Family+ plan |
| **Where to get it** | Same as above |

---

### `STRIPE_PRICE_EXTENDED`

| Field | Value |
|---|---|
| **Why it exists** | Price ID for Extended Family plan |
| **Where to get it** | Same as above |

---

## Monitoring

### `SENTRY_DSN_BACKEND`

| Field | Value |
|---|---|
| **Why it exists** | Error tracking for Fastify API |
| **Where to get it** | https://sentry.io → Create project (Node.js) → **DSN** |
| **Signup** | https://sentry.io/signup/ |
| **Free or paid** | Free: 5K errors/mo |
| **Docs** | https://docs.sentry.io/platforms/javascript/guides/node/ |

---

### `SENTRY_DSN_FRONTEND`

| Field | Value |
|---|---|
| **Why it exists** | Error tracking for React app |
| **Where to get it** | Sentry → Create project (React) → DSN |
| **Maps to** | `VITE_SENTRY_DSN` on Vercel |

---

### `BETTERSTACK_LOG_TOKEN`

| Field | Value |
|---|---|
| **Why it exists** | Ingest structured logs (Pino → Logtail) |
| **Where to get it** | https://logs.betterstack.com → Sources → Create source → copy token |
| **Signup** | https://betterstack.com/logs — free tier available |
| **Free or paid** | Free tier: 1GB/mo |
| **Hackathon** | Optional — console logs sufficient |
| **Docs** | https://betterstack.com/docs/logs/api/ |

---

### `BETTERSTACK_UPTIME_TOKEN`

| Field | Value |
|---|---|
| **Why it exists** | Heartbeat monitor for `GET /health` |
| **Where to get it** | Better Stack → Uptime → Heartbeat → create → copy URL/token |
| **Signup** | https://betterstack.com/uptime |
| **Free or paid** | Free: 10 monitors |
| **Docs** | https://betterstack.com/docs/uptime/api/ |

---

## Application

### `NODE_ENV`

| Field | Value |
|---|---|
| **Why it exists** | Node standard environment (`development` \| `production` \| `test`) |
| **Render** | `production` |
| **Local** | `development` |

---

### `APP_ENV`

| Field | Value |
|---|---|
| **Why it exists** | KINKEEPER-specific environment for feature flags and logging |
| **Values** | `development` \| `staging` \| `production` |

---

### `APP_URL`

| Field | Value |
|---|---|
| **Why it exists** | Frontend base URL for email links (verify, reset, invite) |
| **Dev** | `http://localhost:5173` |
| **Prod** | `https://app.kinkeeper.app` |

---

### `API_URL`

| Field | Value |
|---|---|
| **Why it exists** | Backend base URL for OpenAPI, webhooks, internal references (added) |
| **Dev** | `http://localhost:3000` |
| **Prod** | `https://api.kinkeeper.app` |

---

### `APP_PORT`

| Field | Value |
|---|---|
| **Why it exists** | Fastify listen port |
| **Default** | `3000` |
| **Render** | Render sets `PORT` — read `process.env.PORT \|\| APP_PORT` |

---

### `CORS_ORIGINS`

| Field | Value |
|---|---|
| **Why it exists** | Allowed browser origins for CORS |
| **Dev** | `http://localhost:5173` |
| **Prod** | `https://app.kinkeeper.app,https://kinkeeper.app` |
| **Format** | Comma-separated (no JSON) per master prompt Fastify example |

---

### `LOG_LEVEL`

| Field | Value |
|---|---|
| **Why it exists** | Pino log level (added) |
| **Default** | `info` (dev: `debug`) |

---

## Frontend (Vercel)

Set in Vercel Dashboard → Project → Settings → Environment Variables.

### `VITE_API_BASE_URL`

| Field | Value |
|---|---|
| **Why it exists** | Backend API base for all frontend fetch calls |
| **Dev** | `http://localhost:3000` |
| **Prod** | `https://api.kinkeeper.app` |

---

### `VITE_SUPABASE_URL`

| Field | Value |
|---|---|
| **Why it exists** | Same as `SUPABASE_URL` — Realtime client |
| **Where to get it** | Copy from Supabase API settings |

---

### `VITE_SUPABASE_ANON_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Same as `SUPABASE_ANON_KEY` — safe for browser with RLS |
| **Where to get it** | Supabase API settings |

---

### `VITE_STRIPE_PUBLISHABLE_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Stripe.js checkout (if billing enabled) |
| **Where to get it** | Stripe Dashboard → API keys → **Publishable key** (`pk_test_...`) |
| **Hackathon** | Optional |

---

### `VITE_SENTRY_DSN`

| Field | Value |
|---|---|
| **Why it exists** | Frontend error tracking |
| **Where to get it** | Same as `SENTRY_DSN_FRONTEND` |

---

### `VITE_APP_ENV`

| Field | Value |
|---|---|
| **Why it exists** | Frontend feature flags / analytics gating |
| **Values** | `development` \| `staging` \| `production` |

---

## Optional Analytics

### `POSTHOG_KEY`

| Field | Value |
|---|---|
| **Why it exists** | Opt-in product analytics |
| **Where to get it** | https://app.posthog.com → Project → Settings → Project API Key |
| **Signup** | https://posthog.com/signup |
| **Free or paid** | Free: 1M events/mo |
| **Default** | Unset = analytics disabled |

---

### `POSTHOG_HOST`

| Field | Value |
|---|---|
| **Why it exists** | PostHog API host |
| **Default** | `https://app.posthog.com` |
| **Self-host** | Your instance URL |

---

## Render / Docker (Platform-provided)

### `PORT`

| Field | Value |
|---|---|
| **Why it exists** | Injected by Render — Fastify must bind to this |
| **Where to get it** | Automatic on Render — do not set manually locally unless testing |

---

## Minimum Env Sets

### Hackathon MVP (must have before implementation)

```bash
# Database
DATABASE_URL=
DATABASE_DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=

# Queue
REDIS_URL=

# QVAC (local machine)
QVAC_MODELS_CACHE_DIR=
QVAC_HYPERSWARM_SEED=

# Email
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=

# App
NODE_ENV=development
APP_ENV=development
APP_URL=http://localhost:5173
API_URL=http://localhost:3000
APP_PORT=3000
CORS_ORIGINS=http://localhost:5173
```

### Production add-ons

All MVP vars (production values) + `WEBAUTHN_*` + `SENTRY_*` + Vercel `VITE_*` + Cloudflare DNS

### Explicitly optional (defer OK)

`TWILIO_*`, `VAPID_*`, `STRIPE_*`, `BETTERSTACK_*`, `POSTHOG_*`, `QVAC_SWARM_RELAYS`

---

## Security Checklist

- [ ] Never commit `.env` — only `.env.example` with empty values
- [ ] Rotate keys if exposed
- [ ] Use separate Supabase projects for staging vs production
- [ ] Stripe test keys for hackathon; live keys only at launch
- [ ] `SUPABASE_SERVICE_ROLE_KEY` and `JWT_PRIVATE_KEY` backend-only
- [ ] R2 bucket: block public access; presigned URLs with short TTL

---

## Next Step

Provide values in a secure channel (not chat logs if avoidable). When ready, say:

> **All ENV variables are ready. Start implementation.**

Implementation begins with Phase 0 (`scripts/qvac-smoke.ts`) per `WINNING_BUILD_PLAN.md`.
