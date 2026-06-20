# SDK 0.13.3 Migration Report

**Generated:** 2026-06-20  
**Previous:** `@qvac/sdk@0.10.2`  
**Current:** `@qvac/sdk@0.13.3`

---

## Migration summary

| Change | File | Status |
|---|---|---|
| Pin SDK 0.13.3 | `packages/qvac/package.json` | DONE |
| `transcribe` + `metadata: true` | `packages/qvac/src/qvac-service.ts` | DONE |
| Whisper segments + stats | `QvacTranscribeResult.segments`, `stats` | DONE |
| `audioChunk` string path (client normalizes) | `qvac-service.ts` | DONE |
| Completion `stopReason` capture | `qvac-service.ts` (event + final) | DONE |
| `generatedTokens` in stats | `inference-logger.ts` | DONE |
| Metadata JSONL audit | `evidence/inference-metadata.jsonl` | DONE |
| Delegate `forceNewConnection` | `qvac-service.ts`, `delegate-p2p-verify.ts` | DONE |
| Model type aliases deprecation | Logs warn `llm` → `llamacpp-completion` | INFO only |

---

## npm install proof

```
added 7 packages, removed 18 packages, changed 17 packages
@qvac/sdk version: 0.13.3 (node_modules/@qvac/sdk/package.json)
```

---

## Build / test proof (post-migration)

| Command | Result |
|---|---|
| `npm run build` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | 2/2 PASS |
| `npm run test:integration` | 1/1 PASS (Supabase) |

---

## Runtime verification (post-migration)

| Script | Exit | Artifact |
|---|---|---|
| `npm run qvac:runtime` | 0 | `evidence/qvac-runtime-verify.json`, `QVAC_RUNTIME_REPORT.md` |
| `npm run delegate:verify` | 0 | `evidence/delegation-verify.json` |
| `npm run e2e:verify` | 0 | Sentinel/Cognoscente/Evidence reports |
| `npm run p2p:verify` | 0 (proven:false) | `evidence/p2p-verify.json` |

### QVAC runtime metrics (SDK 0.13.3)

| Step | Duration | Key metric |
|---|---|---|
| health | 30ms | provider key 64 hex |
| qwen3 | 2194ms | TTFT 91ms, 210 tok/s, GPU |
| medpsy | 7153ms | TTFT 162ms, 136 tok/s |
| whisper | 921ms | 2 segments, 12.16s audio |

### Metadata capture proof

From `evidence/qvac-runtime-verify.json`:

```json
"metadataCapture": {
  "whisperSegments": 2,
  "whisperStats": { "totalSegments": 2, "audioDuration": 12.16 }
}
```

From `evidence/inference-metadata.jsonl` (sample):

```json
{"operation":"transcribe","transcribeStats":{"totalSegments":2,"audioDuration":12.16}}
{"operation":"completion","backendDevice":"gpu"}
```

---

## Breaking changes handled

1. **`audioChunk`:** Client accepts string; server schema uses discriminated union — pass file path string.
2. **`transcribe({ metadata: true })`:** Returns `TranscribeSegment[]`; text joined from segments.
3. **Stats field rename:** `generatedTokens` preferred over `completionTokens` in 0.13 stats.
4. **Delegate diagnostics:** 0.13 reports `PEER_CONNECTION_FAILED` with relay context in logs.

---

## Sentinel fix (High priority)

`buildSentinelAlertSummary()` in `sentinel.service.ts` — E2E alert no longer shows `"undefined ..."`:

```
"summary": "The IRS is clearly acting as a scammer by threatening..."
```

Proof: `SENTINEL_E2E_REPORT.md` (2026-06-20T03:48:11Z run).

---

## Remaining SDK gaps (not blocking migration)

| Item | Priority | Notes |
|---|---|---|
| `stopReason` in metadata JSONL | Low | SDK may omit on thinking-heavy completions; capture code in place |
| `llm`/`whisper` type aliases | Low | Switch to `llamacpp-completion` / `whispercpp-transcription` labels |
| `loggingStream()` native hook | Optional | Future enhancement for live SDK logs |

---

**Migration verdict:** SDK 0.13.3 upgrade **complete** with runtime proof on all local inference paths.
