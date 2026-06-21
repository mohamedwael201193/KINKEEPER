# KINKEEPER Guardian Mesh — Judge Instructions

## One-click launch (Windows)

1. Double-click `Start-Guardian-Mesh.bat` in `release/GuardianMesh-Judge/`
2. First run: installs deps, builds if needed, generates test assets (~5–15 min)
3. Browser opens to **http://127.0.0.1:8787/**

## 3-minute judge flow (recommended)

1. Click **▶ 3-Min Judge Demo** — runs scam call (BLOCK) → fake invoice (BLOCK) → safe check-in (ALLOW)
2. Click **Verify Chain** — confirm tamper-evident evidence
3. Click **Refresh QVAC Proof** — show provider key + models

Total time: under 3 minutes after models are cached.

## Manual scenarios

| Button | Expected | What it shows |
|---|---|---|
| A | BLOCK | IRS scam phone call |
| B | BLOCK | Fake invoice OCR |
| G | ALLOW | Safe daily check-in |
| W | WARN | Suspicious utility verify |

## Caregiver mode

Switch to **Caregiver** — plain language verdict, no technical jargon.

## Telegram (optional live proof)

Alerts go to linked caregiver bot. Developer verify: `npm run guardian:telegram` (tap Acknowledge within 90s).

## Electron desktop (optional)

Portable EXE: `npm run pack -w @kinkeeper/guardian-desktop`  
Installer: `npm run pack:installer -w @kinkeeper/guardian-desktop`

Output: `release/guardian-desktop/`

## Developer verification

```
npm run guardian:fresh
npm run guardian:verify
npm run guardian:scenarios
npm run guardian:telegram
```
