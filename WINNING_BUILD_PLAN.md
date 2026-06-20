# WINNING BUILD PLAN — KINKEEPER × AETHER

**Goal:** Strongest *realistic* QVAC Hackathon I submission — not the largest scope.  
**Constraints:** 1 developer · deadline June 21, 2026 · no mock inference · backend first · Fastify (see `BACKEND_DECISION.md`)  
**Hardware for demo:** Developer laptop (cognition node) + Raspberry Pi 4 OR second laptop (consumer) · optional pre-recorded audio

---

## Strategy

Build in **6 phases over ~5–7 focused days** (compressed to **36–48 hours** if starting June 20). Each phase has a **demo-able artifact**. Skip anything not in this document.

**Architecture split:**

```
┌─────────────────────┐     HTTPS      ┌──────────────────────┐
│  Vercel (Frontend)  │ ◄────────────► │  Render (Fastify API) │
│  Dashboard + upload │                │  Auth · DB · Evidence  │
└─────────────────────┘                └──────────┬───────────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────────┐
                     │                            │                            │
              ┌──────▼──────┐            ┌────────▼────────┐          ┌────────▼────────┐
              │  Supabase   │            │  Upstash Redis  │          │  Cloudflare R2  │
              │  Postgres   │            │  BullMQ         │          │  Audio files    │
              └─────────────┘            └─────────────────┘          └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  LOCAL QVAC COGNITION NODE (laptop/Pi) — ALL INFERENCE HERE                             │
│  @qvac/sdk · MedPsy-4B · Qwen3 · Whisper · GTE · startQVACProvider · delegated infer  │
│  Writes: inference-log.csv · syncs bundles to API                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0 — Research & Proof of Life

| Field | Value |
|---|---|
| **Goal** | QVAC runs on your hardware; inference log line produced |
| **Duration** | 4–6 hours |

### Files

| File | Purpose |
|---|---|
| `docs/RESEARCH.md` | QVAC summaries + 20 question answers (abbreviated OK for hackathon) |
| `scripts/qvac-smoke.ts` | Load Qwen3-600M, one completion, log TTFT/TPS |
| `evidence/inference-log.csv` | First real log row |

### APIs

None.

### Database tables

None.

### Tests

| Test | Type |
|---|---|
| `qvac doctor` exits 0 | Manual |
| Smoke script prints completion + stats | Manual |

### Exit criteria

- [ ] Models cached in `QVAC_MODELS_CACHE_DIR`
- [ ] One CSV row: timestamp, model, operation, ttft_sec, tps
- [ ] Hardware specs documented in README draft

---

## Phase 1 — Monorepo + Database + Auth

| Field | Value |
|---|---|
| **Goal** | User can register, login, create family + elder |
| **Duration** | 8–10 hours |

### Files

```
package.json                    # npm workspaces root
apps/api/src/main.ts            # Fastify bootstrap
apps/api/src/plugins/auth.ts
apps/api/src/routes/auth.ts
apps/api/src/routes/families.ts
apps/api/src/routes/elders.ts
packages/shared/src/schemas/    # Zod
packages/db/prisma/schema.prisma
packages/db/prisma/migrations/
docs/DATABASE_ARCHITECTURE.md   # subset of master schema
docs/openapi.yaml               # auth + family endpoints only
.env.example
Dockerfile
render.yaml
```

### APIs (implement first)

| Method | Path |
|---|---|
| POST | `/auth/register` |
| POST | `/auth/login` |
| POST | `/auth/refresh` |
| POST | `/auth/logout` |
| GET | `/users/me` |
| POST | `/families` |
| GET | `/families/current` |
| POST | `/families/current/elders` |
| GET | `/families/current/elders` |
| GET | `/health` |
| GET | `/ready` |

### Database tables

**Must create:**

| Table | Purpose |
|---|---|
| `users` | Accounts |
| `refresh_tokens` | JWT rotation |
| `families` | Family unit |
| `family_members` | Roles |
| `elders` | Care recipients |
| `devices` | Registered mesh devices (minimal) |
| `audit_logs` | Compliance |

**Defer:** billing, memory_vault, knowledge graph, notification_preferences

### Tests

| Test file | Coverage |
|---|---|
| `auth.service.test.ts` | Password hash, JWT sign/verify |
| `auth.integration.test.ts` | register → login → me |
| `families.integration.test.ts` | create family + elder |

### Exit criteria

- [ ] `npm run lint && npm run typecheck && npm run build` pass
- [ ] Prisma migrate on Supabase succeeds
- [ ] RLS policies on family-scoped tables (minimum: elders, family_members)

---

## Phase 2 — QVAC Wrapper + Local Cognition Node

| Field | Value |
|---|---|
| **Goal** | Shared QvacService; local node loads models; inference logged to DB + CSV |
| **Duration** | 10–14 hours |

### Files

```
packages/qvac/src/qvac-service.ts
packages/qvac/src/inference-logger.ts
packages/qvac/src/model-registry.ts
apps/qvac-node/src/main.ts          # Local cognition node entry
apps/qvac-node/src/provider.ts      # startQVACProvider
apps/api/src/routes/inference-logs.ts
```

### APIs

| Method | Path |
|---|---|
| GET | `/families/current/inference-logs` |
| GET | `/families/current/inference-logs/export?format=csv\|json` |
| POST | `/internal/qvac/sync-log` | *(optional: node pushes logs)* |

### Database tables

| Table | Columns (key) |
|---|---|
| `inference_logs` | timestamp, model_src, operation, prompt_tokens, completion_tokens, ttft_sec, tps, delegate_provider, delegate_fallback_used, bundle_id |

### QVAC operations (real)

| Operation | Model | Use |
|---|---|---|
| `loadModel` / `unloadModel` | Qwen3-600M, MedPsy-4B, Whisper-tiny, GTE-Large | Lifecycle |
| `completion` | Qwen3 + MedPsy | Classification |
| `transcribe` | Whisper | Audio → text |
| `embed` + `ragSearch` | GTE-Large | Chapter search (Phase 4) |
| `startQVACProvider` | — | P2P provider on laptop |
| `loadModel({ delegate })` | MedPsy-4B | Consumer on Pi → laptop |
| `loggingStream` | — | Native QVAC logs |

### Tests

| Test | Notes |
|---|---|
| `inference-logger.test.ts` | CSV row format matches hackathon spec |
| `qvac-service.integration.test.ts` | Real Whisper-tiny on short WAV — **no mocks** |
| Manual | `delegate` call Pi → laptop, log shows provider pubkey |

### Exit criteria

- [ ] `evidence/inference-log.csv` appends on every SDK call
- [ ] Export endpoint downloads same data as CSV
- [ ] `captureThinking: true` returns thinking text in result object

---

## Phase 3 — Agents + Evidence (Archivist)

| Field | Value |
|---|---|
| **Goal** | Sentinel + Cognoscente pipelines produce alerts + hash-chained bundles |
| **Duration** | 12–16 hours |

### Files

```
apps/api/src/agents/base-agent.ts
apps/api/src/agents/sentinel.agent.ts
apps/api/src/agents/cognoscente.agent.ts
apps/api/src/services/archivist.service.ts
apps/api/src/routes/sentinel.ts
apps/api/src/routes/cognoscente.ts
apps/api/src/routes/evidence.ts
apps/api/src/routes/alerts.ts
apps/api/src/workers/sentinel.worker.ts
apps/api/src/workers/cognoscente.worker.ts
packages/shared/src/types/decision-bundle.ts
```

### APIs

| Method | Path |
|---|---|
| POST | `/families/current/sentinel/call-recording` |
| GET | `/families/current/sentinel/alerts` |
| POST | `/families/current/sentinel/alerts/:id/resolve` |
| POST | `/families/current/cognoscente/check-in` |
| GET | `/families/current/cognoscente/check-ins` |
| GET | `/families/current/cognoscente/trends` |
| GET | `/families/current/alerts` |
| GET | `/families/current/evidence/bundles` |
| GET | `/families/current/evidence/bundles/:id` |
| GET | `/families/current/evidence/chain` |
| POST | `/families/current/evidence/chain/verify` |
| POST | `/families/current/evidence/export` |

### Database tables

| Table | Purpose |
|---|---|
| `agents` | Agent config/status |
| `agent_logs` | Operational logs |
| `alerts` | Unified alerts |
| `decision_bundles` | Hash chain |
| `cognoscente_check_ins` | Check-in records |
| `cognoscente_baselines` | Rolling baseline |
| `cognoscente_trends` | Daily aggregates |
| `memory_reasoning_traces` | thinkingText storage |

### Agent behavior (real)

**Sentinel:**

1. Accept multipart: audio + optional transcript
2. If no transcript → QVAC transcribe (local node)
3. Qwen3 classify → if UNCERTAIN → MedPsy deep analysis
4. Tool: `alert_caregivers`, `archive_bundle`
5. Commit Decision Bundle with delegation attestation if delegated

**Cognoscente:**

1. Accept check-in audio
2. Transcribe → MedPsy prompt with baseline JSON
3. Parse metrics → update baselines → alert if threshold
4. Bundle + disclaimer in alert body

**Archivist:**

- Deterministic SHA-256 chain
- No LLM

### Tests

| Test | Coverage |
|---|---|
| `archivist.service.test.ts` | 100% — hash chain integrity |
| `sentinel.integration.test.ts` | Upload sample scam WAV → alert + bundle |
| `cognoscente.integration.test.ts` | Upload check-in → metrics row |
| `evidence.integration.test.ts` | chain verify passes |

### Exit criteria

- [ ] 3+ real Decision Bundles in chain
- [ ] Bundle links to inference_log rows via bundle_id
- [ ] JSON export contains bundles + verification report

---

## Phase 4 — P2P Delegation + Storage + Realtime

| Field | Value |
|---|---|
| **Goal** | Audio in R2; delegated inference demo; live alert on dashboard |
| **Duration** | 8–10 hours |

### Files

```
apps/api/src/services/storage.service.ts      # R2 presigned
apps/api/src/services/mesh.service.ts         # device registry + topology
apps/api/src/routes/devices.ts
apps/api/src/routes/mesh.ts
apps/api/src/plugins/websocket.ts
apps/qvac-node/src/delegate-consumer.ts       # Pi-side script for demo
```

### APIs

| Method | Path |
|---|---|
| POST | `/families/current/devices` |
| GET | `/families/current/devices` |
| GET | `/families/current/mesh/topology` |
| WS | `/realtime` — events: `alert:new`, `archivist:bundle_committed` |

### Database tables

| Table | Purpose |
|---|---|
| `devices` | mesh_public_key, role, last_seen |
| `device_health_logs` | Optional heartbeat |

### Tests

| Test | Notes |
|---|---|
| `storage.integration.test.ts` | Presigned PUT + GET roundtrip |
| `websocket.integration.test.ts` | Connect + receive alert event |
| Manual demo script | `scripts/demo-delegate.ts` on Pi |

### Exit criteria

- [ ] Call recording stored in R2 (encrypted HTTPS transit)
- [ ] inference_log row shows non-null `delegate_provider`
- [ ] Mesh topology shows 2+ nodes online

---

## Phase 5 — Deploy + Test + Hackathon Artifacts

| Field | Value |
|---|---|
| **Goal** | Staging live; CI green; submission package complete |
| **Duration** | 8–10 hours |

### Files

```
.github/workflows/ci.yml
README.md                          # What's Real table + bounty mapping
LICENSE                            # Apache-2.0
docs/IMPLEMENTATION_PLAN.md        # Executive summary for judges
evidence/demo-run-2026-06-21.json  # Frozen log snapshot matching video
scripts/record-demo.sh             # Demo checklist
```

### APIs

All prior endpoints deployed to `api.kinkeeper.app` (or staging URL).

### Database tables

Production migration on Supabase staging project.

### Tests

| Suite | Target |
|---|---|
| `npm run test:unit` | auth + archivist + inference-logger ≥80% |
| `npm run test:integration` | All Phase 1–4 happy paths |
| `npm run test:e2e` | 1 Playwright: login → upload scam audio → see alert → export CSV |
| `npm audit` | No high/critical |

### Deployment checklist

- [ ] Render: Docker API, health check green
- [ ] Vercel: frontend env vars set
- [ ] Supabase: RLS enabled, backups on
- [ ] R2: bucket private, CORS for presigned only
- [ ] Upstash: Redis connected

### Hackathon deliverables

- [ ] Public GitHub repo
- [ ] Demo video ≤5 min (YouTube unlisted)
- [ ] `evidence/inference-log.csv` committed (or release artifact)
- [ ] Hardware proof section in README
- [ ] Discord link + join proof

---

## Phase 6 — Frontend (AFTER backend approved)

| Field | Value |
|---|---|
| **Goal** | Caregiver dashboard — Hiro-quality restraint, KINKEEPER identity |
| **Duration** | 12–16 hours |
| **Prerequisite** | User approves `FRONTEND_ARCHITECTURE.md` (generated separately after Phase 5) |

### Files (minimal)

```
apps/web/src/routes/
  index.tsx              # Marketing landing
  login.tsx
  register.tsx
  app/index.tsx          # Dashboard
  app/alerts.tsx
  app/alerts/[id].tsx
  app/evidence.tsx
  app/upload.tsx         # Sentinel + Cognoscente upload
  app/onboarding.tsx     # 3 steps
