import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import type { ApiEnv } from "./config/env.js";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerUserRoutes, registerFamilyRoutes } from "./routes/family.js";
import { registerSentinelRoutes } from "./routes/sentinel.js";
import { registerCognoscenteRoutes } from "./routes/cognoscente.js";
import {
  registerEvidenceRoutes,
  registerInferenceLogRoutes,
} from "./routes/evidence.js";
import { registerTelegramRoutes } from "./routes/telegram.js";
import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerPublicRoutes } from "./routes/public.js";
import type { Queues } from "./queues/index.js";
import type { AgentServices } from "./services/factory.js";

declare module "fastify" {
  interface FastifyInstance {
    config: { env: ApiEnv };
  }
}

export async function buildApp(env: ApiEnv, queues: Queues, services: AgentServices) {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
  });

  app.decorate("config", { env });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.corsOrigins,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  await app.register(cookie);
  await app.register(multipart, {
    limits: { fileSize: 50 * 1024 * 1024 },
  });
  await app.register(prismaPlugin);
  await app.register(authPlugin, { env });

  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  await registerUserRoutes(app);
  await registerFamilyRoutes(app);
  await registerSentinelRoutes(app, queues);
  await registerCognoscenteRoutes(app, queues);
  await registerEvidenceRoutes(app, services);
  await registerInferenceLogRoutes(app);
  await registerTelegramRoutes(app, services);
  await registerDashboardRoutes(app);
  await registerPublicRoutes(app);

  return app;
}
