import type { ApiEnv } from "../config/env.js";
import { ArchivistService } from "./archivist.service.js";
import { CaregiverWorkflowService } from "./caregiver-workflow.service.js";
import { CognoscenteService } from "./cognoscente.service.js";
import { EvidencePacketService } from "./evidence-packet.service.js";
import { SentinelService } from "./sentinel.service.js";
import { TelegramService } from "./telegram.service.js";
import type { PrismaClient } from "@kinkeeper/db";
import { QvacClient } from "@kinkeeper/qvac";

export interface AgentServices {
  archivist: ArchivistService;
  evidencePackets: EvidencePacketService;
  telegram: TelegramService;
  caregiverWorkflow: CaregiverWorkflowService;
  sentinel: SentinelService;
  cognoscente: CognoscenteService;
}

export function createAgentServices(prisma: PrismaClient, env: ApiEnv): AgentServices {
  const archivist = new ArchivistService(prisma);
  const evidencePackets = new EvidencePacketService(
    prisma,
    archivist,
    env.EVIDENCE_DIR,
    env.APP_URL,
    env.API_URL,
  );
  const telegram = new TelegramService(
    prisma,
    env.TELEGRAM_BOT_TOKEN,
    env.TELEGRAM_ENABLED,
    env.APP_URL,
    env.TELEGRAM_LINK_TOKEN_TTL_SEC,
  );
  const caregiverWorkflow = new CaregiverWorkflowService(prisma, evidencePackets, telegram);
  const qvacClient = new QvacClient({ baseUrl: env.QVAC_NODE_URL, secret: env.QVAC_NODE_SECRET });
  const sentinel = new SentinelService(prisma, qvacClient, archivist, caregiverWorkflow);
  const cognoscente = new CognoscenteService(prisma, qvacClient, archivist, caregiverWorkflow);

  return {
    archivist,
    evidencePackets,
    telegram,
    caregiverWorkflow,
    sentinel,
    cognoscente,
  };
}
