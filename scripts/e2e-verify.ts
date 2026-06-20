/**
 * Sentinel + Cognoscente E2E via live API + BullMQ workers.
 * Requires: qvac-node + API running, test audio in test-data/
 */
import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@kinkeeper/db";

const API = process.env.API_URL ?? "http://localhost:3000";
const SENTINEL_AUDIO = join(process.cwd(), "test-data", "sentinel-scam-call.wav");
const COG_AUDIO = join(process.cwd(), "test-data", "cognoscente-checkin.wav");

async function registerAndSetup(): Promise<{
  accessToken: string;
  familyId: string;
  elderId: string;
}> {
  const email = `e2e-${Date.now()}@kinkeeper.test`;
  const password = "SecurePass123!@#";

  const reg = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      firstName: "E2E",
      lastName: "Verifier",
    }),
  });
  if (!reg.ok) throw new Error(`Register failed: ${await reg.text()}`);
  const regBody = (await reg.json()) as { accessToken: string };

  let token = regBody.accessToken;
  let headers = { Authorization: `Bearer ${token}` };

  const fam = await fetch(`${API}/families`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name: `E2E Family ${Date.now()}` }),
  });
  if (!fam.ok) throw new Error(`Family create failed: ${await fam.text()}`);
  const famBody = (await fam.json()) as { id: string; accessToken: string };
  token = famBody.accessToken;
  headers = { Authorization: `Bearer ${token}` };

  const elder = await fetch(`${API}/families/current/elders`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Margaret",
      lastName: "E2E",
      birthYear: 1945,
      timezone: "Europe/London",
    }),
  });
  if (!elder.ok) throw new Error(`Elder create failed: ${await elder.text()}`);
  const elderBody = (await elder.json()) as { id: string };

  return { accessToken: token, familyId: famBody.id, elderId: elderBody.id };
}

async function uploadMultipart(
  url: string,
  token: string,
  elderId: string,
  audioPath: string,
  extraFields: Record<string, string> = {},
): Promise<unknown> {
  const buffer = readFileSync(audioPath);
  const boundary = `----kinkeeper${Date.now()}`;
  const parts: Buffer[] = [];

  const appendField = (name: string, value: string) => {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
    );
  };

  appendField("elderId", elderId);
  for (const [k, v] of Object.entries(extraFields)) {
    appendField(k, v);
  }

  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n`,
    ),
  );
  parts.push(buffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`Upload failed ${res.status}: ${await res.text()}`);
  return res.json();
}

async function waitFor<T>(
  label: string,
  fn: () => Promise<T | null>,
  timeoutMs = 600_000,
  intervalMs = 5000,
): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await fn();
    if (result) return result;
    console.log(`Waiting for ${label}... (${Math.round((Date.now() - start) / 1000)}s)`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout waiting for ${label}`);
}

