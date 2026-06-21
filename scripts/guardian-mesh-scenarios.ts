import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { QvacService } from "@kinkeeper/qvac";
import {
  GuardianMeshEngine,
  getGuardianScenarios,
  loadGuardianMeshConfig,
  resolveScenarioPath,
} from "@kinkeeper/guardian-mesh";

const root = join(import.meta.dirname, "..");
const reportDir = join(root, "evidence", "guardian-scenarios");
const reportPath = join(reportDir, "scenario-results.json");

function fail(message: string): never {
  console.error("FAIL:", message);
  process.exit(1);
}

async function main(): Promise<void> {
  mkdirSync(reportDir, { recursive: true });
  const scenarios = getGuardianScenarios(root).filter((s) => s.id !== "W");

  const missing = scenarios.filter((s) => !existsSync(resolveScenarioPath(root, s)));
  if (missing.length > 0) {
    fail(`Missing assets:\n${missing.map((m) => m.relativePath).join("\n")}\nRun: npm run guardian:assets`);
  }

  const config = loadGuardianMeshConfig({
    dataDir: join(root, "guardian-mesh-data-scenarios"),
    evidenceDir: join(root, "guardian-mesh-data-scenarios", "evidence"),
  });

  const qvac = new QvacService();
  const engine = new GuardianMeshEngine(qvac, config);
  await engine.preload();

  const results: Record<string, unknown> = {
    verifiedAt: new Date().toISOString(),
    providerPublicKey: engine.getProviderPublicKey(),
    scenarios: [] as unknown[],
    mismatches: [] as string[],
  };

  for (const scenario of scenarios) {
    const path = resolveScenarioPath(root, scenario);
    console.log(`\n=== ${scenario.id}: ${scenario.name} (expect ${scenario.expectedVerdict}) ===`);
    const result =
      scenario.type === "audio" ? await engine.processAudio(path) : await engine.processImage(path);

    const match = result.risk.verdict === scenario.expectedVerdict;
    if (!match) {
      (results.mismatches as string[]).push(
        `${scenario.id}: expected ${scenario.expectedVerdict}, got ${result.risk.verdict}`,
      );
    }

    const summary = {
      ...scenario,
      path,
      verdict: result.risk.verdict,
      expectedVerdict: scenario.expectedVerdict,
      match,
      confidence: result.risk.confidence,
      bundleHash: result.bundleHash,
      telegramSent: result.telegramSent,
      ttsGenerated: Boolean(result.ttsWarningPath),
    };
    (results.scenarios as unknown[]).push(summary);
    writeFileSync(join(reportDir, `scenario-${scenario.id}.json`), JSON.stringify(summary, null, 2));
    console.log("Verdict:", result.risk.verdict, match ? "OK" : "MISMATCH");
  }

  const warnScenario = getGuardianScenarios(root).find((s) => s.id === "W");
  if (warnScenario && existsSync(resolveScenarioPath(root, warnScenario))) {
    const path = resolveScenarioPath(root, warnScenario);
    const result = await engine.processAudio(path);
    const match = result.risk.verdict === "WARN";
    if (!match) {
      (results.mismatches as string[]).push(`W: expected WARN, got ${result.risk.verdict}`);
    }
    (results.scenarios as unknown[]).push({
      ...warnScenario,
      path,
      verdict: result.risk.verdict,
      match,
      confidence: result.risk.confidence,
    });
  }

  results.chain = engine.verifyChain();
  writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");

  if ((results.mismatches as string[]).length > 0) {
    fail(`Classification mismatches:\n${(results.mismatches as string[]).join("\n")}`);
  }
  if (!(results.chain as { valid: boolean }).valid) {
    fail("Evidence chain invalid");
  }

  console.log("\nPASS — all scenarios match expected verdicts:", reportPath);
  await qvac.unloadAll().catch(() => undefined);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
