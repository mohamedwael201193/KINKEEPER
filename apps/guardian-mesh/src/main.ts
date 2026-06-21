import { config } from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { startGuardianMeshServer } from "./server.js";

const repoRoot = join(import.meta.dirname, "..", "..", "..");
for (const envPath of [join(repoRoot, ".env"), join(process.cwd(), ".env")]) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

const port = Number(process.env.GUARDIAN_MESH_PORT ?? 8787);
await startGuardianMeshServer(port);
