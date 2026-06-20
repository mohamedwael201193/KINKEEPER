import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import type { PrismaClient } from "@kinkeeper/db";
import type { QvacClient } from "@kinkeeper/qvac";

export class LocalStorageService {
  constructor(private readonly uploadDir: string) {
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  saveBuffer(params: {
    familyId: string;
    category: string;
    buffer: Buffer;
    extension: string;
  }): { path: string; hash: string } {
    const hash = createHash("sha256").update(params.buffer).digest("hex");
    const dir = join(this.uploadDir, params.familyId, params.category);
    mkdirSync(dir, { recursive: true });
    const filename = `${hash}${params.extension}`;
    const fullPath = join(dir, filename);
    writeFileSync(fullPath, params.buffer);
    return { path: fullPath, hash };
  }

  extensionFromMime(mime: string): string {
    switch (mime) {
      case "audio/wav":
      case "audio/x-wav":
        return ".wav";
      case "audio/mpeg":
        return ".mp3";
      case "audio/webm":
        return ".webm";
      case "audio/ogg":
        return ".ogg";
      default:
        return extname(mime) || ".bin";
    }
  }
}

export class FamilyService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly qvacClient: QvacClient,
  ) {}

  async createFamily(userId: string, name: string) {
    const existing = await this.prisma.familyMember.findFirst({ where: { userId } });
    if (existing) {
      throw new Error("ALREADY_IN_FAMILY");
    }

    let providerPublicKey: string | null = null;
    try {
      providerPublicKey = await this.qvacClient.getProviderPublicKey();
    } catch {
      providerPublicKey = null;
    }

    const family = await this.prisma.$transaction(async (tx) => {
      const created = await tx.family.create({
        data: {
          name,
          meshPublicKey: providerPublicKey,
        },
      });

      await tx.familyMember.create({
        data: {
          familyId: created.id,
          userId,
          role: "admin",
        },
      });

      for (const agentName of ["sentinel", "cognoscente", "archivist"] as const) {
        await tx.agent.create({
          data: {
            familyId: created.id,
            name: agentName,
            status: "active",
          },
        });
      }

      if (providerPublicKey) {
        await tx.device.create({
          data: {
            familyId: created.id,
            name: "Cognition Node",
            role: "cognition_node",
            meshPublicKey: providerPublicKey,
            status: "online",
            lastSeenAt: new Date(),
          },
        });
      }

      return created;
    });

    return family;
  }

  async getCurrentFamily(userId: string) {
    const member = await this.prisma.familyMember.findFirst({
      where: { userId },
      include: { family: true },
    });
    return member;
  }

  async createElder(
    familyId: string,
    data: { firstName: string; lastName: string; birthYear: number; timezone: string },
  ) {
    return this.prisma.elder.create({
      data: {
        familyId,
        firstName: data.firstName,
        lastName: data.lastName,
        birthYear: data.birthYear,
        timezone: data.timezone,
      },
    });
  }

  async listElders(familyId: string) {
    return this.prisma.elder.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } });
  }

  async getOnboardingStatus(familyId: string, userId: string) {
    const [elders, members, telegramChat, baselineCheckIns, caregiverInvite] = await Promise.all([
      this.prisma.elder.count({ where: { familyId } }),
      this.prisma.familyMember.count({ where: { familyId } }),
      this.prisma.telegramChat.findUnique({ where: { userId } }),
      this.prisma.cognoscenteCheckIn.count({
        where: { elder: { familyId } },
      }),
      this.prisma.auditLog.findFirst({
        where: { familyId, action: "onboarding_caregiver_invited" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const steps = {
      elder: elders > 0,
      caregiver: members > 1 || Boolean(caregiverInvite),
      telegram: Boolean(telegramChat),
      baselineScan: baselineCheckIns > 0,
      protectionActivated: false,
    };
    steps.protectionActivated =
      steps.elder && steps.caregiver && steps.telegram && steps.baselineScan;

    const order = ["elder", "caregiver", "telegram", "baselineScan", "protectionActivated"] as const;
    const currentStep =
      order.find((step) => !steps[step]) ?? "protectionActivated";

    return {
      steps,
      currentStep,
      progress: Math.round(
        (Object.values(steps).filter(Boolean).length / order.length) * 100,
      ),
      caregiverInviteEmail:
        (caregiverInvite?.metadata as { email?: string } | null)?.email ?? null,
    };
  }

  async recordCaregiverInvite(familyId: string, userId: string, email: string) {
    await this.prisma.auditLog.create({
      data: {
        familyId,
        userId,
        action: "onboarding_caregiver_invited",
        entityType: "caregiver_invite",
        metadata: { email: email.toLowerCase() },
      },
    });
    return { email: email.toLowerCase() };
  }
}
