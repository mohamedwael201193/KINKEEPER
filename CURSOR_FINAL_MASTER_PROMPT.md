# KINKEEPER × AETHER — Cursor Final Master Prompt

> **THIS IS THE ONLY PROMPT.** Read this entire document three times before taking any action. This prompt defines a strict 16-phase workflow. Skipping phases, mocking services, generating placeholder code, building the frontend before the backend, or any other violation of this document is a critical failure that invalidates the entire build.
>
> **You are NOT building a demo.** You are NOT building an MVP. You are NOT building a prototype. You are building a real, startup-grade, production-ready platform that real families will trust with their aging parents' safety and their family's most private data. Every line of code must be production-grade. Every integration must actually work. Every agent must make real decisions. Every alert must trigger real notifications. Every evidence bundle must be cryptographically verifiable.

---

## 0. Mission Statement

### 0.1 What You Are Building

You are the lead engineer building **KINKEEPER** — the AI co-pilot for the sandwich generation. KINKEEPER is a local-first, peer-to-peer, multi-agent AI mesh that protects aging parents from scams, monitors cognitive health, preserves family memories, coordinates care logistics, and bundles tamper-evident evidence — running entirely on a family's existing consumer hardware (phones, laptops, Raspberry Pi), with zero cloud dependency for AI inference.

**The architecture combines two layers:**

- **KINKEEPER** — the user-facing product. The marketing site, the caregiver dashboard, the elder mobile app (built separately), the family experience. What the user sees and touches.
- **AETHER** — the internal multi-agent intelligence fabric that powers KINKEEPER. The orchestration layer beneath the surface: agent runtime, mesh networking, memory system, evidence system, reasoning pipeline, tool registry, delegation protocol. What the user never sees but everything depends on.

Every KINKEEPER feature is implemented on top of AETHER. Every AETHER capability is exposed through KINKEEPER. The two are inseparable in implementation but conceptually distinct: AETHER is the engine, KINKEEPER is the car.

### 0.2 Primary Objective

