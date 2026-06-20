# MVP Environment Checklist — Phase 0–3 Only

**Scope lock:** Sentinel · Cognoscente · Archivist · QVAC · Delegated Inference · Evidence Logging · Auth · Family Management  
**Sources:** `PROJECT_REALITY_CHECK.md` · `WINNING_BUILD_PLAN.md` Phases 0–3  
**Out of scope:** Stripe, Twilio, Web Push, WebAuthn, Sentry, Better Stack, PostHog, R2, Supabase Realtime, frontend (Vite), Resend (optional)

---

## Phase-by-Phase Env Verification

| Phase | Goal | External services | Env vars needed |
|---|---|---|---|
| **0** | QVAC smoke test + first CSV log line | None (local disk only) | **1** |
| **1** | Auth + family + elder CRUD | Supabase **Postgres only** | **9** |
| **2** | QVAC wrapper, cognition node, inference logs, delegation provider | Supabase + local QVAC | **+4** (13 total) |
| **3** | Sentinel, Cognoscente, Archivist, BullMQ workers | Supabase + Redis + local QVAC + local audio dir | **+2** (15 total) |

---

## Removed Services (not needed Phase 0–3)

These appear in `ENV_REQUIREMENTS.md` but are **excluded** from MVP implementation:

| Service / vars | Why removed |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Postgres-only via Prisma; no Supabase Auth or Realtime in Phase 0–3 |
| `R2_*` (5 vars) | Audio storage deferred to Phase 4; Phase 0–3 uses local disk (`UPLOAD_DIR`) |
| `RESEND_*`, `EMAIL_*` | Email verification skipped; auth works without outbound email |
| `TWILIO_*` | SMS not in scope |
| `VAPID_*` | Push not in scope |
| `STRIPE_*` | Billing not in scope |
| `WEBAUTHN_*` | Passkeys deferred |
| `SENTRY_*`, `BETTERSTACK_*` | Monitoring deferred |
| `POSTHOG_*` | Analytics deferred |
| `VITE_*` | No frontend in Phase 0–3 |
| `QVAC_SWARM_RELAYS` | Optional; same-LAN delegation demo works without relays |
| `QVAC_API_URL`, `QVAC_NODE_PUBLIC_KEY` | Derived at runtime / stored in DB — not pre-provisioned env |

---

## Accounts to Create (minimum)

| # | Service | Signup | Cost | Needed by |
|---|---|---|---|---|
| 1 | **Supabase** | https://supabase.com/dashboard/sign-in | Free | Phase 1 |
| 2 | **Upstash Redis** | https://console.upstash.com/login | Free | Phase 3 |
| — | **QVAC models** | Local cache dir + HuggingFace downloads via SDK | Free | Phase 0 |
| — | **JWT keys** | Generate locally (`openssl`) | Free | Phase 1 |

**Do not create yet:** Cloudflare R2, Resend, Stripe, Twilio, Sentry, Better Stack, Vercel.

---

## Required Variables (15 total)

### Phase 0 — QVAC proof of life (start here)

| Variable | Required | How to obtain |
|---|---|---|
| `QVAC_MODELS_CACHE_DIR` | ✅ | Create local folder with **20GB+ free** (e.g. `D:\qvac-models` or `~/.cache/qvac/models`) |

**Phase 0 exit test:** `qvac doctor` passes · smoke script writes one row to `evidence/inference-log.csv`.

---

### Phase 1 — Auth + family (add after Phase 0)

| Variable | Required | How to obtain |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase → Settings → Database → **Transaction pooler** URI (port 6543) |
| `DATABASE_DIRECT_URL` | ✅ | Same page → **Direct connection** URI (port 5432) — migrations only |
| `JWT_PRIVATE_KEY` | ✅ | `openssl genrsa -out jwt-private.pem 4096` → paste PEM (or base64 single-line) |
| `JWT_PUBLIC_KEY` | ✅ | `openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem` |
| `JWT_ACCESS_EXPIRES_IN` | ✅ | Set `15m` |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Set `30d` |
| `NODE_ENV` | ✅ | `development` locally |
| `APP_ENV` | ✅ | `development` |
| `APP_PORT` | ✅ | `3000` (Render uses injected `PORT` in production) |
| `APP_URL` | ✅ | `http://localhost:5173` (for future email links; unused in Phase 0–3) |
| `API_URL` | ✅ | `http://localhost:3000` |
| `CORS_ORIGINS` | ✅ | `http://localhost:5173` |

