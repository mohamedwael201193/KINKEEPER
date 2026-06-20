# IMPLEMENTATION TODO — KINKEEPER × AETHER Backend

**Last updated:** 2026-06-20 (runtime verification complete)

---

## Phase 0 — QVAC validation & smoke test

- [x] Monorepo scaffold
- [x] QVAC smoke test (`npm run qvac:smoke`)
- [x] Runtime verify (`npm run qvac:runtime`) — **ALL STEPS PASS**
- [x] `QVAC_RUNTIME_REPORT.md`

## Phase 1 — Database, auth, family

- [x] Prisma schema + Supabase
- [x] Auth integration test (PASS)
- [x] Family/elders via E2E verify

## Phase 2 — QVAC wrapper & cognition node

- [x] `@kinkeeper/qvac` wrapper
- [x] Cognition node + provider
- [x] MedPsy local download (`npm run download:medpsy`)
- [x] Whisper fix (`audioChunk`)
- [x] Inference CSV + DB logs (21+ rows)

## Phase 3 — Agents

- [x] Sentinel E2E — SCAM alert, bundle, transcript (**PROVEN**)
- [x] Cognoscente E2E — baselines, trends, MedPsy bundle (**PROVEN**)
- [x] Archivist hash chain — `{ valid: true, length: 2 }`
- [x] BullMQ workers processing jobs

## Phase 4 — Integration & hardening

- [x] `npm run build/lint/typecheck/test:*` — all PASS
- [x] Root env + JWT path fixes
- [x] Delegation verify with fallback (`npm run delegate:verify`)
- [x] `SENTINEL_E2E_REPORT.md`
- [x] `COGNOSCENTE_E2E_REPORT.md`
- [x] `EVIDENCE_SYSTEM_REPORT.md`
- [x] `DELEGATION_VERIFICATION_REPORT.md`
- [x] `PRODUCTION_READINESS_REPORT.md`
- [x] `RUNTIME_VERIFICATION_MASTER_REPORT.md`

---

## Blockers

| ID | Blocker | Status |
|---|---|---|
| B1 | Rotate Supabase password | **User action** |
| B2 | True P2P delegation (second peer) | Manual demo on two hosts |
| B3 | Render deployment | Not deployed |

---

## Stop condition

Runtime verification complete. **No frontend.** See `RUNTIME_VERIFICATION_MASTER_REPORT.md`.
