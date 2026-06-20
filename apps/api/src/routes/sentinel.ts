import type { FastifyInstance } from "fastify";
import { callRecordingSchema } from "@kinkeeper/shared";
import type { Queues } from "../queues/index.js";
import { LocalStorageService } from "../services/family.service.js";

export async function registerSentinelRoutes(app: FastifyInstance, queues: Queues): Promise<void> {
  const storage = new LocalStorageService(app.config.env.UPLOAD_DIR);

  app.post(
    "/families/current/sentinel/call-recording",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const parts = request.parts();
      let elderId = "";
      let transcript: string | undefined;
      let initialClassification: string | undefined;
      let initialConfidence: number | undefined;
      let initialReasoning: string | undefined;
      let audioBuffer: Buffer | null = null;
      let mimeType = "audio/wav";

      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "audio") {
          audioBuffer = await part.toBuffer();
          mimeType = part.mimetype;
        } else if (part.type === "field") {
          const value = part.value as string;
          switch (part.fieldname) {
            case "elderId":
              elderId = value;
              break;
            case "transcript":
              transcript = value;
              break;
            case "initialClassification":
              initialClassification = value;
              break;
            case "initialConfidence":
              initialConfidence = Number(value);
              break;
            case "initialReasoning":
              initialReasoning = value;
              break;
          }
        }
      }

      const parsed = callRecordingSchema.parse({
        elderId,
        transcript,
        initialClassification,
        initialConfidence,
        initialReasoning,
      });

      if (!audioBuffer) {
        return reply.status(400).send({ error: { code: "AUDIO_REQUIRED", message: "Audio file is required" } });
      }

      const saved = storage.saveBuffer({
        familyId: request.user.familyId!,
        category: "sentinel",
        buffer: audioBuffer,
        extension: storage.extensionFromMime(mimeType),
      });

      const recording = await app.prisma.sentinelCallRecording.create({
        data: {
          familyId: request.user.familyId!,
          elderId: parsed.elderId,
          audioPath: saved.path,
          transcript: parsed.transcript,
          initialClassification: parsed.initialClassification,
          initialConfidence: parsed.initialConfidence,
          initialReasoning: parsed.initialReasoning,
          status: "pending",
        },
      });

      await queues.sentinel.add("process", {
        familyId: request.user.familyId!,
        elderId: parsed.elderId,
        recordingId: recording.id,
        audioPath: saved.path,
        audioHash: saved.hash,
        transcript: parsed.transcript,
        initialClassification: parsed.initialClassification,
        initialConfidence: parsed.initialConfidence,
        initialReasoning: parsed.initialReasoning,
      });

      return { recordingId: recording.id, status: "queued" };
    },
  );

  app.get(
    "/families/current/sentinel/alerts",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return app.prisma.alert.findMany({
        where: { familyId: request.user.familyId!, agent: "sentinel" },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },
  );

  app.post(
    "/families/current/sentinel/alerts/:id/resolve",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const { id } = request.params as { id: string };
      return app.prisma.alert.update({
        where: { id, familyId: request.user.familyId! },
        data: { resolved: true, resolvedAt: new Date(), resolvedBy: request.user.sub },
      });
    },
  );
}