---

### Phase 2 — QVAC node + inference logs (add when starting Phase 2)

| Variable | Required | How to obtain |
|---|---|---|
| `QVAC_HYPERSWARM_SEED` | ✅ | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `QVAC_NODE_SECRET` | ✅ | Same command — separate 32-byte hex; secures API ↔ cognition-node internal calls |
| `EVIDENCE_DIR` | ✅ | Local path for CSV audit log, e.g. `./evidence` (default ok) |

**Note:** Provider public key from `startQVACProvider()` is persisted to `devices` table — not an env var.

---

### Phase 3 — Agents + BullMQ (add when starting Phase 3)

| Variable | Required | How to obtain |
|---|---|---|
| `REDIS_URL` | ✅ | Upstash → Create database → Connect → copy `rediss://...` URL |
| `UPLOAD_DIR` | ✅ | Local path for audio uploads, e.g. `./uploads` (replaces R2 until Phase 4) |

---

## Optional (safe to omit Phase 0–3)

| Variable | If omitted |
|---|---|
| `LOG_LEVEL` | Defaults to `info` |
| `RESEND_API_KEY` | Register/login works; no verification emails (log token in dev console) |
| `QVAC_SWARM_RELAYS` | Delegation demo on same Wi‑Fi/LAN only |

---

## Minimal `.env` template (Phase 0–3)

Copy to `.env` at repo root. Fill values in order as phases start.

```bash
# ── Phase 0 ─────────────────────────────────────────
QVAC_MODELS_CACHE_DIR=

# ── Phase 1 ─────────────────────────────────────────
DATABASE_URL=
DATABASE_DIRECT_URL=
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=development
APP_ENV=development
APP_PORT=3000
APP_URL=http://localhost:5173
API_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173

# ── Phase 2 ─────────────────────────────────────────
QVAC_HYPERSWARM_SEED=
QVAC_NODE_SECRET=
EVIDENCE_DIR=./evidence

# ── Phase 3 ─────────────────────────────────────────
REDIS_URL=
UPLOAD_DIR=./uploads
```

---

## Setup Order (do not skip)

```
1. Phase 0  → QVAC_MODELS_CACHE_DIR + download models + smoke test
2. Phase 1  → Supabase project + JWT keys + migrate DB
3. Phase 2  → QVAC seeds + cognition node + inference_logs table
4. Phase 3  → Upstash Redis + UPLOAD_DIR + agent workers
```

---

## Hardware (not env — but required for QVAC)

| Device | Role | Phase |
|---|---|---|
| Developer laptop | Cognition node (MedPsy-4B, Qwen3, Whisper) + API dev | 0–3 |
| Raspberry Pi 4 **or** second laptop | Delegated inference **consumer** (optional until Phase 2 demo) | 2+ |

Document RAM, OS, and model quantizations in README when Phase 0 completes.

---

## Confirmation Checklist

Before saying **"All ENV variables are ready. Start implementation."**, verify:

### Phase 0 ready
- [ ] `QVAC_MODELS_CACHE_DIR` exists with 20GB+ free space
- [ ] `qvac doctor` passes on inference machine
- [ ] Node.js 22+ and npm installed

### Phase 1 ready (can proceed Phase 0 while Supabase provisions)
- [ ] Supabase project created
- [ ] `DATABASE_URL` and `DATABASE_DIRECT_URL` copied and password replaced
- [ ] JWT key pair generated and stored securely

### Phase 2 ready (needed before cognition node)
- [ ] `QVAC_HYPERSWARM_SEED` generated
- [ ] `QVAC_NODE_SECRET` generated (different from seed)
- [ ] `EVIDENCE_DIR` path writable

### Phase 3 ready (needed before agent workers)
- [ ] Upstash Redis database created
- [ ] `REDIS_URL` copied (must start with `rediss://`)
- [ ] `UPLOAD_DIR` path writable

---

## What happens when you confirm

Implementation starts **Phase 0 only** (`scripts/qvac-smoke.ts` + monorepo scaffold). Phases 1–3 begin as each env tier above is satisfied. Scope will not expand beyond the eight focus areas.

---

**Status: WAITING**

Reply with either:
- **"Start Phase 0 only — QVAC_MODELS_CACHE_DIR is ready"** (partial start), or
- **"All ENV variables are ready. Start implementation."** (full Phase 0–3 tier provisioned)
