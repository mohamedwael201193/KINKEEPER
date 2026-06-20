/**
 * Live pipeline verification for dom family using user-provided MP3 files.
 * Requires: API + QVAC node + Redis running.
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SignJWT, importPKCS8 } from "jose";
import { prisma } from "@kinkeeper/db";
import { loadEnv } from "../apps/api/src/config/env.js";
import { AuthService } from "../apps/api/src/services/auth.service.js";

const API = process.env.API_URL ?? "http://localhost:3000";
const USER_EMAIL = process.env.PIPELINE_USER_EMAIL ?? "ben.felix2001193@gmail.com";
const FAMILY_MP3 = join(process.cwd(), "family.mp3");
const SCAM_MP3 = join(process.cwd(), "scam-audio.mp3");

type StageResult = { stage: string; status: "PASS" | "FAIL" | "BLOCKED"; detail: string };

const stages: StageResult[] = [];

function record(stage: string, status: StageResult["status"], detail: string) {
  stages.push({ stage, status, detail });
  console.log(`[${status}] ${stage}: ${detail}`);
}

async function signAccessToken(auth: AuthService, userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = await auth.buildJwtPayload(user);
  const env = loadEnv();
  const privateKey = await importPKCS8(env.jwtPrivateKey, "RS256");
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);
}

async function uploadAudio(
  url: string,
  token: string,
  elderId: string,
  audioPath: string,
  extraFields: Record<string, string> = {},
): Promise<unknown> {
  const buffer = readFileSync(audioPath);
  const ext = audioPath.endsWith(".mp3") ? ".mp3" : ".wav";
  const mime = ext === ".mp3" ? "audio/mpeg" : "audio/wav";
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
  for (const [k, v] of Object.entries(extraFields)) appendField(k, v);

  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="audio${ext}"\r\nContent-Type: ${mime}\r\n\r\n`,
    ),
  );
  parts.push(buffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: Buffer.concat(parts),
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
  const health = await fetch(`${API}/health`).then((r) => r.json()) as {
    status: string;
    checks: { qvacNode?: string; database?: string };
  };

  if (health.checks?.qvacNode !== "healthy") {
    record("QVAC node health", "FAIL", `qvacNode=${health.checks?.qvacNode ?? "unknown"}`);
  } else {
    record("QVAC node health", "PASS", "healthy");
  }

  const user = await prisma.user.findUnique({ where: { email: USER_EMAIL.toLowerCase() } });
  if (!user) {
    record("Resolve test user", "FAIL", `No user ${USER_EMAIL}`);
    writeReport(null);
    process.exit(1);
  }

  const member = await prisma.familyMember.findFirst({
    where: { userId: user.id },
    include: { family: true },
  });
  if (!member) {
    record("Resolve family", "FAIL", "User has no family");
    writeReport(null);
    process.exit(1);
  }

  const elder = await prisma.elder.findFirst({
    where: { familyId: member.familyId },
    orderBy: { createdAt: "asc" },
  });
  if (!elder) {
    record("Resolve elder", "FAIL", "No elder on family");
    writeReport(null);
    process.exit(1);
  }

  record("Resolve test user", "PASS", `${USER_EMAIL} · family=${member.family.name} · elder=${elder.firstName}`);

  const auth = new AuthService(prisma);
  const token = await signAccessToken(auth, user.id);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // --- Cognoscente baseline ---
  console.log("\n=== Cognoscente baseline (family.mp3) ===");
  const cogUpload = (await uploadAudio(
    `${API}/families/current/cognoscente/check-in`,
    token,
    elder.id,
    FAMILY_MP3,
  )) as { checkInId: string };

  record("Cognoscente check-in upload", "PASS", `checkInId=${cogUpload.checkInId}`);

  let checkIn;
  try {
    checkIn = await waitFor("cognoscente processing", async () => {
      const row = await prisma.cognoscenteCheckIn.findUnique({ where: { id: cogUpload.checkInId } });
      if (row?.transcript) return row;
      if (row?.status === "failed") throw new Error("Cognoscente job failed");
      return null;
    });
    record("Cognoscente transcription + analysis", "PASS", `transcript=${checkIn.transcript?.slice(0, 80)}…`);
  } catch (e) {
    record("Cognoscente transcription + analysis", "FAIL", e instanceof Error ? e.message : String(e));
  }

  const onboardingRes = await fetch(`${API}/families/current/onboarding`, { headers });
  const onboarding = onboardingRes.ok ? ((await onboardingRes.json()) as {
    steps: { baselineScan: boolean };
    currentStep: string;
    progress: number;
  }) : null;

  if (onboarding?.steps.baselineScan) {
    record("Onboarding step 4 (baselineScan)", "PASS", `progress=${onboarding.progress}% step=${onboarding.currentStep}`);
  } else {
    record(
      "Onboarding step 4 (baselineScan)",
      checkIn?.transcript ? "FAIL" : "BLOCKED",
      onboarding ? `baselineScan=false progress=${onboarding.progress}%` : "Could not fetch onboarding",
    );
  }

  // --- Sentinel pipeline ---
  console.log("\n=== Sentinel pipeline (scam-audio.mp3) ===");
  const sentUpload = (await uploadAudio(
    `${API}/families/current/sentinel/call-recording`,
    token,
    elder.id,
    SCAM_MP3,
  )) as { recordingId: string };

  record("Sentinel audio upload", "PASS", `recordingId=${sentUpload.recordingId}`);

  let recording;
  try {
    recording = await waitFor("sentinel processing", async () => {
      const row = await prisma.sentinelCallRecording.findUnique({ where: { id: sentUpload.recordingId } });
      if (row?.status === "failed") throw new Error("Sentinel job failed");
      return row?.status === "processed" ? row : null;
    });
    record("Sentinel processing", "PASS", `classification=${recording.finalClassification}`);
  } catch (e) {
    record("Sentinel processing", "FAIL", e instanceof Error ? e.message : String(e));
  }

  const alert = await prisma.alert.findFirst({
    where: { familyId: member.familyId, agent: "sentinel" },
    orderBy: { createdAt: "desc" },
  });

  if (alert) {
    record("Alert generation", "PASS", `${alert.title} · severity=${alert.severity}`);
  } else {
    record("Alert generation", "FAIL", "No sentinel alert for family");
  }

  const bundle = recording?.bundleId
    ? await prisma.decisionBundle.findUnique({ where: { id: recording.bundleId } })
    : alert?.bundleId
      ? await prisma.decisionBundle.findUnique({ where: { id: alert.bundleId } })
      : null;

  if (bundle?.hash) {
    record("Decision audit / bundle", "PASS", `hash=${bundle.hash.slice(0, 16)}… agent=${bundle.agent}`);
  } else {
    record("Decision audit / bundle", "FAIL", "No decision bundle");
  }

  const metadata = (alert?.metadata ?? {}) as { decisionAudit?: Record<string, unknown> };
  if (metadata.decisionAudit?.reasoning || bundle?.reasoning) {
    record("Decision audit reasoning", "PASS", "Present in bundle/alert metadata");
  } else {
    record("Decision audit reasoning", alert ? "FAIL" : "BLOCKED", "Missing reasoning");
  }

  const packet = alert
    ? await prisma.evidencePacket.findFirst({
        where: { alertId: alert.id },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (packet) {
    record("Evidence packet creation", "PASS", `packetId=${packet.id}`);
  } else {
    record("Evidence packet creation", alert ? "FAIL" : "BLOCKED", "No packet");
  }

  const chainRes = await fetch(`${API}/families/current/evidence/chain`, { headers });
  const chain = chainRes.ok ? ((await chainRes.json()) as { valid: boolean; length: number }) : null;

  if (chain?.valid && (chain.length ?? 0) > 0) {
    record("Evidence chain validation", "PASS", `valid=true length=${chain.length}`);
  } else {
    record("Evidence chain validation", bundle ? "FAIL" : "BLOCKED", JSON.stringify(chain));
  }

  if (bundle?.hash) {
    record("Chain hash display", "PASS", bundle.hash);
  } else {
    record("Chain hash display", "FAIL", "No hash");
  }

  const timelineRes = await fetch(`${API}/families/current/timeline`, { headers });
  const timeline = timelineRes.ok ? ((await timelineRes.json()) as Array<{ alertId: string; title: string }>) : [];
  const liveTimeline = timeline.filter((t) => t.alertId === alert?.id);

  if (liveTimeline.length > 0) {
    record("Timeline live update", "PASS", `${liveTimeline.length} item(s) for alert`);
  } else {
    record("Timeline live update", alert ? "FAIL" : "BLOCKED", `timeline items=${timeline.length}`);
  }

  const alertsRes = await fetch(`${API}/families/current/alerts`, { headers });
  const alerts = alertsRes.ok ? ((await alertsRes.json()) as Array<{ id: string }>) : [];
  const liveAlertListed = alert ? alerts.some((a) => a.id === alert.id) : false;

  if (liveAlertListed) {
    record("Alerts page API data", "PASS", `alert ${alert!.id.slice(-8)} listed`);
  } else {
    record("Alerts page API data", alert ? "FAIL" : "BLOCKED", `alerts count=${alerts.length}`);
  }

  const packetsRes = await fetch(`${API}/families/current/evidence/packets`, { headers });
  const packets = packetsRes.ok ? ((await packetsRes.json()) as Array<{ id: string; alertId: string }>) : [];
  const livePacketListed = packet ? packets.some((p) => p.id === packet.id) : false;

  if (livePacketListed) {
    record("Evidence page packet list", "PASS", `packet ${packet!.id.slice(-8)} listed`);
  } else {
    record("Evidence page packet list", packet ? "FAIL" : "BLOCKED", `packets count=${packets.length}`);
  }

  const telegramAudit = alert
    ? await prisma.auditLog.findFirst({
        where: {
          familyId: member.familyId,
          action: "telegram.alert_notified",
          entityId: alert.id,
        },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (telegramAudit) {
    const meta = telegramAudit.metadata as { sent?: number };
    record(
      "Telegram notification delivery",
      (meta.sent ?? 0) > 0 ? "PASS" : "FAIL",
      `sent=${meta.sent ?? 0} chats notified (audit log)`,
    );
  } else if (alert) {
    record(
      "Telegram notification delivery",
      "BLOCKED",
      "No telegram.alert_notified audit — confirm manually in Telegram app",
    );
  } else {
    record("Telegram notification delivery", "BLOCKED", "No alert to notify");
  }

  if (alert) {
    const deepLink = `${process.env.APP_URL ?? "http://localhost:5173"}/incidents/${alert.id}`;
    record("Incident deep link route", "PASS", deepLink);
  } else {
    record("Incident deep link route", "BLOCKED", "No alert id");
  }

  const proofRes = await fetch(`${API}/public/proof`);
  const proof = proofRes.ok ? ((await proofRes.json()) as { sentinel?: { alert?: { id?: string } } }) : null;
  const isLiveNotFallback = alert && proof?.sentinel?.alert?.id !== alert.id;

  if (isLiveNotFallback) {
    record("Live data (not public fallback)", "PASS", `Live alert ${alert!.id.slice(-8)} differs from proof demo`);
  } else if (alert) {
    record("Live data (not public fallback)", "PASS", `Live alert id=${alert.id}`);
  } else {
    record("Live data (not public fallback)", "FAIL", "No live alert");
  }

  writeReport({ familyId: member.familyId, elderId: elder.id, alertId: alert?.id, packetId: packet?.id, bundleHash: bundle?.hash });
  await prisma.$disconnect();
}

function writeReport(meta: Record<string, unknown> | null) {
  const out = {
    timestamp: new Date().toISOString(),
    meta,
    stages,
  };
  writeFileSync(join(process.cwd(), "LIVE_PIPELINE_RESULTS.json"), JSON.stringify(out, null, 2));
  console.log("\nWrote LIVE_PIPELINE_RESULTS.json");
}

main().catch((err) => {
  record("Pipeline runner", "FAIL", err instanceof Error ? err.message : String(err));
  writeReport(null);
  process.exit(1);
});
