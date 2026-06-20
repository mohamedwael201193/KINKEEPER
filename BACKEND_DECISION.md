# Backend Framework Decision — KINKEEPER × AETHER

**Decision:** **Fastify 5** (Node.js + TypeScript)  
**Rejected:** NestJS (per project correction), Express 4  
**Date:** 2026-06-20  
**Status:** Pre-implementation — no code written yet

---

## Context

The master prompt originally specified NestJS. The execution command overrides this:

> Backend stack: Node.js, TypeScript, Express OR Fastify — choose the fastest and most maintainable option.

KINKEEPER/AETHER needs:

- REST API (~80+ endpoints eventually; ~35 for hackathon MVP)
- WebSocket gateway (`/realtime`)
- BullMQ workers (agents, inference log flush, cron)
- QVAC SDK integration (`@qvac/sdk` — native Node bindings)
- Prisma ORM + Supabase Postgres
- JWT auth, rate limiting, OpenAPI
- Docker deployment on Render (orchestration only — **not** primary inference host for hackathon compliance)

---

## Evaluation Matrix

| Criterion | Express 4 | Fastify 5 | Winner |
|---|---|---|---|
| **Raw HTTP throughput** | ~15–25k req/s (typical) | ~30–45k req/s (typical) | Fastify |
| **JSON serialization** | Manual / middleware | Built-in, optimized | Fastify |
| **Schema validation** | External (Zod middleware) | Native JSON Schema + `@fastify/type-provider-typebox` or Zod bridge | Fastify |
| **TypeScript ergonomics** | Good with `@types/express` | Excellent with generics on routes | Fastify |
| **WebSocket** | `ws` + manual upgrade | `@fastify/websocket` first-class | Fastify |
| **Plugin ecosystem** | Largest (mature) | Large and growing | Tie |
| **Learning curve (1 dev)** | Lowest | Low–medium | Express (slight) |
| **Boilerplate for DI/modules** | Manual structure | Manual structure (no Nest overhead) | Tie |
| **QVAC SDK compatibility** | Node.js — works | Node.js — works | Tie |
| **Render Docker deploy** | Trivial | Trivial | Tie |
| **OpenAPI generation** | `swagger-jsdoc` | `@fastify/swagger` + `@fastify/swagger-ui` | Fastify |
| **Startup time / memory** | Lower baseline | Slightly higher, still lean | Express (marginal) |
| **Long-term maintainability** | Route sprawl without discipline | Enforced schemas per route | Fastify |

---

## QVAC Integration Compatibility

`@qvac/sdk` is a Node.js library (also supports Bare, Expo, Bun — we use **npm + Node only** per hard rules).

**Requirements for the wrapper:**

- Long-lived process (model load/unload lifecycle)
- Async iterators for `completion().events`, `loggingStream()`
- File system access for `QVAC_MODELS_CACHE_DIR`
- Optional P2P: `startQVACProvider`, delegated `loadModel({ delegate })`

Neither Express nor Fastify affects QVAC SDK behavior. Both run the same Node event loop. The critical constraint is **where** inference runs:

| Location | Hackathon compliant? | Notes |
|---|---|---|
| Developer's laptop / Pi (local cognition node) | ✅ Yes | Primary inference for demo + logs |
| Render backend (16GB) | ⚠️ Risky | Hackathon rules: no cluster/datacenter inference; BYOH only |
| Phone (future elder app) | ✅ Yes | Out of scope for this build window |

**Architecture implication:** Fastify backend on Render handles auth, DB, queues, evidence APIs. A **local QVAC worker** (same codebase, different process profile) runs models and connects via delegated inference or syncs bundles via HTTPS. This satisfies both production orchestration and hackathon evidence requirements.

Fastify's plugin model maps cleanly:

```
apps/
  api/          → Fastify HTTP + WS (Render)
  worker/       → BullMQ consumers
  qvac-node/    → Local cognition node (laptop/Pi, QVAC loaded)
packages/
  qvac/         → Shared QvacService wrapper
  shared/       → Zod schemas, types
```

---

## Scalability

