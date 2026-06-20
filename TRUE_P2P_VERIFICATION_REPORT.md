# True P2P Verification Report

**Generated:** 2026-06-20  
**SDK:** @qvac/sdk@0.13.3  
**Mode:** Strict delegation (`fallbackToLocal: false`, `forceNewConnection: true`)

---

## Executive summary

| Test | Result | Proof |
|---|---|---|
| Provider active (DHT announce) | **PASS** | qvac-node logs + health endpoint |
| Same-host strict P2P | **FAIL (expected)** | `PEER_CONNECTION_FAILED` — NAT holepunch to self |
| Cross-device strict P2P | **NOT RUN** | Requires second device on different network |
| Fallback delegation | **PASS** | `npm run delegate:verify` exit 0 |

**True cross-device delegated inference is NOT yet proven in this environment.**

---

## Provider proof

| Field | Value |
|---|---|
| Public key | `a4f108873779204cc2d2f397e883a3bc56a71832716f32e810acba700ed3dfcc` |
| Health | `GET /internal/health` → 200 |
| DHT | Logs show `Provider is listening and ready to accept connections` |

---

## Same-host strict test

Command: `npm run p2p:verify`

```json
{
  "sameHostStrictTest": {
    "ok": false,
    "durationMs": 14532,
    "error": "PEER_CONNECTION_FAILED: provider was found but connection could not be established (NAT/holepunch failure; no swarm relays configured)"
  },
  "proven": false
}
```

Artifact: `evidence/p2p-verify.json`

This confirms 0.13.3 delegate diagnostics work and strict mode correctly rejects same-machine holepunch (no silent fallback).

---

## Cross-device procedure (required for proof)

### Device A — Provider

```powershell
npm run dev:qvac-node
# Copy providerPublicKey from /internal/health
```

### Device B — Consumer (different network, e.g. phone hotspot)

```powershell
git clone <repo> && cd KINKEEPER
npm install
npm run download:medpsy
$env:PROVIDER_PUBLIC_KEY="<64-char-hex-key>"
npm run p2p:consumer
```

**Success criteria:** exit 0, `evidence/p2p-consumer-result.json` contains:

```json
{ "ok": true, "proof": "Cross-peer delegated inference succeeded without local fallback" }
```

Scripts: `scripts/delegate-p2p-verify.ts`  
npm: `p2p:verify`, `p2p:consumer`

---

## Fallback proof (separate from true P2P)

`npm run delegate:verify` — exit 0, 2026-06-20:

- Delegate API invoked → DHT attempt → `fallbackToLocal` → completion `"Hello"`
- Invalid key fallback → local completion in 1752ms

Artifact: `evidence/delegation-verify.json`, `DELEGATION_VERIFICATION_REPORT.md`

---

## QVAC 0.13 delegate improvements observed

- `forceNewConnection: true` logged in delegate request
- Improved error: `provider was found but connection could not be established`
- Relay context: `no swarm relays configured`

---

## Blocker

True P2P requires **physical second device** on a routable network. Single-machine automation cannot satisfy hackathon cross-peer proof.

**Owner action:** Run `npm run p2p:consumer` on Device B and attach `evidence/p2p-consumer-result.json` with `"ok": true`.
