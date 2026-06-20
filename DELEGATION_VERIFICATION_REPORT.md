# DELEGATION VERIFICATION REPORT

**Generated:** 2026-06-20T03:45:11.975Z

## Provider

| Field | Value |
|---|---|
| Public key | `a4f108873779204cc2d2f397e883a3bc56a71832716f32e810acba700ed3dfcc` |

## Delegated completion

| Metric | Value |
|---|---|
| Duration | 20044ms |
| TTFT (ms) | 2333.791 |
| Tokens/sec | 170.65574469900594 |
| Output | Hello |

## Fallback to local

| Metric | Value |
|---|---|
| Duration | 1752ms |
| Output preview | Hello! I'm here to assist you with whatever you need. |

## Inference log tail

```csv
2026-06-20T03:45:02.647Z,,,D:\route\KINKEEPER\.qvac-models\medpsy-1.7b-q4_k_m-imat.gguf,completion,53,136,0.13406900000000002,114.14490359791449,,false,
2026-06-20T03:45:03.778Z,,,WHISPER_TINY,transcribe,0,26,0.407,,,false,
2026-06-20T03:45:27.970Z,,,QWEN3_600M_INST_Q4,loadModel,0,0,15.442,,a4f108873779204cc2d2f397e883a3bc56a71832716f32e810acba700ed3dfcc,false,
2026-06-20T03:45:32.019Z,,,QWEN3_600M_INST_Q4,completion,15,252,2.333791,170.65574469900594,a4f108873779204cc2d2f397e883a3bc56a71832716f32e810acba700ed3dfcc,false,
2026-06-20T03:45:33.363Z,,,QWEN3_600M_INST_Q4,loadModel,0,0,1.344,,0000000000000000000000000000000000000000000000000000000000000001,false,
2026-06-20T03:45:33.770Z,,,QWEN3_600M_INST_Q4,completion,15,101,0.006367,315.93006997381843,0000000000000000000000000000000000000000000000000000000000000001,false,
2026-06-20T03:45:33.860Z,,,c5b73f3f056b2c1a,unloadModel,0,0,,,,false,

```

## QVAC docs reference

Delegated inference via `loadModel({ delegate: { providerPublicKey, fallbackToLocal, timeout } })` per https://docs.qvac.tether.io/llms-full.txt
