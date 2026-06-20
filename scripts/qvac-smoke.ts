import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { QvacService, getDefaultLlmModel, setupQvacEnvironment } from "@kinkeeper/qvac";

async function main(): Promise<void> {
  setupQvacEnvironment();

  console.log("KINKEEPER Phase 0 — QVAC smoke test");
  console.log(`Cache dir: ${process.env.QVAC_MODELS_CACHE_DIR}`);
  console.log(`Node: ${process.version}`);

  const qvac = new QvacService();
  const logger = qvac.getInferenceLogger();
  const result = await qvac.runCompletion({
    modelSrc: await getDefaultLlmModel(),
    history: [
      {
        role: "user",
        content: 'Reply with exactly: {"status":"ok"}',
      },
    ],
    captureThinking: false,
  });

  console.log("\n--- Completion output ---");
  console.log(result.contentText.trim());
  console.log("\n--- Stats ---");
  console.log(JSON.stringify(result.stats, null, 2));

  const csvPath = logger.getCsvPath();
  console.log(`\nInference log written to: ${csvPath}`);

  const reportPath = join(process.cwd(), "evidence", "phase0-smoke-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        modelSrc: result.modelSrc,
        contentText: result.contentText,
        stats: result.stats,
        csvPath,
      },
      null,
      2,
    ),
    "utf8",
  );

  await qvac.unloadAll();
  console.log(`Smoke report: ${reportPath}`);
  console.log("Phase 0 smoke test PASSED");
}

main().catch((error: unknown) => {
  console.error("Phase 0 smoke test FAILED:", error);
  process.exit(1);
});
