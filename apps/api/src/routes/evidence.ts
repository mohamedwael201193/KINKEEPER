import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { evidenceExportSchema, type AgentDecisionAudit } from "@kinkeeper/shared";
import { ArchivistService } from "../services/archivist.service.js";
import type { AgentServices } from "../services/factory.js";

export async function registerEvidenceRoutes(
  app: FastifyInstance,
  services: Pick<AgentServices, "evidencePackets">,
): Promise<void> {
  const archivist = new ArchivistService(app.prisma);

  app.get(
    "/families/current/evidence/bundles",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return app.prisma.decisionBundle.findMany({
        where: { familyId: request.user.familyId! },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    },
  );

  app.get(
    "/families/current/evidence/bundles/:id",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const bundle = await app.prisma.decisionBundle.findFirst({
        where: { id, familyId: request.user.familyId! },
      });
      if (!bundle) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Bundle not found" } });
      }
      return bundle;
    },
  );

  app.get(
    "/families/current/evidence/chain",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const verification = await archivist.verifyChain(request.user.familyId!);
      return verification;
    },
  );

  app.post(
    "/families/current/evidence/chain/verify",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return archivist.verifyChain(request.user.familyId!);
    },
  );

  app.post(
    "/families/current/evidence/export",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const body = evidenceExportSchema.parse(request.body ?? {});
      const where: {
        familyId: string;
        createdAt?: { gte?: Date; lte?: Date };
        agent?: "sentinel" | "cognoscente" | "chronicler" | "coordinator" | "archivist";
      } = { familyId: request.user.familyId! };

      if (body.dateFrom || body.dateTo) {
        where.createdAt = {};
        if (body.dateFrom) where.createdAt.gte = new Date(body.dateFrom);
        if (body.dateTo) where.createdAt.lte = new Date(body.dateTo);
      }
      if (body.agent !== "all") {
        where.agent = body.agent;
      }

      const bundles = await app.prisma.decisionBundle.findMany({
        where,
        orderBy: { createdAt: "asc" },
      });
      const chain = await archivist.verifyChain(request.user.familyId!);

      if (body.format === "csv") {
        const header = "bundle_id,agent,trigger,hash,previous_hash,created_at";
        const rows = bundles.map(
          (b) =>
            `${b.id},${b.agent},${JSON.stringify(b.trigger)},${b.hash},${b.previousHash},${b.createdAt.toISOString()}`,
        );
        return { format: "csv", content: [header, ...rows].join("\n") };
      }

      return {
        format: "json",
        exportedAt: new Date().toISOString(),
        chainVerification: chain,
        bundles,
      };
    },
  );

  app.get(
    "/families/current/alerts",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return app.prisma.alert.findMany({
        where: { familyId: request.user.familyId! },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    },
  );

  app.get(
    "/families/current/alerts/:id",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const alert = await app.prisma.alert.findFirst({
        where: { id, familyId: request.user.familyId! },
        include: { bundle: true },
      });
      if (!alert) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Alert not found" } });
      }
      return alert;
    },
  );

  app.get(
    "/families/current/alerts/:id/evidence-packet",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const alert = await app.prisma.alert.findFirst({
        where: { id, familyId: request.user.familyId! },
      });
      if (!alert) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Alert not found" } });
      }

      let packet = await services.evidencePackets.getByAlertId(request.user.familyId!, id);
      if (!packet) {
        const metadata = alert.metadata as Record<string, unknown> | null;
        const decisionAudit = metadata?.decisionAudit;
        if (!decisionAudit || typeof decisionAudit !== "object") {
          return reply.status(404).send({
            error: { code: "NO_DECISION", message: "No decision audit available for this alert" },
          });
        }
        const generated = await services.evidencePackets.generateForAlert({
          alertId: id,
          decision: decisionAudit as AgentDecisionAudit,
        });
        packet = generated.content;
      }

      return packet;
    },
  );

  app.post(
    "/families/current/alerts/:id/evidence-packet",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const alert = await app.prisma.alert.findFirst({
        where: { id, familyId: request.user.familyId! },
      });
      if (!alert) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Alert not found" } });
      }

      const metadata = alert.metadata as Record<string, unknown> | null;
      const decisionAudit = metadata?.decisionAudit;
      if (!decisionAudit || typeof decisionAudit !== "object") {
        return reply.status(400).send({
          error: { code: "NO_DECISION", message: "Alert has no decision audit metadata" },
        });
      }

      const result = await services.evidencePackets.generateForAlert({
        alertId: id,
        decision: decisionAudit as AgentDecisionAudit,
      });

      return {
        packetId: result.packetId,
        filePath: result.filePath,
        content: result.content,
      };
    },
  );
}

export async function registerInferenceLogRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/families/current/inference-logs",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return app.prisma.inferenceLog.findMany({
        where: { familyId: request.user.familyId! },
        orderBy: { timestamp: "desc" },
        take: 200,
      });
    },
  );

  app.get(
    "/families/current/inference-logs/export",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const format = (request.query as { format?: string }).format ?? "csv";
      const logs = await app.prisma.inferenceLog.findMany({
        where: { familyId: request.user.familyId! },
        orderBy: { timestamp: "asc" },
      });

      if (format === "json") {
        return logs;
      }

      const header =
        "timestamp,family_id,device_id,model_src,operation,prompt_tokens,completion_tokens,ttft_sec,tps,delegate_provider,delegate_fallback_used,bundle_id";
      const rows = logs.map((log) =>
        [
          log.timestamp.toISOString(),
          log.familyId ?? "",
          log.deviceId ?? "",
          log.modelSrc,
          log.operation,
          log.promptTokens,
          log.completionTokens,
          log.ttftSec ?? "",
          log.tps ?? "",
          log.delegateProvider ?? "",
          log.delegateFallbackUsed,
          log.bundleId ?? "",
        ].join(","),
      );

      reply.header("Content-Type", "text/csv");
      reply.header("Content-Disposition", 'attachment; filename="inference-log.csv"');
      return [header, ...rows].join("\n");
    },
  );

  app.get(
    "/families/current/inference-logs/export/file",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (_request, reply) => {
      const csvPath = join(app.config.env.EVIDENCE_DIR, "inference-log.csv");
      const content = readFileSync(csvPath, "utf8");
      reply.header("Content-Type", "text/csv");
      reply.header("Content-Disposition", 'attachment; filename="inference-log.csv"');
      return content;
    },
  );
}
