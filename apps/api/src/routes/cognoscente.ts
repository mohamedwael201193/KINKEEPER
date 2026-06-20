import type { FastifyInstance } from "fastify";
import { checkInSchema } from "@kinkeeper/shared";
import type { Queues } from "../queues/index.js";
import { LocalStorageService } from "../services/family.service.js";

export async function registerCognoscenteRoutes(app: FastifyInstance, queues: Queues): Promise<void> {
  const storage = new LocalStorageService(app.config.env.UPLOAD_DIR);

  app.post(
    "/families/current/cognoscente/check-in",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request, reply) => {
      const parts = request.parts();
      let elderId = "";
      let audioBuffer: Buffer | null = null;
      let mimeType = "audio/wav";

      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "audio") {
          audioBuffer = await part.toBuffer();
          mimeType = part.mimetype;
        } else if (part.type === "field" && part.fieldname === "elderId") {
          elderId = part.value as string;
        }
      }

      checkInSchema.parse({ elderId });

      if (!audioBuffer) {
        return reply.status(400).send({ error: { code: "AUDIO_REQUIRED", message: "Audio file is required" } });
      }

      const saved = storage.saveBuffer({
        familyId: request.user.familyId!,
        category: "cognoscente",
        buffer: audioBuffer,
        extension: storage.extensionFromMime(mimeType),
      });

      const checkIn = await app.prisma.cognoscenteCheckIn.create({
        data: {
          elderId,
          audioPath: saved.path,
        },
      });

      await queues.cognoscente.add("process", {
        familyId: request.user.familyId!,
        elderId,
        checkInId: checkIn.id,
        audioPath: saved.path,
        audioHash: saved.hash,
      });

      return { checkInId: checkIn.id, status: "queued" };
    },
  );

  app.get(
    "/families/current/cognoscente/check-ins",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const elders = await app.prisma.elder.findMany({
        where: { familyId: request.user.familyId! },
        select: { id: true },
      });
      const elderIds = elders.map((e) => e.id);
      return app.prisma.cognoscenteCheckIn.findMany({
        where: { elderId: { in: elderIds } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },
  );

  app.get(
    "/families/current/cognoscente/trends",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const elders = await app.prisma.elder.findMany({
        where: { familyId: request.user.familyId! },
        select: { id: true },
      });
      const elderIds = elders.map((e) => e.id);
      return app.prisma.cognoscenteTrend.findMany({
        where: { elderId: { in: elderIds } },
        orderBy: { date: "desc" },
        take: 90,
      });
    },
  );
}
