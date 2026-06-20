# DEPLOYMENT READINESS REPORT — KINKEEPER × AETHER

**Report generated:** 2026-06-20  
**Verifier:** Automated build/test suite + live HTTP probes against Supabase + Upstash + local API  
**Scope:** Backend Phases 0–4 only (no frontend)

---

## Verification Run Metadata

### Commands executed (all from `D:\route\KINKEEPER`)

| Command | Exit code | Timestamp (local) | Result |
|---|---|---|---|
| `npm run build` | 0 | 2026-06-20 ~05:12 UTC | All 5 workspaces compiled |
| `npm run lint` | 0 | 2026-06-20 ~05:12 UTC | ESLint clean |
| `npm run typecheck` | 0 | 2026-06-20 ~05:12 UTC | Project references clean |
| `npm run test:unit` | 0 | 2026-06-20 ~05:12 UTC | 2/2 tests passed |
| `npm run test:integration` | 0 | 2026-06-20 ~05:13 UTC | 1/1 tests passed |
| `npm run qvac:smoke` | 0 | 2026-06-20 (terminal 3.txt) | Real GPU inference |
| `npx tsx scripts/verify-db.ts` | 0 | 2026-06-20 ~05:13 UTC | 17 tables present in Supabase |
| Live API (PowerShell env load + `npx tsx apps/api/src/main.ts`) | 0 | 2026-06-20 ~02:14 UTC | Server on port 3000 |
| HTTP probes (register, login, family, elder, chain) | 0 | 2026-06-20 ~02:15 UTC | All 200 responses |

### External services confirmed reachable

| Service | Connection string host | Evidence |
|---|---|---|
| Supabase Postgres (pooler) | `aws-0-eu-west-1.pooler.supabase.com:6543` | `SELECT 1` via Prisma in `/health` → `"database": "healthy"` |
| Supabase Postgres (direct) | `aws-0-eu-west-1.pooler.supabase.com:5432` | `db:push` applied schema; 17 tables listed |
| Upstash Redis | `crack-corgi-151533.upstash.io:6379` (TLS) | API + BullMQ workers start without Redis connection error |
| QVAC SDK | `@qvac/sdk@0.10.2` local GPU | Phase 0 smoke: `backendDevice: "gpu"`, 249 tok/s |

---

## Feature 1 — Monorepo & Build Pipeline

### Source files

| Path | Role |
|---|---|
| `package.json` | Root workspaces, scripts (`build`, `lint`, `typecheck`, `test:unit`, `test:integration`, `qvac:smoke`, `delegate:smoke`, `db:push`, `dev:api`, `dev:qvac-node`) |
| `vitest.config.ts` | Unit vs integration project split |
| `tsconfig.json` | Solution-style project references |
| `apps/api/package.json` | Fastify API workspace |
| `apps/qvac-node/package.json` | Cognition node workspace |
| `packages/db/package.json` | Prisma workspace |
| `packages/qvac/package.json` | QVAC wrapper workspace |
| `packages/shared/package.json` | Shared types/schemas workspace |

### Routes

None (infrastructure only).

### Tests

No dedicated test file. Build success is the verification gate.

### Database tables

None.

### Evidence it works

```
> npm run build
> @kinkeeper/api@0.1.0 build → tsc -p tsconfig.json ✓
> @kinkeeper/qvac-node@0.1.0 build → tsc -p tsconfig.json ✓
> @kinkeeper/db@0.1.0 build → tsc -p tsconfig.json ✓
> @kinkeeper/qvac@0.1.0 build → tsc -p tsconfig.json ✓
> @kinkeeper/shared@0.1.0 build → tsc -p tsconfig.json ✓

> npm run lint → exit 0
> npm run typecheck → exit 0
```

---

## Feature 2 — Environment Configuration

### Source files

| Path | Role |
|---|---|
| `.env` | Live credentials (gitignored) — Supabase, Upstash, QVAC, JWT paths |
| `.env.example` | Template for 15 MVP variables |
| `apps/api/src/config/env.ts` | Zod validation: `DATABASE_URL`, `DATABASE_DIRECT_URL`, JWT key files, `REDIS_URL`, `QVAC_NODE_URL`, `QVAC_NODE_SECRET`, CORS, ports |
| `apps/qvac-node/src/config/env.ts` | Zod validation: `QVAC_MODELS_CACHE_DIR`, `QVAC_HYPERSWARM_SEED`, `QVAC_NODE_SECRET`, `EVIDENCE_DIR` |
| `packages/qvac/src/setup.ts` | Sets `QVAC_CONFIG_PATH` → `config/default/default.config.json` |
| `config/default/default.config.json` | QVAC SDK logger config |

