import { join } from "node:path";

export interface GuardianMeshConfig {
  dataDir: string;
  evidenceDir: string;
  ragWorkspace: string;
  elderName: string;
  familyLabel: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  appUrl: string;
  firewallAllowlist?: string[];
}

export function loadGuardianMeshConfig(overrides?: Partial<GuardianMeshConfig>): GuardianMeshConfig {
  const dataDir = overrides?.dataDir ?? process.env.GUARDIAN_MESH_DATA_DIR ?? join(process.cwd(), "guardian-mesh-data");
  const allowlistRaw = process.env.GUARDIAN_FIREWALL_ALLOWLIST ?? "";
  const firewallAllowlist =
    overrides?.firewallAllowlist ??
    (allowlistRaw
      ? allowlistRaw
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : undefined);

  return {
    dataDir,
    evidenceDir: overrides?.evidenceDir ?? join(dataDir, "evidence"),
    ragWorkspace: overrides?.ragWorkspace ?? "guardian-mesh-family",
    elderName: overrides?.elderName ?? process.env.GUARDIAN_ELDER_NAME ?? "Margaret",
    familyLabel: overrides?.familyLabel ?? process.env.GUARDIAN_FAMILY_LABEL ?? "dom family",
    telegramBotToken: overrides?.telegramBotToken ?? process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId:
      overrides?.telegramChatId ??
      process.env.TELEGRAM_DEMO_CHAT_ID ??
      process.env.TELEGRAM_CAREGIVER_CHAT_ID ??
      process.env.GUARDIAN_TELEGRAM_CHAT_ID ??
      process.env.TELEGRAM_CHAT_ID,
    appUrl: overrides?.appUrl ?? process.env.APP_URL ?? "https://kinkeeper-web.vercel.app",
    firewallAllowlist,
  };
}
