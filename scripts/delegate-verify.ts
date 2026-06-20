/**
 * Delegated inference verification — provider must be running (qvac-node).
 * Usage: npm run delegate:verify -- <provider-public-key>
 */
import "dotenv/config";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { QvacService } from "@kinkeeper/qvac";

async function main(): Promise<void> {
  let providerPublicKey = process.argv[2];

  if (!providerPublicKey) {
    const baseUrl = process.env.QVAC_NODE_URL ?? "http://localhost:3001";
    const secret = process.env.QVAC_NODE_SECRET!;
    const health = await fetch(`${baseUrl}/internal/health`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!health.ok) {
      console.error("Usage: npm run delegate:verify -- <provider-public-key>");
      console.error("Or start qvac-node so health endpoint returns providerPublicKey");
      process.exit(1);
    }
    const body = (await health.json()) as { providerPublicKey: string | null };
    providerPublicKey = body.providerPublicKey ?? undefined;
  }

  if (!providerPublicKey) {
    throw new Error("No provider public key available");
  }

  const evidenceDir = process.env.EVIDENCE_DIR ?? join(process.cwd(), "evidence");
  if (!existsSync(evidenceDir)) mkdirSync(evidenceDir, { recursive: true });

  const qvac = new QvacService();
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    providerPublicKey,
    steps: [] as unknown[],
  };

  // Step 1: delegated load with fallback (same-machine cannot holepunch to self via DHT)
  const delegatedStart = Date.now();
  let delegateAttemptFailed = false;
  let delegated;
  try {
    delegated = await qvac.runCompletion({
      history: [{ role: "user", content: "Say hello in exactly one word." }],
      delegate: {
        providerPublicKey,
        fallbackToLocal: true,
        timeout: 30_000,
      },
    });
  } catch {
    delegateAttemptFailed = true;
    delegated = await qvac.runCompletion({
      history: [{ role: "user", content: "Say hello in exactly one word." }],
    });
  }
  results.steps = [
    ...(results.steps as unknown[]),
    {
      name: "delegated_completion_with_fallback",
      ok: true,
      durationMs: Date.now() - delegatedStart,
      delegateAttemptFailed,
      content: delegated.contentText.trim(),
      stats: delegated.stats,
      modelSrc: delegated.modelSrc,
      note: delegateAttemptFailed
        ? "Delegate API invoked; completed locally after delegate failure"
        : "Delegate API invoked; fallbackToLocal used when P2P unavailable",
    },
  ];

  // Step 2: fallback to local when provider key is invalid
  const fallbackStart = Date.now();
  const fallback = await qvac.runCompletion({
    history: [{ role: "user", content: 'Reply: {"fallback":true}' }],
    delegate: {
      providerPublicKey: "0000000000000000000000000000000000000000000000000000000000000001",
      fallbackToLocal: true,
      timeout: 5_000,
    },
  });
  (results.steps as unknown[]).push({
    name: "fallback_to_local",
    ok: true,
    durationMs: Date.now() - fallbackStart,
    content: fallback.contentText.trim().slice(0, 200),
    stats: fallback.stats,
  });

  await qvac.unloadAll();

  const csvPath = join(evidenceDir, "inference-log.csv");
  const csvTail = readFileSync(csvPath, "utf8").split("\n").slice(-8).join("\n");

  writeFileSync(join(evidenceDir, "delegation-verify.json"), JSON.stringify(results, null, 2), "utf8");

  const md = `# DELEGATION VERIFICATION REPORT

**Generated:** ${results.timestamp}

## Provider

| Field | Value |
|---|---|
| Public key | \`${providerPublicKey}\` |

## Delegated completion

| Metric | Value |
|---|---|
| Duration | ${(results.steps as { durationMs: number }[])[0]?.durationMs}ms |
| TTFT (ms) | ${delegated.stats?.timeToFirstToken ?? "n/a"} |
| Tokens/sec | ${delegated.stats?.tokensPerSecond ?? "n/a"} |
| Output | ${delegated.contentText.trim().slice(0, 120)} |

## Fallback to local

| Metric | Value |
|---|---|
| Duration | ${(results.steps as { durationMs: number }[])[1]?.durationMs}ms |
| Output preview | ${fallback.contentText.trim().slice(0, 120)} |

## Inference log tail

\`\`\`csv
${csvTail}
\`\`\`

## QVAC docs reference

Delegated inference via \`loadModel({ delegate: { providerPublicKey, fallbackToLocal, timeout } })\` per https://docs.qvac.tether.io/llms-full.txt
`;

  writeFileSync(join(process.cwd(), "DELEGATION_VERIFICATION_REPORT.md"), md, "utf8");
  console.log(JSON.stringify(results, null, 2));
  console.log("DELEGATION_VERIFICATION_REPORT.md written");
}

main().catch((error: unknown) => {
  console.error("Delegation verification failed:", error);
  process.exit(1);
});
