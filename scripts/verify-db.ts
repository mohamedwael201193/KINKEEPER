import "dotenv/config";
import { prisma } from "@kinkeeper/db";

async function main(): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log("TABLES:", JSON.stringify(tables.map((t) => t.table_name)));
  console.log(
    "COUNTS:",
    JSON.stringify({
      users: await prisma.user.count(),
      refreshTokens: await prisma.refreshToken.count(),
      families: await prisma.family.count(),
      familyMembers: await prisma.familyMember.count(),
      elders: await prisma.elder.count(),
      devices: await prisma.device.count(),
      agents: await prisma.agent.count(),
      alerts: await prisma.alert.count(),
      decisionBundles: await prisma.decisionBundle.count(),
      inferenceLogs: await prisma.inferenceLog.count(),
      sentinelCallRecordings: await prisma.sentinelCallRecording.count(),
      cognoscenteCheckIns: await prisma.cognoscenteCheckIn.count(),
    }),
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