Build the strongest possible submission for **QVAC Hackathon I** (https://dorahacks.io/hackathon/qvac-unleach-edge-ai-i/detail) while simultaneously building a real startup-quality platform that could launch as a product the day after the hackathon ends.

The hackathon has a 21-day build window (June 1 – June 21, 2026), a $21,000 prize pool, four tracks (General Purpose / Tinkerer / Mobile / Psy Models), and mandatory requirements: Apache 2.0 license, QVAC SDK for all inference, auditable inference logs (CSV/JSON with TTFT, tokens/sec), ≤5-minute demo video, hardware proof. Your implementation must satisfy every mandatory requirement.

### 0.3 Hard Rules — Violation of Any Is a Critical Failure

- ❌ **NO mock data.** No fake users, no fake alerts, no fake cognitive trends, no fake chapters, no fake devices.
- ❌ **NO fake APIs.** No "TODO: implement this endpoint" stubs that return hardcoded data.
- ❌ **NO demo-only flows.** Every flow must work for real users.
- ❌ **NO placeholders.** No `// TODO`, no `throw new Error('Not implemented')`, no `return null as any`, no `// placeholder`.
- ❌ **NO simulated inference.** Every QVAC SDK call must run real models on real hardware.
- ❌ **NO fake metrics.** Dashboard numbers must reflect real database state.
- ❌ **NO hardcoded outputs.** Agent decisions must come from real LLM inference.
- ❌ **NO skipping env vars.** Every external service must be properly configured. Feature flags disable features gracefully if vars are missing — they never mock the feature.
- ❌ **NO "I'll add tests later."** Tests are written alongside implementation.
- ❌ **NO "I'll fix security later."** Security is built-in from line one.
- ❌ **NO frontend-first development.** The frontend is the LAST phase. Phases 1-15 must complete before any frontend code is written.
- ❌ **NO pnpm, bun, or yarn.** Use **npm** everywhere. No exceptions.
- ❌ **NO cloning Hiro's design.** Analyze Hiro for quality bar. Create a custom design language for KINKEEPER.
- ❌ **NO shortcuts.** Ever. For any reason.

---

## 1. Development Order — Strict Sequence

Execute these phases in order. Do not skip ahead. Do not parallelize phases that depend on each other. Each phase produces a deliverable that the next phase depends on.

| Phase | Name | Output | Code Allowed? |
|---|---|---|---|
| 0 | Research & Documentation Review | `docs/RESEARCH.md` | NO |
| 1 | Architecture | `docs/ARCHITECTURE.md` | NO |
| 2 | Database Design | `docs/DATABASE_ARCHITECTURE.md` + Prisma schema | Schema only |
| 3 | Authentication | Auth module implementation | YES |
| 4 | Backend APIs | All REST controllers + OpenAPI spec | YES |
| 5 | QVAC Integration | QVAC SDK wrapper module | YES |
| 6 | Agent System (AETHER) | All 5+ agents with real reasoning | YES |
| 7 | P2P Layer | Hyperswarm DHT + mesh + message bus | YES |
| 8 | Delegated Inference | Provider server + consumer client + attestations | YES |
| 9 | Evidence Logging | Archivist + hash chain + audit log | YES |
| 10 | Monitoring | Sentry + Better Stack + structured logging | YES |
| 11 | Security Hardening | OWASP audit + rate limiting + RLS + dependency audit | YES |
| 12 | Deployment | Vercel + Render + Supabase + R2 + Upstash configured | YES |
| 13 | Testing | Unit + integration + e2e + load | YES |
| 14 | Implementation Plan | `IMPLEMENTATION_PLAN.md` | NO |
| 15 | Env Requirements | `ENV_REQUIREMENTS.md` → user fills → `ENV_SETUP_GUIDE.md` | NO |
| 16 | Frontend Architecture | `FRONTEND_ARCHITECTURE.md` → STOP for review | NO |
| 17 | Frontend Implementation | React + Vite + TS + Tailwind + shadcn/ui | YES |

**Phase 0 produces `docs/RESEARCH.md`.**
**Phase 1 produces `docs/ARCHITECTURE.md`.**
**Phase 2 produces `docs/DATABASE_ARCHITECTURE.md` and the initial Prisma schema.**
**Phases 3-13 produce working backend code.**
**Phase 14 produces `IMPLEMENTATION_PLAN.md` summarizing everything built.**
**Phase 15 produces `ENV_REQUIREMENTS.md`, then STOPS for user to fill env vars, then produces `ENV_SETUP_GUIDE.md`.**
**Phase 16 produces `FRONTEND_ARCHITECTURE.md` and STOPS for user review.**
**Phase 17 produces the frontend.**

---

## Phase 0 — Research & Documentation Review

**NO CODE GENERATION in this phase. You only read, research, and understand.**

### 0.1 Required Reading (do all before proceeding)

Read these documents and resources completely. For each, write a 200-word summary in `docs/RESEARCH.md`.

**QVAC official documentation** (read in this order):
1. https://qvac.tether.io — the marketing site (understand the philosophy: "Stable Intelligence," "Sovereign AI," local-first, P2P)
2. https://docs.qvac.tether.io — the SDK docs (read end-to-end; if too long, read the `llms-full.txt` mirror at `https://docs.qvac.tether.io/llms-full.txt`)
3. https://github.com/tetherto/qvac — the SDK source (clone locally, read examples in `packages/sdk/examples/`)
4. https://huggingface.co/qvac — the models (note all available models, sizes, licenses)
5. https://github.com/tetherto/qvac-fabric-llm.cpp — the inference engine fork (TurboQuant, Vulkan/Metal/CUDA)
6. QVAC Discord (`discord.com/invite/tetherdev`) — read recent announcements and known issues

**QVAC Hackathon I rules:**
1. https://dorahacks.io/hackathon/qvac-unleach-edge-ai-i/detail — read Official Rules, Prizes & Judging, Eligibility
2. Note: mandatory Apache 2.0 license, mandatory QVAC SDK for all inference, mandatory auditable inference logs (CSV/JSON with TTFT, tokens/sec), mandatory ≤5min demo video, mandatory hardware proof, 4 tracks (General Purpose / Tinkerer / Mobile / Psy Models)

**Study these QVAC capabilities specifically:**
- SDK lifecycle: `loadModel`, `unloadModel`, `close`
- LLM completion: `completion({ history, tools, captureThinking, emitRawDeltas, stream })`
- Transcription: `transcribe`, `transcribeStream` (Whisper, Parakeet)
- Text-to-speech: `textToSpeech` (Supertonic)
- Embeddings: `embed` (GTE-Large)
- RAG: `ragChunk`, `ragIngest`, `ragSaveEmbeddings`, `ragSearch`, `ragReindex`, `ragDeleteEmbeddings`, `ragListWorkspaces`, `ragCloseWorkspace`, `ragDeleteWorkspace`
- OCR: `ocr`
- Multimodal: `vla`, `vlaPreprocessImage` (SmolVLM2, Gemma3 multimodal)
- Translation: `translate` (Bergamot)
- Diffusion: `diffusion`, `upscale` (FLUX.2)
- Fine-tuning: `finetune` (LoRA, SFT, Causal)
- P2P: `startQVACProvider({ firewall })`, `stopQVACProvider`
- Delegated inference: `loadModel({ delegate: { providerPublicKey, fallbackToLocal, timeout } })`
- Model registry: `modelRegistryList`, `modelRegistrySearch`, `modelRegistryGetModel`, `downloadAsset`
- Cancellation: `cancel({ requestId })`
- Profiling: `getModelInfo`, Profiler utility
- Reasoning transparency: `captureThinking: true` → `thinkingDelta` events; `emitRawDeltas: true` → `rawDelta` events
- Tool calling: `tools` array (Zod schemas) → `toolCall` / `toolError` events; MCP server support
- Available models: Qwen3-600M/1.7B/4B/8B, Llama 3.2 1B, MedPsy-1.7B/4B (the Psy models), Whisper-tiny/large-v3-turbo, Parakeet-Sortformer-4Spk, Supertonic TTS, GTE-Large embeddings, FLUX.2 Klein

### 0.2 Critical Understanding Checks

Before proceeding to Phase 1, you must be able to answer these questions precisely. Write answers in `docs/RESEARCH.md`.

1. What is the exact import path for the QVAC SDK in a TypeScript project? What Node.js version is required?
2. What is the exact API signature for `loadModel`? What are the valid `modelType` values?
3. What is the exact API signature for `completion`? How do you enable thinking capture? How do you stream?
4. What is the exact API signature for `transcribe` and `transcribeStream`? What audio formats are accepted?
5. What is the exact API signature for `textToSpeech`? What output formats are supported?
6. What is the exact API for `startQVACProvider`? How does the `firewall` option work?
7. What is the exact API for `loadModel({ delegate })`? What are the valid delegate options? What does `fallbackToLocal` do?
8. What are the available model constants? List all `QWEN3_*`, `MEDPSY_*`, `WHISPER_*`, `PARAKEET_*`, `TTS_*`, `GTE_*` constants.
9. How does `modelRegistryList` and `downloadAsset` work? How do peers share models via Hyperdrive?
10. How does the Hyperswarm DHT work in QVAC? What is the bootstrap time? How do blind relays work?
11. What is `qvac doctor` and what does it validate?
12. What is TurboQuant and how does it improve KV-cache memory?
13. What is `qvac serve openai` (OpenAI-compatible server)?
14. What are the hardware requirements per platform (macOS, iOS, Linux, Android, Windows)?
15. How does `qvac-finetune` work? What base models and quantizations are supported?
16. What is the BCI (brain-computer interface) capability? (Likely not used in KINKEEPER but note it.)
17. What is the VLA (vision-language-action) capability for robotics? (Likely not used.)
18. How does the QVAC event stream work? List all event types (`contentDelta`, `thinkingDelta`, `toolCall`, `toolError`, `completionStats`, `completionDone`, `rawDelta`).
19. What are the `stopReason` values from `completionDone`?
20. How does MCP integration work with `completion({ tools })`?

### 0.3 Research Output

Create `docs/RESEARCH.md` with:
- 200-word summary of each required reading (Section 0.1)
- Answers to all 20 questions in Section 0.2 (be specific — include API signatures, code snippets, version numbers)
- A diagram (ASCII or Mermaid) of your understanding of the QVAC SDK architecture
- A list of every QVAC SDK API KINKEEPER will need to call, with the exact use case for each
- A list of every external service KINKEEPER will need (database, storage, queue, auth, monitoring, etc.)
- A summary of QVAC hackathon judging criteria and how KINKEEPER will satisfy each

**DO NOT PROCEED TO PHASE 1 until `docs/RESEARCH.md` is complete and you can answer all 20 questions from memory.**

---

## Phase 1 — Architecture

**NO CODE GENERATION in this phase. You produce `docs/ARCHITECTURE.md` only.**

### 1.1 Generate `docs/ARCHITECTURE.md`

This document is the complete system architecture. It must include every section below.

### 1.2 Two-Layer Architecture: KINKEEPER × AETHER

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            KINKEEPER × AETHER ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  KINKEEPER LAYER (User-Facing Product)                                          │
  │                                                                                  │
  │  ┌─────────────────────────────────┐  ┌──────────────────────────────────────┐ │
  │  │  Web App (Vercel)               │  │  Elder Mobile App (React Native)     │ │
  │  │  React + Vite + TS + Tailwind   │  │  Built separately — not in this build│ │
  │  │  + shadcn/ui                    │  │  BUT web app must support its data   │ │
  │  │  - Marketing site               │  │  contract (Sentinel call uploads,    │ │
  │  │  - Caregiver dashboard          │  │  Cognoscente check-ins, etc.)       │ │
  │  │  - Onboarding                   │  │                                      │ │
  │  └──────────────┬──────────────────┘  └──────────────────┬───────────────────┘ │
  │                 │ HTTPS (REST) + WSS (realtime)           │                     │
  │                 └──────────────────┬──────────────────────┘                     │
  │                                    ▼                                            │
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  AETHER LAYER (Internal Intelligence Fabric) — Backend on Render (NestJS)       │
  │                                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
  │  │  API Gateway                                                             │   │
  │  │  REST controllers + WebSocket gateway + rate limiting + auth middleware │   │
  │  └─────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
  │  │  Agent Orchestration                                                     │   │
  │  │  ├── Base Agent class (lifecycle, loop scheduler, tool registry)        │   │
  │  │  ├── Sentinel Agent (fraud/scam interceptor)                            │   │
  │  │  ├── Cognoscente Agent (cognitive health monitor — uses MedPsy-4B)      │   │
  │  │  ├── Chronicler Agent (memory preservation — weekly interviews)         │   │
  │  │  ├── Coordinator Agent (care logistics — meds, appts)                   │   │
  │  │  ├── Archivist Agent (evidence bundler — hash chain)                    │   │
  │  │  └── [Additional agents as needed: Sentinel-Deep, Cognoscente-Trend,    │   │
  │  │      Chronicler-Indexer, Coordinator-Sync, Archivist-Verifier]          │   │
  │  └─────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
  │  │  Memory System                                                           │   │
  │  │  ├── Vector memory (QVAC GTE-Large embeddings + Postgres pgvector)      │   │
  │  │  ├── Knowledge graph (Postgres tables for entities + relationships)     │   │
  │  │  ├── Episodic memory (Decision Bundles — every agent decision logged)   │   │
  │  │  ├── Semantic retrieval (QVAC ragSearch)                                │   │
  │  │  └── Reasoning traces (captureThinking + emitRawDeltas)                 │   │
  │  └─────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
  │  │  Evidence System                                                         │   │
  │  │  ├── Decision Bundle schema (inputs, reasoning, delegation, tools,      │   │
  │  │  │   action, device, hash, previousHash)                                │   │
  │  │  ├── SHA-256 hash chain (tamper-evident, append-only)                   │   │
  │  │  ├── Inference audit log (CSV/JSON with TTFT, tokens/sec — QVAC req.)  │   │
  │  │  ├── Export wizard (PDF/JSON/CSV for legal/medical/insurance use)       │   │
  │  │  └── Chain integrity verification (cron job + on-demand)                │   │
  │  └─────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
  │  │  QVAC Integration (the backend IS a Cognition Node)                     │   │
  │  │  ├── QVAC SDK wrapper (loadModel, completion, transcribe, TTS, embed)   │   │
  │  │  ├── P2P Provider Server (startQVACProvider for family devices)        │   │
  │  │  ├── Delegated Inference Client (when backend needs Pi's Whisper)      │   │
  │  │  ├── Inference Audit Logger (CSV/JSON with TTFT, tokens/sec)            │   │
  │  │  └── Model lifecycle management (load/unload based on demand)           │   │
  │  └─────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
  │  │  Mesh Layer (Hyperswarm DHT via QVAC SDK)                               │   │
  │  │  ├── Peer discovery (deterministic swarm topic from family key)         │   │
  │  │  ├── Direct connect (dht.connect(publicKey))                            │   │
  │  │  ├── Blind relays (NAT traversal)                                       │   │
  │  │  ├── Typed message bus (5+ message types, JSON, encrypted)              │   │
  │  │  ├── Mesh health monitor (60s heartbeat)                                │   │
  │  │  └── Attestation protocol (signed model + input + output hashes)        │   │
  │  └─────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
  │  │  Cross-Cutting Services                                                 │   │
  │  │  ├── Auth (JWT + WebAuthn + family invites)                             │   │
  │  │  ├── Storage (R2 for audio/transcripts — encrypted at rest)             │   │
  │  │  ├── Realtime (Supabase Realtime + custom WebSocket)                    │   │
  │  │  ├── Notifications (email/SMS/push/in-app)                              │   │
  │  │  ├── Billing (Stripe)                                                   │   │
  │  │  ├── Audit log (every action tracked)                                   │   │
  │  │  └── Health/Metrics (Prometheus format)                                 │   │
  │  └─────────────────────────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
  ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
  │  Postgres          │    │  Object Storage    │    │  Redis             │
  │  (Supabase)        │    │  (Cloudflare R2)   │    │  (Upstash)         │
  │  - All relational  │    │  - Audio files     │    │  - BullMQ queues   │
  │    data            │    │  - Transcripts     │    │  - Cache           │
  │  - pgvector        │    │  - Chapter audio   │    │  - Rate limiting   │
  │  - RLS policies    │    │  - Memory vault    │    │  - Session store   │
  │                    │    │  - All encrypted   │    │                    │
  └────────────────────┘    └────────────────────┘    └────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  FAMILY MESH (P2P via QVAC Hyperswarm DHT) — NOT on Render                      │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  ┌────────────┐ │
  │  │ Elder Phone  │  │ Caregiver    │  │ Laptop (= Backend on │  │ Raspberry  │ │
  │  │ (Sentinel +  │  │ Phone        │  │  Render — Cognition  │  │ Pi 4       │ │
  │  │  UI)         │  │ (Dashboard)  │  │  Node, always-on)    │  │ (Archive + │ │
  │  │              │  │              │  │                       │  │  Sentinel) │ │
  │  └──────────────┘  └──────────────┘  └──────────────────────┘  └────────────┘ │
  │  All P2P communication encrypted with family-derived key (BIP-39 → Argon2id)   │
  └─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Architecture Document Contents

`docs/ARCHITECTURE.md` must include:

1. **Two-layer overview** — KINKEEPER (product) vs AETHER (fabric). Why this separation matters (separates user experience from intelligence, enables future products on AETHER).
2. **System diagram** — the diagram above, refined.
3. **Data flow diagrams** — for each critical user journey:
   - Scam call detection (Sentinel)
   - Daily cognitive check-in (Cognoscente)
   - Weekly memory interview (Chronicler)
   - Medication reminder (Coordinator)
   - Evidence bundle creation (Archivist)
   - P2P delegated inference (phone → laptop)
   - Family mesh formation (first device → second device pairing)
4. **Service catalog** — every NestJS module with: name, purpose, dependencies, key methods, external integrations.
5. **Agent catalog** — every agent with: name, loop cadence, model binding, tools, decision flow, evidence bundle structure, realtime events emitted.
6. **Memory system design** — vector memory, knowledge graph, episodic memory, retrieval, reasoning traces.
7. **Evidence system design** — Decision Bundle schema, hash chain, audit log, export.
8. **QVAC integration map** — every QVAC SDK API used, with the exact use case.
9. **P2P mesh design** — node roles, message types, encryption, delegation, attestations.
10. **Deployment topology** — Vercel + Render + Supabase + R2 + Upstash. Why each. Cost projection at 100/1000/10000 users.
11. **Scalability strategy** — horizontal scaling, caching, connection pooling, read replicas, queue partitioning.
12. **Security model** — auth, RLS, encryption at rest, encryption in transit, secrets management, audit log, OWASP top 10 mitigation.
13. **Observability** — logging, metrics, tracing, error tracking, uptime monitoring.
14. **Disaster recovery** — backups, point-in-time recovery, rollback procedures, multi-region considerations.
15. **Hackathon compliance matrix** — every QVAC hackathon requirement mapped to a KINKEEPER feature.

**DO NOT PROCEED TO PHASE 2 until `docs/ARCHITECTURE.md` is complete.**

---

## Phase 2 — Database Design

### 2.1 Generate `docs/DATABASE_ARCHITECTURE.md`

Document the complete database design. Include:

1. **Database choice: Postgres on Supabase.** Justify:
   - Managed Postgres with point-in-time recovery, automatic backups, read replicas
   - Generous free tier (500MB DB, 1GB storage)
   - Built-in Row-Level Security (RLS) — enforce family-level data isolation at the database layer, not just the application layer
   - Built-in Realtime (Postgres changes broadcast over WebSocket) — reduces operational complexity
   - Built-in Storage (S3-compatible) — same vendor, same auth, same dashboard
   - Built-in Auth — fallback option for email/password
   - pgvector extension — for vector memory (semantic search of memoir chapters, evidence bundles, alerts)

2. **Why not Neon:** Better cold-start but lacks integrated Storage/Realtime/Auth.
3. **Why not Render Postgres:** Lacks integrated Storage/Realtime/Auth.
4. **Why not MongoDB:** KINKEEPER data is highly relational (families → members → elders → devices → agents → alerts → bundles). Postgres + Prisma gives type safety and referential integrity. Vector search via pgvector.
5. **Why not DynamoDB:** Vendor lock-in, no pgvector equivalent, no RLS.

### 2.2 Schema Design

The complete schema covers (at minimum) these domains:

**Users & Auth:**
- `users` (id, email, password_hash, first_name, last_name, avatar_url, email_verified_at, created_at, updated_at, deleted_at)
- `webauthn_credentials` (id, user_id, credential_id, public_key, counter, transports, created_at)
- `refresh_tokens` (id, user_id, token_hash, expires_at, revoked_at, created_at)
- `password_resets` (id, user_id, token_hash, expires_at, used_at, created_at)
- `email_verifications` (id, user_id, token_hash, expires_at, used_at, created_at)

**Families (the mesh):**
- `families` (id, name, mesh_seed_encrypted, mesh_public_key, created_at, updated_at)
- `family_members` (id, family_id, user_id, role, relationship, access_level, created_at)
- `family_invites` (id, family_id, email, role, token_hash, expires_at, accepted_at, accepted_by, created_at)

**Elders (the people being cared for):**
- `elders` (id, family_id, first_name, last_name, birth_year, timezone, avatar_url, created_at, updated_at)

**Devices:**
- `devices` (id, family_id, name, role, hardware_model, os, ram_bytes, storage_bytes, qvac_sdk_version, mesh_public_key, status, last_seen_at, joined_at, created_at)
- `device_models` (id, device_id, model_src, model_type, loaded_at, unloaded_at)
- `device_health_logs` (id, device_id, cpu_percent, ram_used_bytes, ram_total_bytes, disk_used_bytes, disk_total_bytes, battery_percent, temperature_c, recorded_at)

**Agents:**
- `agents` (id, family_id, name, status, config, created_at, updated_at)
- `agent_logs` (id, family_id, agent, level, message, metadata, created_at)

**Alerts:**
- `alerts` (id, family_id, elder_id, agent, severity, type, title, summary, metadata, bundle_id, resolved, resolved_at, resolved_by, created_at)
- `alert_acknowledgments` (id, alert_id, user_id, acknowledged_at)

**Decision Bundles (the Archivist's hash chain):**
- `decision_bundles` (id, family_id, agent, trigger, inputs, reasoning, delegation, tool_calls, action, device, hash, previous_hash, created_at)
- Indexes on (family_id, created_at), (agent, created_at), (hash)

**Cognoscente (cognitive health):**
- `cognoscente_check_ins` (id, elder_id, audio_url, transcript, word_finding_latency_sec, semantic_drift, repetition, sentiment, composite_deviation, alert_triggered, bundle_id, created_at)
- `cognoscente_baselines` (id, elder_id, metric, baseline_value, stddev, computed_at, sample_count)
- `cognoscente_trends` (id, elder_id, date, word_finding_latency_sec, semantic_drift, repetition, sentiment, composite_deviation, alert_triggered)

**Chronicler (memory preservation):**
- `chronicler_chapters` (id, elder_id, number, title, life_chapter, duration_sec, audio_url, transcript, summary, bundle_id, recorded_at, created_at)
- `chronicler_chapter_access` (id, chapter_id, user_id, accessed_at)
- `chronicler_interview_state` (id, elder_id, current_chapter, current_outline, status, started_at, completed_at)

**Coordinator (care logistics):**
- `coordinator_medications` (id, elder_id, name, dosage, schedule, active, created_at)
- `coordinator_medication_logs` (id, medication_id, scheduled_time, status, taken_at, created_at)
- `coordinator_appointments` (id, elder_id, title, scheduled_at, duration_min, location, notes, reminder_sent, created_at)
- `coordinator_tasks` (id, family_id, elder_id, assigned_to, title, description, due_at, completed, completed_at, created_at)

**Memory Vault:**
- `memory_vault_items` (id, family_id, type, title, description, file_url, thumbnail_url, metadata, tags, event_date, uploaded_by, created_at)
- `memory_vault_access` (id, item_id, user_id, accessed_at)

**Health Timeline:**
- `health_events` (id, elder_id, event_type, title, description, source_type, source_id, metadata, occurred_at, created_at)

**Memory System (AETHER):**
- `memory_embeddings` (id, family_id, source_type, source_id, content, embedding (vector(1024)), metadata, created_at) — pgvector
- `memory_entities` (id, family_id, type, name, attributes, created_at)
- `memory_relationships` (id, family_id, source_entity_id, target_entity_id, type, metadata, created_at)
- `memory_reasoning_traces` (id, family_id, agent, bundle_id, thinking_text, raw_deltas, created_at)

**Notifications:**
- `notifications` (id, user_id, type, title, body, data, read_at, created_at)
- `notification_preferences` (id, user_id, agent, severity, channels, quiet_hours_start, quiet_hours_end)

**Inference audit log (QVAC hackathon requirement):**
- `inference_logs` (id, family_id, device_id, timestamp, model_src, operation, prompt_tokens, completion_tokens, ttft_sec, tps, delegate_provider, delegate_fallback_used, bundle_id, created_at)
- Index on (family_id, timestamp DESC) for queries

**Billing:**
- `stripe_customers` (id, user_id, stripe_customer_id, created_at)
- `subscriptions` (id, family_id, stripe_subscription_id, plan, status, current_period_end, created_at)
- `invoices` (id, family_id, stripe_invoice_id, amount_paid, currency, period_start, period_end, created_at)

**Audit log (compliance):**
- `audit_logs` (id, family_id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at)

### 2.3 RLS Policies

Document every Row-Level Security policy. Every table that has `family_id` gets an RLS policy:

```sql
-- Example: alerts table
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_family_isolation ON alerts
  FOR ALL
  USING (family_id IN (
    SELECT family_id FROM family_members WHERE user_id = auth.uid()
  ));
```

This means even if the application layer has a bug that lets a query through without a family_id filter, the database rejects it. Defense in depth.

### 2.4 Migrations

Use Prisma migrations. Generate the initial migration:
```bash
npx prisma migrate dev --name init
```

Every schema change gets a new migration. Migrations are committed to git. Production migrations run via `npx prisma migrate deploy` (no interactive prompts).

### 2.5 Seed Data (Development Only)

`prisma/seed.ts` — creates synthetic test data for development ONLY. Clearly marked with a banner: `// DEVELOPMENT SEED — DO NOT RUN IN PRODUCTION`. Includes:
- 1 family with 3 members (Karen caregiver, David caregiver, Margaret elder)
- 4 devices (Pixel 6a, iPhone, M1 MacBook Air, Raspberry Pi 4)
- 5 agents (Sentinel, Cognoscente, Chronicler, Coordinator, Archivist)
- 30 days of synthetic Cognoscente check-ins (with realistic cognitive trend data)
- 5 synthetic Sentinel alerts (with full Decision Bundles)
- 3 Chronicler chapters (with audio + transcript)
- 1 week of medication logs (94% adherence)
- A complete hash chain of 50 Decision Bundles

**Production NEVER runs seed.** Enforce via npm script: `"seed": "NODE_ENV=development ts-node prisma/seed.ts"` and a guard in the seed script that throws if `NODE_ENV !== 'development'`.

**DO NOT PROCEED TO PHASE 3 until `docs/DATABASE_ARCHITECTURE.md` is complete and the Prisma schema compiles.**

---

## Phase 3 — Authentication

Implement real authentication. No mocks.

### 3.1 Auth Choice: Custom JWT (RS256) + WebAuthn + Family Invites, with Supabase Auth as fallback for email/password

Justify:
- Need WebAuthn (passkeys) for elderly caregivers who forget passwords
- Need family invite tokens (custom flow)
- Need refresh tokens with rotation
- Need family mesh key derivation (BIP-39) tied to user account — custom
- Supabase Auth handles email/password, email verification, password reset, OAuth (Google, Apple). Use it as the "password provider" and add custom logic for WebAuthn and mesh keys.

### 3.2 Implementation

**JWT:**
- Algorithm: RS256 (asymmetric, so Supabase can verify too)
- Access token: 15-minute expiry, contains `sub` (user ID), `family_id`, `role`, `exp`, `iat`
- Refresh token: 30-day expiry, stored hashed in `refresh_tokens` table, rotated on each use, revoked on logout

**Password hashing:** argon2id (memory=64MB, time=3, parallelism=4)

**WebAuthn:**
- `@simplewebauthn/server` for registration and login
- Credential stored in `webauthn_credentials` table
- Supports platform authenticators (Touch ID, Face ID, Windows Hello) and roaming authenticators (YubiKey)

**Family invites:**
- Family admin generates invite → `family_invites` row with `token_hash` (UUID)
- Email sent to invitee with link `https://app.kinkeeper.app/invite/[token]`
- Invitee accepts → joins family with specified role

**Email verification:**
- On registration, send verification email with token
- `email_verifications` table tracks tokens (hashed, 24-hour expiry)
- User must verify before first login (configurable — can be relaxed for dev)

**Password reset:**
- `password_resets` table tracks tokens (hashed, 1-hour expiry)
- Email sent with link `https://app.kinkeeper.app/reset-password/[token]`

**Guards:**
- `JwtAuthGuard` — verifies JWT on every protected route
- `FamilyMemberGuard` — ensures user is a member of the family in the request (for family-scoped routes)
- `RateLimitGuard` — 100 req/min per user, 10 auth attempts per minute per IP

**Cookies vs headers:**
- Access token: `Authorization: Bearer [token]` header (stateless, scalable)
- Refresh token: `httpOnly`, `secure`, `sameSite=strict` cookie (XSS-safe)

### 3.3 Implementation Tasks

- [ ] `AuthModule` with `AuthService`, `AuthController`
- [ ] `POST /auth/register` — email, password, first_name, last_name → creates user, sends verification email, returns JWT
- [ ] `POST /auth/login` — email, password → returns JWT + sets refresh cookie
- [ ] `POST /auth/refresh` — refresh cookie → new JWT + new refresh cookie (rotation)
- [ ] `POST /auth/logout` — revokes refresh token, clears cookie
- [ ] `POST /auth/forgot-password` — email → sends reset email
- [ ] `POST /auth/reset-password` — token, new password → updates password
- [ ] `POST /auth/verify-email` — token → marks email verified
- [ ] `POST /auth/webauthn/register/begin` — starts WebAuthn registration
- [ ] `POST /auth/webauthn/register/finish` — completes WebAuthn registration
- [ ] `POST /auth/webauthn/login/begin` — starts WebAuthn login
- [ ] `POST /auth/webauthn/login/finish` — completes WebAuthn login, returns JWT
- [ ] `POST /auth/family/invite` — family admin generates invite (family-scoped)
- [ ] `POST /auth/family/invite/[token]/accept` — invitee accepts invite
- [ ] Unit tests for every endpoint (happy path + error cases)
- [ ] Integration tests for full auth flows (register → verify → login → refresh → logout)

---

## Phase 4 — Backend APIs

Implement every REST controller and WebSocket event.

### 4.1 Generate `docs/openapi.yaml`

OpenAPI 3.1 spec for every endpoint. For each:
- Method + path
- Auth required (yes/no, role)
- Request body schema (or query params)
- Response schema (success + error)
- Rate limit
- Realtime events emitted (if any)

### 4.2 API Surface (Complete List)

**Auth** (see Phase 3)

**Users:**
- `GET /users/me` — current user profile
- `PATCH /users/me` — update profile
- `PATCH /users/me/password` — change password
- `DELETE /users/me` — delete account (soft delete, 30-day grace period)

**Families:**
- `POST /families` — create family (generates BIP-39 mesh seed)
- `GET /families/current` — current family
- `PATCH /families/current` — update family settings
- `GET /families/current/members` — list members
- `POST /families/current/members` — invite member
- `PATCH /families/current/members/[id]` — update member role
- `DELETE /families/current/members/[id]` — remove member
- `GET /families/current/mesh-seed` — view mesh seed (one-time, requires re-auth)
- `POST /families/current/regenerate-mesh-seed` — regenerate (danger zone, requires password confirmation)

**Elders:**
- `POST /families/current/elders` — add elder
- `GET /families/current/elders` — list elders
- `GET /families/current/elders/[id]` — elder detail
- `PATCH /families/current/elders/[id]` — update elder
- `DELETE /families/current/elders/[id]` — remove elder

**Devices:**
- `POST /families/current/devices` — register device (returns pairing QR code)
- `GET /families/current/devices` — list devices
- `GET /families/current/devices/[id]` — device detail (models, RAM, logs)
- `PATCH /families/current/devices/[id]` — update device (name, role)
- `DELETE /families/current/devices/[id]` — remove device
- `POST /families/current/devices/[id]/command` — send command (restart, unload model)
- `GET /families/current/devices/[id]/health` — health history (paginated)
- `GET /families/current/devices/[id]/inference-logs` — inference logs (paginated)

**Agents:**
- `GET /families/current/agents` — list agents with status
- `GET /families/current/agents/[name]` — agent detail (per-agent UI)
- `PATCH /families/current/agents/[name]` — update agent config
- `POST /families/current/agents/[name]/pause` — pause agent
- `POST /families/current/agents/[name]/resume` — resume agent
- `GET /families/current/agents/[name]/logs` — agent logs (paginated, filterable)

**Sentinel-specific:**
- `POST /families/current/sentinel/call-recording` — elder phone uploads call audio + transcript + initial classification
- `GET /families/current/sentinel/alerts` — list Sentinel alerts
- `GET /families/current/sentinel/alerts/[id]` — alert detail with transcript + reasoning
- `POST /families/current/sentinel/alerts/[id]/resolve` — mark alert resolved
- `GET /families/current/sentinel/stats` — scam stats (types, counts, $ saved estimate)

**Cognoscente-specific:**
- `POST /families/current/cognoscente/check-in` — elder phone uploads check-in audio
- `GET /families/current/cognoscente/check-ins` — check-in history (paginated)
- `GET /families/current/cognoscente/check-ins/[id]` — check-in detail with audio + transcript + analysis
- `GET /families/current/cognoscente/baseline` — current baseline
- `PATCH /families/current/cognoscente/baseline` — update sensitivity thresholds
- `GET /families/current/cognoscente/trends` — trend data (30/90/365 days)

**Chronicler-specific:**
- `POST /families/current/chronicler/interview/start` — start interview (caregiver or elder triggers)
- `POST /families/current/chronicler/interview/[id]/audio` — upload interview audio chunks (streaming)
- `POST /families/current/chronicler/interview/[id]/complete` — mark interview complete (triggers processing)
- `GET /families/current/chronicler/chapters` — chapter library
- `GET /families/current/chronicler/chapters/[id]` — chapter detail with audio + transcript + summary
- `POST /families/current/chronicler/chapters/[id]/access` — log family access
- `GET /families/current/chronicler/search` — semantic search across chapters

**Coordinator-specific:**
- `GET /families/current/coordinator/medications` — list medications
- `POST /families/current/coordinator/medications` — add medication
- `PATCH /families/current/coordinator/medications/[id]` — update medication
- `DELETE /families/current/coordinator/medications/[id]` — remove medication
- `POST /families/current/coordinator/medications/[id]/log` — log dose taken/missed/skipped
- `GET /families/current/coordinator/medications/[id]/adherence` — adherence stats
- `GET /families/current/coordinator/appointments` — list appointments
- `POST /families/current/coordinator/appointments` — add appointment
- `PATCH /families/current/coordinator/appointments/[id]` — update appointment
- `DELETE /families/current/coordinator/appointments/[id]` — remove appointment
- `GET /families/current/coordinator/tasks` — list tasks
- `POST /families/current/coordinator/tasks` — create task
- `PATCH /families/current/coordinator/tasks/[id]` — update task
- `POST /families/current/coordinator/tasks/[id]/complete` — mark task complete

**Archivist-specific (Evidence Center):**
- `GET /families/current/evidence/bundles` — list bundles (paginated, filterable by agent, date, delegation)
- `GET /families/current/evidence/bundles/[id]` — bundle detail (full reasoning trace)
- `GET /families/current/evidence/chain` — chain status (length, integrity verified, last verified)
- `POST /families/current/evidence/chain/verify` — trigger verification
- `POST /families/current/evidence/export` — export wizard (PDF/JSON/CSV, date range, agent filter)

**Alerts (unified):**
- `GET /families/current/alerts` — list alerts across all agents (paginated, filterable)
- `GET /families/current/alerts/[id]` — alert detail
- `POST /families/current/alerts/[id]/acknowledge` — acknowledge alert
- `POST /families/current/alerts/[id]/resolve` — resolve alert

**Memory Vault:**
- `POST /families/current/memory-vault/items` — create item (generates presigned upload URL)
- `GET /families/current/memory-vault/items` — list items (filterable by type, tag, date)
- `GET /families/current/memory-vault/items/[id]` — item detail
- `PATCH /families/current/memory-vault/items/[id]` — update metadata
- `DELETE /families/current/memory-vault/items/[id]` — delete item
- `POST /families/current/memory-vault/items/[id]/access` — log access

**Health Timeline:**
- `GET /families/current/elders/[id]/health-timeline` — timeline events (filterable by type, date)
- `POST /families/current/elders/[id]/health-timeline` — add manual observation
- `GET /families/current/elders/[id]/health-timeline/[eventId]` — event detail

**Mesh:**
- `GET /families/current/mesh/topology` — current mesh topology (nodes, edges, status)
- `GET /families/current/mesh/health` — mesh health history
- `GET /families/current/mesh/models` — models available across mesh
- `POST /families/current/mesh/refresh` — force mesh refresh

**Inference Log (QVAC hackathon requirement):**
- `GET /families/current/inference-logs` — paginated, filterable by model, device, date
- `GET /families/current/inference-logs/export` — export as CSV/JSON (for hackathon submission)

**Notifications:**
- `GET /notifications` — current user's notifications (paginated)
- `POST /notifications/[id]/read` — mark as read
- `POST /notifications/read-all` — mark all as read
- `GET /notifications/preferences` — notification preferences
- `PATCH /notifications/preferences` — update preferences

**Billing:**
- `POST /billing/checkout` — create Stripe Checkout session
- `POST /billing/portal` — create Stripe Customer Portal session
- `GET /billing/subscription` — current subscription
- `GET /billing/invoices` — invoice history
- `POST /billing/webhook` — Stripe webhook (no auth, signature verified)

**Realtime (WebSocket):**
- `WS /realtime` — authenticate with JWT, subscribe to family events
- Events: `alert:new`, `alert:resolved`, `mesh:device_online`, `mesh:device_offline`, `cognoscente:check_in_complete`, `chronicler:chapter_ready`, `coordinator:medication_taken`, `coordinator:medication_missed`, `archivist:bundle_committed`, `sentinel:scam_detected`

**Health/Metrics:**
- `GET /health` — health check (no auth, returns 200 if healthy)
- `GET /ready` — readiness check (no auth, returns 200 if ready to serve traffic)
- `GET /metrics` — Prometheus metrics (no auth, or auth-restricted)

### 4.3 Implementation Standards

- Every controller is thin — delegates to a service
- Every service has unit tests
- Every endpoint has integration tests (using a real test database)
- Input validation via Zod schemas (shared with frontend via `packages/shared`)
- Output serialization via class-transformer
- Pagination: cursor-based for large tables (alerts, bundles, inference_logs), offset-based for small tables
- Error responses: consistent JSON shape `{ error: { code, message, details? } }`
- Rate limiting: 100 req/min per user, 10 auth attempts per IP per minute
- CORS: only allow configured origins

---

## Phase 5 — QVAC Integration

Implement the QVAC SDK wrapper module. This is the foundation of AETHER — every agent depends on it.

### 5.1 QvacModule

```typescript
// Sketch — full implementation in this phase
@Injectable()
export class QvacService implements OnModuleInit, OnModuleDestroy {
  private qvac: QVAC;
  private models: Map<string, string> = new Map();  // modelSrc -> modelId

  async onModuleInit() {
    this.qvac = new QVAC();
    
    // Validate environment
    const modelsCacheDir = process.env.QVAC_MODELS_CACHE_DIR;
    if (!modelsCacheDir) throw new Error('QVAC_MODELS_CACHE_DIR required');
    
    // Load models the backend will serve (Cognition Node)
    await this.loadModel(MEDPSY_4B_Q4_K_M, 'llm');
    await this.loadModel(QWEN3_8B_INST_Q4_K_M, 'llm');
    await this.loadModel(WHISPER_LARGE_V3_TURBO, 'transcription');
    await this.loadModel(PARAKEET_SORTFORMER_4SPK_V1_Q4_0, 'transcription');
    await this.loadModel(GTE_LARGE_FP16, 'embedding');
    
    // Start P2P provider server
    const { publicKey } = await this.qvac.startQVACProvider({
      firewall: {
        mode: 'allow',
        publicKeys: await this.getAuthorizedFamilyPublicKeys(),
      },
    });
    await this.storeBackendPublicKey(publicKey);
    
    // Log startup
    this.logger.log('QVAC Cognition Node started', { publicKey, models: [...this.models.keys()] });
  }

  async loadModel(modelSrc: string, modelType: string, config?: any): Promise<string> {
    const modelId = await this.qvac.loadModel({ modelSrc, modelType, modelConfig: config });
    this.models.set(modelSrc, modelId);
    return modelId;
  }

  async completion(modelSrc: string, history: any[], opts: CompletionOpts): Promise<CompletionResult> {
    const modelId = this.models.get(modelSrc);
    if (!modelId) throw new Error(`Model ${modelSrc} not loaded`);
    
    const start = Date.now();
    const result = this.qvac.completion({
      modelId,
      history,
      tools: opts.tools,
      captureThinking: opts.captureThinking ?? true,
      emitRawDeltas: opts.emitRawDeltas ?? false,
      stream: opts.stream ?? false,
    });
    
    // Log to inference audit
    await this.logInference({
      modelSrc,
      operation: 'completion',
      ttft: Date.now() - start,
      ...await result.stats,
    });
    
    return result;
  }

  async transcribe(modelSrc: string, audio: Buffer, opts?: any): Promise<TranscriptionResult> { ... }
  async textToSpeech(modelSrc: string, text: string, opts?: any): Promise<TTSResult> { ... }
  async embed(modelSrc: string, text: string): Promise<number[]> { ... }
  async ragSearch(workspaceId: string, query: string): Promise<RagResult[]> { ... }
  
  async onModuleDestroy() {
    await this.qvac.stopQVACProvider();
    for (const modelId of this.models.values()) {
      await this.qvac.unloadModel({ modelId });
    }
    await this.qvac.close();
  }
}
```

### 5.2 Model Deployment Strategy

| Device | Models | RAM Budget |
|---|---|---|
| Backend (Render, 16GB) | MedPsy-4B, Qwen3-8B, Whisper-large-v3-turbo, Parakeet-Sortformer-4Spk, GTE-Large | ~10GB |
| Raspberry Pi 4 (4GB) | Qwen3-4B (Q4), Whisper-tiny (Q8) | ~3GB |
| Elder phone (6GB) | Qwen3-600M (Q4), Whisper-tiny (Q8), Supertonic TTS | ~1.5GB |
| Caregiver phone (any) | None (dashboard only) | <500MB |

### 5.3 Inference Audit Logger

Every QVAC SDK call is logged to the `inference_logs` table AND to a CSV file (for QVAC hackathon submission):

```csv
timestamp,family_id,device_id,model_src,operation,prompt_tokens,completion_tokens,ttft_sec,tps,delegate_provider,delegate_fallback_used,bundle_id
2026-06-21T09:47:01.234Z,fam_abc,dev_phone,WHISPER_TINY,transcribeStream,0,42,0.12,—,—,—
2026-06-21T09:47:01.456Z,fam_abc,dev_phone,QWEN3_600M_INST_Q4,completion,287,15,0.31,32.4,—,—,bundle_001
2026-06-21T09:47:02.789Z,fam_abc,dev_phone,MEDPSY_4B_Q4_K_M,completion,412,87,1.21,45.2,backend_pubkey,false,bundle_001
```

The CSV is flushed to disk every 5 minutes (BullMQ job) and is downloadable via `/families/current/inference-logs/export`.

### 5.4 Delegated Inference

When the backend needs to run a model that's only available on another device (e.g., the Pi has Whisper-tiny for always-on listening, and the backend occasionally wants to use it for batch processing), the backend acts as a consumer:

```typescript
const piWhisper = await this.qvac.loadModel({
  modelSrc: WHISPER_TINY,
  modelType: 'transcription',
  delegate: {
    providerPublicKey: piPublicKey,
    fallbackToLocal: true,  // backend has Whisper-large as fallback
    timeout: 30_000,
  },
});
```

When a family device needs a model only the backend has (e.g., the phone needs MedPsy-4B), the phone is the consumer and the backend is the provider:

```typescript
// On the phone (in the elder mobile app, built separately)
const medpsy = await qvac.loadModel({
  modelSrc: MEDPSY_4B_Q4_K_M,
  modelType: 'llm',
  delegate: {
    providerPublicKey: backendPublicKey,
    fallbackToLocal: false,  // phone can't run MedPsy-4B
    timeout: 30_000,
  },
});
```

The backend's `startQVACProvider` firewall restricts which consumer public keys can connect — only authorized family devices.

### 5.5 Attestation Protocol

When a provider returns a delegated inference result, it includes a signed attestation:
- Model identifier + version
- Input hash (SHA-256 of input prompt)
- Output hash (SHA-256 of output)
- Provider signature (Ed25519 over the attestation)
- Fallback flag (was local fallback used?)

This attestation is committed to the Decision Bundle as `delegation` field, making evidence bundles tamper-evident across devices.

---

## Phase 6 — Agent System (AETHER)

Implement the 5 core agents + any additional agents needed. Every agent must:
- Communicate via the typed message bus (Phase 7)
- Reason using real QVAC LLM calls with `captureThinking: true`
- Call tools via QVAC tool calling (Zod schemas)
- Share memory via the Memory System (vector + graph + episodic)
- Log every decision as a Decision Bundle (Phase 9)
- Emit realtime events when actions occur

### 6.1 Base Agent Class

```typescript
export abstract class BaseAgent {
  abstract name: AgentName;
  abstract defaultConfig: AgentConfig;
  
  constructor(
    protected qvac: QvacService,
    protected memory: MemoryService,
    protected archivist: ArchivistService,
    protected mesh: MeshService,
    protected notifications: NotificationService,
    protected logger: Logger,
  ) {}
  
  abstract loop(): Promise<void>;  // called by scheduler
  abstract handleTrigger(trigger: AgentTrigger): Promise<void>;  // called by events
  
  protected async buildBundle(args: BuildBundleArgs): Promise<DecisionBundle> {
    // Compute hash, link to previous, commit to Archivist
  }
  
  protected async callTool(name: string, args: any): Promise<any> {
    // Tool registry dispatch
  }
}
```

### 6.2 Sentinel Agent — Fraud & Scam Interceptor

**Loop cadence:** Event-driven. Triggered when elder phone uploads call recording via `POST /families/current/sentinel/call-recording`.

**Models:**
- Whisper-tiny (on elder phone) — initial transcription (done on phone, transcript uploaded)
- Qwen3-600M (on elder phone) — initial classification (done on phone, classification uploaded)
- MedPsy-4B (on backend) — deep analysis for uncertain cases

**Prompt (Qwen3-600M, on phone):**
```
You are Sentinel, an AI agent protecting {elder_name} from scams. Analyze this call transcript and classify it.

TRANSCRIPT:
{transcript}

Classify as one of:
- SCAM (confidence > 0.85): This is definitely a scam. Common patterns: government impersonation, tech support, romance, grandparent, investment.
- UNCERTAIN (confidence 0.5-0.85): This might be a scam but I'm not sure. Escalate to deep analysis.
- LEGITIMATE (confidence < 0.5): This is not a scam.

Respond with JSON: { "classification": "...", "confidence": 0.XX, "scam_type": "...", "reasoning": "..." }
```

**Prompt (MedPsy-4B, on backend, for uncertain cases):**
```
You are Sentinel-Deep, analyzing a call that was flagged as potentially fraudulent. The initial classifier was uncertain. Perform a deep analysis.

CALL TRANSCRIPT:
{transcript}

INITIAL CLASSIFICATION:
{initial_classification}

INITIAL REASONING:
{initial_reasoning}

Analyze for:
1. Social engineering techniques used (urgency, authority, fear, isolation)
2. Information being requested (SSN, banking, passwords, gift cards, crypto)
3. Caller identity claims (government, tech support, family, romance)
4. Red flags (specific phrases, requests, threats)

Respond with JSON: {
  "classification": "SCAM" | "LEGITIMATE",
  "confidence": 0.XX,
  "scam_type": "government_impersonation" | "tech_support" | "romance" | "grandparent" | "investment" | "other",
  "techniques_identified": ["..."],
  "information_requested": ["..."],
  "red_flags": ["..."],
  "reasoning": "..."
}
```

**Tools (Zod schemas):**
- `notify_elder({ message: string })` — uses Supertonic TTS to speak to elder
- `hang_up_call()` — terminates the call (Android only)
- `alert_caregivers({ summary: string, severity: 'critical' | 'warning' | 'info' })` — sends P2P push to all caregiver phones
- `archive_bundle({ bundle: object })` — commits Decision Bundle to Archivist

**Decision flow:**
1. Phone uploads `{ audio_url, transcript, initial_classification, initial_confidence, initial_reasoning }` to `POST /families/current/sentinel/call-recording`
2. Backend creates a `sentinel.process-call` BullMQ job
3. Job checks initial classification:
   - SCAM with confidence > 0.85: emit alert immediately
   - UNCERTAIN: queue deep analysis (MedPsy-4B on backend)
   - LEGITIMATE: log for analytics, no alert
4. If deep analysis: call QVAC completion with MedPsy-4B prompt, parse JSON
5. If deep analysis says SCAM: emit alert
6. Build Decision Bundle with full reasoning trace (captureThinking), delegation attestation, tool calls
7. Commit bundle to Archivist (Phase 9)
8. Emit `sentinel:scam_detected` and `alert:new` realtime events
9. Dispatch notifications per user preferences

**Risk controls:**
- Conservative threshold: any UNCERTAIN is escalated (no false negatives)
- Elder can override any Sentinel decision (logged in audit)
- If backend unreachable (P2P delegation fails), phone stores audio locally and retries
- Audio retention: 90 days, then auto-deleted (configurable per family)

### 6.3 Cognoscente Agent — Cognitive Health Monitor

**Loop cadence:** Daily 9:00am local time per elder's timezone, elder-initiated.

**Models:**
- Whisper-tiny (on Pi) — transcription
- MedPsy-4B (on backend) — cognitive analysis

**Prompt (MedPsy-4B):**
```
You are Cognoscente, an AI agent monitoring {elder_name}'s cognitive health. Analyze this morning's voice check-in.

CHECK-IN TRANSCRIPT:
{transcript}

ELDER'S 30-DAY BASELINE:
- Word-finding latency: {baseline} sec (stddev {stddev})
- Semantic drift: {baseline} (stddev {stddev})
- Repetition: {baseline} (stddev {stddev})
- Sentiment: {baseline} (stddev {stddev})

Extract these features from today's check-in:
1. word_finding_latency_sec: Average pause length before content words (nouns, verbs). Higher = more difficulty.
2. semantic_drift: Score 0-1 indicating how much the topic wanders. 0 = stayed on topic, 1 = severe drift.
3. repetition: Count of repeated phrases or words.
4. sentiment: Score -1 to 1 (negative to positive).
5. confabulation_markers: List of any confabulation indicators (made-up facts, impossible timelines, etc.)

Then compute:
6. composite_deviation: 0-1 score indicating how far today's check-in deviates from baseline. 0 = within normal range, 1 = severe deviation.
7. alert: boolean — should caregivers be alerted?

Respond with JSON: {
  "word_finding_latency_sec": float,
  "semantic_drift": float,
  "repetition": int,
  "sentiment": float,
  "confabulation_markers": ["..."],
  "composite_deviation": float,
  "alert": boolean,
  "reasoning": "Clinical reasoning for the scores..."
}
```

**Tools:**
- `trend_lookup({ elder_id, metric, days })` — retrieve baseline
- `alert_caregivers({ summary, severity })` — if deviation > threshold
- `schedule_followup({ elder_id, type, time })` — schedule follow-up check
- `archive_bundle({ bundle })` — commit to Archivist

**Decision flow:**
1. Cron job triggers at 9:00am elder's timezone → pushes notification to elder phone
2. Elder opens app, taps "Start check-in," speaks for 60 seconds
3. Phone uploads audio to `POST /families/current/cognoscente/check-in`
4. Pi transcribes (or backend transcribes if Pi offline)
5. Backend runs MedPsy-4B analysis with baseline context
6. Updates `cognoscente_check_ins` table with extracted features
7. Updates `cognoscente_baselines` (rolling 30-day)
8. If `alert: true` → emit alert + notify caregivers
9. Build Decision Bundle with MedPsy reasoning trace
10. Emit `cognoscente:check_in_complete` realtime event

**Risk controls:**
- Never diagnoses — only flags deviations from personal baseline
- All alerts include "This is not a diagnosis. Consult a clinician." disclaimer
- Caregivers can mute specific signal types

### 6.4 Chronicler Agent — Memory Preservation

**Loop cadence:** Weekly Sunday 4:00pm, caregiver or elder initiated.

**Models:**
- Qwen3-8B (on backend) — interview conduction + chapter summarization
- Whisper-large-v3-turbo (on backend) — high-accuracy transcription
- Parakeet-Sortformer-4Spk (on backend) — diarization (separate elder from LLM TTS)
- GTE-Large (on backend) — embed chapters for semantic search

**Interview state machine:**
- States: `idle`, `scheduled`, `in_progress`, `processing`, `completed`, `failed`
- Outline: 50 chapters (childhood, education, career, courtship, marriage, parenthood, etc.)
- Each chapter has 5-10 guiding questions, dynamically selected by Qwen3-8B based on previous answers

**Prompt (Qwen3-8B interview):**
```
You are Chronicler, conducting a weekly life-story interview with {elder_name}. This is Chapter {N}: {chapter_title}.

PREVIOUS CHAPTERS SUMMARY:
{previous_chapters_summary}

INTERVIEW TRANSCRIPT SO FAR:
{transcript}

Ask the next question. Guidelines:
- Open-ended, not yes/no
- Builds on previous answers
- Elicits sensory details (sights, sounds, smells, feelings)
- Elicits specific stories, not generalizations
- Warm, curious, respectful tone
- If elder seems tired or repeats themselves, gently wind down the interview
- Max 30 minutes total, max 8 questions per chapter

Respond with: { "question": "...", "should_continue": boolean, "reasoning": "..." }
```

**Prompt (Qwen3-8B summarization):**
```
You are Chronicler, summarizing Chapter {N} of {elder_name}'s life story.

INTERVIEW TRANSCRIPT:
{transcript}

Produce:
1. summary: 2-3 paragraph narrative summary of this chapter
2. key_quotes: 3-5 verbatim quotes that capture the essence
3. themes: list of themes (e.g., "perseverance", "family bonds")
4. entities: list of people, places, organizations mentioned (for knowledge graph)
5. life_chapter: which life chapter this represents (childhood, education, etc.)

Respond with JSON: { ... }
```

**Decision flow:**
1. Caregiver triggers interview via dashboard → `POST /families/current/chronicler/interview/start`
2. Elder phone prompts: "Margaret, ready for Chapter 14: First Job?"
3. State machine: `in_progress`
4. Qwen3-8B asks question → elder speaks → audio uploaded → transcribed → Qwen3-8B asks next question
5. Loop until `should_continue: false` or 30 min cap
6. State machine: `processing`
7. Parakeet diarizes (separate elder from LLM TTS voice)
8. Whisper transcribes full audio
9. Qwen3-8B summarizes → produces chapter summary, key quotes, themes, entities
10. GTE-Large embeds chapter for semantic search
11. Store entities in `memory_entities`, relationships in `memory_relationships` (knowledge graph)
12. Store chapter in `chronicler_chapters`
13. Notify family: "Chapter 14 is ready"
14. Build Decision Bundle
15. Emit `chronicler:chapter_ready` realtime event

### 6.5 Coordinator Agent — Care Logistics

**Loop cadence:** 5-minute heartbeat. Event-driven for caregiver commands.

**Models:**
- Qwen3-4B (on Pi) — natural language interpretation for task creation
- Supertonic TTS (on elder phone) — voice reminders

**Tools (via MCP):**
- `calendar_read({ from, to })` — read local calendar
- `calendar_write({ event })` — write to local calendar
- `contacts_read({ filter })` — read contacts
- `notify_elder({ message })` — Supertonic TTS
- `notify_caregiver({ user_id, message })` — push notification
- `log_medication({ medication_id, status })` — log dose
- `create_task({ title, assigned_to, due_at })` — create care task
- `archive_bundle({ bundle })` — commit to Archivist

**5-minute heartbeat:**
1. Check `coordinator_medications` for doses due in next 5 minutes
2. For each due dose: trigger Supertonic TTS reminder on elder phone
3. Check `coordinator_appointments` for upcoming (next 1 hour)
4. For each upcoming appointment: notify elder + caregiver
5. Check `coordinator_medication_logs` for doses past grace period (15 min) not marked taken → mark as missed, notify caregiver
6. Check `coordinator_tasks` for overdue tasks → notify assignee
7. Build Decision Bundle for the heartbeat (summary of actions)
8. Emit relevant realtime events

### 6.6 Archivist Agent — Evidence Bundler

**Loop cadence:** Continuous. Receives Decision Bundles from all other agents.

**Not an LLM agent** — deterministic service. No model binding.

**Decision Bundle schema (matches frontend TypeScript type exactly):**

```typescript
interface DecisionBundle {
  bundleId: string;              // UUID v7
  timestamp: string;             // ISO 8601
  agent: 'sentinel' | 'cognoscente' | 'chronicler' | 'coordinator';
  trigger: string;
  inputs: {
    audioClipHash?: string;
    audioClipUrl?: string;
    transcript?: string;
    userMessage?: string;
    priorContext?: any;
  };
  reasoning: {
    modelSrc: string;
    modelVersion: string;
    thinkingText: string;        // from captureThinking
    rawDeltas?: string[];        // from emitRawDeltas
    classification?: string;
    confidence?: number;
  };
  delegation?: {
    providerPublicKey: string;
    consumerPublicKey: string;
    inputHash: string;
    outputHash: string;
    providerSignature: string;
    fallbackToLocal: boolean;
    fallbackUsed: boolean;
  };
  toolCalls: Array<{
    name: string;
    arguments: any;
    result: any;
  }>;
  action: string;
  device: string;
  hash: string;                  // SHA-256 of this bundle
  previousHash: string;          // hash chain link
}
```

**Hash chain:**
- Each bundle's `hash` = SHA-256 of (canonical JSON of all fields except `hash` and `previousHash`)
- Each bundle's `previousHash` = `hash` of the previous bundle in the chain
- First bundle's `previousHash` = "0" (genesis)
- Chain is append-only — never modify or delete
- Daily cron job verifies entire chain integrity
- On-demand verification via `POST /families/current/evidence/chain/verify`

### 6.7 Additional Agents (Implement as Needed)

Based on the architecture, consider these supporting agents:
- **Sentinel-Deep** — sub-agent for MedPsy-4B deep analysis (called by Sentinel)
- **Cognoscente-Trend** — sub-agent for trend analysis and anomaly detection
- **Chronicler-Indexer** — sub-agent for RAG indexing of new chapters
- **Coordinator-Sync** — sub-agent for calendar/contact sync
- **Archivist-Verifier** — sub-agent for chain verification

Document each in `docs/ARCHITECTURE.md` with the same detail as the 5 core agents.

---

## Phase 7 — P2P Layer

Implement the P2P mesh using QVAC's Hyperswarm DHT (built into the SDK).

### 7.1 Mesh Formation

1. First device installed generates a BIP-39 mnemonic (the "family seed") — 12 words
2. Mnemonic → Argon2id (memory=64MB, time=3, parallelism=4) → 32-byte family encryption key
3. Mnemonic → Ed25519 keypair → family mesh public key (Hyperswarm identity)
4. First device bootstraps a Hyperswarm DHT node, becomes "family root"
5. Subsequent devices join by scanning a QR code containing: family root's public key + family encryption key fingerprint + swarm topic
6. Joining device derives same encryption key from mnemonic (entered manually) → becomes a peer

### 7.2 Peer Discovery

- Each device runs a Hyperswarm DHT node
- Family mesh uses a deterministic swarm topic derived from `SHA-256(family_encryption_key)`
- Devices announce on this topic, discover other family devices
- Direct connection via `dht.connect(peerPublicKey)` — no relay required for typical home networks
- Cold-DHT bootstrap: 15-45 seconds on first connection; sub-second on warm sockets

### 7.3 NAT Traversal

- For devices behind restrictive NATs (CGNAT, corporate Wi-Fi), configure blind relays
- `swarmRelays: ["<relay1_pubkey>", "<relay2_pubkey>"]` in `qvac.config.json`
- KINKEEPER operates two default blind relays (best-effort) — document how families can run their own

### 7.4 Transport Encryption

- All P2P messages encrypted at application layer with family key (in addition to transport-layer encryption)
- Even if a relay operator intercepts traffic, they cannot decrypt
- `crypto_secretbox` (XSalsa20-Poly1305) with per-message nonces

### 7.5 Message Types

Five core message types on the bus:

1. `DecisionBundle` — from any agent to Archivist (commit bundle)
2. `CaregiverAlert` — from Sentinel/Cognoscente to caregiver phones
3. `CaregiverCommand` — from caregiver phones to Coordinator
4. `InterviewTrigger` — from caregiver to Chronicler
5. `MeshHealth` — heartbeat from all nodes (60s)

Each message: typed JSON, encrypted, addressed by recipient public key, routed via DHT.

### 7.6 Mesh Health Monitor

- Every 60s, each node broadcasts `MeshHealth` with: node role, available models, current load, battery (if mobile), uptime
- Backend aggregates, exposes via `GET /families/current/mesh/topology`
- Frontend renders as interactive SVG (MeshTopology component)
- Node status: `online` (seen <2min ago), `sleeping` (seen <15min ago), `offline` (seen >15min ago)

### 7.7 Model Distribution

- Models fetched via QVAC's `modelRegistryList`, `downloadAsset` (Hyperdrive-backed)
- If a peer has a model, others can fetch from it (LAN-fast, no internet needed)
- Fall back to direct HuggingFace download on first install (model weights only, never user data)

---

## Phase 8 — Delegated Inference

This is the heart of AETHER's distributed intelligence. Implement it as load-bearing architecture, not a footnote.

### 8.1 Delegation Matrix

| Consumer | Provider | Model | Purpose | Fallback |
|---|---|---|---|---|
| Elder phone | Backend (Render) | MedPsy-4B | Deep scam analysis | Queue for later |
| Elder phone | Backend (Render) | Qwen3-8B | Chronicler interview | Queue for later |
| Raspberry Pi | Backend (Render) | MedPsy-4B | Cognoscente analysis | Queue for later |
| Raspberry Pi | Backend (Render) | Qwen3-8B | Chronicler summarization | Queue for later |
| Caregiver phone | Backend (Render) | Qwen3-8B | Memoir semantic search | Local 600M fallback |
| Backend (Render) | Raspberry Pi | Whisper-tiny | Batch transcription | Local Whisper-large fallback |
| Any device | Any device | (per registry) | Future models | Per-config |

### 8.2 Implementation

```typescript
// In QvacService
async delegatedCompletion(
  modelSrc: string,
  history: any[],
  providerPublicKey: string,
  opts?: { fallbackToLocal?: boolean; timeout?: number }
): Promise<CompletionResult> {
  const modelId = await this.qvac.loadModel({
    modelSrc,
    modelType: 'llm',
    delegate: {
      providerPublicKey,
      fallbackToLocal: opts?.fallbackToLocal ?? false,
      timeout: opts?.timeout ?? 30_000,
    },
  });
  
  try {
    const result = await this.qvac.completion({ modelId, history, captureThinking: true });
    return {
      ...result,
      delegation: {
        providerPublicKey,
        consumerPublicKey: this.ownPublicKey,
        inputHash: sha256(JSON.stringify(history)),
        outputHash: sha256(result.text),
        providerSignature: result.providerSignature,  // from QVAC SDK
        fallbackToLocal: opts?.fallbackToLocal ?? false,
        fallbackUsed: false,
      },
    };
  } catch (err) {
    if (opts?.fallbackToLocal && err.code === 'PROVIDER_UNREACHABLE') {
      // Load locally, mark fallback used
      const localModelId = await this.qvac.loadModel({ modelSrc, modelType: 'llm' });
      const result = await this.qvac.completion({ modelId: localModelId, history, captureThinking: true });
      return {
        ...result,
        delegation: {
          providerPublicKey,
          consumerPublicKey: this.ownPublicKey,
          inputHash: sha256(JSON.stringify(history)),
          outputHash: sha256(result.text),
          providerSignature: null,
          fallbackToLocal: true,
          fallbackUsed: true,
        },
      };
    }
    throw err;
  }
}
```

### 8.3 Performance Targets (Validate in Phase 13)

- Phone local 600M: ~30 tokens/sec, 0.8s TTFT
- Phone → backend delegated MedPsy-4B: ~45 tokens/sec on backend, 1.2s network latency, 0.4s TTFT after warmup → net 11× faster than 600M for the same task
- Pi → backend delegated: similar, plus 0.2s LAN latency
- Cold-DHT bootstrap: 15-45s (pre-warm on startup)

---

## Phase 9 — Evidence Logging

Implement the Archivist's evidence system. This is mandatory for QVAC hackathon judging.

### 9.1 Decision Bundle Lifecycle

1. Agent produces a decision (e.g., Sentinel classifies a call as scam)
2. Agent builds a `DecisionBundle` object with all required fields (see Phase 6.6)
3. Agent calls `ArchivistService.commitBundle(bundle)`
4. Archivist computes `hash = SHA-256(canonicalJSON(bundle without hash/previousHash))`
5. Archivist fetches the latest bundle's hash from the chain → sets `previousHash`
6. Archivist inserts into `decision_bundles` table (with RLS ensuring family isolation)
7. Archivist broadcasts `archivist:bundle_committed` realtime event
8. Bundle is now queryable via `/families/current/evidence/bundles/[id]`

### 9.2 Hash Chain Integrity

- Daily cron job (`archivist.verify-chain`) walks the entire chain, recomputes hashes, verifies links
- On-demand verification via `POST /families/current/evidence/chain/verify`
- If verification fails: critical alert, all agents paused, family notified
- Chain is append-only — never modify or delete (only redact, with redaction logged)

### 9.3 Inference Audit Log (QVAC Requirement)

Every QVAC SDK call logged to:
1. `inference_logs` Postgres table (queryable)
2. CSV file on disk (for hackathon submission): `evidence/inference-log.csv`

Columns (per QVAC hackathon requirements):
- `timestamp` (ISO 8601)
- `family_id`
- `device_id`
- `model_src`
- `operation` (completion, transcribe, textToSpeech, embed, ragSearch)
- `prompt_tokens`
- `completion_tokens`
- `ttft_sec` (time to first token)
- `tps` (tokens per second)
- `delegate_provider` (mesh public key or NULL for local)
- `delegate_fallback_used` (boolean)
- `bundle_id` (links to Decision Bundle if applicable)

Flush to CSV every 5 minutes (BullMQ job). Downloadable via `/families/current/inference-logs/export?format=csv`.

### 9.4 Evidence Export

`POST /families/current/evidence/export` with:
- `date_range: { from, to }`
- `agent: sentinel | cognoscente | chronicler | coordinator | all`
- `format: pdf | json | csv`

Generates export with:
- All matching Decision Bundles (full reasoning traces)
- Hash chain verification report
- Inference log for the date range
- Cover page with family name, export timestamp, export ID

PDFs generated via `pdfkit` or `puppeteer`. Stored in R2 (encrypted with family key), presigned URL returned.

---

## Phase 10 — Monitoring

### 10.1 Error Tracking: Sentry

- `@sentry/node` on backend
- `@sentry/react` on frontend
- Capture unhandled exceptions, performance issues, release tracking
- Source maps uploaded on release
- DSN via `SENTRY_DSN_BACKEND` and `SENTRY_DSN_FRONTEND` env vars

### 10.2 Uptime Monitoring: Better Stack

- Heartbeat to Better Stack every 60s from `GET /health` endpoint
- Alert on-call (email + Slack) if heartbeat missed for 2 minutes
- Status page: `status.kinkeeper.app`

### 10.3 Logging: Pino (structured JSON)

```typescript
// Every log line is JSON with: timestamp, level, message, requestId, userId, familyId, ...context
this.logger.info({ msg: 'Sentinel alert emitted', alertId, elderId, scamType, bundleId });
```

- Logs shipped to Better Stack (Logtail) for aggregation
- No secrets in logs (PII scrubbing via Pino redact)
- Request IDs propagate from API gateway through services (AsyncLocalStorage)

### 10.4 Metrics: Prometheus Format

`GET /metrics` exposes:
- `kinkeeper_http_requests_total{method,route,status}` — counter
- `kinkeeper_http_request_duration_seconds{method,route}` — histogram
- `kinkeeper_inference_total{model,operation,delegated}` — counter
- `kinkeeper_inference_duration_seconds{model,operation}` — histogram
- `kinkeeper_inference_tokens_total{model,type}` — counter (prompt vs completion)
- `kinkeeper_agents_active{agent}` — gauge
- `kinkeeper_mesh_nodes_online` — gauge
- `kinkeeper_decision_bundles_total` — counter
- `kinkeeper_hash_chain_length` — gauge
- `kinkeeper_db_connections_active` — gauge
- `kinkeeper_redis_operations_total{operation}` — counter
- `kinkeeper_queue_jobs_total{queue,status}` — counter

Scraped by Prometheus (or Better Stack's metrics integration).

### 10.5 Health Checks

`GET /health`:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-21T09:47:01.234Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "r2": "healthy",
    "qvac": "healthy",
    "mesh": "healthy"
  },
  "version": "1.0.0"
}
```

Returns 503 if any check fails. Used by Render for health checks and by Better Stack for uptime monitoring.

---

## Phase 11 — Security Hardening

### 11.1 OWASP Top 10 Mitigation

1. **Broken Access Control:** JWT auth on every protected route. FamilyMemberGuard ensures user is in the family. RLS at DB level as defense-in-depth.
2. **Cryptographic Failures:** argon2id for passwords. RS256 for JWTs. XSalsa20-Poly1305 for P2P. SHA-256 for hash chain. TLS 1.3 for all HTTP/WS.
3. **Injection:** Prisma parameterized queries only. Zod validation on all inputs. No raw SQL.
4. **Insecure Design:** Threat model documented. Security review checklist per PR.
5. **Security Misconfiguration:** Helmet middleware. CORS locked down. No debug mode in prod. Env vars validated at startup.
6. **Vulnerable Components:** `npm audit` in CI. Dependabot enabled. Renovate for major updates.
7. **Auth Failures:** Rate limiting (100/min/user, 10/min/IP for auth). Account lockout after 5 failed attempts. Strong password policy (zxcvbn ≥ 3).
8. **Software/Data Integrity Failures:** Subresource integrity for static assets. Signed npm package-lock.json.
9. **Logging/Monitoring Failures:** Every auth event logged. Every data access logged in audit_logs. Sentry + Better Stack.
10. **SSRF:** Allowlist for outbound HTTP (only known services: Stripe, Resend, Twilio, Supabase, R2). Block private IP ranges.

### 11.2 Rate Limiting

- Global: 1000 req/min per IP
- Per-user: 100 req/min
- Auth endpoints: 10 req/min per IP
- Password reset: 3 req/hour per email
- Webhook endpoints: 100 req/min per IP (with signature verification)

### 11.3 CORS

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
});
```

### 11.4 Secrets Management

- All secrets in env vars (never in code, never in git)
- `.env` gitignored. `.env.example` committed (template only)
- Production secrets in Vercel/Render dashboard (encrypted at rest)
- JWT signing keys generated via `openssl genrsa -out jwt-private.pem 2048`
- WebAuthn RPID must match production domain
- Stripe webhook secret verified on every webhook call

### 11.5 Dependency Audit

- `npm audit` in CI, fail on high/critical
- Dependabot for security updates
- Renovate for major version updates (manual review)
- License audit (only allow Apache 2.0, MIT, ISC, BSD — no GPL/AGPL)

### 11.6 Penetration Testing Checklist

Before production: run through this checklist manually + via automation:
- [ ] SQL injection (sqlmap on all endpoints)
- [ ] XSS (inject `<script>` in every input field)
- [ ] CSRF (verify SameSite cookies, no state-changing GET)
- [ ] SSRF (attempt outbound requests to internal IPs)
- [ ] Auth bypass (remove JWT, tamper JWT, expired JWT)
- [ ] IDOR (try to access other families' data)
- [ ] Rate limit bypass (send 1000 req/min)
- [ ] Path traversal (`../../../etc/passwd` in file paths)
- [ ] Command injection (in any exec/spawn calls)
- [ ] Dependency vulnerabilities (`npm audit`)

---

## Phase 12 — Deployment

### 12.1 Frontend: Vercel

- Auto-deploys from `main` branch on GitHub
- Preview environments for every PR
- Custom domain: `app.kinkeeper.app` (production), `staging.kinkeeper.app` (staging)
- Environment variables in Vercel dashboard
- Edge network for global delivery

### 12.2 Backend: Render

- Web service (NestJS) via `render.yaml`
- **Standard instance (16GB RAM)** required for QVAC models — ~$50/month
- Auto-deploy from `main` branch
- Custom domain: `api.kinkeeper.app`
- Health check: `GET /health` returns 200
- Environment variables in Render dashboard
- Dockerfile for reproducible builds

`render.yaml`:
```yaml
services:
  - type: web
    name: kinkeeper-api
    env: docker
    repo: https://github.com/kinkeeper/kinkeeper
    branch: main
    region: oregon
    plan: standard  # 16GB RAM for QVAC models
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: APP_ENV
        value: production
      - key: DATABASE_URL
        sync: false  # set in dashboard
      - key: REDIS_URL
        sync: false
      # ... all other env vars
```

### 12.3 Database: Supabase

- Production project: `kinkeeper-prod`
- Staging project: `kinkeeper-staging`
- Connection pooling via PgBouncer (Supabase default)
- Point-in-time recovery enabled (7 days)
- Daily backups
- pgvector extension enabled
- RLS enabled on every table

### 12.4 Object Storage: Cloudflare R2

- Bucket: `kinkeeper-prod` (production), `kinkeeper-staging` (staging)
- Public access: NO (presigned URLs only)
- Lifecycle: temporary exports auto-delete after 24h
- Encryption: server-side encryption with Cloudflare-managed keys (additional client-side encryption with family key)

### 12.5 Redis: Upstash

- Production: dedicated, 1GB, TLS
- Staging: free tier
- Eviction policy: `allkeys-lru` (cache) + separate DB for BullMQ (no eviction)

### 12.6 DNS: Cloudflare

- `kinkeeper.app` → Vercel
- `app.kinkeeper.app` → Vercel
- `api.kinkeeper.app` → Render
- `status.kinkeeper.app` → Better Stack status page
- All proxied through Cloudflare (DDoS protection, WAF)

### 12.7 CI/CD: GitHub Actions

`.github/workflows/ci.yml`:
- On PR: lint, typecheck, build, unit tests, integration tests. Block merge on failure.
- On merge to main: auto-deploy to staging. Run e2e smoke tests. If pass, manual approval gate, then promote to production.

`.github/workflows/deploy-staging.yml`:
- Triggered on merge to main
- Builds Docker image, pushes to GitHub Container Registry
- Render webhook triggers redeploy
- Vercel auto-deploys frontend
- Run smoke tests against staging

`.github/workflows/deploy-production.yml`:
- Triggered manually after staging validation
- Promotes Docker image to production tag
- Render + Vercel redeploy
- Run smoke tests against production
- Notify Slack/Discord on success/failure

---

## Phase 13 — Testing

### 13.1 Unit Tests

- Every service has unit tests (Jest)
- Mock external dependencies (QVAC SDK, R2, etc.) at the boundary
- Coverage target: 80% for services, 100% for auth and crypto code
- Run on every PR via CI

### 13.2 Integration Tests

- Every API endpoint has integration tests
- Use a real test database (Docker Postgres) — no mocking the DB
- Use a real Redis (Docker) — no mocking the queue
- For QVAC: use smallest models (Qwen3-600M, Whisper-tiny) — REAL inference, not mocks
- Test happy path + error cases + edge cases + auth + RLS

### 13.3 E2E Tests (Playwright)

Critical user flows:
1. **Signup → onboarding → first alert → evidence export**
   - Register new user
   - Complete onboarding wizard
   - Add a device (simulated elder phone uploads a call recording)
   - Verify Sentinel catches the scam
   - Verify alert appears on dashboard
   - Verify Decision Bundle is created
   - Export evidence bundle as PDF
   - Verify PDF contains correct data

2. **Family invite → second caregiver joins**
   - First caregiver invites second
   - Second caregiver accepts invite
   - Both can see same family data
   - Both receive realtime alerts

3. **Cognoscente check-in flow**
   - Upload a check-in audio file
   - Verify MedPsy analysis runs
   - Verify trend chart updates
   - Verify baseline updates

4. **Chronicler interview flow**
   - Start interview
   - Upload audio chunks
   - Complete interview
   - Verify chapter is created with audio + transcript + summary
   - Verify semantic search finds the chapter

5. **Billing flow**
   - Subscribe to Family+ plan
   - Verify Stripe customer created
   - Verify subscription active
   - Cancel subscription
   - Verify access revoked at period end

### 13.4 Load Tests (k6)

- 100 concurrent families (350 users)
- Each family: 1 alert/min, 1 check-in/day, 1 chapter/week
- Target: p95 response time < 500ms
- Identify bottlenecks: DB connections, Redis ops, QVAC inference queue depth

### 13.5 Continuous Verification Checklist

**Before marking ANY task complete:**

- [ ] `npm run lint` passes with zero errors
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] `npm run test:unit` passes with coverage ≥ 80% for changed files
- [ ] `npm run test:integration` passes for changed endpoints
- [ ] `npm run test:e2e` passes for affected user flows (if applicable)
- [ ] No `any` types without explicit eslint-disable
- [ ] All Zod schemas match TypeScript types
- [ ] New endpoint is behind JWT auth (or explicitly public)
- [ ] RLS policy exists for any new family-scoped table
- [ ] Input validation (Zod) on all request bodies
- [ ] No secrets logged
- [ ] No SQL injection vectors (Prisma parameterized queries only)
- [ ] Rate limiting applied to new endpoint
- [ ] `npm audit` passes (no high/critical vulnerabilities)
- [ ] Database query has appropriate index (check EXPLAIN ANALYZE)
- [ ] No N+1 queries (use Prisma `include` / `select`)
- [ ] Pagination on list endpoints
- [ ] Real QVAC SDK calls (no mock inference)
- [ ] Real database writes (no in-memory only)
- [ ] Real notifications sent (in dev, use test credentials)
- [ ] No `// TODO` comments
- [ ] No `throw new Error('Not implemented')`
- [ ] No hardcoded responses
- [ ] OpenAPI spec updated for new endpoints
- [ ] JSDoc comments on public methods
- [ ] README updated if setup steps changed

---

## Phase 14 — Implementation Plan Document

### 14.1 Generate `IMPLEMENTATION_PLAN.md`

After Phases 0-13 are complete (or in parallel as they complete), generate `docs/IMPLEMENTATION_PLAN.md` summarizing:

1. **Architecture summary** (reference to `docs/ARCHITECTURE.md`)
2. **Services implemented** (every NestJS module with status: done/in-progress/blocked)
3. **Infrastructure** (Supabase, R2, Upstash, Render, Vercel — all configured)
4. **Database** (reference to `docs/DATABASE_ARCHITECTURE.md`, migration status)
5. **APIs** (reference to `docs/openapi.yaml`, endpoint count, auth coverage)
6. **Agents** (5+ agents implemented with real QVAC inference)
7. **Deployment** (Vercel + Render + Supabase + R2 + Upstash all live)
8. **Testing strategy** (unit + integration + e2e + load — coverage numbers)
9. **Evidence strategy** (Decision Bundles + hash chain + inference log — sample bundle attached)
10. **Scalability strategy** (caching, connection pooling, queue partitioning, horizontal scaling plan)
11. **Security** (OWASP checklist, RLS, audit log, pen test results)
12. **Monitoring** (Sentry, Better Stack, Prometheus metrics, health checks)
13. **Hackathon compliance** (matrix: every QVAC requirement → KINKEEPER feature → evidence)

This document is the "executive summary" of the entire backend. It's what a judge or investor reads first.

---

## Phase 15 — Environment Variables

### 15.1 Generate `docs/ENV_REQUIREMENTS.md`

List EVERY environment variable. For each:

```
Variable: DATABASE_URL
Purpose: Connection string for Postgres (Supabase). The backend uses this to connect to the database for all persistent data — users, families, devices, alerts, bundles, etc.
Where to obtain: Supabase dashboard → your project → Settings → Database → Connection string (with pooling)
Free or paid: Free tier (500MB DB, 1GB storage). Paid plans start at $25/month.
Setup instructions:
  1. Go to https://supabase.com and sign up (free, no credit card required)
  2. Click "New project"
  3. Name it "kinkeeper-prod" (or "kinkeeper-staging" for staging)
  4. Generate a strong database password (use a password manager — save it securely, you'll need it)
  5. Choose the region closest to your users (e.g., "US East" for North America)
  6. Click "Create new project" — wait 2-3 minutes for provisioning
  7. Once provisioned, navigate to Settings → Database (left sidebar)
  8. Find "Connection string" section
  9. Select "URI" format and "Connection pooling" enabled
  10. Copy the connection string — it looks like: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  11. Replace [password] with your actual database password
  12. Paste the full string as the DATABASE_URL value in your .env file
Official documentation: https://supabase.com/docs/guides/database/connecting-to-postgres
```

### 15.2 Complete Env Var List

**Database (Supabase):**
1. `DATABASE_URL` — Postgres connection string (pooled, for app queries)
2. `DATABASE_DIRECT_URL` — Postgres connection string (direct, for Prisma migrations)
3. `SUPABASE_URL` — Supabase project URL (e.g., https://xyz.supabase.co)
4. `SUPABASE_ANON_KEY` — Supabase anonymous key (for Realtime subscriptions from frontend)
5. `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side admin access)

**Auth:**
6. `JWT_SECRET` — RS256 private key PEM (for signing JWTs)
7. `JWT_PUBLIC_KEY` — RS256 public key PEM (for verifying JWTs)
8. `JWT_ACCESS_EXPIRES_IN` — Access token expiry (e.g., "15m")
9. `JWT_REFRESH_EXPIRES_IN` — Refresh token expiry (e.g., "30d")
10. `WEBAUTHN_RP_ID` — WebAuthn relying party ID (e.g., "kinkeeper.app")
11. `WEBAUTHN_RP_NAME` — WebAuthn relying party name (e.g., "KINKEEPER")
12. `WEBAUTHN_ORIGIN` — WebAuthn origin (e.g., "https://app.kinkeeper.app")

**Object Storage (Cloudflare R2):**
13. `R2_ACCOUNT_ID` — Cloudflare account ID
14. `R2_ACCESS_KEY_ID` — R2 access key
15. `R2_SECRET_ACCESS_KEY` — R2 secret key
16. `R2_BUCKET_NAME` — R2 bucket name (e.g., "kinkeeper-prod")
17. `R2_PUBLIC_URL` — R2 public URL (for presigned URLs)

**Redis (Upstash):**
18. `REDIS_URL` — Upstash Redis connection string (rediss://...)

**QVAC:**
19. `QVAC_MODELS_CACHE_DIR` — Where to cache QVAC model files on backend (e.g., /data/qvac-models)
20. `QVAC_HYPERSWARM_SEED` — 64-char hex seed for backend's Hyperswarm identity
21. `QVAC_SWARM_RELAYS` — JSON array of blind relay public keys

**Email (Resend):**
22. `RESEND_API_KEY` — Resend API key
23. `EMAIL_FROM` — From address (e.g., "KINKEEPER <noreply@kinkeeper.app>")
24. `EMAIL_REPLY_TO` — Reply-to address

**SMS (Twilio):**
25. `TWILIO_ACCOUNT_SID` — Twilio account SID
26. `TWILIO_AUTH_TOKEN` — Twilio auth token
27. `TWILIO_FROM_NUMBER` — Twilio phone number (E.164 format)

**Push Notifications (Web Push):**
28. `VAPID_PUBLIC_KEY` — VAPID public key
29. `VAPID_PRIVATE_KEY` — VAPID private key
30. `VAPID_SUBJECT` — VAPID subject (e.g., "mailto:admin@kinkeeper.app")

**Stripe (Billing):**
31. `STRIPE_SECRET_KEY` — Stripe secret key
32. `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
33. `STRIPE_PRICE_FAMILY` — Stripe Price ID for Family plan
34. `STRIPE_PRICE_FAMILY_PLUS` — Stripe Price ID for Family+ plan
35. `STRIPE_PRICE_EXTENDED` — Stripe Price ID for Extended Family plan

**Monitoring:**
36. `SENTRY_DSN_BACKEND` — Sentry DSN for backend
37. `SENTRY_DSN_FRONTEND` — Sentry DSN for frontend
38. `BETTERSTACK_LOG_TOKEN` — Better Stack log ingestion token
39. `BETTERSTACK_UPTIME_TOKEN` — Better Stack uptime monitor token

**App:**
40. `APP_ENV` — "development" | "staging" | "production"
41. `APP_URL` — Frontend URL (e.g., https://app.kinkeeper.app)
42. `APP_PORT` — Backend port (e.g., 3000)
43. `CORS_ORIGINS` — JSON array of allowed origins

**Frontend (Vercel):**
44. `VITE_API_BASE_URL` — Backend API URL
45. `VITE_SUPABASE_URL` — Same as SUPABASE_URL
46. `VITE_SUPABASE_ANON_KEY` — Same as SUPABASE_ANON_KEY
47. `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
48. `VITE_SENTRY_DSN` — Same as SENTRY_DSN_FRONTEND
49. `VITE_APP_ENV` — "development" | "staging" | "production"

**Optional:**
50. `POSTHOG_KEY` — PostHog project key (opt-in analytics only)
51. `POSTHOG_HOST` — PostHog host

### 15.3 STOP — Wait for User

After generating `docs/ENV_REQUIREMENTS.md`, **STOP**. Do not proceed until the user has provided every env var value. Do NOT mock any service. Do NOT use placeholder values.

If the user cannot provide a value (e.g., they don't have a Twilio account yet):
1. Explain that the feature requiring this var will not work until the var is provided.
2. Implement a feature flag that disables the feature gracefully (e.g., if `TWILIO_AUTH_TOKEN` is missing, SMS notifications are disabled with a clear log message).
3. Get explicit user confirmation that they want the feature disabled.
4. Document this in `docs/ENV_SETUP_GUIDE.md`.

### 15.4 Generate `docs/ENV_SETUP_GUIDE.md`

After collecting all env vars, generate a comprehensive setup guide with:
- Per-service sections (Supabase, R2, Upstash, Stripe, Resend, Twilio, Sentry, Better Stack, QVAC)
- Each with: what it does, sign-up URL, free tier limits, step-by-step setup, how to obtain each env var, local dev setup, production setup, cost projection at 100/1000/10000 users
- Troubleshooting common issues
- Security best practices (rotating keys, least privilege, etc.)

### 15.5 Generate `.env.example` and `.env.production.example`

Templates with every env var, commented with what it is and where to get it. The user copies to `.env` and fills in values. `.env` is gitignored.

---

## Phase 16 — Frontend Architecture

**DO NOT WRITE FRONTEND CODE YET.** This phase produces `docs/FRONTEND_ARCHITECTURE.md` only. Then STOP and wait for user review.

### 16.1 Generate `docs/FRONTEND_ARCHITECTURE.md`

Document:

1. **Sitemap** — every route (see Section 17.1 for full list)
2. **Route map** — file-based routing structure (TanStack Router or React Router — justify choice)
3. **User journeys** — for each primary persona (Karen, David, Margaret, Dr. Patel), document their typical journey through the app
4. **Information architecture** — how content is organized, navigation patterns, search/discovery
5. **Component tree** — top-level layout components, page components, shared components
6. **State management** — TanStack Query for server state, Zustand for client UI state, no Redux
7. **API client** — typed client matching backend OpenAPI spec, generated via `openapi-typescript` or hand-written
8. **Realtime** — Supabase Realtime subscriptions + custom WebSocket for non-DB events
9. **Accessibility plan** — WCAG 2.2 AA, keyboard nav, screen reader, axe-core in CI
10. **Responsive strategy** — mobile-first, breakpoints, bottom nav on mobile, sidebar on desktop
11. **Design system** — colors, typography, spacing, motion, dark mode (see Phase 17.3)
12. **Performance budget** — Lighthouse 95+, code splitting per route, lazy loading, image optimization
13. **SEO** — meta tags, Open Graph, sitemap.xml, robots.txt
14. **Analytics** — PostHog (opt-in only), privacy-respecting

### 16.2 Visual Reference Analysis: Hiro Platform

Study https://www.hiro.so/platform deeply. Document in `docs/FRONTEND_ARCHITECTURE.md`:

- **Layout patterns:** How Hiro uses full-bleed sections, asymmetric grids, sticky navigation
- **Spacing:** Generous whitespace, section padding rhythm
- **Typography:** Large display type, careful hierarchy, monospace accents for technical credibility
- **Visual hierarchy:** How they guide the eye, use of color, weight, size
- **Interactions:** Hover states, scroll-triggered animations, micro-interactions
- **Motion:** Subtle, purposeful, never decorative
- **Navigation:** How the nav transforms on scroll, mobile menu patterns
- **Onboarding:** How they introduce concepts to new visitors
- **Dashboard patterns:** (If Hiro has a dashboard — analyze it)
- **Responsiveness:** How layouts adapt across breakpoints

**The final KINKEEPER design should feel like "Hiro Platform quality redesigned for KINKEEPER."** Same level of polish, same confidence in whitespace, same restraint in color — but a completely distinct visual identity.

### 16.3 Custom Design Language for KINKEEPER

**DO NOT clone Hiro's colors.** Create a custom palette optimized for:
- Trust (deep, stable colors — not aggressive)
- Privacy (subdued, not flashy)
- Family protection (warm, not cold)
- Healthcare (clean, not clinical)
- Safety (calm, not alarming)
- Premium SaaS (refined, not generic)

Suggested palette direction (refine in implementation):
- Primary background: pure white (light) / deep near-black (dark)
- Accent: deep forest green (#1B4332 light / #4ADE80 dark) — trust, growth, family roots
- Warm secondary: muted amber (used sparingly for elder-related warmth)
- Status: red (danger/scam), green (success/healthy), amber (warning), blue (info)
- NO blue as primary (too generic SaaS)
- NO purple (too tech-bro)
- NO gradient backgrounds (too 2021)

Typography: Inter for body/UI, JetBrains Mono for code/data, Source Serif Pro for Chronicler chapter excerpts (Margaret's voice — adds warmth).

### 16.4 STOP for User Review

After generating `docs/FRONTEND_ARCHITECTURE.md`, **STOP**. Present the document to the user. Do NOT proceed to Phase 17 until the user explicitly approves the frontend architecture.

---

## Phase 17 — Frontend Implementation

**Only after Phase 16 is approved by the user.**

### 17.1 Sitemap (Implementation Order)

**Marketing Routes:**
- `/` — Landing
- `/features` — Features
- `/how-it-works` — How It Works
- `/security` — Security
- `/privacy` — Privacy
- `/faq` — FAQ
- `/contact` — Contact
- `/pricing` — Pricing (added — was in original Lovable spec)
- `/blog` — Blog index (placeholder structure)
- `/blog/[slug]` — Blog post template
- `/legal/terms` — Terms
- `/legal/privacy` — Privacy Policy
- `/changelog` — Changelog
- `/about` — About

**Auth Routes:**
- `/login` — Login
- `/register` — Register
- `/forgot-password` — Forgot password
- `/reset-password` — Reset password
- `/verify-email` — Email verification
- `/invite/[token]` — Family invite acceptance

**Application Routes:**
- `/app` — Dashboard
- `/app/onboarding` — Onboarding wizard (7 steps)
- `/app/family` — Family members
- `/app/family/[id]` — Family member detail
- `/app/family/invite` — Invite member
- `/app/devices` — Devices (mesh topology)
- `/app/devices/add` — Add device wizard
- `/app/devices/[id]` — Device detail
- `/app/agents` — Agents overview
- `/app/agents/sentinel` — Sentinel detail
- `/app/agents/cognoscente` — Cognoscente detail
- `/app/agents/chronicler` — Chronicler detail
- `/app/agents/coordinator` — Coordinator detail
- `/app/agents/archivist` — Archivist detail
- `/app/cognitive` — Cognitive insights
- `/app/cognitive/check-ins` — Check-in history
- `/app/cognitive/baseline` — Baseline config
- `/app/scam-protection` — Scam protection overview
- `/app/scam-protection/alerts` — Sentinel alerts
- `/app/scam-protection/alerts/[id]` — Alert detail
- `/app/voice-journal` — Voice journal (Chronicler chapters)
- `/app/voice-journal/[id]` — Chapter detail
- `/app/alerts` — Alerts center (unified)
- `/app/alerts/[id]` — Alert detail
- `/app/memory-vault` — Memory vault
- `/app/memory-vault/upload` — Upload wizard
- `/app/memory-vault/[id]` — Item detail
- `/app/health-timeline` — Health timeline
- `/app/evidence` — Evidence center
- `/app/evidence/[id]` — Bundle detail
- `/app/evidence/export` — Export wizard
- `/app/settings` — Settings overview
- `/app/settings/profile` — Profile
- `/app/settings/family` — Family settings
- `/app/settings/notifications` — Notification preferences
- `/app/settings/privacy` — Privacy controls
- `/app/settings/billing` — Billing
- `/app/settings/integrations` — Integrations
- `/app/settings/api` — API keys
- `/app/settings/developer` — Developer settings
- `/app/help` — Help center
- `/app/contact` — Contact support

### 17.2 Tech Stack (Final)

- **Vite 5+** (build tool)
- **React 18+** (UI)
- **TypeScript 5+** (strict, no `any` without eslint-disable)
- **Tailwind CSS 4+** (styling)
- **shadcn/ui** (component library — install via CLI, customize aggressively, do NOT use defaults)
- **TanStack Router** (routing, type-safe, file-based)
- **TanStack React Query** (server state)
- **Zustand** (client UI state)
- **Framer Motion** (animation)
- **Lucide React** (icons)
- **Sonner** (toasts)
- **cmdk** (command palette)
- **Recharts** (charts)
- **TanStack Table** (data tables)
- **react-hook-form + zod** (forms)
- **Axios** or native fetch with custom wrapper (HTTP client)
- **next-themes** (dark mode)
- **Fontsource** (self-hosted fonts — Inter, JetBrains Mono, Source Serif Pro)
- **Supabase JS client** (Realtime subscriptions)
- **axe-core** (accessibility testing, dev only)
- **Vitest + React Testing Library** (unit/component tests)
- **Playwright** (e2e tests — already set up in backend Phase 13)

**Package manager: npm ONLY.** No pnpm. No bun. No yarn. `package-lock.json` committed. `npm ci` in CI for reproducible installs.

### 17.3 Design System Implementation

Implement the full design system from Phase 16.3:
- Tailwind config with all custom colors, typography, spacing, motion tokens
- CSS variables for all design tokens (enables dark mode)
- shadcn/ui components installed and customized
- Fontsource fonts loaded
- Framer Motion variants defined
- Dark mode via next-themes (or custom ThemeProvider)

### 17.4 Component Library

Build (using shadcn/ui as base, customized):
- Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, DatePicker
- Badge, Avatar, Tooltip, Popover, Modal, Drawer, Tabs, Accordion
- Card, Divider, Spinner, Skeleton, Toast, Alert, EmptyState, ErrorState
- DataTable, LineChart, AreaChart, BarChart, Sparkline
- AudioPlayer (for Chronicler chapters — waveform, scrub, speed)
- MeshTopology (custom SVG of family mesh)
- Timeline (vertical events timeline)
- CommandPalette (cmd+k)
- Breadcrumb, Pagination, Stepper, ProgressRing

Feature components (KINKEEPER-specific):
- AlertCard, CognitiveTrendChart, DeviceCard, AgentCard, ChapterCard
- EvidenceBundleViewer (modal showing full reasoning trace)
- MedicationTracker, MeshMap, VoiceMemoRecorder, FamilyMemberCard
- ScamTranscriptPlayer, WeeklyCheckInPlayer, PrivacyShield

### 17.5 State Management

- **TanStack React Query** for all server state (every API call wrapped in a hook)
- **Zustand** for client UI state (sidebar open, theme, command palette open, current elder filter)
- **No Redux. No MobX. No Context for global state** (Context only for theme injection)
- Realtime via Supabase Realtime subscriptions (DB changes) + custom WebSocket (non-DB events)

### 17.6 API Client

Typed client matching backend OpenAPI spec. Either:
- Generate via `openapi-typescript` from `docs/openapi.yaml` → `src/lib/api/generated/`
- Or hand-written in `src/lib/api/` with explicit types (more control, more work)

Either way: every API call is typed end-to-end. Frontend types match backend types exactly (shared via `packages/shared` if monorepo, or copied if separate repos).

### 17.7 Every State, Every Time

For every page that fetches data, implement all four states:
- **Loading:** Skeletons matching final layout (not generic spinners). Shimmer animation.
- **Empty:** Custom illustration + title + description + CTA. Never show "No data."
- **Error:** Custom illustration + specific error message + retry CTA + contact support link.
- **Success:** Toast notification (5s auto-dismiss, action button if applicable). Inline confirmation for destructive actions with "Undo" toast.

### 17.8 Accessibility (WCAG 2.2 AA)

- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`, `<footer>`)
- ARIA labels on every interactive element without visible text
- Keyboard navigation: every action reachable, visible focus rings (2px accent, 2px offset)
- Skip-to-content link on every page
- Color contrast: 4.5:1 body text, 3:1 large text/UI components
- Don't rely on color alone (pair with icon or text)
- Form labels: every input has `<label>`, errors linked via `aria-describedby`
- Modals: focus trap, restore focus on close, ESC to close
- Tables: `<th scope>`, caption, `aria-sort` on sortable columns
- Charts: data table fallback (visually hidden, screen-reader accessible)
- Audio: captions, transcripts
- Motion: respect `prefers-reduced-motion`
- Touch targets: minimum 44×44px
- Test with axe DevTools in CI. Zero critical violations.

### 17.9 Responsive Design

Breakpoints (Tailwind defaults):
- `sm: 640px` — large phones, portrait
- `md: 768px` — tablets, portrait
- `lg: 1024px` — tablets landscape, small laptops
- `xl: 1280px` — desktops
- `2xl: 1536px` — large desktops

Mobile-first principles:
- Design mobile layout first, enhance for larger screens
- Bottom navigation on mobile (Dashboard, Alerts, Family, More) — replaces sidebar
- Sidebar collapses to drawer on mobile (hamburger)
- Tables become cards on mobile
- Forms stack vertically, full-width inputs
- Modals become full-screen sheets on mobile
- Charts maintain readability — reduce data points, simplify legends

### 17.10 UX Requirements

Assume users are non-technical, elderly caregivers, family members, first-time users:
- Everything must be obvious (no jargon, no acronyms without explanation)
- Everything must be guided (onboarding wizard, empty state CTAs, tooltips)
- Everything must be accessible (WCAG 2.2 AA, keyboard nav, screen reader)
- Generous touch targets (44×44px minimum)
- Large text option (settings → accessibility → font size)
- High contrast option (settings → accessibility → high contrast)
- Voice input where possible (search via voice, message composition via voice)

### 17.11 Voice & Tone

KINKEEPER's voice is: calm, competent, warm, never alarming, never condescending.

Do:
- "Margaret's morning check-in looks good."
- "Sentinel caught a possible scam call. We've alerted Karen."
- "Your mesh is healthy. All 4 devices online."
- "Cognoscente noticed a small change in Margaret's word-finding. It's within normal range, but we'll keep watching."

Don't:
- "ALERT: Anomaly detected in cognitive parameters!" (too alarming)
- "Hey there! 👋 Welcome to your dashboard!" (too casual, no emoji)
- "It looks like Margaret might have dementia." (never diagnose)
- "Oops, something went wrong 🤷" (no emoji, no casual errors)

No emoji anywhere in the UI. No exclamation marks except in genuine celebration ("Welcome to KINKEEPER!").

### 17.12 Frontend Testing

- Vitest + React Testing Library for component tests
- At least one test per page (smoke test: renders without crashing)
- At least one test per UI primitive
- Form validation tests
- axe-core automated accessibility tests in CI
- Lighthouse CI (performance budget enforcement)
- Playwright e2e tests (covering critical paths — already specified in Phase 13.3)

### 17.13 Frontend Deployment: Vercel

- Auto-deploys from `main` branch
- Preview environments for every PR
- Environment variables in Vercel dashboard
- Custom domain: `app.kinkeeper.app`
- Edge network for global delivery
- Analytics (Vercel Analytics — privacy-respecting, no cookies)

---

## Final Production Readiness Checklist

Before declaring the project complete, verify EVERY item:

**Infrastructure:**
- [ ] Frontend deployed to Vercel, accessible at https://app.kinkeeper.app
- [ ] Backend deployed to Render, accessible at https://api.kinkeeper.app
- [ ] Database on Supabase production, backups enabled, RLS on every table
- [ ] R2 buckets created, public access disabled
- [ ] Redis on Upstash production, TLS enabled
- [ ] DNS configured on Cloudflare
- [ ] SSL certificates valid

**Application:**
- [ ] All 5+ agents functional with real QVAC models
- [ ] All API endpoints return real data (no mocks)
- [ ] All realtime events broadcast correctly
- [ ] All notifications send (email, SMS, push, in-app)
- [ ] Stripe billing works end-to-end (test mode for hackathon, live for production)
- [ ] Auth works (email/password, WebAuthn, family invites)
- [ ] Onboarding wizard completes successfully
- [ ] All frontend pages render without errors
- [ ] All loading/empty/error/success states work

**Quality:**
- [ ] Lighthouse 95+ on all critical pages
- [ ] axe-core zero critical violations
- [ ] Unit test coverage ≥ 80%
- [ ] E2E tests cover: signup → onboarding → first alert → evidence export
- [ ] Load test: 100 concurrent families, p95 < 500ms
- [ ] Security audit: OWASP top 10 addressed, dependency audit clean
- [ ] Error tracking: Sentry captures and alerts
- [ ] Uptime monitoring: Better Stack alerts on downtime

**Documentation:**
- [ ] `docs/RESEARCH.md` (Phase 0)
- [ ] `docs/ARCHITECTURE.md` (Phase 1)
- [ ] `docs/DATABASE_ARCHITECTURE.md` (Phase 2)
- [ ] `docs/openapi.yaml` (Phase 4)
- [ ] `docs/IMPLEMENTATION_PLAN.md` (Phase 14)
- [ ] `docs/ENV_REQUIREMENTS.md` (Phase 15)
- [ ] `docs/ENV_SETUP_GUIDE.md` (Phase 15)
- [ ] `docs/FRONTEND_ARCHITECTURE.md` (Phase 16)
- [ ] `README.md` with setup, dev, deployment instructions
- [ ] `LICENSE` — Apache 2.0
- [ ] All code has JSDoc comments on public APIs

**Hackathon compliance:**
- [ ] Apache 2.0 LICENSE file
- [ ] Public GitHub repo
- [ ] All inference via QVAC SDK (no other inference engines)
- [ ] Auditable inference log (CSV/JSON with TTFT, tokens/sec)
- [ ] Reproducibility instructions with hardware specs
- [ ] Demo video ≤ 5 minutes on YouTube (unlisted)
- [ ] "What's Real (Not Simulated)" table in README
- [ ] Bounty-requirements mapping table in README
- [ ] Early-bird submission by June 17
- [ ] Final submission by June 21

---

## Final Notes

This prompt defines the complete workflow for building KINKEEPER × AETHER as a production-grade platform. The key principles:

1. **Backend first. Frontend last.** Phases 0-15 are backend. Phase 16 is frontend architecture (STOP for review). Phase 17 is frontend implementation.
2. **Analyze before coding.** Phases 0-2 produce documents only.
3. **Collect env vars before going live.** Phase 15 stops and asks. No mocks.
4. **Real, not mocked.** Every QVAC call hits real models. Every DB write persists. Every notification sends. Every Stripe operation charges.
5. **Test continuously.** Every task has lint + typecheck + build + tests before marked complete.
6. **Document everything.** Every phase produces a document. The docs/ folder is the source of truth.
7. **Custom design, not cloned.** Analyze Hiro for quality bar. Create a custom design language for KINKEEPER.

**If at any point you find yourself wanting to mock a service, skip an env var, generate placeholder code, or build the frontend before the backend — STOP. Re-read Phase 0.3's hard rules. The integrity of KINKEEPER as a real product depends on every line being real.**

Begin with Phase 0 now. Read every required document. Write `docs/RESEARCH.md`. Do not write a single line of implementation code until Phase 15 is complete and the user has confirmed all env vars are collected.

The families who will trust KINKEEPER with their aging parents' safety deserve nothing less than real, production-grade, fully-functional software. Build accordingly.
