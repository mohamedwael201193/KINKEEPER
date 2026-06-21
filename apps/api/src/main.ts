import "dotenv/config";
import { loadEnv } from "./config/env.js";
import { buildApp } from "./app.js";
import { startWorkers } from "./workers/index.js";
import { createAgentServices } from "./services/factory.js";
import { prisma } from "@kinkeeper/db";

async function main(): Promise<void> {
  const env = loadEnv();
  const services = createAgentServices(prisma, env);
  const { queues } = startWorkers(env, services);
  const app = await buildApp(env, queues, services);

  if (services.telegram.isEnabled()) {
    await services.telegram.start();
  }

  const port = Number(process.env.PORT ?? env.APP_PORT);
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info({ port, telegram: services.telegram.isEnabled() }, "KINKEEPER API started");
}

process.on("unhandledRejection", (reason) => {
  if (
    reason &&
    typeof reason === "object" &&
    "error_code" in reason &&
    (reason as { error_code?: number }).error_code === 409
  ) {
    console.warn("[api] Telegram 409 ignored — another bot poller is active.");
    return;
  }
});

main().catch((error: unknown) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
