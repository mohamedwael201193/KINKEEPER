import type { FastifyInstance } from "fastify";
import { prisma } from "@kinkeeper/db";
import { QvacClient } from "@kinkeeper/qvac";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => {
    const checks: Record<string, string> = {
      database: "unknown",
      redis: "unknown",
      qvacNode: "unknown",
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "healthy";
    } catch {
      checks.database = "unhealthy";
    }

    const env = app.config.env;
    try {
      const client = new QvacClient({ baseUrl: env.QVAC_NODE_URL, secret: env.QVAC_NODE_SECRET });
      const health = await client.health();
      checks.qvacNode = health.status === "healthy" ? "healthy" : "unhealthy";
    } catch {
      checks.qvacNode = "unhealthy";
    }

    checks.redis = "configured";

    const healthy = checks.database === "healthy";
    return {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      version: "0.1.0",
    };
  });

  app.get("/ready", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ready" };
    } catch {
      return reply.status(503).send({ status: "not_ready" });
    }
  });
}
