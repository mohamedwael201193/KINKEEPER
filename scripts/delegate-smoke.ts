/**
 * Delegated inference consumer smoke test.
 * Usage:
 *   1. Start cognition node: npm run dev:qvac-node
 *   2. Copy provider public key from logs
 *   3. node --import tsx scripts/delegate-smoke.ts <provider-public-key>
 */
import "dotenv/config";
import { QvacService } from "@kinkeeper/qvac";

async function main(): Promise<void> {
  const providerPublicKey = process.argv[2];
  if (!providerPublicKey) {
    console.error("Usage: npm run delegate:smoke -- <provider-public-key>");
    process.exit(1);
  }

  const qvac = new QvacService();
  const result = await qvac.runCompletion({
    history: [{ role: "user", content: "Say hello in one word." }],
    delegate: {
      providerPublicKey,
      fallbackToLocal: true,
      timeout: 60_000,
    },
  });

  console.log("Delegated completion:", result.contentText.trim());
  console.log("Stats:", JSON.stringify(result.stats, null, 2));
  console.log("Inference log:", qvac.getInferenceLogger().getCsvPath());
  await qvac.unloadAll();
}

main().catch((error: unknown) => {
  console.error("Delegated inference smoke test failed:", error);
  process.exit(1);
});
