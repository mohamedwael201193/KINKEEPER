import { randomUUID } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

const transcribeBodySchema = z
  .object({
    audioPath: z.string().min(1).optional(),
    audioBase64: z.string().min(1).optional(),
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
  })
  .refine((body) => Boolean(body.audioPath || body.audioBase64), {
    message: "audioPath or audioBase64 is required",
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

    if (body.audioBase64) {
      const tempPath = join(tmpdir(), `kinkeeper-${randomUUID()}.wav`);
      writeFileSync(tempPath, Buffer.from(body.audioBase64, "base64"));
      try {
        return await qvac.runTranscribe({ ...body, audioPath: tempPath });
      } finally {
        try {
          unlinkSync(tempPath);
        } catch {
          /* ignore cleanup errors */
        }
      }
    }

    return qvac.runTranscribe({ ...body, audioPath: body.audioPath! });
  });
}
