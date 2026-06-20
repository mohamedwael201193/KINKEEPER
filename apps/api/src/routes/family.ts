import type { FastifyInstance } from "fastify";
import { createFamilySchema, createElderSchema } from "@kinkeeper/shared";
import { z } from "zod";
import { QvacClient } from "@kinkeeper/qvac";
import { AuthService } from "../services/auth.service.js";
import { FamilyService } from "../services/family.service.js";

const caregiverInviteSchema = z.object({
  email: z.string().email(),
});

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get("/users/me", { preHandler: [app.authenticate] }, async (request) => {
    const user = await app.prisma.user.findUniqueOrThrow({ where: { id: request.user.sub } });
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      familyId: request.user.familyId,
      role: request.user.role,
    };
  });
}

export async function registerFamilyRoutes(app: FastifyInstance): Promise<void> {
  const qvacClient = new QvacClient({
    baseUrl: app.config.env.QVAC_NODE_URL,
    secret: app.config.env.QVAC_NODE_SECRET,
  });
  const families = new FamilyService(app.prisma, qvacClient);

  app.post("/families", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = createFamilySchema.parse(request.body);
    try {
      const family = await families.createFamily(request.user.sub, body.name);
      const user = await app.prisma.user.findUniqueOrThrow({ where: { id: request.user.sub } });
      const auth = new AuthService(app.prisma);
      const payload = await auth.buildJwtPayload(user);
      const accessToken = app.jwt.sign(payload);
      return { ...family, accessToken };
    } catch (error) {
      if (error instanceof Error && error.message === "ALREADY_IN_FAMILY") {
        return reply.status(409).send({ error: { code: "ALREADY_IN_FAMILY", message: "User already belongs to a family" } });
      }
      throw error;
    }
  });

  app.get("/families/current", { preHandler: [app.authenticate, app.requireFamily] }, async (request) => {
    const member = await families.getCurrentFamily(request.user.sub);
    return member?.family ?? null;
  });

  app.post(
    "/families/current/elders",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const body = createElderSchema.parse(request.body);
      return families.createElder(request.user.familyId!, body);
    },
  );

  app.get(
    "/families/current/elders",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return families.listElders(request.user.familyId!);
    },
  );

  app.get(
    "/families/current/onboarding",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      return families.getOnboardingStatus(request.user.familyId!, request.user.sub);
    },
  );

  app.post(
    "/families/current/onboarding/caregiver-invite",
    { preHandler: [app.authenticate, app.requireFamily] },
    async (request) => {
      const body = caregiverInviteSchema.parse(request.body);
      return families.recordCaregiverInvite(request.user.familyId!, request.user.sub, body.email);
    },
  );
}
