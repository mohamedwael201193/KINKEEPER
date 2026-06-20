import type { FastifyInstance } from "fastify";
import { QvacClient } from "@kinkeeper/qvac";
import { ArchivistService } from "../services/archivist.service.js";

type TimelineStageStatus = "completed" | "pending" | "skipped";

interface TimelineStage {
  id: string;
  label: string;
  status: TimelineStageStatus;
  timestamp: string | null;
  metadata?: Record<string, unknown>;
}

function computeRiskScore(alerts: { severity: string; resolved: boolean }[]): number {
  let score = 0;
  for (const alert of alerts.filter((a) => !a.resolved)) {
    if (alert.severity === "critical") score += 40;
    else if (alert.severity === "warning") score += 20;
    else score += 5;
  }
  return Math.min(100, score);
}

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  const archivist = new ArchivistService(app.prisma);
  const qvacClient = new QvacClient({
    baseUrl: app.config.env.QVAC_NODE_URL,
    secret: app.config.env.QVAC_NODE_SECRET,
  });

  app.get(
    "/families/current/dashboard",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const familyId = request.user.familyId!;

      const [alerts, bundles, packets, chainVerification, inferenceLogs] = await Promise.all([
        app.prisma.alert.findMany({
          where: { familyId },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        app.prisma.decisionBundle.findMany({
          where: { familyId },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            agent: true,
            trigger: true,
            hash: true,
            createdAt: true,
            reasoning: true,
          },
        }),
        app.prisma.evidencePacket.findMany({
          where: { familyId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        archivist.verifyChain(familyId),
        app.prisma.inferenceLog.findMany({
          where: { familyId },
          orderBy: { timestamp: "desc" },
          take: 10,
        }),
      ]);

      const activeAlerts = alerts.filter((a) => !a.resolved).length;
      const resolvedAlerts = alerts.filter((a) => a.resolved).length;

      return {
        activeAlerts,
        resolvedAlerts,
        riskScore: computeRiskScore(alerts),
        totalAlerts: alerts.length,
        chainVerification,
        recentAlerts: alerts.slice(0, 5),
        recentAnalyses: bundles.map((b) => {
          const reasoning = b.reasoning as {
            classification?: string;
            confidence?: number;
            modelSrc?: string;
            latencyMs?: number;
          };
          return {
            bundleId: b.id,
            agent: b.agent,
            trigger: b.trigger,
            hash: b.hash,
            createdAt: b.createdAt,
            classification: reasoning.classification ?? null,
            confidence: reasoning.confidence ?? null,
            modelSrc: reasoning.modelSrc ?? null,
            latencyMs: reasoning.latencyMs ?? null,
          };
        }),
        recentEvidencePackets: packets,
        recentInferenceLogs: inferenceLogs,
      };
    },
  );

  app.get(
    "/families/current/members",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const members = await app.prisma.familyMember.findMany({
        where: { familyId: request.user.familyId! },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      const telegramChats = await app.prisma.telegramChat.findMany({
        where: { userId: { in: members.map((m) => m.userId) } },
      });
      const chatByUser = new Map(telegramChats.map((c) => [c.userId, c]));

      return members.map((m) => ({
        id: m.id,
        role: m.role,
        createdAt: m.createdAt,
        user: m.user,
        telegramLinked: Boolean(chatByUser.get(m.userId)),
        telegramLinkedAt: chatByUser.get(m.userId)?.linkedAt ?? null,
      }));
    },
  );

  app.get(
    "/families/current/agents",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return app.prisma.agent.findMany({
        where: { familyId: request.user.familyId! },
        orderBy: { name: "asc" },
      });
    },
  );

  app.get(
    "/families/current/devices",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return app.prisma.device.findMany({
        where: { familyId: request.user.familyId! },
        orderBy: { createdAt: "asc" },
      });
    },
  );

  app.get(
    "/families/current/evidence/packets",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return app.prisma.evidencePacket.findMany({
        where: { familyId: request.user.familyId! },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    },
  );

  app.get(
    "/families/current/alerts/:id/timeline",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const familyId = request.user.familyId!;

      const alert = await app.prisma.alert.findFirst({
        where: { id, familyId },
        include: { bundle: true, evidencePacket: true },
      });

      if (!alert) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Alert not found" } });
      }

      const metadata = alert.metadata as Record<string, unknown> | null;
      const recordingId = typeof metadata?.recordingId === "string" ? metadata.recordingId : null;
      const checkInId = typeof metadata?.checkInId === "string" ? metadata.checkInId : null;

      const [recording, checkIn, workflowLog, telegramLogs, ackLogs] = await Promise.all([
        recordingId
          ? app.prisma.sentinelCallRecording.findFirst({ where: { id: recordingId, familyId } })
          : null,
        checkInId
          ? app.prisma.cognoscenteCheckIn.findFirst({ where: { id: checkInId } })
          : null,
        app.prisma.agentLog.findFirst({
          where: {
            familyId,
            message: "Autonomous caregiver workflow completed",
            metadata: { path: ["alertId"], equals: id },
          },
          orderBy: { createdAt: "desc" },
        }),
        app.prisma.auditLog.findMany({
          where: {
            familyId,
            action: { in: ["telegram.notify", "telegram.notify_family", "telegram.alert_notified"] },
            entityId: id,
          },
          orderBy: { createdAt: "asc" },
        }),
        app.prisma.auditLog.findMany({
          where: {
            familyId,
            action: { in: ["telegram.ack", "telegram.linked", "alert.acknowledged", "alert.resolve"] },
            entityId: id,
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      const stages: TimelineStage[] = [];

      const audioTimestamp = recording?.createdAt ?? checkIn?.createdAt ?? alert.createdAt;
      stages.push({
        id: "audio_uploaded",
        label: "Audio Uploaded",
        status: "completed",
        timestamp: audioTimestamp.toISOString(),
        metadata: recording
          ? { recordingId: recording.id, status: recording.status }
          : checkIn
            ? { checkInId: checkIn.id }
            : undefined,
      });

      const transcript =
        recording?.transcript ??
        checkIn?.transcript ??
        (alert.bundle?.inputs as { transcript?: string } | null)?.transcript ??
        null;

      stages.push({
        id: "transcribed",
        label: "Transcribed",
        status: transcript ? "completed" : recording || checkIn ? "pending" : "skipped",
        timestamp: transcript
          ? (recording?.processedAt ?? checkIn?.createdAt ?? alert.bundle?.createdAt)?.toISOString() ??
            null
          : null,
        metadata: transcript ? { excerpt: transcript.slice(0, 160) } : undefined,
      });

      stages.push({
        id: "sentinel_analysis",
        label: "Sentinel Analysis",
        status:
          alert.agent === "sentinel" && alert.bundle
            ? "completed"
            : alert.agent === "sentinel"
              ? "pending"
              : "skipped",
        timestamp:
          alert.agent === "sentinel" && alert.bundle ? alert.bundle.createdAt.toISOString() : null,
      });

      stages.push({
        id: "cognoscente_review",
        label: "Cognoscente Review",
        status:
          alert.agent === "cognoscente" && alert.bundle
            ? "completed"
            : alert.agent === "cognoscente"
              ? "pending"
              : "skipped",
        timestamp:
          alert.agent === "cognoscente" && alert.bundle ? alert.bundle.createdAt.toISOString() : null,
      });

      stages.push({
        id: "evidence_created",
        label: "Evidence Created",
        status: alert.bundle ? "completed" : "pending",
        timestamp: alert.bundle?.createdAt.toISOString() ?? null,
        metadata: alert.bundle
          ? { bundleId: alert.bundle.id, hash: alert.bundle.hash }
          : undefined,
      });

      stages.push({
        id: "packet_generated",
        label: "Evidence Packet",
        status: alert.evidencePacket ? "completed" : workflowLog ? "pending" : "skipped",
        timestamp: alert.evidencePacket?.createdAt.toISOString() ?? null,
        metadata: alert.evidencePacket
          ? { packetId: alert.evidencePacket.id, contentHash: alert.evidencePacket.contentHash }
          : undefined,
      });

      const telegramSent = telegramLogs.length > 0 || (workflowLog?.metadata as { steps?: string[] })?.steps?.includes("notify");
      stages.push({
        id: "telegram_sent",
        label: "Telegram Sent",
        status: telegramSent ? "completed" : workflowLog ? "skipped" : "pending",
        timestamp: telegramLogs[0]?.createdAt.toISOString() ?? workflowLog?.createdAt.toISOString() ?? null,
        metadata: telegramLogs.length
          ? { deliveries: telegramLogs.length }
          : undefined,
      });

      const acknowledged = ackLogs.length > 0 || alert.resolved;
      stages.push({
        id: "acknowledged",
        label: "Acknowledged",
        status: acknowledged ? "completed" : telegramSent ? "pending" : "skipped",
        timestamp: ackLogs[0]?.createdAt.toISOString() ?? null,
      });

      stages.push({
        id: "resolved",
        label: "Resolved",
        status: alert.resolved ? "completed" : acknowledged ? "pending" : "skipped",
        timestamp: alert.resolvedAt?.toISOString() ?? null,
      });

      return { alertId: id, stages };
    },
  );

  app.get(
    "/families/current/timeline",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const familyId = request.user.familyId!;
      const alerts = await app.prisma.alert.findMany({
        where: { familyId },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { evidencePacket: true, bundle: true },
      });

      return alerts.map((alert) => ({
        alertId: alert.id,
        title: alert.title,
        severity: alert.severity,
        agent: alert.agent,
        resolved: alert.resolved,
        createdAt: alert.createdAt,
        hasBundle: Boolean(alert.bundle),
        hasPacket: Boolean(alert.evidencePacket),
        chainHash: alert.bundle?.hash ?? null,
      }));
    },
  );

  app.get(
    "/telegram/notifications",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const logs = await app.prisma.auditLog.findMany({
        where: {
          familyId: request.user.familyId!,
          action: {
            in: [
              "telegram.notify",
              "telegram.notify_family",
              "telegram.ack",
              "telegram.link",
              "telegram.unlink",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      return logs;
    },
  );

  app.get(
    "/families/current/qvac/runtime",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const familyId = request.user.familyId!;

      let qvacHealth: { status: string; providerPublicKey: string | null } | null = null;
      try {
        qvacHealth = await qvacClient.health();
      } catch {
        qvacHealth = null;
      }

      const [family, inferenceLogs, devices, agents] = await Promise.all([
        app.prisma.family.findUnique({ where: { id: familyId } }),
        app.prisma.inferenceLog.findMany({
          where: { familyId },
          orderBy: { timestamp: "desc" },
          take: 100,
        }),
        app.prisma.device.findMany({ where: { familyId } }),
        app.prisma.agent.findMany({ where: { familyId } }),
      ]);

      const completionLogs = inferenceLogs.filter((l) => l.operation === "completion");
      const transcribeLogs = inferenceLogs.filter((l) => l.operation === "transcribe");
      const delegatedLogs = inferenceLogs.filter((l) => l.delegateProvider);

      const avg = (values: number[]) =>
        values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

      const ttftValues = completionLogs.map((l) => l.ttftSec).filter((v): v is number => v != null);
      const tpsValues = completionLogs.map((l) => l.tps).filter((v): v is number => v != null);

      const modelUsage = inferenceLogs.reduce<Record<string, number>>((acc, log) => {
        acc[log.modelSrc] = (acc[log.modelSrc] ?? 0) + 1;
        return acc;
      }, {});

      return {
        qvacNode: qvacHealth,
        providerPublicKey: qvacHealth?.providerPublicKey ?? family?.meshPublicKey ?? null,
        devices,
        agents,
        stats: {
          totalInferences: inferenceLogs.length,
          completionCount: completionLogs.length,
          transcribeCount: transcribeLogs.length,
          delegatedCount: delegatedLogs.length,
          fallbackCount: inferenceLogs.filter((l) => l.delegateFallbackUsed).length,
          avgTtftSec: avg(ttftValues),
          avgTps: avg(tpsValues),
          modelUsage,
        },
        recentLogs: inferenceLogs.slice(0, 20),
      };
    },
  );

  app.get(
    "/families/current/system-health",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const familyId = request.user.familyId!;

      let apiHealth: Record<string, string>;
      try {
        await app.prisma.$queryRaw`SELECT 1`;
        apiHealth = { database: "healthy" };
      } catch {
        apiHealth = { database: "unhealthy" };
      }

      let qvacNode = "unknown";
      try {
        const health = await qvacClient.health();
        qvacNode = health.status === "healthy" ? "healthy" : "degraded";
      } catch {
        qvacNode = "unhealthy";
      }

      const [agents, openAlerts, chainVerification, lastBundle] = await Promise.all([
        app.prisma.agent.findMany({ where: { familyId } }),
        app.prisma.alert.count({ where: { familyId, resolved: false } }),
        archivist.verifyChain(familyId),
        app.prisma.decisionBundle.findFirst({
          where: { familyId },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);

      return {
        timestamp: new Date().toISOString(),
        checks: {
          database: apiHealth.database,
          qvacNode,
          redis: "configured",
          telegram: app.config.env.TELEGRAM_ENABLED ? "enabled" : "disabled",
        },
        family: {
          openAlerts,
          chainVerification,
          lastEvidenceAt: lastBundle?.createdAt ?? null,
          agents: agents.map((a) => ({ name: a.name, status: a.status })),
        },
      };
    },
  );
}
