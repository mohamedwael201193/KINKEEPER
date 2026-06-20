import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { QvacService } from "@kinkeeper/qvac";

const completionBodySchema = z.object({
  modelSrc: z.string().optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  captureThinking: z.boolean().optional(),
  familyId: z.string().nullable().optional(),
  deviceId: z.string().nullable().optional(),
  bundleId: z.string().nullable().optional(),
  delegate: z
    .object({
      providerPublicKey: z.string(),
      fallbackToLocal: z.boolean().optional(),
      timeout: z.number().optional(),
    })
    .optional(),
});

const transcribeBodySchema = z.object({
  audioPath: z.string().min(1),
  modelSrc: z.string().optional(),
  familyId: z.string().nullable().optional(),
  deviceId: z.string().nullable().optional(),
  bundleId: z.string().nullable().optional(),
  delegate: z
    .object({
      providerPublicKey: z.string(),
      fallbackToLocal: z.boolean().optional(),
      timeout: z.number().optional(),
    })
    .optional(),
});

export function registerInternalRoutes(app: FastifyInstance, qvac: QvacService): void {
  app.get("/internal/health", async () => ({
    status: "healthy",
    providerPublicKey: qvac.getProviderPublicKey(),
  }));

  app.post("/internal/completion", async (request) => {
    const body = completionBodySchema.parse(request.body);
    return qvac.runCompletion(body);
  });

  app.post("/internal/transcribe", async (request) => {
    const body = transcribeBodySchema.parse(request.body);
    return qvac.runTranscribe(body);
  });
}
