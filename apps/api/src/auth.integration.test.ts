import "dotenv/config";
import { describe, expect, it, afterAll } from "vitest";
import { prisma } from "@kinkeeper/db";
import { AuthService } from "./services/auth.service.js";

describe("Auth integration", () => {
  const auth = new AuthService(prisma);
  const email = `test-${Date.now()}@kinkeeper.test`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("registers, logs in, and builds JWT payload", async () => {
    const user = await auth.register({
      email,
      password: "SecurePass123!@#",
      firstName: "Test",
      lastName: "Caregiver",
    });

    expect(user.email).toBe(email);

    const loggedIn = await auth.login(email, "SecurePass123!@#");
    expect(loggedIn.id).toBe(user.id);

    const payload = await auth.buildJwtPayload(loggedIn);
    expect(payload.sub).toBe(user.id);
    expect(payload.familyId).toBeNull();
  });
});
