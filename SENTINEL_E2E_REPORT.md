# SENTINEL E2E REPORT

**Generated:** 2026-06-20T03:48:11.271Z

## Proof checklist

| Requirement | Status |
|---|---|
| Real audio uploaded | YES |
| Transcript in DB | YES |
| Classification stored | YES |
| Alert row | YES |
| Decision bundle | YES |
| Inference logs | YES |

## Recording

```json
{
  "id": "cmqlthlyi000guwn0tf75u94i",
  "familyId": "cmqlthjni0003uwn0phdeq98e",
  "elderId": "cmqlthlh2000fuwn0ex01k6ju",
  "audioPath": "D:\\route\\KINKEEPER\\uploads\\cmqlthjni0003uwn0phdeq98e\\sentinel\\95f4249349f476f50db4ff58405fcbecfa8d9cfba2b43a0a6eccb8564a43fd9a.wav",
  "transcript": "Hello Margaret, this is Officer Smith from the IRS. Your Social Security number has been suspended due to suspicious activity. You must pay $5,000 in gift cards today or we will send police to your home.",
  "initialClassification": null,
  "initialConfidence": null,
  "initialReasoning": null,
  "finalClassification": "SCAM",
  "finalConfidence": 0.95,
  "bundleId": "b9607612-13c2-4083-b8a2-8c5cf7c3e1d4",
  "status": "processed",
  "createdAt": "2026-06-20T03:47:51.018Z",
  "processedAt": "2026-06-20T03:48:05.638Z"
}
```

## Alert

```json
{
  "id": "cmqlthxmv000kuwn0d02c8zhh",
  "familyId": "cmqlthjni0003uwn0phdeq98e",
  "elderId": "cmqlthlh2000fuwn0ex01k6ju",
  "agent": "sentinel",
  "severity": "critical",
  "type": "Threat Detection and Solicitation of Personal Information",
  "title": "Possible scam call targeting Margaret",
  "summary": "The IRS is clearly acting as a scammer by threatening to suspend Margaret's SSN and send police to her home, which directly exploits her personal data for financial gain and coercion. This is not legal advice. Review the transcript and contact authorities if needed.",
  "metadata": {
    "transcript": "Hello Margaret, this is Officer Smith from the IRS. Your Social Security number has been suspended due to suspicious activity. You must pay $5,000 in gift cards today or we will send police to your home.",
    "classification": {
      "scamType": "Threat Detection and Solicitation of Personal Information",
      "reasoning": "The IRS is clearly acting as a scammer by threatening to suspend Margaret's SSN and send police to her home, which directly exploits her personal data for financial gain and coercion.",
      "confidence": 0.95,
      "classification": "SCAM"
    }
  },
  "bundleId": "b9607612-13c2-4083-b8a2-8c5cf7c3e1d4",
  "resolved": false,
  "resolvedAt": null,
  "resolvedBy": null,
  "createdAt": "2026-06-20T03:48:06.151Z"
}
```

## Decision bundle

```json
{
  "id": "b9607612-13c2-4083-b8a2-8c5cf7c3e1d4",
  "familyId": "cmqlthjni0003uwn0phdeq98e",
  "agent": "sentinel",
  "trigger": "sentinel.process-call",
  "inputs": {
    "transcript": "Hello Margaret, this is Officer Smith from the IRS. Your Social Security number has been suspended due to suspicious activity. You must pay $5,000 in gift cards today or we will send police to your home.",
    "audioClipUrl": "D:\\route\\KINKEEPER\\uploads\\cmqlthjni0003uwn0phdeq98e\\sentinel\\95f4249349f476f50db4ff58405fcbecfa8d9cfba2b43a0a6eccb8564a43fd9a.wav",
    "audioClipHash": "95f4249349f476f50db4ff58405fcbecfa8d9cfba2b43a0a6eccb8564a43fd9a"
  },
  "reasoning": {
    "modelSrc": "QWEN3_600M_INST_Q4",
    "confidence": 0.95,
    "modelVersion": "QWEN3_600M_INST_Q4",
    "thinkingText": "\nOkay, let's see. The transcript is from a call transcript between a Sentinel and a user, Margaret. The Sentinel is an AI protecting Margaret from scams. The call starts with \"Hello Margaret...\" and mentions that the IRS is suspending her SSN for suspicious activity. Then the IRS says she must pay $5,000 in gift cards today or the police will come to her home.\n\nSo, the user is talking to the IRS, and the IRS is acting as a scammer here. They're threatening to send police if she doesn't pay. That sounds like a scam because the IRS is making money out of someone's personal information (SSN) and threatening to take their home. The reasoning is that the IRS is using her personal data for a scam, and it's a big, big threat. The Sentinel is supposed to be protecting her, so the IRS is definitely a scammer here. The confidence here is high because the threat is direct and the scam elements are present. So, the classification should be SCAM with high confidence.\n",
    "classification": "SCAM"
  },
  "delegation": null,
  "toolCalls": [],
  "action": "emit_scam_alert",
  "device": "cognition_node",
  "hash": "88997d2bdbc186cecff2f815e8a895fc1320029f08ef377b02aeec674eb4f8e8",
  "previousHash": "0",
  "createdAt": "2026-06-20T03:48:04.614Z"
}
```

## Inference logs (sample)

```json
[
  {
    "id": "cmqlthvj6000fuwksmj7mav6b",
    "familyId": "cmqlthjni0003uwn0phdeq98e",
    "deviceId": null,
    "timestamp": "2026-06-20T03:48:03.424Z",
    "modelSrc": "QWEN3_600M_INST_Q4",
    "operation": "completion",
    "promptTokens": 199,
    "completionTokens": 298,
    "ttftSec": 8.319061,
    "tps": 257.3935876174682,
    "delegateProvider": null,
    "delegateFallbackUsed": false,
    "bundleId": null,
    "createdAt": "2026-06-20T03:48:03.426Z"
  },
  {
    "id": "cmqlthnoc000duwksgdpp5ocj",
    "familyId": "cmqlthjni0003uwn0phdeq98e",
    "deviceId": null,
    "timestamp": "2026-06-20T03:47:53.141Z",
    "modelSrc": "WHISPER_TINY",
    "operation": "transcribe",
    "promptTokens": 0,
    "completionTokens": 36,
    "ttftSec": 0.506,
    "tps": null,
    "delegateProvider": null,
    "delegateFallbackUsed": false,
    "bundleId": null,
    "createdAt": "2026-06-20T03:47:53.143Z"
  }
]
```
