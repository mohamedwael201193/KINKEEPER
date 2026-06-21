import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { QvacService } from "@kinkeeper/qvac";
import { GuardianMeshEngine, loadGuardianMeshConfig } from "@kinkeeper/guardian-mesh";

const root = join(import.meta.dirname, "..");
const audioPath = join(root, "test-data", "sentinel-scam-call.wav");
const imagePath = join(root, "samples", "fake-bank-invoice.png");
const reportPath = join(root, "evidence", "guardian-mesh-verify.json");

function fail(message: string): never {
  console.error("FAIL:", message);
  process.exit(1);
}

async function main(): Promise<void> {
  if (!existsSync(audioPath)) {
    fail(`Missing test audio: ${audioPath}. Run scripts/generate-test-audio.ps1`);
  }

  const config = loadGuardianMeshConfig({
    dataDir: join(root, "guardian-mesh-data"),
    evidenceDir: join(root, "guardian-mesh-data", "evidence"),
  });

  const qvac = new QvacService();
  const engine = new GuardianMeshEngine(qvac, config);

  console.log("Preloading QVAC models…");
  await engine.preload();

  console.log("Running audio pipeline…");
  const audioResult = await engine.processAudio(audioPath);
  if (!audioResult.transcript || audioResult.transcript.length < 20) {
    fail("Audio transcript too short");
  }
  if (!audioResult.chainValid) {
    fail("Evidence chain invalid after audio run");
  }
  console.log("Audio verdict:", audioResult.risk.verdict, audioResult.risk.confidence);

  let ocrResult = null;
  if (existsSync(imagePath)) {
    console.log("Running OCR pipeline…");
    ocrResult = await engine.processImage(imagePath);
    if (!ocrResult.extractedText || ocrResult.extractedText.length < 10) {
      fail("OCR extracted text too short");
    }
    console.log("OCR verdict:", ocrResult.risk.verdict, ocrResult.risk.confidence);
  } else {
    console.warn("Skipping OCR — run scripts/generate-sample-invoice.ps1");
  }

  const chain = engine.verifyChain();
  if (!chain.valid) {
    fail(`Evidence chain invalid: ${chain.errors.join("; ")}`);
  }
  const report = {
    verifiedAt: new Date().toISOString(),
    audio: {
      verdict: audioResult.risk.verdict,
      bundleHash: audioResult.bundleHash,
      telegramSent: audioResult.telegramSent,
      stages: audioResult.stages.length,
    },
    ocr: ocrResult
      ? {
          verdict: ocrResult.risk.verdict,
          bundleHash: ocrResult.bundleHash,
          extractedPreview: ocrResult.extractedText?.slice(0, 120),
        }
      : null,
    chain,
    providerPublicKey: engine.getProviderPublicKey(),
  };

  mkdirSync(join(root, "evidence"), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log("PASS — report written to", reportPath);
  await qvac.unloadAll().catch(() => undefined);
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