apps/web/src/components/
  AlertCard.tsx
  EvidenceBundleViewer.tsx
  CognitiveTrendChart.tsx
  MeshTopology.tsx
docs/FRONTEND_ARCHITECTURE.md
```

### Routes (NOT full 40+ sitemap)

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/app` | Dashboard summary |
| `/app/onboarding` | Family setup |
| `/app/alerts` | Alert feed |
| `/app/evidence` | Bundle list + export |
| `/app/upload` | Demo upload UI |

### Tests

| Test | Target |
|---|---|
| Vitest smoke | Each page renders |
| axe-core | Zero critical on `/app` |
| Playwright | Full demo path |

### Exit criteria

- [ ] Lighthouse ≥90 on dashboard (95 aspirational)
- [ ] WCAG 2.2 AA on alert + evidence pages
- [ ] Large touch targets (44px) on upload flow

---

## Timeline Summary (1 developer)

| Phase | Hours | Cumulative | Calendar (8h/day) |
|---|---|---|---|
| 0 Research + QVAC smoke | 6 | 6 | Day 1 AM |
| 1 DB + Auth | 10 | 16 | Day 1 PM – Day 2 AM |
| 2 QVAC wrapper + node | 14 | 30 | Day 2–3 |
| 3 Agents + evidence | 16 | 46 | Day 3–4 |
| 4 P2P + R2 + WS | 10 | 56 | Day 4–5 |
| 5 Deploy + artifacts | 10 | 66 | Day 5–6 |
| 6 Frontend (minimal) | 14 | 80 | Day 6–7 |

