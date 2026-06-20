# PROJECT REALITY CHECK — KINKEEPER × AETHER

**Author role:** Technical owner / hackathon judge lens  
**Source of truth:** `CURSOR_FINAL_MASTER_PROMPT.md` (read end-to-end)  
**Date:** 2026-06-20  
**Build window remaining:** ~1 day until final submission (June 21, 2026)  
**Team assumption:** 1 developer, no elder mobile app in this repo

---

## Executive Summary

The master prompt describes a **12–18 month startup platform** (5+ agents, P2P mesh, delegated inference, billing, SMS, WebAuthn, 40+ frontend routes, load tests at 100 concurrent families). That scope is **not buildable to production grade by one person before June 21, 2026**.

What **is** buildable and **winnable**: a **narrow, evidence-rich QVAC showcase** — local inference on BYOH hardware, MedPsy-powered cognitive + scam analysis, tamper-evident decision bundles, auditable inference logs, and a **delegated inference demo** (phone/Pi → laptop cognition node) — with a **thin Fastify backend** (Supabase, auth, APIs) and a **focused caregiver dashboard** (not the full sitemap).

The highest-scoring hackathon submission is **deep on QVAC**, not wide on SaaS features.

---

## Critical Conflict: Cloud Inference vs. Hackathon Rules

| Master prompt | Hackathon official rules |
|---|---|
| QVAC models on Render Standard 16GB (~$50/mo) | BYOH — phones, laptops, SBCs |
| Backend IS a "Cognition Node" in cloud | No datacenter/cluster inference |
| "Zero cloud dependency for AI inference" (product vision) | All inference via `@qvac/sdk` on edge hardware |

**Resolution (mandatory):** Render hosts **orchestration only** (API, DB, queues, evidence storage). **All QVAC inference for demo + logs runs on local hardware** (developer laptop + Raspberry Pi or second machine). Delegated inference demo: consumer device as consumer, laptop as provider. Document this clearly in README "What's Real" table.

Running MedPsy-4B on Render risks **disqualification or Stage 3 live verification failure**.

---

## 1. Features that MUST Exist

These are **non-negotiable** for hackathon compliance + credible demo + judge scoring.

### Hackathon compliance (objective)

| Requirement | KINKEEPER implementation |
|---|---|
| Apache 2.0 license | `LICENSE` file in repo root |
| All inference via `@qvac/sdk` | Local cognition node + wrapper module |
| Auditable inference log (CSV/JSON) | TTFT, tokens/sec, model load/unload, prompt token counts |
| Demo video ≤ 5 minutes | Script: scam detection + cognitive check-in + P2P delegation + evidence export |
| Hardware proof | README: exact devices, RAM, OS, model quantizations |
| Open source + reproducibility | README with `npm ci`, env vars, `qvac doctor` |
| Discord community | Join + link in README |
| Evidence bundle (3-stage verification) | Repo + logs + video consistency |

### QVAC depth (highest judge weight)

| Capability | Minimum viable proof |
|---|---|
| **LLM completion** | Qwen3-600M or 1.7B local; MedPsy-4B for Psy track |
| **MedPsy** | Cognoscente cognitive deviation analysis (Psy Models track) |
| **Transcription** | Whisper-tiny or large on local node |
| **Embeddings + RAG** | GTE-Large + `ragSearch` on Chronicler chapter OR memory snippet |
| **Tool calling** | Sentinel or Cognoscente calls ≥1 tool (alert, archive) |
| **captureThinking** | Stored in Decision Bundle reasoning field |
| **P2P / delegated inference** | `startQVACProvider` on laptop; second device delegates one call |
| **Inference logging** | QVAC `loggingStream` + app-level CSV |

### Product core (must work for real, not mocked)

| Feature | Scope |
|---|---|
| Auth | Email/password + JWT (WebAuthn can be Phase 2 if time) |
| Family + elder CRUD | One family, one elder for demo |
| Sentinel pipeline | Upload real audio → transcribe → classify → alert → bundle |
| Cognoscente pipeline | Upload check-in audio → MedPsy analysis → trend row → optional alert |
| Archivist | Hash-chained Decision Bundles in Postgres |
| Inference log API | `GET .../inference-logs/export?format=csv` |
| Evidence export | JSON minimum; PDF nice-to-have |

---

## 2. Features that SHOULD Exist

Strongly improve score and production credibility; build if time after MUST list.

