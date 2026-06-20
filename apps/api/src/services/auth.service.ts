import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import type { PrismaClient, User } from "@kinkeeper/db";
import type { JwtPayload } from "@kinkeeper/shared";

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  createRefreshToken(): { token: string; hash: string; expiresAt: Date } {
    const token = randomBytes(48).toString("base64url");
    const hash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return { token, hash, expiresAt };
  }

  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email: params.email } });
    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await this.hashPassword(params.password);
    return this.prisma.user.create({
      data: {
        email: params.email.toLowerCase(),
        passwordHash,
        firstName: params.firstName,
        lastName: params.lastName,
        emailVerifiedAt: new Date(),
      },
    });
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.deletedAt) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (!user.passwordHash) {
      throw new Error("USE_PRIVY");
    }

    const valid = await this.verifyPassword(user.passwordHash, password);
    if (!valid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    return user;
  }

  async getMembership(userId: string): Promise<{ familyId: string; role: string } | null> {
    const member = await this.prisma.familyMember.findFirst({ where: { userId } });
    if (!member) {
      return null;
    }
    return { familyId: member.familyId, role: member.role };
  }

  async buildJwtPayload(user: User): Promise<JwtPayload> {
    const membership = await this.getMembership(user.id);
    return {
      sub: user.id,
      familyId: membership?.familyId ?? null,
      role: membership?.role ?? "none",
    };
  }

  async storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashRefreshToken(token),
        expiresAt,
      },
    });
  }

  async rotateRefreshToken(oldToken: string): Promise<{ user: User; refreshToken: string }> {
    const hash = this.hashRefreshToken(oldToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new Error("INVALID_REFRESH");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
    const next = this.createRefreshToken();
    await this.storeRefreshToken(user.id, next.token, next.expiresAt);
    return { user, refreshToken: next.token };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const hash = this.hashRefreshToken(token);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async syncPrivyUser(params: {
    privyDid: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const email = params.email.toLowerCase();

    const byDid = await this.prisma.user.findUnique({ where: { privyDid: params.privyDid } });
    if (byDid) {
      return this.prisma.user.update({
        where: { id: byDid.id },
        data: {
          email,
          firstName: params.firstName,
          lastName: params.lastName,
          emailVerifiedAt: new Date(),
        },
      });
    }

    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      if (byEmail.privyDid && byEmail.privyDid !== params.privyDid) {
        throw new Error("EMAIL_LINKED_OTHER_PRIVY");
      }
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          privyDid: params.privyDid,
          firstName: params.firstName || byEmail.firstName,
          lastName: params.lastName || byEmail.lastName,
          emailVerifiedAt: new Date(),
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email,
        privyDid: params.privyDid,
        firstName: params.firstName,
        lastName: params.lastName,
        emailVerifiedAt: new Date(),
      },
    });
  }
}
