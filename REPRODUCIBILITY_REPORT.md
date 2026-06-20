# Reproducibility Report

**Generated:** 2026-06-20  
**SDK:** @qvac/sdk@0.13.3

---

## What's real / what's not

See [README.md](./README.md#whats-real--whats-not) for the full table.

**Summary:** All agent inference, transcription, alerts, bundles, and hash chains are real. Cross-device P2P and cloud deploy are the only unproven items.

---

## Exact setup commands

```powershell
# Prerequisites: Node 22.17+, Git, PowerShell
cd KINKEEPER
npm install

copy .env.example .env
# Required in .env:
#   DATABASE_URL, DIRECT_URL, REDIS_URL
#   QVAC_NODE_SECRET, JWT_PRIVATE_KEY_PATH, JWT_PUBLIC_KEY_PATH
#   APP_URL, API_URL, CORS_ORIGINS

npm run db:push
npm run download:medpsy
powershell -ExecutionPolicy Bypass -File scripts/generate-test-audio.ps1
```

### Start stack (3 terminals)

```powershell
# T1 — Cognition node
npm run dev:qvac-node

# T2 — API + BullMQ workers
npm run dev:api

# T3 — Verification
npm run build && npm run lint && npm run typecheck
npm run test:unit && npm run test:integration
npm run qvac:runtime
npm run delegate:verify
npm run e2e:verify
npm run p2p:verify
npm run verify:db
```

---

## Hackathon reproduction guide

Full frozen runbook: **[DEMO_RUNBOOK.md](./DEMO_RUNBOOK.md)**

### Expected outputs

| Command | Exit code | Report files |
|---|---|---|
| `qvac:runtime` | 0 | `QVAC_RUNTIME_REPORT.md`, `evidence/qvac-runtime-verify.json` |
| `delegate:verify` | 0 | `DELEGATION_VERIFICATION_REPORT.md` |
| `e2e:verify` | 0 | `SENTINEL_E2E_REPORT.md`, `COGNOSCENTE_E2E_REPORT.md`, `EVIDENCE_SYSTEM_REPORT.md` |
| `p2p:verify` | 0 | `TRUE_P2P_VERIFICATION_REPORT.md` (`proven: false` on single host) |
| `verify:db` | 0 | Console table of 17 tables |

### Evidence artifacts

| Path | Contents |
|---|---|
| `evidence/inference-log.csv` | Every SDK operation (timestamp, model, ttft, tps) |
| `evidence/inference-metadata.jsonl` | stopReason, backendDevice, transcribeStats |
| `evidence/sentinel-e2e.json` | Full Sentinel pipeline JSON |
| `evidence/cognoscente-e2e.json` | Full Cognoscente pipeline JSON |
| `evidence/p2p-verify.json` | Strict P2P test result |

---

## Verification results (2026-06-20 post-0.13.3)

| Check | Result |
|---|---|
| Build/lint/typecheck | PASS |
| Unit tests | 2/2 PASS |
| Integration (Supabase auth) | 1/1 PASS |
| QVAC runtime (4 steps) | ALL PASS |
| Delegation fallback | PASS |
| Sentinel E2E | PASS — alert summary valid (no `undefined`) |
| Cognoscente E2E | PASS |
| Evidence chain | `{ "valid": true, "length": 2 }` |
| Strict P2P same-host | FAIL (expected) |
| Cross-device P2P | NOT RUN |

---

## Environment variables reference

| Variable | Purpose |
|---|---|
| `MEDPSY_MODEL` | `1.7B` (default) or `4B` |
| `PRELOAD_MEDPSY` | `true` to preload on qvac-node startup |
| `QVAC_MODELS_CACHE_DIR` | Local GGUF cache (`.qvac-models`) |
| `EVIDENCE_DIR` | Default `./evidence` |
| `PROVIDER_PUBLIC_KEY` | Consumer-side P2P target key |

---

## Security reproducibility note

If `DATABASE_URL` was exposed in chat, rotate the Supabase database password before sharing this repo or deploying:

1. Supabase Dashboard → Project Settings → Database → Reset password  
2. Update `.env` `DATABASE_URL` and `DIRECT_URL`  
3. Re-run `npm run test:integration` and `npm run e2e:verify`

This step cannot be automated from the codebase.

---

## Demo script one-liner (after stack up)

```powershell
npm run qvac:runtime; npm run delegate:verify; npm run e2e:verify
```

Expected: three exit code 0, six report files updated under repo root.
