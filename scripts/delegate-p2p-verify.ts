/**
 * True P2P delegation verification (strict mode — no local fallback).
 *
 * Device A (provider): npm run dev:qvac-node
 * Device B (consumer): npm run p2p:consumer -- <provider-public-key>
 *
 * Same-machine strict test (expected to fail holepunch):
 *   npm run p2p:verify
 */
import "dotenv/config";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { QvacService } from "@kinkeeper/qvac";

const mode = process.argv[2] ?? "verify";

async function resolveProviderKey(): Promise<string> {
  const fromArg = process.argv[3];
  if (fromArg) {
    return fromArg;
  }
  const fromEnv = process.env.PROVIDER_PUBLIC_KEY;
  if (fromEnv) {
    return fromEnv;
  }
  const baseUrl = process.env.QVAC_NODE_URL ?? "http://localhost:3001";
  const secret = process.env.QVAC_NODE_SECRET!;
  const health = await fetch(`${baseUrl}/internal/health`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!health.ok) {
    throw new Error("Start qvac-node on provider device or pass provider public key");
  }
  const body = (await health.json()) as { providerPublicKey: string | null };
  if (!body.providerPublicKey) {
    throw new Error("Provider not started — qvac-node must call startQVACProvider()");
  }
  return body.providerPublicKey;
}

async function runConsumer(providerPublicKey: string): Promise<Record<string, unknown>> {
  const qvac = new QvacService();
  const started = Date.now();
  try {
    const result = await qvac.runCompletion({
      history: [{ role: "user", content: "Reply with exactly one word: delegated" }],
      delegate: {
        providerPublicKey,
        fallbackToLocal: false,
        timeout: 60_000,
        forceNewConnection: true,
      },
    });
    await qvac.unloadAll();
    return {
      ok: true,
      mode: "strict_p2p",
      durationMs: Date.now() - started,
      providerPublicKey,
      content: result.contentText.trim(),
      stopReason: result.stopReason,
      stats: result.stats,
      modelSrc: result.modelSrc,
      proof: "Cross-peer delegated inference succeeded without local fallback",
    };
  } catch (error) {
    await qvac.unloadAll().catch(() => undefined);
    return {
      ok: false,
      mode: "strict_p2p",
      durationMs: Date.now() - started,
      providerPublicKey,
      error: error instanceof Error ? error.message : String(error),
      proof: "Strict delegation failed — expected on same-machine; retry from second device on different network",
    };
  }
}

async function main(): Promise<void> {
  const evidenceDir = process.env.EVIDENCE_DIR ?? join(process.cwd(), "evidence");
  if (!existsSync(evidenceDir)) {
    mkdirSync(evidenceDir, { recursive: true });
  }

  if (mode === "consumer") {
    const providerPublicKey = await resolveProviderKey();
    const result = {
      timestamp: new Date().toISOString(),
      hostname: process.env.COMPUTERNAME ?? process.env.HOSTNAME ?? "unknown",
      sdkVersion: "0.13.3",
      ...(await runConsumer(providerPublicKey)),
    };
    writeFileSync(join(evidenceDir, "p2p-consumer-result.json"), JSON.stringify(result, null, 2), "utf8");
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  const providerPublicKey = await resolveProviderKey();
  const sameHostResult = await runConsumer(providerPublicKey);
  const report = {
    timestamp: new Date().toISOString(),
    sdkVersion: "0.13.3",
    providerPublicKey,
    sameHostStrictTest: sameHostResult,
    crossDeviceInstructions: {
      providerDevice: "npm run dev:qvac-node",
      consumerDevice: "npm run p2p:consumer -- <provider-public-key-from-health>",
      successArtifact: "evidence/p2p-consumer-result.json with ok:true",
    },
    proven: sameHostResult.ok === true,
  };

  writeFileSync(join(evidenceDir, "p2p-verify.json"), JSON.stringify(report, null, 2), "utf8");

  const md = `# TRUE P2P VERIFICATION REPORT

**Generated:** ${report.timestamp}  
**SDK:** @qvac/sdk@0.13.3  
**Strict mode:** fallbackToLocal=false, forceNewConnection=true

## Provider public key

\`${providerPublicKey}\`

## Same-host strict test

| Field | Value |
|---|---|
| Result | ${sameHostResult.ok ? "PASS — true P2P" : "FAIL (expected on single host)"} |
| Duration | ${sameHostResult.durationMs}ms |
| Error | ${(sameHostResult as { error?: string }).error ?? "none"} |
| Output | ${(sameHostResult as { content?: string }).content ?? "n/a"} |

## Cross-device reproduction

1. **Device A (provider):** \`npm run dev:qvac-node\` — copy \`providerPublicKey\` from \`/internal/health\`
2. **Device B (consumer, different network):** \`npm run p2p:consumer -- <key>\`
3. Success when \`evidence/p2p-consumer-result.json\` has \`"ok": true\`

## Raw JSON

\`evidence/p2p-verify.json\`
`;

  writeFileSync(join(process.cwd(), "TRUE_P2P_VERIFICATION_REPORT.md"), md, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
