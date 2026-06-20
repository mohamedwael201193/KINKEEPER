import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { loginSchema, registerSchema } from "@kinkeeper/shared";
import { AuthService } from "../services/auth.service.js";
import { PrivyService } from "../services/privy.service.js";

const privySyncSchema = z.object({
  accessToken: z.string().min(1),
});

function setRefreshCookie(app: FastifyInstance, reply: FastifyReply, token: string): void {
  reply.setCookie("refresh_token", token, {
    httpOnly: true,
    secure: app.config.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60,
  });
}

function authUserResponse(user: { id: string; email: string; firstName: string; lastName: string }) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  const auth = new AuthService(app.prisma);
  const privy = new PrivyService(app.config.env);

  app.post("/auth/privy/sync", { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } }, async (request, reply) => {
    const parsed = privySyncSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "INVALID_BODY", message: parsed.error.errors[0]?.message ?? "Invalid request" },
      });
    }
    const body = parsed.data;
    try {
      const verified = await privy.verifyAccessToken(body.accessToken);
      const profile = await privy.fetchUserProfile(verified.userId);
      const user = await auth.syncPrivyUser(profile);
      const payload = await auth.buildJwtPayload(user);
      const accessToken = app.jwt.sign(payload);
      const refresh = auth.createRefreshToken();
      await auth.storeRefreshToken(user.id, refresh.token, refresh.expiresAt);
      setRefreshCookie(app, reply, refresh.token);

      return {
        accessToken,
        user: {
          ...authUserResponse(user),
          familyId: payload.familyId,
          role: payload.role,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PRIVY_EMAIL_REQUIRED") {
          return reply.status(400).send({
            error: { code: "PRIVY_EMAIL_REQUIRED", message: "Privy account must include a verified email" },
          });
        }
        if (error.message === "EMAIL_LINKED_OTHER_PRIVY") {
          return reply.status(409).send({
            error: { code: "EMAIL_LINKED_OTHER_PRIVY", message: "Email is linked to a different Privy account" },
          });
        }
      }
      return reply.status(401).send({
        error: { code: "PRIVY_INVALID", message: "Invalid or expired Privy session" },
      });
    }
  });

  app.post("/auth/register", { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } }, async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "INVALID_BODY", message: parsed.error.errors[0]?.message ?? "Invalid registration payload" },
      });
    }
    return reply.status(410).send({
      error: {
        code: "AUTH_DEPRECATED",
        message: "Password registration is disabled. Sign in with Privy (email OTP or magic link).",
      },
    });
  });

  app.post("/auth/login", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const body = loginSchema.parse(request.body);
    try {
      const user = await auth.login(body.email, body.password);
      const payload = await auth.buildJwtPayload(user);
      const accessToken = app.jwt.sign(payload);
      const refresh = auth.createRefreshToken();
      await auth.storeRefreshToken(user.id, refresh.token, refresh.expiresAt);
      setRefreshCookie(app, reply, refresh.token);

      return {
        accessToken,
        user: {
          ...authUserResponse(user),
          familyId: payload.familyId,
          role: payload.role,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === "USE_PRIVY") {
        return reply.status(410).send({
          error: {
            code: "USE_PRIVY",
            message: "This account uses Privy sign-in. Continue with email OTP or magic link.",
          },
        });
      }
      return reply.status(401).send({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken =
      (request.cookies as Record<string, string | undefined>).refresh_token ??
      (request.body as { refreshToken?: string } | undefined)?.refreshToken;

    if (!refreshToken) {
      return reply.status(401).send({ error: { code: "NO_REFRESH", message: "Refresh token required" } });
    }

    try {
      const { user, refreshToken: nextRefresh } = await auth.rotateRefreshToken(refreshToken);
      const payload = await auth.buildJwtPayload(user);
      const accessToken = app.jwt.sign(payload);
      setRefreshCookie(app, reply, nextRefresh);
      return { accessToken };
    } catch {
      return reply.status(401).send({ error: { code: "INVALID_REFRESH", message: "Invalid refresh token" } });
    }
  });

  app.post("/auth/logout", async (request, reply) => {
    const refreshToken = (request.cookies as Record<string, string | undefined>).refresh_token;
    if (refreshToken) {
      await auth.revokeRefreshToken(refreshToken);
    }
    reply.clearCookie("refresh_token", { path: "/auth/refresh" });
    return { success: true };
  });
}