async function main(): Promise<void> {
  const mode = process.argv[2] ?? "all";
  if (!existsSync(SENTINEL_AUDIO) || !existsSync(COG_AUDIO)) {
    throw new Error("Run scripts/generate-test-audio.ps1 first");
  }

  const { accessToken, familyId, elderId } = await registerAndSetup();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const evidenceDir = process.env.EVIDENCE_DIR ?? join(process.cwd(), "evidence");
  mkdirSync(evidenceDir, { recursive: true });

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    familyId,
    elderId,
  };

  if (mode === "all" || mode === "sentinel") {
    console.log("=== Sentinel E2E ===");
    const upload = (await uploadMultipart(
      `${API}/families/current/sentinel/call-recording`,
      accessToken,
      elderId,
      SENTINEL_AUDIO,
    )) as { recordingId: string };

    const recording = await waitFor("sentinel processing", async () => {
      const row = await prisma.sentinelCallRecording.findUnique({
        where: { id: upload.recordingId },
      });
      return row?.status === "processed" || row?.status === "failed" ? row : null;
    });

    if (recording?.status === "failed") {
      throw new Error("Sentinel job failed — check API worker logs");
    }

    const alert = await prisma.alert.findFirst({
      where: { familyId, agent: "sentinel" },
      orderBy: { createdAt: "desc" },
    });
    const bundle = recording?.bundleId
      ? await prisma.decisionBundle.findUnique({ where: { id: recording.bundleId } })
      : null;
    const inferenceLogs = await prisma.inferenceLog.findMany({
      where: { familyId },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    results.sentinel = {
      recording,
      alert,
      bundle,
      inferenceLogCount: inferenceLogs.length,
      inferenceLogs,
    };

    writeFileSync(
      join(evidenceDir, "sentinel-e2e.json"),
      JSON.stringify(results.sentinel, null, 2),
      "utf8",
    );
    writeFileSync(
      join(process.cwd(), "SENTINEL_E2E_REPORT.md"),
      buildSentinelReport(results.sentinel as Record<string, unknown>),
      "utf8",
    );
    console.log("SENTINEL_E2E_REPORT.md written");
  }

  if (mode === "all" || mode === "cognoscente") {
    console.log("=== Cognoscente E2E ===");
    const upload = (await uploadMultipart(
      `${API}/families/current/cognoscente/check-in`,
      accessToken,
      elderId,
      COG_AUDIO,
    )) as { checkInId: string };

    const checkIn = await waitFor("cognoscente processing", async () => {
      const row = await prisma.cognoscenteCheckIn.findUnique({ where: { id: upload.checkInId } });
      return row?.transcript ? row : null;
    });

    const baselines = await prisma.cognoscenteBaseline.findMany({ where: { elderId } });
    const trends = await prisma.cognoscenteTrend.findMany({ where: { elderId } });
    const bundle = checkIn?.bundleId
      ? await prisma.decisionBundle.findUnique({ where: { id: checkIn.bundleId } })
      : null;
    const trace = checkIn?.bundleId
      ? await prisma.memoryReasoningTrace.findFirst({ where: { bundleId: checkIn.bundleId } })
      : null;

    results.cognoscente = { checkIn, baselines, trends, bundle, trace };

    writeFileSync(
      join(evidenceDir, "cognoscente-e2e.json"),
      JSON.stringify(results.cognoscente, null, 2),
      "utf8",
    );
    writeFileSync(
      join(process.cwd(), "COGNOSCENTE_E2E_REPORT.md"),
      buildCognoscenteReport(results.cognoscente as Record<string, unknown>),
      "utf8",
    );
    console.log("COGNOSCENTE_E2E_REPORT.md written");
  }

  if (mode === "all" || mode === "evidence") {
    console.log("=== Evidence system ===");
    const chainRes = await fetch(`${API}/families/current/evidence/chain`, { headers });
    const chain = await chainRes.json();
    const bundles = await prisma.decisionBundle.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } });
    const exportRes = await fetch(`${API}/families/current/evidence/export`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ format: "json", agent: "all" }),
    });
    const exportBody = await exportRes.json();
    const inferenceExport = await fetch(`${API}/families/current/inference-logs/export?format=json`, {
      headers,
    });
    const inferenceLogs = await inferenceExport.json();

    results.evidence = { chain, bundleCount: bundles.length, bundles, exportBody, inferenceLogs };

    writeFileSync(
      join(evidenceDir, "evidence-system.json"),
      JSON.stringify(results.evidence, null, 2),
      "utf8",
    );
    writeFileSync(
      join(process.cwd(), "EVIDENCE_SYSTEM_REPORT.md"),
      buildEvidenceReport(results.evidence as Record<string, unknown>),
      "utf8",
    );
    console.log("EVIDENCE_SYSTEM_REPORT.md written");
  }

  writeFileSync(join(evidenceDir, "e2e-verify.json"), JSON.stringify(results, null, 2), "utf8");
  await prisma.$disconnect();
}

function buildSentinelReport(data: Record<string, unknown>): string {
  const rec = data.recording as Record<string, unknown> | null;
  const alert = data.alert as Record<string, unknown> | null;
  const bundle = data.bundle as Record<string, unknown> | null;
  return `# SENTINEL E2E REPORT

**Generated:** ${new Date().toISOString()}

## Proof checklist

| Requirement | Status |
|---|---|
| Real audio uploaded | ${rec ? "YES" : "NO"} |
| Transcript in DB | ${rec?.transcript ? "YES" : "NO"} |
| Classification stored | ${rec?.finalClassification ? "YES" : "NO"} |
| Alert row | ${alert ? "YES" : "NO (may be LEGITIMATE classification)"} |
| Decision bundle | ${bundle ? "YES" : "NO"} |
| Inference logs | ${(data.inferenceLogCount as number) > 0 ? "YES" : "NO"} |

## Recording

\`\`\`json
${JSON.stringify(rec, null, 2)}
\`\`\`

## Alert

\`\`\`json
${JSON.stringify(alert, null, 2)}
\`\`\`

## Decision bundle

\`\`\`json
${JSON.stringify(bundle, null, 2)}
\`\`\`

## Inference logs (sample)

\`\`\`json
${JSON.stringify(data.inferenceLogs, null, 2)}
\`\`\`
`;
}

function buildCognoscenteReport(data: Record<string, unknown>): string {
  return `# COGNOSCENTE E2E REPORT

**Generated:** ${new Date().toISOString()}

## Check-in

\`\`\`json
${JSON.stringify(data.checkIn, null, 2)}
\`\`\`

## Baselines

\`\`\`json
${JSON.stringify(data.baselines, null, 2)}
\`\`\`

## Trends

\`\`\`json
${JSON.stringify(data.trends, null, 2)}
\`\`\`

## Decision bundle

\`\`\`json
${JSON.stringify(data.bundle, null, 2)}
\`\`\`

## Reasoning trace

\`\`\`json
${JSON.stringify(data.trace, null, 2)}
\`\`\`
`;
}

function buildEvidenceReport(data: Record<string, unknown>): string {
  return `# EVIDENCE SYSTEM REPORT

**Generated:** ${new Date().toISOString()}

## Chain verification

\`\`\`json
${JSON.stringify(data.chain, null, 2)}
\`\`\`

## Bundles (${data.bundleCount})

\`\`\`json
${JSON.stringify(data.bundles, null, 2)}
\`\`\`

## Export response

\`\`\`json
${JSON.stringify(data.exportBody, null, 2)}
\`\`\`

## Inference logs export

\`\`\`json
${JSON.stringify(data.inferenceLogs, null, 2)}
\`\`\`
`;
}

main().catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
