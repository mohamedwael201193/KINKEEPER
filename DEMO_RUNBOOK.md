# KINKEEPER Demo Runbook

Frozen reproduction path for hackathon judges. Run from repository root on Windows PowerShell unless noted.

## Prerequisites snapshot

| Item | Expected |
|---|---|
| Node | v22.17+ (`node -v`) |
| SDK | `@qvac/sdk@0.13.3` |
| MedPsy | `MEDPSY_MODEL=1.7B`, file ~1223 MB in QVAC cache |
| Test audio | `test-data/sentinel-scam.wav`, `test-data/cognoscente-checkin.wav` |
| `.env` | `DATABASE_URL`, `REDIS_URL`, `QVAC_NODE_SECRET`, JWT PEM paths |

## Terminal layout

| Terminal | Command | Ready signal |
|---|---|---|
| T1 | `npm run dev:qvac-node` | `Essential models preloaded` + health 200 |
| T2 | `npm run dev:api` | `Server listening at http://0.0.0.0:3000` |

## Step 1 — QVAC runtime (T3)

```powershell
npm run qvac:runtime
```

**Expected:** exit 0, all steps PASS  
**Artifacts:** `QVAC_RUNTIME_REPORT.md`, `evidence/qvac-runtime-verify.json`  
**Check:** `providerPublicKey` 64 hex chars; whisper step includes `segments` count > 0

## Step 2 — Delegation fallback (T3)

```powershell
npm run delegate:verify
```

**Expected:** exit 0, completion output contains a greeting word  
**Artifacts:** `DELEGATION_VERIFICATION_REPORT.md`, `evidence/delegation-verify.json`

## Step 3 — Agent E2E (T3, T1+T2 running)

```powershell
npm run e2e:verify
```

**Expected:** exit 0  
**Artifacts:**

- `SENTINEL_E2E_REPORT.md` — alert summary must NOT contain `"undefined"`
- `COGNOSCENTE_E2E_REPORT.md` — baselines + trend rows
- `EVIDENCE_SYSTEM_REPORT.md` — `"valid": true`
- `evidence/sentinel-e2e.json`, `evidence/cognoscente-e2e.json`

## Step 4 — True P2P (two devices)

**Device A (provider):** already running `npm run dev:qvac-node`

```powershell
curl -H "Authorization: Bearer $env:QVAC_NODE_SECRET" http://localhost:3001/internal/health
```

Copy `providerPublicKey`.

**Device B (consumer, different network — phone hotspot OK):**

```powershell
git clone <repo> KINKEEPER
cd KINKEEPER
npm install
npm run download:medpsy
$env:PROVIDER_PUBLIC_KEY="<paste-key>"
npm run p2p:consumer
```

**Expected on Device B:** exit 0, `"ok": true`, content includes `delegated`  
**Artifact:** `evidence/p2p-consumer-result.json`

**Same-machine sanity (expected fail):**

```powershell
npm run p2p:verify
```

**Expected:** `sameHostStrictTest.ok: false`, report at `TRUE_P2P_VERIFICATION_REPORT.md`

## Step 5 — Metadata audit

```powershell
Get-Content evidence/inference-metadata.jsonl -Tail 5
```

**Expected fields:** `stopReason` (e.g. `eos`), `backendDevice` (`gpu`), `transcribeStats.totalSegments`

## Report checklist for judges

| Report | Proves |
|---|---|
| `SDK_013_MIGRATION_REPORT.md` | SDK 0.13.3 upgrade + tests |
| `QVAC_RUNTIME_REPORT.md` | Local AI on consumer hardware |
| `DELEGATION_VERIFICATION_REPORT.md` | Delegate API + fallback |
| `TRUE_P2P_VERIFICATION_REPORT.md` | Cross-device P2P procedure |
| `SENTINEL_E2E_REPORT.md` | Scam alert pipeline |
| `COGNOSCENTE_E2E_REPORT.md` | Cognitive check-in pipeline |
| `EVIDENCE_SYSTEM_REPORT.md` | Hash chain integrity |
| `REPRODUCIBILITY_REPORT.md` | Full command matrix |
| `FINAL_PRE_FRONTEND_REPORT.md` | Go/no-go score after fixes |

## Troubleshooting

| Symptom | Fix |
|---|---|
| MedPsy download stuck | `npm run download:medpsy` first; set `PRELOAD_MEDPSY=false` |
| API env missing | Use root scripts (`npm run dev:api`), not workspace `-w` |
| P2P fails same machine | Normal — use second device per Step 4 |
| Whisper error | Ensure SDK 0.13.3 + `audioChunk: { type: "filePath", value }` |
