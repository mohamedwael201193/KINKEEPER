# Judge runbook — Guardian Mesh

Step-by-step instructions for evaluators running the project **from zero**. Every step below maps to files and scripts verified in this repository.

---

## What you are evaluating

**Guardian Mesh** — a local-first fraud analysis pipeline for families. It runs on your machine at `http://127.0.0.1:8787/`. No cloud inference is required for the demo.

---

## Requirements

| Requirement | Verified in repo |
|---|---|
| Windows 10/11 (primary path) | `Start-Guardian-Mesh.bat` |
| Node.js ≥ 22.17 | `package.json` → `engines.node` |
| npm ≥ 10.9 | `package.json` → `engines.npm` |
| Disk space for QVAC models | ~2–4 GB first download (see `FINAL_10_OF_10_AUDIT.md`) |
| Internet (first run only) | Model download from QVAC registry |

Optional: Telegram bot token + chat ID for live caregiver alerts.

---

## Path A — One-click judge launch (recommended)

### Step 1 — Open the launcher

Double-click:

```
release/GuardianMesh-Judge/Start-Guardian-Mesh.bat
```

The script will, if needed:
- Run `npm ci`
- Run `npm run build:guardian-mesh`
- Run `npm run guardian:assets` (generates WAV/PNG test files)
- Copy `.env.example` → `.env` if missing
- Start the server and open your browser

### Step 2 — Wait for the browser

URL: **http://127.0.0.1:8787/**

First run may take several minutes while QVAC models download. Subsequent runs are faster if models are cached (`.qvac-models` or `QVAC_MODELS_CACHE_DIR`).

Keep the minimized **Guardian Mesh** terminal window open while judging.

### Step 3 — Run the 3-minute demo

1. Click **▶ 3-Min Judge Demo**
2. Wait for completion dialog showing:
   - **A BLOCK** (scam call)
   - **B BLOCK** (fake invoice)
   - **G ALLOW** (safe check-in)
3. Click **Verify Chain** → expect `Chain VALID`
4. Click **Refresh QVAC Proof** → expect provider public key + model list

**API:** `POST /api/demo/judge-flow` — `apps/guardian-mesh/src/server.ts`

### Step 4 — Spot-check individual scenarios (optional)

| Button | Expected verdict | What it proves |
|---|---|---|
| A | BLOCK | STT + scam call |
| B | BLOCK | OCR + fake invoice |
| G | ALLOW | Safe daily check-in |
| W | WARN | Ambiguous utility verify |

---

## Path B — Developer verification (terminal)

From repository root:

```powershell
npm install
copy .env.example .env
npm run build:guardian-mesh
npm run guardian:verify
npm run guardian:scenarios
```

**Expected:**
- `guardian:verify` → `PASS — report written to evidence/guardian-mesh-verify.json`
- `guardian:scenarios` → `PASS — all scenarios match expected verdicts`

Evidence files:
- `evidence/guardian-mesh-verify.json`
- `evidence/guardian-scenarios/scenario-results.json`

---

## Path C — Telegram live proof (optional)

1. Set in `.env`:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_DEMO_CHAT_ID` (or run `npm run telegram:discover`)
   - `TELEGRAM_ENABLED=true` if using API bot for acks
2. Run: `npm run guardian:telegram`
3. Tap **Acknowledge** on the Telegram alert within 90 seconds

**Verified result (prior run):** `evidence/telegram-verify.json` → `"ackReceived": true`

**Note:** Only one process should poll the bot token at a time (local verify script stops `dev:api` automatically).

---

## Path D — Electron desktop (optional)

Build (unsigned, Windows):

```powershell
$env:CSC_IDENTITY_AUTO_DISCOVERY='false'
npm run pack -w @kinkeeper/guardian-desktop
npm run pack:installer -w @kinkeeper/guardian-desktop
```

Outputs:
- `release/guardian-desktop/KINKEEPER-Guardian-Mesh-Portable-0.1.0.exe`
- `release/guardian-desktop/KINKEEPER-Guardian-Mesh-0.1.0.exe`

SmartScreen may warn (no code signing certificate).

---

## What “success” looks like

| Check | Pass criteria |
|---|---|
| Server | `[guardian-mesh] Judge UI: http://127.0.0.1:8787/` in terminal |
| Scenario A | Red **BLOCK** verdict |
| Scenario G | Green **ALLOW** verdict |
| Scenario W | Amber **WARN** verdict |
| Chain | `Verify Chain` → VALID |
| Proof | Provider key visible in QVAC Proof Center |
| Automated | `npm run guardian:scenarios` → `mismatches: []` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Port 8787 in use | Stop other Guardian Mesh processes; set `GUARDIAN_MESH_PORT` |
| Models re-downloading | Set `QVAC_MODELS_CACHE_DIR` in `.env` |
| Telegram 409 conflict | Stop duplicate `dev:api` or Render bot using same token |
| QVAC worker lock | Close other verify scripts; wait for `unloadAll()` |
| Build missing | Run `npm run build:guardian-mesh` |

---

## Pre-warm before live judging (recommended)

Run once before an audience:

```powershell
npm run guardian:verify
```

This downloads models and confirms audio + OCR + chain in one pass.

---

## Related documents

- [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md) — short judge script
- [FINAL_10_OF_10_AUDIT.md](../FINAL_10_OF_10_AUDIT.md) — full gate results
- [docs/SCREENSHOT_PLAN.md](./SCREENSHOT_PLAN.md) — capture guide for README images