### Routes

None.

### Tests

Integration tests load `.env` via `import "dotenv/config"` from repo root.

### Database tables

None.

### Evidence it works

- `scripts/verify-db.ts` connected using `DATABASE_URL` from `.env` and returned 17 table names.
- API `loadEnv()` succeeded when run from repo root with `.env` loaded (see Feature 3).
- QVAC smoke test read `QVAC_MODELS_CACHE_DIR=D:/route/KINKEEPER/.qvac-models` (terminal 3.txt line 15).

### Deployment blocker discovered

`npm run dev:api` (workspace script) runs with cwd `apps/api`. `dotenv/config` in `main.ts` looks for `apps/api/.env` which does not exist → **all env vars undefined**. Additionally, `JWT_PRIVATE_KEY_FILE=.jwt-private.pem` resolves to `apps/api/.jwt-private.pem` but keys live at repo root.

**Workaround used for live verification:**

```powershell
cd D:\route\KINKEEPER
$env:JWT_PRIVATE_KEY_FILE='D:/route/KINKEEPER/.jwt-private.pem'
$env:JWT_PUBLIC_KEY_FILE='D:/route/KINKEEPER/.jwt-public.pem'
Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') } }
npx tsx apps/api/src/main.ts
```

**Required before production deploy:** Fix npm scripts to load root `.env` and absolute JWT paths, or set `cwd` to monorepo root.

---

## Feature 3 — Health & Readiness Endpoints

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/health.ts` | `/health`, `/ready` |
| `apps/api/src/app.ts` | Registers health routes |
| `packages/qvac/src/qvac-client.ts` | `health()` → `GET /internal/health` on cognition node |

### Routes

| Method | Path | Auth | Handler location |
|---|---|---|---|
| GET | `/health` | None | `apps/api/src/routes/health.ts:6-37` |
| GET | `/ready` | None | `apps/api/src/routes/health.ts:40-47` |

### Tests

No automated HTTP test. Verified live (see Evidence).

### Database tables

Uses Prisma `$queryRaw\`SELECT 1\`` against `users` datasource (any table ping).

### Evidence it works

**Live HTTP response — 2026-06-20T02:15:04Z:**

```json
{
  "status": "healthy",
  "timestamp": "2026-06-20T02:15:04.569Z",
  "checks": {
    "database": "healthy",
    "redis": "configured",
    "qvacNode": "unhealthy"
  },
  "version": "0.1.0"
}
```

```json
{ "status": "ready" }
```

**Server log** (`terminals/359005.txt`):

- `GET /health` → statusCode 200, responseTime 1174ms
- `GET /ready` → statusCode 200, responseTime 439ms

`qvacNode: unhealthy` is expected when cognition node is not running. Database probe proves Supabase connectivity.

---

## Feature 4 — Authentication (Register, Login, Refresh, Logout)

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/auth.ts` | HTTP routes |
| `apps/api/src/services/auth.service.ts` | argon2id hashing, refresh token rotation |
| `apps/api/src/plugins/auth.ts` | `@fastify/jwt` RS256, `authenticate` decorator |
| `packages/shared/src/schemas/auth.ts` | `registerSchema`, `loginSchema`, `JwtPayload` |
| `.jwt-private.pem` | RS256 private key (repo root, gitignored) |
| `.jwt-public.pem` | RS256 public key (repo root, gitignored) |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/auth/register` | None | `auth.ts:8-40` |
| POST | `/auth/login` | None | `auth.ts:42-71` |
| POST | `/auth/refresh` | Cookie or body | `auth.ts:73-99` |
| POST | `/auth/logout` | Cookie | `auth.ts:101-108` |

### Tests

| File | Test name | What it proves |
|---|---|---|
| `apps/api/src/auth.integration.test.ts` | `registers, logs in, and builds JWT payload` | Real Supabase insert/delete for user; argon2 verify; JWT payload shape |

**Integration test output (2026-06-20):**

```
✓ Auth integration > registers, logs in, and builds JWT payload  2528ms
Test Files  1 passed (1)
Tests  1 passed (1)
```

Test creates user `test-{timestamp}@kinkeeper.test`, verifies login, asserts `payload.sub === user.id`, cleans up in `afterAll`.

### Database tables

| Table | Columns used |
|---|---|
| `users` | `id`, `email`, `password_hash`, `first_name`, `last_name`, `email_verified_at` |
| `refresh_tokens` | `user_id`, `token_hash`, `expires_at`, `revoked_at` |

Prisma models: `User` (`schema.prisma:50-66`), `RefreshToken` (`schema.prisma:68-80`).

