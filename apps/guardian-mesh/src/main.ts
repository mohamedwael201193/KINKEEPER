import { config } from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { isTelegramPollConflict } from "@kinkeeper/guardian-mesh";
import { startGuardianMeshServer } from "./server.js";

const repoRoot = join(import.meta.dirname, "..", "..", "..");
for (const envPath of [join(repoRoot, ".env"), join(process.cwd(), ".env")]) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

process.on("unhandledRejection", (reason) => {
  if (isTelegramPollConflict(reason)) {
    process.stderr.write(
      "[guardian-mesh] Telegram 409 ignored — another bot instance is polling. Judge UI keeps running.\n",
    );
    return;
  }
});

const port = Number(process.env.GUARDIAN_MESH_PORT ?? 8787);
try {
  await startGuardianMeshServer(port);
} catch (error) {
  process.stderr.write(`[guardian-mesh] ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
