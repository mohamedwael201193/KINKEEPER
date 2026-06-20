import "dotenv/config";
import { prisma } from "@kinkeeper/db";
import { ArchivistService } from "../apps/api/src/services/archivist.service.js";

const familyId = "cmqmim2zu0003uw20g7g2ufjv";
const archivist = new ArchivistService(prisma);

const bundles = await prisma.decisionBundle.findMany({
  where: { familyId },
  orderBy: { createdAt: "asc" },
});

for (const row of bundles) {
  const recomputed = archivist.buildBundleHash(archivist["buildHashInputFromRow"](row));
  console.log(row.agent, row.id.slice(0, 8), recomputed === row.hash ? "OK" : "BROKEN");
  if (recomputed !== row.hash) {
    console.log("  stored", row.hash);
    console.log("  recomputed", recomputed);
  }
}

console.log("\nverify", await archivist.verifyChain(familyId));
await prisma.$disconnect();