### Evidence it works

**A. Integration test** — passes against live Supabase (see above).

**B. Live HTTP register** — 2026-06-20T02:15:11Z:

```
POST /auth/register → 200 (1845ms)
Body: email=deploy-verify-20260620051511@kinkeeper.test
Response user.id: cmqlq6hzy0000uwxob79f2hvb
JWT alg: RS256 (decoded header from accessToken)
```

**C. Live HTTP login** — 2026-06-20T02:15:25Z:

```
POST /auth/login → 200 (1466ms)
Same email/password → new accessToken issued
```

**D. Database after live test** (`scripts/verify-db.ts`):

```json
{
  "users": 1,
  "refreshTokens": 1
}
```

**E. Password hashing** — `auth.service.ts:9-15` uses `argon2.argon2id` with `memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`. Not mocked.

---

## Feature 5 — User Profile (`/users/me`)

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/family.ts` | `registerUserRoutes()` |
| `apps/api/src/plugins/auth.ts` | JWT verification |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/users/me` | Bearer JWT | `family.ts:8-18` |

### Tests

Covered indirectly by auth integration test (`buildJwtPayload`). No dedicated HTTP test.

### Database tables

| Table | Operation |
|---|---|
| `users` | `findUniqueOrThrow` by JWT `sub` |
| `family_members` | Role/familyId read via JWT payload (populated after family create) |

### Evidence it works

**Live HTTP** — immediately after register:

```json
GET /users/me → 200
{
  "id": "cmqlq6hzy0000uwxob79f2hvb",
  "email": "deploy-verify-20260620051511@kinkeeper.test",
  "firstName": "Deploy",
  "lastName": "Verify",
  "familyId": null,
  "role": "none"
}
```

After family creation, JWT is reissued with `familyId` and `role: admin` (see Feature 6).

---

## Feature 6 — Family Management

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/family.ts` | Family + elder routes |
| `apps/api/src/services/family.service.ts` | `createFamily`, `getCurrentFamily`, `createElder`, `listElders` |
| `packages/shared/src/schemas/family.ts` | `createFamilySchema`, `createElderSchema` |
| `packages/qvac/src/qvac-client.ts` | Optional provider pubkey fetch on family create |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/families` | Bearer JWT | `family.ts:28-43` |
| GET | `/families/current` | JWT + family | `family.ts:45-48` |
| POST | `/families/current/elders` | JWT + family | `family.ts:50-57` |
| GET | `/families/current/elders` | JWT + family | `family.ts:59-65` |

### Tests

No automated test. Verified live.

### Database tables

| Table | Written on family create | Written on elder create |
|---|---|---|
| `families` | name, mesh_public_key (null if qvac-node down) | — |
| `family_members` | user as `admin` | — |
| `agents` | 3 rows: sentinel, cognoscente, archivist | — |
| `devices` | cognition_node (only if qvac-node reachable) | — |
| `elders` | — | first_name, last_name, birth_year, timezone |

### Evidence it works

**Live HTTP family create** — 2026-06-20T02:15:16Z:

```
POST /families → 200 (2520ms)
Response:
  id: cmqlq6jv30003uwxo081qv63m
  name: Deploy Test Family
  meshPublicKey: null  (qvac-node was not running)
  accessToken: reissued with familyId + role admin
```

**Database counts after family create:**

```json
{ "families": 1, "familyMembers": 1, "agents": 3, "devices": 0 }
```

Three agent rows prove `family.service.ts:81-89` transaction ran.

**Live HTTP elder create** — 2026-06-20T02:15:27Z:

```json
POST /families/current/elders → 200
{
  "id": "cmqlq6sdu000fuwxo40lxkyks",
  "familyId": "cmqlq6jv30003uwxo081qv63m",
  "firstName": "Margaret",
  "lastName": "Test",
  "birthYear": 1945,
  "timezone": "Europe/London"
}
```

**Live HTTP get family:**

```json
GET /families/current → 200
{ "id": "cmqlq6jv30003uwxo081qv63m", "name": "Deploy Test Family" }
```

---

## Feature 7 — Local File Upload Storage

### Source files

| Path | Role |
|---|---|
| `apps/api/src/services/family.service.ts` | `LocalStorageService` class (`saveBuffer`, `extensionFromMime`) |
| `apps/api/src/routes/sentinel.ts` | Multipart audio save |
| `apps/api/src/routes/cognoscente.ts` | Multipart audio save |
| `apps/api/src/app.ts` | `@fastify/multipart` limit 50MB |

### Routes

Used by Sentinel and Cognoscente upload routes (Features 10, 11). No standalone route.

