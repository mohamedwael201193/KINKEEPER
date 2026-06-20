import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { QvacClient } from "@kinkeeper/qvac";

function readEvidenceJson(evidenceDir: string, filename: string): unknown | null {
  const path = join(evidenceDir, filename);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch {
    return null;
  }
}

export async function registerPublicRoutes(app: FastifyInstance): Promise<void> {
  const qvacClient = new QvacClient({
    baseUrl: app.config.env.QVAC_NODE_URL,
    secret: app.config.env.QVAC_NODE_SECRET,
  });

  app.get("/public/proof", async () => {
    const dir = app.config.env.EVIDENCE_DIR;
    return {
      generatedAt: new Date().toISOString(),
      sources: {
        sentinel: "evidence/sentinel-e2e.json",
        cognoscente: "evidence/cognoscente-e2e.json",
        qvacRuntime: "evidence/qvac-runtime-verify.json",
        evidenceSystem: "evidence/evidence-system.json",
        delegation: "evidence/delegation-verify.json",
      },
      sentinel: readEvidenceJson(dir, "sentinel-e2e.json"),
      cognoscente: readEvidenceJson(dir, "cognoscente-e2e.json"),
      qvacRuntime: readEvidenceJson(dir, "qvac-runtime-verify.json"),
      evidenceSystem: readEvidenceJson(dir, "evidence-system.json"),
      delegation: readEvidenceJson(dir, "delegation-verify.json"),
    };
  });

  app.get("/public/runtime", async () => {
    let liveHealth: { status: string; providerPublicKey: string | null } | null = null;
    try {
      liveHealth = await qvacClient.health();
    } catch {
      liveHealth = null;
    }

    const verified = readEvidenceJson(app.config.env.EVIDENCE_DIR, "qvac-runtime-verify.json") as {
      sdkVersion?: string;
      providerPublicKey?: string;
      hardware?: Record<string, unknown>;
      steps?: Array<{ name: string; ok: boolean; details?: Record<string, unknown> }>;
    } | null;

    return {
      live: liveHealth,
      verified,
      source: "evidence/qvac-runtime-verify.json + GET /internal/health",
    };
  });
}
