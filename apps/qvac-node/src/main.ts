import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "@kinkeeper/db";
import { QvacService } from "@kinkeeper/qvac";
import { loadEnv } from "./config/env.js";
import { registerInternalRoutes } from "./routes/internal.js";

const env = loadEnv();
const qvac = new QvacService(prisma);

async function bootstrap(): Promise<void> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await app.register(cors, { origin: false });

  app.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/internal")) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Not found" } });
    }

    const auth = request.headers.authorization;
    if (auth !== `Bearer ${env.QVAC_NODE_SECRET}`) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Invalid token" } });
    }
  });

  registerInternalRoutes(app, qvac);

  const provider = await qvac.startProvider({
    firewall: {
      mode: "allow",
      publicKeys: [],
    },
  });

  // Listen immediately — do not block on multi-GB MedPsy download
  await app.listen({ port: env.QVAC_NODE_PORT, host: "0.0.0.0" });

  app.log.info(
    {
      port: env.QVAC_NODE_PORT,
      providerPublicKey: provider.publicKey,
      evidenceDir: env.EVIDENCE_DIR,
      modelsCache: env.QVAC_MODELS_CACHE_DIR,
      preloadMedPsy: process.env.PRELOAD_MEDPSY === "true",
      medPsyModel: process.env.MEDPSY_MODEL ?? "1.7B",
    },
    "QVAC cognition node started",
  );

  void qvac
    .preloadAgentModels()
    .then(() => app.log.info("Essential models preloaded (Qwen3 + Whisper)"))
    .catch((error: unknown) => {
      app.log.error({ err: error }, "Model preload failed");
    });

  const shutdown = async (): Promise<void> => {
    await qvac.unloadAll();
    await qvac.stopProvider();
    await app.close();
    await prisma.$disconnect();
  };

  process.on("SIGINT", () => {
    void shutdown().finally(() => process.exit(0));
  });
  process.on("SIGTERM", () => {
    void shutdown().finally(() => process.exit(0));
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start QVAC node:", error);
  process.exit(1);
});