**If starting June 20 with June 21 deadline:** Execute Phases 0–3 + inference export + README + video **first**. Frontend = upload form only (HTML or minimal Vite). Phase 6 full dashboard is **post-submission** unless time allows.

---

## Priority Cuts (if behind schedule)

Cut in this order (last cut = never):

1. Chronicler / RAG search
2. Coordinator agent
3. WebSocket (poll instead)
4. Mesh topology UI (show JSON)
5. PDF evidence export (JSON only)
6. Cognoscente trends chart (table only)
7. ~~Sentinel pipeline~~ — **never cut**
8. ~~Inference CSV export~~ — **never cut**
9. ~~Decision Bundle hash chain~~ — **never cut**
10. ~~Delegated inference demo~~ — **never cut** (highest QVAC score)

---

## Definition of Done (Hackathon Win)

| Artifact | Judge sees |
|---|---|
| Repo | Clean Fastify + QVAC wrapper + agents |
| Video | Real audio → real model → real alert → real log |
| CSV/JSON | TTFT, TPS, model names match video |
| README | Honest "What's Real" + hardware specs |
| MedPsy | Cognoscente or Sentinel-Deep on edge hardware |
| P2P | At least one delegated inference log row |
| License | Apache-2.0 |

---

## Stop Condition

This plan is **planning only**. Implementation begins when user says:

> All ENV variables are ready. Start implementation.

First implementation commit: Phase 0 smoke script + monorepo scaffold.