### Tests

None.

### Database tables

Stores path in `sentinel_call_recordings.audio_path` and `cognoscente_check_ins.audio_path`.

### Evidence it works

**Code path verified:** SHA-256 hash used as filename (`family.service.ts:20-26`).

**Runtime NOT verified:** No audio file uploaded during this verification session (requires multipart POST with real WAV + running workers + qvac-node).

**Upload directory configured:** `UPLOAD_DIR=D:/route/KINKEEPER/uploads` in `.env`.

---

## Feature 8 — QVAC SDK Wrapper (`@kinkeeper/qvac`)

### Source files

| Path | Role |
|---|---|
| `packages/qvac/src/qvac-service.ts` | `loadModel`, `completion`, `transcribe`, `unloadModel`, `startProvider`, `stopProvider`, delegate support |
| `packages/qvac/src/models.ts` | `QWEN3_600M_INST_Q4`, `WHISPER_TINY`, `MEDPSY_4B_Q4_K_M` HF URL |
| `packages/qvac/src/inference-logger.ts` | CSV + optional Prisma logging |
| `packages/qvac/src/qvac-client.ts` | HTTP client for API → node |
| `packages/qvac/src/setup.ts` | Env bootstrap |
| `packages/qvac/src/index.ts` | Public exports |
| `packages/shared/src/types/inference-log.ts` | CSV header spec |

### Routes

No direct HTTP routes in API. Consumed by cognition node and agent services.

### Tests

| File | Test | Result |
|---|---|---|
| `packages/qvac/src/inference-logger.test.ts` | `matches hackathon header columns` | PASS — 12 CSV columns |

### Database tables

| Table | When written |
|---|---|
| `inference_logs` | When `InferenceLogger` constructed with Prisma client (qvac-node uses `new QvacService(prisma)`) |

### Evidence it works

**A. Phase 0 smoke** (`npm run qvac:smoke`, terminal 3.txt):

```
Model: QWEN3_600M_INST_Q4
GPU load: device: 'gpu', gpu_layers: '99'
Completion output contains: { "status": "ok" }
Stats:
  timeToFirstToken: 276.935 ms
  tokensPerSecond: 249.18
  generatedTokens: 180
  backendDevice: gpu
Phase 0 smoke test PASSED
```

**B. CSV log** (`evidence/inference-log.csv`):

```csv
timestamp,family_id,device_id,model_src,operation,prompt_tokens,completion_tokens,ttft_sec,tps,delegate_provider,delegate_fallback_used,bundle_id
2026-06-20T02:06:37.216Z,,,QWEN3_600M_INST_Q4,loadModel,0,0,174.855,,,false,
2026-06-20T02:06:42.378Z,,,QWEN3_600M_INST_Q4,completion,0,0,3.940354,152.48038261008557,,false,
2026-06-20T02:10:38.549Z,,,QWEN3_600M_INST_Q4,completion,0,0,0.276935,249.1756439113931,,false,
```

**C. Smoke report JSON** (`evidence/phase0-smoke-report.json`):

```json
{
  "timestamp": "2026-06-20T02:10:38.550Z",
  "modelSrc": "QWEN3_600M_INST_Q4",
  "stats": {
    "timeToFirstToken": 276.935,
    "tokensPerSecond": 249.1756439113931,
    "backendDevice": "gpu"
  },
  "csvPath": "D:\\route\\KINKEEPER\\evidence\\inference-log.csv"
}
```

**D. SDK version:** `@qvac/sdk@0.10.2` (package-lock.json).

**NOT runtime-verified in this session:**

- `transcribe()` / Whisper-tiny
- `MEDPSY_4B_Q4_K_M` load from HuggingFace (~2.7GB)
- `loadModel({ delegate })` consumer path
- `startQVACProvider()` P2P provider

---

## Feature 9 — QVAC Cognition Node (`apps/qvac-node`)

### Source files