| Concern | Fastify approach |
|---|---|
| Horizontal API scaling | Stateless JWT — scale Render instances behind health checks |
| DB connections | Prisma + Supabase PgBouncer (`DATABASE_URL` pooled) |
| Heavy inference | Offload to family mesh / local node — never block HTTP thread |
| WebSocket fanout | Redis pub/sub via Upstash for multi-instance realtime |
| Rate limiting | `@fastify/rate-limit` + Redis store |

Express would work at 100–1000 families for API traffic. The bottleneck is **QVAC inference**, not HTTP framework choice. Fastify wins on headroom and structured validation at scale.

---

## Performance

- Fastify avoids middleware chain overhead on hot paths (dashboard polling, alert feeds).
- Built-in schema compilation reduces runtime validation cost vs. ad-hoc Express middleware.
- `@fastify/compress`, `@fastify/cors`, `@fastify/helmet` are maintained by the same team — fewer integration gaps.

For KINKEEPER, p95 API target is <500ms (Phase 13). Fastify provides margin; Express would still meet target if queries are optimized. Performance is not the deciding factor — **maintainability + validation + WS** are.

---

## Development Speed (1 developer, ~days left)

**Express advantage:** More Stack Overflow answers, familiar patterns.

**Fastify advantage:**

- Route-level schemas catch bugs at compile + runtime
- `@fastify/swagger` auto-generates OpenAPI from schemas (master prompt requires `docs/openapi.yaml`)
- Less glue code for validation/error responses

**Verdict:** Fastify is faster over the full project because OpenAPI + validation are built-in. Initial setup takes ~2 extra hours vs. Express — negligible.

**Why not NestJS:** Decorators, modules, and Nest-specific patterns add ceremony without benefit for a single developer on a tight deadline. The master prompt's `@Injectable()` examples translate directly to plain TypeScript classes wired in Fastify plugins.

---

## Deployment Simplicity on Render

Both deploy identically:

```dockerfile
FROM node:22-bookworm
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
CMD ["node", "dist/apps/api/main.js"]
```

Render requirements met by either:

- `GET /health` and `GET /ready`
- Docker env vars from dashboard
- Standard instance for API (512MB–2GB sufficient if inference is local)
- Persistent disk only on **local QVAC node**, not Render API

Fastify's lower memory footprint helps if we downsize Render from the master prompt's 16GB Standard plan (which was sized for cloud inference — **not recommended for hackathon**).

---

## Final Decision: Fastify 5

### Rationale (one paragraph)

Fastify delivers measurably better HTTP performance, first-class JSON Schema validation and OpenAPI generation, and native WebSocket support — all with less boilerplate than Express and none of NestJS's structural overhead. QVAC SDK integration is framework-agnostic on Node.js; the decisive factors are development speed through schema-first routes (critical for 80+ endpoints and hackathon evidence consistency), Render deployment parity, and long-term maintainability for a solo founder. Express would be acceptable for an API-only CRUD app; KINKEEPER is an agent orchestration platform with realtime, queues, and strict audit logging — Fastify's plugin architecture and validation pipeline reduce defect rate under time pressure.

### Stack (locked)

| Layer | Choice |
|---|---|
| Runtime | Node.js 22 LTS |
| Language | TypeScript 5.x (strict) |
| HTTP | Fastify 5 |
| ORM | Prisma 6 |
| Validation | Zod (shared) + Fastify route schemas |
| Queue | BullMQ + Upstash Redis |
| WS | `@fastify/websocket` |
| Auth | `@fastify/jwt` + `@simplewebauthn/server` |
| Docs | `@fastify/swagger` → `docs/openapi.yaml` export |
| Package manager | **npm only** |

### Explicit non-goals for v1

- No NestJS migration path planned
- No Express compatibility layer
- No inference on Render for hackathon submission (see `PROJECT_REALITY_CHECK.md`)

---

## Next Step

Proceed to implementation only after user confirms: **"All ENV variables are ready. Start implementation."**

First code phase: monorepo scaffold → Prisma schema → Fastify auth module → QVAC local node proof-of-life.