| Feature | Why |
|---|---|
| Chronicler (single chapter) | Shows multimodal stack: Whisper + Qwen3 + GTE RAG search |
| Mesh topology API | Visual proof of P2P family mesh (even 2 nodes) |
| WebSocket realtime | `alert:new`, `archivist:bundle_committed` on dashboard |
| Supabase RLS | Defense-in-depth; judges respect security story |
| R2 presigned uploads | Real audio storage (not DB blobs) |
| Coordinator medication reminder | Simple cron + TTS demo (Supertonic on local node) |
| Marketing landing page | 1 page, not 12 marketing routes |
| Onboarding wizard (3 steps) | Family → elder → device — not 7 steps |
| README bounty mapping table | Maps hackathon criteria → repo artifacts |

---

## 3. Features that Can Wait

Post-hackathon or post-env confirmation. **Do not block submission.**

| Feature | Reason to defer |
|---|---|
| Elder React Native app | Explicitly out of scope; simulate via API uploads + curl/Postman |
| Full 40+ frontend routes | UI polish ≠ judging weight |
| Stripe billing (3 plans) | Not scored; adds webhook + test complexity |
| Twilio SMS | Optional notifications; email sufficient for demo |
| Web Push (VAPID) | In-app + email enough |
| WebAuthn passkeys | Email auth works; add after launch |
| Knowledge graph (entities/relationships) | Chronicler v2 |
| Fine-tuning / FLUX / diffusion | Not relevant to KINKEEPER story |
| k6 load test 100 families | Aspirational; document target, skip execution |
| Better Stack status page | Sentry + health endpoint sufficient for hackathon |
| PostHog analytics | Explicitly opt-in optional |
| Blog, changelog, FAQ pages | Marketing debt |
| Pen test automation (sqlmap) | Manual checklist only |
| Multi-region DR | Enterprise phase |
| Blind relay operation | Document config; don't operate relays |
| 50-chapter Chronicler state machine | One chapter proves concept |
| Calendar MCP integration | Coordinator v2 |
| hang_up_call Android tool | Requires mobile app |

---

## 4. Features that Should Be Removed (from hackathon scope)

Remove from **June 21 submission scope** — not from long-term vision. Document as roadmap.

| Feature | Why remove now |
|---|---|
| NestJS backend | Replaced by Fastify per execution command |
| QVAC inference on Render 16GB | Hackathon rule conflict |
| 5 sub-agents (Sentinel-Deep, Cognoscente-Trend, etc.) | Merge into parent agents |
| Synthetic seed data in production narrative | Dev-only seed OK; demo uses real uploads |
| Simulated elder phone flows | Replace with API + recorded audio samples (real inference, real files) |
| `$ saved estimate` scam stats | Hard to defend without real billing data — use alert counts |
| BIP-39 mesh seed QR pairing | Complex crypto UX — simplify to device registration + public key |
| Client-side encryption of all R2 objects | v2; server-side encryption + RLS for v1 |
| 30-day synthetic Cognoscente trends in seed | Real baselines need real check-ins over time; demo with 3–5 real check-ins |
| Full OWASP pen test suite | Checklist only |
| 80% unit coverage entire codebase | Target 80% on auth + archivist + qvac wrapper only |

---

## 5. Technical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **QVAC model download size/time** | High | Pre-download models before demo; commit cache path in docs; use smallest quants (Q4) |
| **Render cannot run QVAC natively** | High | Never depend on cloud inference; local cognition node is source of truth |
| **Windows dev env for QVAC** | Medium | Verify `qvac doctor` on Windows; use WSL2 or Linux Pi for demo if needed |
| **Delegated inference NAT** | Medium | Demo on same LAN; pre-warm DHT; document 15–45s cold bootstrap |
| **MedPsy JSON parsing failures** | Medium | Zod validate; retry with stricter prompt; fallback to structured tool call |
| **Prisma + pgvector on Supabase** | Low | Enable extension in dashboard; test migration early |
| **Monorepo scope creep** | Medium | Single `apps/api` + `apps/qvac-node` max for hackathon |
| **Audio pipeline latency** | Medium | Pre-record 2–3 sample calls; live demo optional |
| **Hash chain bugs** | High | Archivist is deterministic — unit test 100% coverage |
| **Stage 3 live verification** | High | Logs must match video exactly — single scripted demo run |

---

## 6. Time Risks

