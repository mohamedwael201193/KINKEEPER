import "dotenv/config";
import { prisma } from "@kinkeeper/db";
import { ArchivistService } from "../apps/api/src/services/archivist.service.js";

const familyId = "cmqmim2zu0003uw20g7g2ufjv";
const archivist = new ArchivistService(prisma);

const bundle = await archivist.commitBundle(familyId, {
  agent: "sentinel",
  trigger: "hash-self-test",
  inputs: { transcript: `self-test ${Date.now()}` },
  reasoning: {
    modelSrc: "test",
    modelVersion: "test",
    thinkingText: "hash commit round-trip test",
    classification: "TEST",
    confidence: 0.5,
    latencyMs: 123,
    ttftSec: 45.678901234,
    tps: 151.4451160838834,
    evidenceReferences: [{ type: "transcript", ref: "inputs.transcript", excerpt: "test" }],
  },
  toolCalls: [],
  action: "test",
  device: "test",
});

const verify = await archivist.verifyChain(familyId);
const ok = verify.valid;
console.log("committed", bundle.bundleId, bundle.hash.slice(0, 16));
console.log("verify", verify);

// cleanup test bundle
await prisma.decisionBundle.delete({ where: { id: bundle.bundleId } });
// repair chain after delete
const repaired = await archivist.repairChain(familyId);
console.log("after cleanup repair", repaired);

await prisma.$disconnect();
process.exit(ok ? 0 : 1);
