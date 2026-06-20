import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import fjwt from "@fastify/jwt";
import type { JwtPayload } from "@kinkeeper/shared";
import type { ApiEnv } from "../config/env.js";

export default fp<{ env: ApiEnv }>(async (app, opts) => {
  await app.register(fjwt, {
    secret: {
      private: opts.env.jwtPrivateKey,
      public: opts.env.jwtPublicKey,
    },
    sign: { algorithm: "RS256", expiresIn: opts.env.JWT_ACCESS_EXPIRES_IN },
  });

  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify<JwtPayload>();
      } catch {
        reply.status(401).send({
          error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
        });
      }
    },
  );

  app.decorate(
    "requireFamily",
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const payload = request.user as JwtPayload;
      if (!payload.familyId) {
        reply.status(403).send({
          error: { code: "NO_FAMILY", message: "Create or join a family first" },
        });
      }
    },
  );
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireFamily: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
