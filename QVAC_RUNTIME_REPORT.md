# QVAC RUNTIME REPORT

**Generated:** 2026-06-20T03:49:21.107Z  
**Status:** ALL STEPS PASSED

## Hardware

```json
{
  "node": "v24.12.0",
  "platform": "win32",
  "arch": "x64",
  "cpu": {
    "Name": "Intel(R) Core(TM) i7-14700HX",
    "NumberOfCores": 20,
    "NumberOfLogicalProcessors": 28
  },
  "memory": {
    "TotalPhysicalMemory": 16873545728,
    "Model": "83DV"
  },
  "gpu": {
    "Name": "Intel(R) UHD Graphics",
    "AdapterRAM": 2147479552,
    "DriverVersion": "32.0.101.7026"
  }
}
```

## Provider

| Field | Value |
|---|---|
| Provider public key | `a4f108873779204cc2d2f397e883a3bc56a71832716f32e810acba700ed3dfcc` |
| Key length | 64 chars |

## Runtime Steps

| Step | Result | Duration | Details |
|---|---|---|---|
| health_endpoint | PASS | 30ms | {"status":"healthy","providerPublicKey":"a4f108873779204cc2d2f397e883a3bc56a71832716f32e810acba700ed3dfcc","providerPubl |
| qwen3_completion | PASS | 2194ms | {"modelSrc":"QWEN3_600M_INST_Q4","contentPreview":"<think>\nOkay, the user wants me to reply with exactly {\"verified\": |
| medpsy_completion | PASS | 7153ms | {"modelSrc":"D:\\route\\KINKEEPER\\.qvac-models\\medpsy-1.7b-q4_k_m-imat.gguf","contentPreview":"\n\n{\"mood\":\"calm\", |
| whisper_transcribe | PASS | 921ms | {"modelSrc":"WHISPER_TINY","textLength":137,"textPreview":"Good morning. I slept well last night. I had oatmeal for brea |

## Inference Log (last 10 CSV rows)

```csv
2026-06-20T03:48:03.424Z,cmqlthjni0003uwn0phdeq98e,,QWEN3_600M_INST_Q4,completion,199,298,8.319061,257.3935876174682,,false,
2026-06-20T03:48:13.096Z,cmqlthjni0003uwn0phdeq98e,,WHISPER_TINY,transcribe,0,26,0.406,,,false,
2026-06-20T03:48:26.239Z,cmqlthjni0003uwn0phdeq98e,,D:\route\KINKEEPER\.qvac-models\medpsy-1.7b-q4_k_m-imat.gguf,completion,196,826,6.563694000000001,153.97764714325794,,false,
2026-06-20T03:49:07.740Z,,,QWEN3_600M_INST_Q4,loadModel,0,0,1.644,,,false,
2026-06-20T03:49:09.687Z,,,WHISPER_TINY,loadModel,0,0,0.698,,,false,
2026-06-20T03:49:12.360Z,,,QWEN3_600M_INST_Q4,completion,17,252,0.09120400000000001,210.05093735230793,,false,
2026-06-20T03:49:17.617Z,,,D:\route\KINKEEPER\.qvac-models\medpsy-1.7b-q4_k_m-imat.gguf,loadModel,0,0,4.582,,,false,
2026-06-20T03:49:19.661Z,,,D:\route\KINKEEPER\.qvac-models\medpsy-1.7b-q4_k_m-imat.gguf,completion,53,152,0.162471,136.20913837862736,,false,
2026-06-20T03:49:20.595Z,,,WHISPER_TINY,transcribe,0,26,0.407,,,false,

```

## Raw JSON

Full machine-readable output: `D:\route\KINKEEPER\evidence\qvac-runtime-verify.json`

## QVAC SDK References Verified

- `loadModel()` — model preload on cognition node startup
- `completion()` — Qwen3-600M + MedPsy-4B via `/internal/completion`
- `transcribe()` — Whisper-tiny via `/internal/transcribe`
- `startQVACProvider()` — provider public key returned on `/internal/health`

Per official docs: https://docs.qvac.tether.io/llms-full.txt
