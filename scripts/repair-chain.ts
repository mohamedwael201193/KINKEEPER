import "dotenv/config";
import { prisma } from "@kinkeeper/db";
import { ArchivistService } from "../apps/api/src/services/archivist.service.js";

const familyId = process.argv[2] ?? "cmqmim2zu0003uw20g7g2ufjv";
const archivist = new ArchivistService(prisma);

console.log("Before:", await archivist.verifyChain(familyId));
const result = await archivist.repairChain(familyId);
console.log("Repair:", result);
console.log("After:", await archivist.verifyChain(familyId));

await prisma.$disconnect();