| Factor | Impact |
|---|---|
| **~1 day to deadline** | Full master prompt = impossible |
| 2283 lines of spec | Analysis paralysis — follow `WINNING_BUILD_PLAN.md` only |
| First-time QVAC integration | Budget 8–12 hours minimum |
| Model downloads (10GB+) | Can consume entire day on slow network |
| Full frontend sitemap | 2–3 weeks alone |
| Env var collection | Blocks implementation — user must provision Supabase first |
| Docker Render deploy | 2–4 hours first time |
| Demo video production | 3–4 hours (script, record, edit, upload) |

**Time strategy:** Parallelize env setup (user) + local QVAC proof (dev) while waiting. Cut frontend to **5 dashboard screens** max for submission.

---

## 7. Architecture Risks

| Risk | Description | Decision |
|---|---|---|
| **Split brain: product vs hackathon** | Master prompt assumes production SaaS; hackathon assumes edge AI | Dual-mode architecture: local QVAC node + cloud API |
| **Elder app dependency** | Sentinel/Cognoscente flows assume phone uploads | HTTP API accepts uploads from any client; demo via web upload UI |
| **BullMQ on Upstash** | Redis serverless limits | OK for demo volume; watch connection limits |
| **Supabase Realtime + custom WS** | Two realtime systems | Pick one for hackathon: custom WS from Fastify |
| **Evidence PDF generation** | puppeteer heavy on Render | JSON export mandatory; PDF optional |
| **Family mesh encryption** | XSalsa20 + BIP-39 + Argon2id | Simplify v1: TLS + JWT + RLS; mesh encryption v2 |
| **Feature flags without mocks** | Missing Twilio must disable SMS, not fake SMS | Correct pattern — implement flags |

---

## 8. Recommended Scope (Winning Submission)

### Target tracks

1. **General Purpose** — primary
2. **Psy Models** — MedPsy Cognoscente + Sentinel deep analysis
3. **Tinkerer** — delegated inference + hash chain (optional third narrative)

Skip **Mobile track** (no RN app in time).

### The winning story (5-minute demo script)

1. **Setup shot:** Show laptop + Pi, `qvac doctor`, models loaded locally.
2. **Sentinel:** Play scam call audio → Whisper transcribe → Qwen3 classify uncertain → delegate MedPsy-4B → SCAM alert → Decision Bundle committed → hash chain verified.
3. **Cognoscente:** Play elder check-in → MedPsy extracts metrics vs baseline → calm dashboard trend (no diagnosis disclaimer).
4. **P2P:** Show inference log row with `delegate_provider` pubkey — phone/Pi delegated to laptop.
5. **Evidence:** Export CSV inference log + JSON bundle chain — matches video timestamps.

### Build footprint (realistic)

| Layer | Hackathon scope |
|---|---|
| Backend | Fastify, ~25 endpoints, Prisma, BullMQ |
| QVAC node | Separate process on laptop/Pi |
| Database | ~20 tables (not all 40+) |
| Agents | Sentinel, Cognoscente, Archivist (Coordinator stub OK) |
| Frontend | Landing + login + dashboard + alerts + evidence + 1 upload flow |
| Tests | Integration tests on auth + archivist + inference log; 1 Playwright path |
| Deploy | API on Render free/starter; frontend Vercel; Supabase free |

### Success metrics for judges

| Criterion | How we win |
|---|---|
| Technical execution & performance | Real TTFT/TPS in CSV; MedPsy on consumer hardware |
| Innovation | Family safety + Psy models + tamper-evident AI audit trail |
| QVAC usage | completion + transcribe + embed + ragSearch + delegate + tool calling + thinking capture |
| Artifact quality | Video ↔ logs ↔ repo hash match |
| Impact | Sandwich generation / elder fraud — clear market |
| Originality | Hash-chained agent decisions + family mesh (not another chatbot) |

### Explicit exclusions (document in README)

- Elder mobile app (roadmap)
- Stripe billing (roadmap)
- SMS notifications (roadmap)
- Full Chronicler 50-chapter system (roadmap)
- Cloud-hosted inference (intentionally excluded — hackathon compliance)

---

## Decision Gate

**Do not write implementation code** until the user states:

> All ENV variables are ready. Start implementation.

Until then, user should prioritize: **Supabase project**, **local QVAC model cache**, **Cloudflare R2 bucket**, **Upstash Redis** — minimum viable env for backend + evidence storage.

See `ENV_REQUIREMENTS.md` for full list; see `WINNING_BUILD_PLAN.md` for hour-by-hour phases.
