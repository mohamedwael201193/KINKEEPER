# Screenshot capture plan

Production README references screenshots under `docs/screenshots/`. This document defines **what** to capture and **why** — not speculative marketing copy.

---

## 1. `dashboard.png` — Judge Console home

**When:** Server running, before any scenario.

**Must show:**
- Headline “KINKEEPER Guardian Mesh”
- **▶ 3-Min Judge Demo** button
- Scenario grid (A–H, W) with expected verdict labels
- Local status panel (chain, provider key snippet)

**Do not:** Crop out the localhost URL bar if it helps judges confirm local execution.

---

## 2. `block-scam-call.png` — Scenario A

**Steps:**
1. Click scenario **A · IRS scam call**
2. Wait for pipeline to finish (STT → RAG → risk stages populate)

**Must show:**
- Verdict **BLOCK** (red)
- Transcript excerpt mentioning IRS / gift cards
- Pipeline stages with `stt`, `rag`, `risk` complete

**Evidence:** Expected verdict verified in `evidence/guardian-scenarios/scenario-results.json` (`id: A`, `match: true`).

---

## 3. `fake-invoice.png` — Scenario B

**Steps:**
1. Click scenario **B · Fake bank invoice**

**Must show:**
- Verdict **BLOCK**
- OCR / transcript panel with invoice text
- `ocr` stage in pipeline

---

## 4. `allow-checkin.png` — Scenario G

**Steps:**
1. Click scenario **G · Safe family check-in**

**Must show:**
- Verdict **ALLOW** (green)
- Benign check-in transcript (garden, oatmeal, etc.)

---

## 5. `warn-scenario.png` — Scenario W

**Steps:**
1. Click scenario **W · Suspicious utility verify**

**Must show:**
- Verdict **WARN** (amber)
- Utility verification language without full BLOCK signals

---

## 6. `proof-center.png` — QVAC Proof Center

**Steps:**
1. Click **Refresh QVAC Proof**

**Must show:**
- JSON or formatted proof panel with:
  - `providerPublicKey`
  - `models` block (WHISPER_TINY, QWEN3_600M_INST_Q4, etc.)
  - `capabilities` array
  - `localExecution: true`

**API:** `GET /api/proof` — implemented in `packages/guardian-mesh/src/proof-center.ts`.

---

## 7. `telegram-alert.png` — Caregiver alert

**Prerequisites:**
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_DEMO_CHAT_ID` in `.env`
- Run scenario A or `npm run guardian:telegram`

**Must show:**
- Telegram message with incident summary
- **Acknowledge** inline button

**Verified E2E:** `evidence/telegram-verify.json` (`ackReceived: true`, prior run).

---

## 8. `evidence-chain.png` — Tamper-evident chain

**Steps:**
1. Run at least one scenario
2. Click **Verify Chain**

**Must show:**
- Alert dialog: `Chain VALID (N bundles)` where N > 0

**Verified:** `evidence/guardian-mesh-verify.json` → `"chain": { "valid": true }`.

---

## Optional captures (not in README hero set)

| File | Purpose |
|---|---|
| `caregiver-mode.png` | Caregiver toggle — plain-language verdict |
| `electron-window.png` | `KINKEEPER Guardian Mesh.exe` from `release/guardian-desktop/` |
| `three-min-demo.png` | Summary alert after **3-Min Judge Demo** completes |

---

## Publishing checklist

- [ ] All 8 required PNGs in `docs/screenshots/`
- [ ] No secrets in images (tokens, chat IDs, `.env` values)
- [ ] README links updated if filenames change
- [ ] Re-verify scenarios after capture session: `npm run guardian:scenarios`