| Path | Role |
|---|---|
| `apps/qvac-node/src/main.ts` | Fastify server, auth hook, provider start, model preload |
| `apps/qvac-node/src/routes/internal.ts` | Internal inference routes |
| `apps/qvac-node/src/config/env.ts` | Node env validation |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/internal/health` | Bearer `QVAC_NODE_SECRET` | `internal.ts:42-45` |
| POST | `/internal/completion` | Bearer | `internal.ts:47-50` |
| POST | `/internal/transcribe` | Bearer | `internal.ts:52-55` |

Non-`/internal/*` paths return 404 (`main.ts:22-24`).

### Tests

None. Not started during this verification (MedPsy preload takes minutes + ~2.7GB download).

### Database tables

| Table | When written |
|---|---|
| `inference_logs` | Via `QvacService(prisma)` on each SDK call |

### Evidence it works

**Code complete:** `main.ts:34-41` calls `qvac.startProvider()` then `qvac.preloadAgentModels()` (Qwen3 + MedPsy + Whisper).

**Runtime NOT verified this session:** Node was not running. API `/health` reported `"qvacNode": "unhealthy"`.

**To verify manually:**

```bash
npx dotenv-cli -e .env -- npm run dev -w @kinkeeper/qvac-node
# Wait for "QVAC cognition node started" + providerPublicKey in logs
curl -H "Authorization: Bearer $QVAC_NODE_SECRET" http://localhost:3001/internal/health
```

---

## Feature 10 — Sentinel Agent

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/sentinel.ts` | Upload + alert routes |
| `apps/api/src/services/sentinel.service.ts` | Transcribe → Qwen3 classify → MedPsy deep → alert + bundle |
| `apps/api/src/workers/index.ts` | BullMQ worker `sentinel-process-call` |
| `apps/api/src/queues/index.ts` | Queue definition |
| `packages/shared/src/schemas/sentinel.ts` | `callRecordingSchema`, `SentinelClassification` |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/families/current/sentinel/call-recording` | JWT + family | `sentinel.ts:9-94` (multipart) |
| GET | `/families/current/sentinel/alerts` | JWT + family | `sentinel.ts:96-106` |
| POST | `/families/current/sentinel/alerts/:id/resolve` | JWT + family | `sentinel.ts:108-118` |

### Tests

None.

### Database tables

| Table | Operation |
|---|---|
| `sentinel_call_recordings` | Insert on upload; update on process |
| `alerts` | Insert if SCAM confidence ≥ 0.85 |
| `decision_bundles` | Insert via Archivist |
| `memory_reasoning_traces` | Insert if thinkingText present |
| `inference_logs` | Via qvac-node during transcribe/completion |
| `agent_logs` | Not written by current implementation |

### Evidence it works

**Code path verified:** Full pipeline in `sentinel.service.ts:49-171` — no mocks, calls `qvacClient.transcribe()` and `qvacClient.completion()` with real prompts.

**Runtime NOT verified:** Requires:
1. Cognition node running with Whisper + Qwen3 + MedPsy loaded
2. Multipart POST with real audio WAV
3. BullMQ worker consuming job from Upstash

**Queue name:** `sentinel-process-call` (`queues/index.ts:4`).

**Worker:** `workers/index.ts:24-30` calls `sentinel.processCallRecording(job.data)`.

---

## Feature 11 — Cognoscente Agent

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/cognoscente.ts` | Check-in upload + list routes |
| `apps/api/src/services/cognoscente.service.ts` | Transcribe → MedPsy analysis → baselines/trends/alerts |
| `apps/api/src/workers/index.ts` | BullMQ worker `cognoscente-check-in` |
| `packages/shared/src/schemas/cognoscente.ts` | `checkInSchema`, `CognoscenteAnalysis` |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/families/current/cognoscente/check-in` | JWT + family | `cognoscente.ts:9-57` |
| GET | `/families/current/cognoscente/check-ins` | JWT + family | `cognoscente.ts:59-74` |
| GET | `/families/current/cognoscente/trends` | JWT + family | `cognoscente.ts:76-91` |

### Tests

None.

### Database tables

| Table | Operation |
|---|---|
| `cognoscente_check_ins` | Insert on upload; update with metrics |
| `cognoscente_baselines` | Rolling mean/stddev update |
| `cognoscente_trends` | Daily upsert |
| `alerts` | Insert if `analysis.alert === true` |
| `decision_bundles` | Insert via Archivist |
| `memory_reasoning_traces` | Insert if thinkingText present |
| `inference_logs` | Via qvac-node |

### Evidence it works

**Code path verified:** `cognoscente.service.ts:92-210` — real QVAC client calls, Welford-style baseline update (`lines 73-88`), trend upsert.

**Runtime NOT verified:** Same blockers as Sentinel (qvac-node + audio + MedPsy download).

**Queue name:** `cognoscente-check-in` (`queues/index.ts:5`).

---

## Feature 12 — Archivist (Hash-Chained Decision Bundles)

### Source files

| Path | Role |
|---|---|
| `apps/api/src/services/archivist.service.ts` | `buildBundleHash`, `commitBundle`, `verifyChain` |
| `apps/api/src/routes/evidence.ts` | Bundle list, chain verify, export |
| `packages/shared/src/types/decision-bundle.ts` | `DecisionBundle` interface |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/families/current/evidence/bundles` | JWT + family | `evidence.ts:10-20` |
| GET | `/families/current/evidence/bundles/:id` | JWT + family | `evidence.ts:22-35` |
| GET | `/families/current/evidence/chain` | JWT + family | `evidence.ts:37-44` |
| POST | `/families/current/evidence/chain/verify` | JWT + family | `evidence.ts:46-52` |
| POST | `/families/current/evidence/export` | JWT + family | `evidence.ts:54-96` |

Also invoked internally by Sentinel/Cognoscente via `archivist.commitBundle()`.

### Tests

| File | Test | Result |
|---|---|---|
| `apps/api/src/services/archivist.service.test.ts` | `builds deterministic hashes` | PASS |

**Unit test proof:**

```
ArchivistService hash chain > builds deterministic hashes
hash1 === hash2
hash matches /^[a-f0-9]{64}$/
```

### Database tables

| Table | Columns |
|---|---|
| `decision_bundles` | `hash`, `previous_hash`, `agent`, `trigger`, `inputs`, `reasoning`, `delegation`, `tool_calls`, `action`, `device` |
| `memory_reasoning_traces` | `thinking_text`, `raw_deltas`, linked to bundle |

Unique constraint on `decision_bundles.hash` (`schema.prisma:229`).

### Evidence it works

**A. Unit test** — deterministic SHA-256 over canonicalized JSON (`archivist.service.ts:30-33`).

**B. Live HTTP chain verify** (empty chain):

```json
GET /families/current/evidence/chain → 200
{ "valid": true, "length": 0 }
```

**C. Runtime bundle creation NOT verified** — requires Sentinel or Cognoscente job completion to produce first bundle row. Current DB: `decisionBundles: 0`.

---

## Feature 13 — Alerts (Unified)

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/evidence.ts` | `GET /families/current/alerts` |
| `apps/api/src/routes/sentinel.ts` | Sentinel-specific alerts + resolve |
| `apps/api/src/services/sentinel.service.ts` | Creates critical alerts |
| `apps/api/src/services/cognoscente.service.ts` | Creates warning alerts |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/families/current/alerts` | JWT + family | `evidence.ts:98-108` |
| GET | `/families/current/sentinel/alerts` | JWT + family | `sentinel.ts:96-106` |
| POST | `/families/current/sentinel/alerts/:id/resolve` | JWT + family | `sentinel.ts:108-118` |

### Tests

None.

### Database tables

| Table | Columns |
|---|---|
| `alerts` | `severity`, `type`, `title`, `summary`, `metadata`, `bundle_id`, `resolved`, `elder_id`, `agent` |

### Evidence it works

**Code path verified:** Alert creation in `sentinel.service.ts:152-165` and `cognoscente.service.ts:193-206`.

**Runtime NOT verified:** No alerts in DB (`alerts: 0`). Requires agent pipeline completion.

---

## Feature 14 — Inference Log Export

### Source files

| Path | Role |
|---|---|
| `apps/api/src/routes/evidence.ts` | `registerInferenceLogRoutes()` |
| `packages/qvac/src/inference-logger.ts` | CSV append + Prisma insert |

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/families/current/inference-logs` | JWT + family | `evidence.ts:112-122` |
| GET | `/families/current/inference-logs/export` | JWT + family | `evidence.ts:124-161` |
| GET | `/families/current/inference-logs/export/file` | JWT + family | `evidence.ts:163-173` (reads `EVIDENCE_DIR/inference-log.csv`) |

### Tests

| File | Test | Result |
|---|---|---|
| `packages/qvac/src/inference-logger.test.ts` | CSV 12-column format | PASS |

### Database tables

| Table | Columns |
|---|---|
| `inference_logs` | Full hackathon audit schema (`schema.prisma:302-323`) |

### Evidence it works

**A. CSV file on disk** — 6 real rows from QVAC smoke (see Feature 8).

**B. `/inference-logs/export/file` route** reads `D:/route/KINKEEPER/evidence/inference-log.csv` directly.

**C. Database `inference_logs` table:** 0 rows — qvac-node was not running during API session, so Prisma logging from agents did not occur. CSV logging from standalone smoke does not use Prisma (no client passed).

---

## Feature 15 — BullMQ Job Queues & Workers

### Source files

| Path | Role |
|---|---|
| `apps/api/src/queues/index.ts` | Redis connection, queue names |
| `apps/api/src/workers/index.ts` | Sentinel + Cognoscente workers |
| `apps/api/src/main.ts` | `startWorkers(env)` before `buildApp` |

### Routes

None (background processing).

### Tests

None.

### Database tables

Workers update `sentinel_call_recordings.status` on failure (`workers/index.ts:40-48`).

### Evidence it works

**A. API startup with workers:** Server started without Redis/BullMQ crash (terminal 359005.txt — no error lines).

**B. Redis connection config:** `createRedisConnection()` parses `rediss://` URL with TLS (`queues/index.ts:8-18`).

**C. Job processing NOT verified:** No jobs enqueued during HTTP verification. Requires audio upload + qvac-node.

---

## Feature 16 — Delegated Inference Foundation

### Source files

| Path | Role |
|---|---|
| `packages/qvac/src/qvac-service.ts` | `loadModel({ delegate: { providerPublicKey, fallbackToLocal, timeout } })` |
| `apps/qvac-node/src/main.ts` | `startQVACProvider({ firewall: { mode: "allow", publicKeys: [] } })` |
| `scripts/delegate-smoke.ts` | Consumer smoke test |
| `apps/qvac-node/src/routes/internal.ts` | `delegate` field in completion/transcribe body schemas |

### Routes

Delegated via cognition node internal routes (Feature 9).

### Tests

None.

### Database tables

`inference_logs.delegate_provider`, `delegate_fallback_used` columns exist.

### Evidence it works

**Code path verified:** Delegate params passed to SDK `loadModel` at `qvac-service.ts:100-110`.

**Runtime NOT verified:** `npm run delegate:smoke -- <provider-pubkey>` not executed. Requires qvac-node running and provider public key from logs.

**Script usage** (`scripts/delegate-smoke.ts:14-16`):

```
npm run delegate:smoke -- <provider-public-key>
```

---

## Feature 17 — Database Schema (Prisma + Supabase)

### Source files

| Path | Role |
|---|---|
| `packages/db/prisma/schema.prisma` | Full schema |
| `packages/db/src/index.ts` | Prisma client export |
| `scripts/verify-db.ts` | Table listing + row counts |

### Routes

None.

### Tests

Integration test + live HTTP tests write to DB.

### Database tables (all 17 present in Supabase public schema)

| Prisma model | Postgres table | Verified present |
|---|---|---|
| User | `users` | ✓ |
| RefreshToken | `refresh_tokens` | ✓ |
| Family | `families` | ✓ |
| FamilyMember | `family_members` | ✓ |
| Elder | `elders` | ✓ |
| Device | `devices` | ✓ |
| Agent | `agents` | ✓ |
| AgentLog | `agent_logs` | ✓ |
| Alert | `alerts` | ✓ |
| DecisionBundle | `decision_bundles` | ✓ |
| CognoscenteCheckIn | `cognoscente_check_ins` | ✓ |
| CognoscenteBaseline | `cognoscente_baselines` | ✓ |
| CognoscenteTrend | `cognoscente_trends` | ✓ |
| MemoryReasoningTrace | `memory_reasoning_traces` | ✓ |
| InferenceLog | `inference_logs` | ✓ |
| AuditLog | `audit_logs` | ✓ |
| SentinelCallRecording | `sentinel_call_recordings` | ✓ |

**Query output:**

```
TABLES: ["agent_logs","agents","alerts","audit_logs","cognoscente_baselines",
"cognoscente_check_ins","cognoscente_trends","decision_bundles","devices",
"elders","families","family_members","inference_logs","memory_reasoning_traces",
"refresh_tokens","sentinel_call_recordings","users"]
```

**Row counts after live HTTP verification:**

```json
{
  "users": 1,
  "refreshTokens": 1,
  "families": 1,
  "familyMembers": 1,
  "elders": 1,
  "devices": 0,
  "agents": 3,
  "alerts": 0,
  "decisionBundles": 0,
  "inferenceLogs": 0,
  "sentinelCallRecordings": 0,
  "cognoscenteCheckIns": 0
}
```

---

## Feature 18 — API Security Middleware

### Source files

| Path | Role |
|---|---|
| `apps/api/src/app.ts` | helmet, cors, rate-limit (100/min), multipart limits |
| `apps/api/src/plugins/auth.ts` | RS256 JWT, `requireFamily` guard |
| `apps/qvac-node/src/main.ts` | Bearer auth on all `/internal/*` routes |

### Routes

All authenticated routes use `preHandler: [app.authenticate]` or `[app.authenticate, app.requireFamily]`.

### Tests

JWT signing verified via live register (RS256 token issued).

### Database tables

None.

### Evidence it works

- Rate limit registered: `app.ts:39-42`
- CORS origins from env: `CORS_ORIGINS=http://localhost:5173`
- Cognition node rejects non-Bearer: `main.ts:26-29`

---

## Feature 19 — Shared Types & Validation Schemas

### Source files

| Path | Contents |
|---|---|
| `packages/shared/src/schemas/auth.ts` | register, login, JwtPayload |
| `packages/shared/src/schemas/family.ts` | family, elder, device schemas |
| `packages/shared/src/schemas/sentinel.ts` | call recording, classification |
| `packages/shared/src/schemas/cognoscente.ts` | check-in, analysis |
| `packages/shared/src/schemas/evidence.ts` | export filters |
| `packages/shared/src/types/decision-bundle.ts` | DecisionBundle types |
| `packages/shared/src/types/inference-log.ts` | InferenceLogEntry, CSV header |
| `packages/shared/src/constants/agents.ts` | CoreAgentName |

### Routes

Consumed by all API route handlers via Zod `.parse()`.

### Tests

Indirectly tested via integration + live HTTP (invalid bodies would 400).

### Database tables

None.

### Evidence it works

Live register used `registerSchema` (min 12 char password). Elder create used `createElderSchema` with birthYear validation.

---

## Deployment Readiness Verdict

### READY (proven at runtime)

| Feature | Proof type |
|---|---|
| Build / lint / typecheck | Command exit 0 |
| QVAC local inference (Qwen3-600M) | Smoke test + CSV + JSON report |
| Supabase schema | 17 tables listed |
| Auth (register/login/JWT) | Integration test + live HTTP |
| Family + elder CRUD | Live HTTP + DB row counts |
| Health / ready endpoints | Live HTTP, DB healthy |
| Archivist hash algorithm | Unit test |
| Inference CSV format | Unit test + on-disk CSV |
| BullMQ + Redis startup | API starts without worker crash |

### NOT READY (code complete, runtime unproven)

| Feature | Blocker |
|---|---|
| Cognition node (`apps/qvac-node`) | Not started this session; MedPsy preload time + download |
| Whisper transcribe | Requires qvac-node |
| MedPsy-4B inference | Requires qvac-node + HF download |
| Sentinel end-to-end | Requires qvac-node + audio upload |
| Cognoscente end-to-end | Requires qvac-node + audio upload |
| Delegated inference demo | Requires qvac-node provider key + `delegate:smoke` |
| Decision bundle creation | Requires agent job completion |
| Inference logs in Postgres | Requires qvac-node with Prisma logger |
| Device auto-registration | Requires qvac-node healthy at family create |

### MUST FIX BEFORE DEPLOY

| Issue | Impact | Fix |
|---|---|---|
| `npm run dev:api` cwd/env | API cannot start via documented script | Load root `.env`; absolute JWT paths in npm script |
| `npm run dev:qvac-node` likely same cwd issue | Cognition node may fail to find env | Same dotenv-cli pattern as `db:push` |
| DB credentials in chat history | Security | Rotate Supabase password |
| No Render/production deploy config | Cannot deploy to cloud API yet | Add Dockerfile or Render manifest |

---

## Recommended Pre-Deploy Verification Checklist

```bash
# 1. Infrastructure
npm ci
npm run build && npm run lint && npm run typecheck
npm run test:unit && npm run test:integration

# 2. QVAC standalone
npm run qvac:smoke
# Confirm evidence/inference-log.csv grows

# 3. Cognition node (Terminal 1 — allow 10+ min first run for MedPsy)
npx dotenv-cli -e .env -- npm run dev -w @kinkeeper/qvac-node

# 4. API (Terminal 2 — use fixed env loading)
# Apply npm script fix first, or use PowerShell workaround from Feature 2

# 5. Delegated inference
npm run delegate:smoke -- <provider-public-key-from-node-logs>

# 6. Agent E2E
# POST multipart audio to /families/current/sentinel/call-recording
# POST multipart audio to /families/current/cognoscente/check-in
# Confirm decision_bundles, alerts, inference_logs rows appear
```

---

## Test Inventory (complete)

| File | Type | Tests | Status |
|---|---|---|---|
| `apps/api/src/services/archivist.service.test.ts` | Unit | 1 | PASS |
| `packages/qvac/src/inference-logger.test.ts` | Unit | 1 | PASS |
| `apps/api/src/auth.integration.test.ts` | Integration | 1 | PASS |

**Total automated tests: 3 passed, 0 failed.**

No tests exist for: Sentinel, Cognoscente, BullMQ workers, QvacClient HTTP, evidence export HTTP, cognition node routes, delegated inference.

---

*End of deployment readiness report. Backend code is implemented; full agent pipeline and npm dev ergonomics require fixes before production deployment.*
