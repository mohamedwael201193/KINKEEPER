import type { PrismaClient, Alert } from "@kinkeeper/db";
import type { AgentDecisionAudit, DecisionBundle } from "@kinkeeper/shared";
import type { EvidencePacketService } from "./evidence-packet.service.js";
import type { TelegramService } from "./telegram.service.js";

export interface CaregiverWorkflowResult {
  alertId: string;
  packetId: string;
  notificationsSent: number;
  notifiedChatIds: string[];
}

/** Autonomous post-incident pipeline: archive → packet → notify caregivers. */
export class CaregiverWorkflowService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly evidencePackets: EvidencePacketService,
    private readonly telegram: TelegramService | null,
  ) {}

  async runHighRiskPipeline(params: {
    alert: Alert;
    bundle: DecisionBundle;
    decision: AgentDecisionAudit;
  }): Promise<CaregiverWorkflowResult> {
    const { packetId } = await this.evidencePackets.generateForAlert({
      alertId: params.alert.id,
      decision: params.decision,
    });

    await this.prisma.agentLog.create({
      data: {
        familyId: params.alert.familyId,
        agent: params.alert.agent,
        level: "info",
        message: "Autonomous caregiver workflow completed",
        metadata: {
          steps: ["detect", "explain", "archive", "notify", "packet"],
          alertId: params.alert.id,
          bundleId: params.bundle.bundleId,
          chainHash: params.bundle.hash,
          packetId,
        },
      },
    });

    let notificationsSent = 0;
    const notifiedChatIds: string[] = [];

    if (this.telegram?.isEnabled()) {
      const result = await this.telegram.notifyFamilyCaregivers({
        familyId: params.alert.familyId,
        alert: params.alert,
        decision: params.decision,
        packetId,
      });
      notificationsSent = result.sent;
      notifiedChatIds.push(...result.chatIds);
    }

    return {
      alertId: params.alert.id,
      packetId,
      notificationsSent,
      notifiedChatIds,
    };
  }
}
