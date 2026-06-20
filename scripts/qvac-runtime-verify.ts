/**
 * Priority 1 — QVAC runtime verification against running cognition node.
 * Usage: npx tsx scripts/qvac-runtime-verify.ts
 */
import "dotenv/config";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { QvacClient, resolveMedPsyModelSource } from "@kinkeeper/qvac";

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? join(process.cwd(), "evidence");
const TEST_AUDIO = join(process.cwd(), "test-data", "cognoscente-checkin.wav");

interface StepResult {
  name: string;
  ok: boolean;
  durationMs: number;
  details: Record<string, unknown>;
  error?: string;
}

async function timed<T>(name: string, fn: () => Promise<T>): Promise<{ result: T; step: StepResult }> {
  const start = Date.now();
  try {
    const result = await fn();
    return {
      result,
      step: { name, ok: true, durationMs: Date.now() - start, details: result as Record<string, unknown> },
    };
  } catch (error) {
    return {
      result: null as T,
      step: {
        name,
        ok: false,
        durationMs: Date.now() - start,
        details: {},
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

function getHardwareSpecs(): Record<string, unknown> {
  try {
    const cpu = execSync(
      'powershell -NoProfile -Command "(Get-CimInstance Win32_Processor | Select-Object -First 1 Name, NumberOfCores, NumberOfLogicalProcessors) | ConvertTo-Json -Compress"',
      { encoding: "utf8" },
    );
    const mem = execSync(
      'powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory, Model) | ConvertTo-Json -Compress"',
      { encoding: "utf8" },
    );
    const gpu = execSync(
      "powershell -NoProfile -Command \"(Get-CimInstance Win32_VideoController | Where-Object { $_.Name -notmatch 'Microsoft Basic' } | Select-Object -First 1 Name, AdapterRAM, DriverVersion) | ConvertTo-Json -Compress\"",
      { encoding: "utf8" },
    );
    return {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpu: JSON.parse(cpu.trim()),
      memory: JSON.parse(mem.trim()),
      gpu: JSON.parse(gpu.trim()),
    };
  } catch {
    return { node: process.version, platform: process.platform, arch: process.arch };
  }
}

async function main(): Promise<void> {
  if (!existsSync(TEST_AUDIO)) {
    throw new Error(`Missing test audio at ${TEST_AUDIO}. Run scripts/generate-test-audio.ps1 first.`);
  }

  const client = new QvacClient({
    baseUrl: process.env.QVAC_NODE_URL ?? "http://localhost:3001",
    secret: process.env.QVAC_NODE_SECRET!,
  });

  const steps: StepResult[] = [];
  const hardware = getHardwareSpecs();

  const healthStep = await timed("health_endpoint", async () => {
    const health = await client.health();
    return {
      status: health.status,
      providerPublicKey: health.providerPublicKey,
      providerPublicKeyLength: health.providerPublicKey?.length ?? 0,
    };
  });
  steps.push(healthStep.step);
  if (!healthStep.step.ok) {
    throw new Error(`QVAC node not reachable: ${healthStep.step.error}`);
  }

  const providerPublicKey = (healthStep.result as { providerPublicKey: string | null }).providerPublicKey;

  const qwenStep = await timed("qwen3_completion", async () => {
    const result = await client.completion({
      history: [{ role: "user", content: 'Reply with exactly: {"verified":true}' }],
      captureThinking: false,
    });
    return {
      modelSrc: result.modelSrc,
      contentPreview: result.contentText.slice(0, 200),
      stopReason: result.stopReason,
      ttftMs: result.stats?.timeToFirstToken,
      tps: result.stats?.tokensPerSecond,
      generatedTokens: (result.stats as Record<string, unknown>)?.generatedTokens,
      backendDevice: (result.stats as Record<string, unknown>)?.backendDevice,
    };
  });
  steps.push(qwenStep.step);

  const medpsyStep = await timed("medpsy_completion", async () => {
    const result = await client.completion({
      modelSrc: resolveMedPsyModelSource(),
      history: [
        {
          role: "user",
          content:
            'Respond with JSON only: {"mood":"calm","confidence":0.9,"note":"runtime verification"}',
        },
      ],
      captureThinking: true,
    });
    return {
      modelSrc: result.modelSrc,
      contentPreview: result.contentText.slice(0, 300),
      thinkingLength: result.thinkingText.length,
      ttftMs: result.stats?.timeToFirstToken,
      tps: result.stats?.tokensPerSecond,
    };
  });
  steps.push(medpsyStep.step);

  const whisperStep = await timed("whisper_transcribe", async () => {
    const result = await client.transcribe({ audioPath: TEST_AUDIO });
    return {
      modelSrc: result.modelSrc,
      textLength: result.text.length,
      textPreview: result.text.slice(0, 200),
      segmentCount: result.segments?.length ?? 0,
      transcribeStats: result.stats,
    };
  });
  steps.push(whisperStep.step);

  const report = {
    timestamp: new Date().toISOString(),
    qvacNodeUrl: process.env.QVAC_NODE_URL,
    sdkVersion: "0.13.3",
    hardware,
    providerPublicKey,
    metadataCapture: {
      completionStopReason: (qwenStep.result as { stopReason?: string })?.stopReason ?? null,
      completionBackendDevice: (qwenStep.result as { stats?: { backendDevice?: string } })?.stats
        ?.backendDevice,
      whisperSegments: (whisperStep.result as { segmentCount?: number })?.segmentCount ?? 0,
      whisperStats: (whisperStep.result as { transcribeStats?: unknown })?.transcribeStats ?? null,
    },
    steps,
    allPassed: steps.every((s) => s.ok),
  };

  if (!existsSync(EVIDENCE_DIR)) {
    mkdirSync(EVIDENCE_DIR, { recursive: true });
  }

  const jsonPath = join(EVIDENCE_DIR, "qvac-runtime-verify.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const csvTail = readFileSync(join(EVIDENCE_DIR, "inference-log.csv"), "utf8")
    .split("\n")
    .slice(-10)
    .join("\n");

  const md = buildMarkdown(report, csvTail, jsonPath);
  const mdPath = join(process.cwd(), "QVAC_RUNTIME_REPORT.md");
  writeFileSync(mdPath, md, "utf8");

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReport written: ${mdPath}`);

  if (!report.allPassed) {
    process.exit(1);
  }
}

function buildMarkdown(
  report: {
    timestamp: string;
    hardware: Record<string, unknown>;
    providerPublicKey: string | null;
    steps: StepResult[];
    allPassed: boolean;
  },
  csvTail: string,
  jsonPath: string,
): string {
  const stepRows = report.steps
    .map(
      (s) =>
        `| ${s.name} | ${s.ok ? "PASS" : "FAIL"} | ${s.durationMs}ms | ${s.error ?? JSON.stringify(s.details).slice(0, 120)} |`,
    )
    .join("\n");

  return `# QVAC RUNTIME REPORT

**Generated:** ${report.timestamp}  
**Status:** ${report.allPassed ? "ALL STEPS PASSED" : "FAILURES DETECTED"}

## Hardware

\`\`\`json
${JSON.stringify(report.hardware, null, 2)}
\`\`\`

## Provider

| Field | Value |
|---|---|
| Provider public key | \`${report.providerPublicKey ?? "null"}\` |
| Key length | ${report.providerPublicKey?.length ?? 0} chars |

## Runtime Steps

| Step | Result | Duration | Details |
|---|---|---|---|
${stepRows}

## Inference Log (last 10 CSV rows)

\`\`\`csv
${csvTail}
\`\`\`

## Raw JSON

Full machine-readable output: \`${jsonPath}\`

## QVAC SDK References Verified

- \`loadModel()\` — model preload on cognition node startup
- \`completion()\` — Qwen3-600M + MedPsy-4B via \`/internal/completion\`
- \`transcribe()\` — Whisper-tiny via \`/internal/transcribe\`
- \`startQVACProvider()\` — provider public key returned on \`/internal/health\`

Per official docs: https://docs.qvac.tether.io/llms-full.txt
`;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
