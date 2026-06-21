import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { QvacClient } from "@kinkeeper/qvac";
import {
  demoCognoscenteProof,
  demoDelegationProof,
  demoEvidenceSystemProof,
  demoQvacRuntimeProof,
  demoSentinelProof,
} from "../assets/demo-proof.js";

function readEvidenceJson(evidenceDir: string, filename: string): unknown | null {
  const path = join(evidenceDir, filename);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch {
    return null;
  }
}

function withFallback(live: unknown | null, bundled: unknown): { value: unknown; source: "live" | "bundled" } {
  return live != null ? { value: live, source: "live" } : { value: bundled, source: "bundled" };
}

export async function registerPublicRoutes(app: FastifyInstance): Promise<void> {
  const qvacClient = new QvacClient({
    baseUrl: app.config.env.QVAC_NODE_URL,
    secret: app.config.env.QVAC_NODE_SECRET,
  });

  app.get("/public/proof", async () => {
    const dir = app.config.env.EVIDENCE_DIR;
    const sentinel = withFallback(readEvidenceJson(dir, "sentinel-e2e.json"), demoSentinelProof);
    const cognoscente = withFallback(readEvidenceJson(dir, "cognoscente-e2e.json"), demoCognoscenteProof);
    const qvacRuntime = withFallback(readEvidenceJson(dir, "qvac-runtime-verify.json"), demoQvacRuntimeProof);
    const evidenceSystem = withFallback(readEvidenceJson(dir, "evidence-system.json"), demoEvidenceSystemProof);
    const delegation = withFallback(readEvidenceJson(dir, "delegation-verify.json"), demoDelegationProof);

    return {
      generatedAt: new Date().toISOString(),
      sources: {
        sentinel: "evidence/sentinel-e2e.json",
        cognoscente: "evidence/cognoscente-e2e.json",
        qvacRuntime: "evidence/qvac-runtime-verify.json",
        evidenceSystem: "evidence/evidence-system.json",
        delegation: "evidence/delegation-verify.json",
      },
      proofSource: {
        sentinel: sentinel.source,
        cognoscente: cognoscente.source,
        qvacRuntime: qvacRuntime.source,
        evidenceSystem: evidenceSystem.source,
        delegation: delegation.source,
      },
      sentinel: sentinel.value,
      cognoscente: cognoscente.value,
      qvacRuntime: qvacRuntime.value,
      evidenceSystem: evidenceSystem.value,
      delegation: delegation.value,
    };
  });

  app.get("/public/runtime", async () => {
    let liveHealth: { status: string; providerPublicKey: string | null } | null = null;
    try {
      liveHealth = await qvacClient.health();
    } catch {
      liveHealth = null;
    }

    const liveVerified = readEvidenceJson(app.config.env.EVIDENCE_DIR, "qvac-runtime-verify.json");
    const verified = (liveVerified ?? demoQvacRuntimeProof) as {
      sdkVersion?: string;
      providerPublicKey?: string;
      hardware?: Record<string, unknown>;
      steps?: Array<{ name: string; ok: boolean; details?: Record<string, unknown> }>;
    };

    return {
      live: liveHealth,
      verified,
      verifiedSource: liveVerified ? "evidence/qvac-runtime-verify.json" : "bundled-demo-proof",
      source: "evidence/qvac-runtime-verify.json + GET /internal/health",
    };
  });
}
