import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@kinkeeper/db";
import type { AgentDecisionAudit, EvidencePacketContent } from "@kinkeeper/shared";
import type { ArchivistService } from "./archivist.service.js";

export class EvidencePacketService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly archivist: ArchivistService,
    private readonly evidenceDir: string,
    private readonly appUrl: string,
    private readonly apiUrl: string,
  ) {}

  async generateForAlert(params: {
    alertId: string;
    decision: AgentDecisionAudit;
  }): Promise<{ packetId: string; filePath: string; content: EvidencePacketContent }> {
    const alert = await this.prisma.alert.findUnique({
      where: { id: params.alertId },
      include: { bundle: true },
    });

    if (!alert || !alert.bundle) {
      throw new Error("ALERT_OR_BUNDLE_NOT_FOUND");
    }

    const existing = await this.prisma.evidencePacket.findUnique({
      where: { alertId: alert.id },
    });
    if (existing) {
      const { readFileSync } = await import("node:fs");
      const content = JSON.parse(readFileSync(existing.filePath, "utf8")) as EvidencePacketContent;
      return { packetId: existing.id, filePath: existing.filePath, content };
    }

    const chain = await this.archivist.verifyChain(alert.familyId);
    const metadata = alert.metadata as Record<string, unknown> | null;
    const transcript =
      typeof metadata?.transcript === "string"
        ? metadata.transcript
        : typeof (alert.bundle.inputs as { transcript?: string }).transcript === "string"
          ? (alert.bundle.inputs as { transcript: string }).transcript
          : null;

    const content: EvidencePacketContent = {
      packetId: randomUUID(),
      alertId: alert.id,
      familyId: alert.familyId,
      elderId: alert.elderId,
      agent: alert.agent,
      severity: alert.severity,
      title: alert.title,
      summary: alert.summary,
      transcript,
      decision: params.decision,
      chainVerification: {
        bundleHash: alert.bundle.hash,
        previousHash: alert.bundle.previousHash,
        chainValid: chain.valid,
      },
      timestamps: {
        alertCreatedAt: alert.createdAt.toISOString(),
        bundleCreatedAt: alert.bundle.createdAt.toISOString(),
        packetGeneratedAt: new Date().toISOString(),
      },
      deepLink: `${this.appUrl}/incidents/${alert.id}`,
      apiLink: `${this.apiUrl}/families/current/alerts/${alert.id}/evidence-packet`,
    };

    const packetsDir = join(this.evidenceDir, "packets");
    mkdirSync(packetsDir, { recursive: true });
    const filePath = join(packetsDir, `${alert.id}.json`);
    const serialized = JSON.stringify(content, null, 2);
    writeFileSync(filePath, serialized, "utf8");
    const contentHash = createHash("sha256").update(serialized).digest("hex");

    const row = await this.prisma.evidencePacket.create({
      data: {
        id: content.packetId,
        familyId: alert.familyId,
        alertId: alert.id,
        bundleId: alert.bundle.id,
        format: "json",
        filePath,
        contentHash,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        familyId: alert.familyId,
        action: "evidence_packet.generated",
        entityType: "evidence_packet",
        entityId: row.id,
        metadata: { alertId: alert.id, contentHash, chainValid: chain.valid },
      },
    });

    return { packetId: row.id, filePath, content };
  }

  async getByAlertId(familyId: string, alertId: string): Promise<EvidencePacketContent | null> {
    const row = await this.prisma.evidencePacket.findFirst({
      where: { alertId, familyId },
    });
    if (!row) {
      return null;
    }
    const fs = await import("node:fs/promises");
    const raw = await fs.readFile(row.filePath, "utf8");
    return JSON.parse(raw) as EvidencePacketContent;
  }
}
