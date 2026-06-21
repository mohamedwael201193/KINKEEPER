# Screenshot assets — checklist

Screenshots are **not yet committed**. Capture from a running Judge UI at `http://127.0.0.1:8787/` after `npm run build:guardian-mesh && npm run start:guardian-mesh` (or `Start-Guardian-Mesh.bat`).

## Required files

| File | Source | Status |
|---|---|---|
| `dashboard.png` | Judge Console home — scenario grid + status panel | ☐ Pending capture |
| `block-scam-call.png` | Run scenario **A** — verdict **BLOCK** visible | ☐ Pending capture |
| `fake-invoice.png` | Run scenario **B** — OCR text + **BLOCK** | ☐ Pending capture |
| `allow-checkin.png` | Run scenario **G** — verdict **ALLOW** | ☐ Pending capture |
| `warn-scenario.png` | Run scenario **W** — verdict **WARN** | ☐ Pending capture |
| `proof-center.png` | QVAC Proof Center panel (Refresh QVAC Proof) | ☐ Pending capture |
| `telegram-alert.png` | Telegram message with Acknowledge button (requires `TELEGRAM_BOT_TOKEN` + chat ID) | ☐ Pending capture |
| `evidence-chain.png` | Verify Chain dialog showing VALID + bundle count | ☐ Pending capture |

## Capture settings

- Resolution: 1920×1080 or 1440×900
- Browser: Chrome or Edge, dark theme matches UI
- Hide personal Telegram names if publishing publicly
- Save as PNG, lossless

## After capture

1. Place files in `docs/screenshots/`
2. Verify README image links render on GitHub
3. Re-run `npm run guardian:scenarios` so evidence chain count is consistent if showing numbers in captions

## Verified UI endpoints (for capture)

| Action | How |
|---|---|
| Launch UI | `release/GuardianMesh-Judge/Start-Guardian-Mesh.bat` |
| 3-Min demo | Click **▶ 3-Min Judge Demo** |
| Single scenario | Click scenario button (A, B, G, W, …) |
| Proof | Click **Refresh QVAC Proof** |
| Chain | Click **Verify Chain** |
