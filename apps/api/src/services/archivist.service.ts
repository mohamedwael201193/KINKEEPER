import { createHash, randomUUID } from "node:crypto";
import type { Prisma, PrismaClient, AgentType } from "@kinkeeper/db";
import type { CoreAgentName, DecisionBundle, DecisionBundleToolCall } from "@kinkeeper/shared";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return Object.fromEntries(entries.map(([key, val]) => [key, canonicalize(val)]));
  }
  return value;
}

/** Match Postgres JSON round-trip so commit-time and verify-time payloads stay identical. */
function freezeJsonPayload<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class ArchivistService {
  constructor(private readonly prisma: PrismaClient) {}

  async getLatestHash(familyId: string): Promise<string> {
    const latest = await this.prisma.decisionBundle.findFirst({
      where: { familyId },
      orderBy: { createdAt: "desc" },
      select: { hash: true },
    });
    return latest?.hash ?? "0";
  }

  buildBundleHash(bundle: Omit<DecisionBundle, "hash" | "previousHash">): string {
    const payload = canonicalize(freezeJsonPayload(bundle));
    return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  }

  private buildHashInputFromRow(row: {
    id: string;
    createdAt: Date;
    agent: string;
    trigger: string;
    inputs: unknown;
    reasoning: unknown;
    delegation: unknown;
    toolCalls: unknown;
    action: string;
    device: string;
  }): Omit<DecisionBundle, "hash" | "previousHash"> {
    const hashInput: Omit<DecisionBundle, "hash" | "previousHash"> = {
      bundleId: row.id,
      timestamp: row.createdAt.toISOString(),
      agent: row.agent as CoreAgentName,
      trigger: row.trigger,
      inputs: row.inputs as DecisionBundle["inputs"],
      reasoning: row.reasoning as unknown as DecisionBundle["reasoning"],
      toolCalls: row.toolCalls as unknown as DecisionBundleToolCall[],
      action: row.action,
      device: row.device,
    };
    if (row.delegation) {
      hashInput.delegation = row.delegation as unknown as DecisionBundle["delegation"];
    }
    return hashInput;
  }

  async commitBundle(
    familyId: string,
    partial: Omit<DecisionBundle, "bundleId" | "timestamp" | "hash" | "previousHash">,
  ): Promise<DecisionBundle> {
    const previousHash = await this.getLatestHash(familyId);
    const createdAt = new Date();
    const bundleWithoutHash = freezeJsonPayload<Omit<DecisionBundle, "hash" | "previousHash">>({
      bundleId: randomUUID(),
      timestamp: createdAt.toISOString(),
      ...partial,
    });

    const bundle: DecisionBundle = {
      ...bundleWithoutHash,
      hash: "",
      previousHash,
    };

    const placeholderHash = createHash("sha256").update(bundle.bundleId).digest("hex");

    await this.prisma.decisionBundle.create({
      data: {
        id: bundle.bundleId,
        familyId,
        agent: bundle.agent as AgentType,
        trigger: bundle.trigger,
        inputs: bundle.inputs as Prisma.InputJsonValue,
        reasoning: bundle.reasoning as unknown as Prisma.InputJsonValue,
        delegation: (bundle.delegation ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
        toolCalls: bundle.toolCalls as unknown as Prisma.InputJsonValue,
        action: bundle.action,
        device: bundle.device,
        hash: placeholderHash,
        previousHash: bundle.previousHash,
        createdAt,
      },
    });

    const persisted = await this.prisma.decisionBundle.findUniqueOrThrow({
      where: { id: bundle.bundleId },
    });
    const hash = this.buildBundleHash(this.buildHashInputFromRow(persisted));

    await this.prisma.decisionBundle.update({
      where: { id: bundle.bundleId },
      data: { hash },
    });

    bundle.hash = hash;

    if (bundle.reasoning.thinkingText) {
      await this.prisma.memoryReasoningTrace.create({
        data: {
          familyId,
          agent: bundle.agent as AgentType,
          bundleId: bundle.bundleId,
          thinkingText: bundle.reasoning.thinkingText,
          rawDeltas: bundle.reasoning.rawDeltas ?? undefined,
        },
      });
    }

    return bundle;
  }

  async verifyChain(familyId: string): Promise<{ valid: boolean; length: number; brokenAt?: string }> {
    const bundles = await this.prisma.decisionBundle.findMany({
      where: { familyId },
      orderBy: { createdAt: "asc" },
    });

    if (bundles.length === 0) {
      return { valid: true, length: 0 };
    }

    if (bundles[0]?.previousHash !== "0") {
      return { valid: false, length: bundles.length, brokenAt: bundles[0]?.id };
    }

    for (let index = 0; index < bundles.length; index++) {
      const row = bundles[index];
      if (!row) {
        continue;
      }

      const recomputed = this.buildBundleHash(this.buildHashInputFromRow(row));

      if (recomputed !== row.hash) {
        return { valid: false, length: bundles.length, brokenAt: row.id };
      }

      if (index > 0) {
        const previous = bundles[index - 1];
        if (previous && row.previousHash !== previous.hash) {
          return { valid: false, length: bundles.length, brokenAt: row.id };
        }
      }
    }

    return { valid: true, length: bundles.length };
  }

  /** Recompute stored hashes from persisted JSON (fixes legacy drift). */
  async repairChain(familyId: string): Promise<{ repaired: number; valid: boolean; length: number }> {
    const bundles = await this.prisma.decisionBundle.findMany({
      where: { familyId },
      orderBy: { createdAt: "asc" },
    });

    let previousHash = "0";
    let repaired = 0;

    for (const row of bundles) {
      const hash = this.buildBundleHash(this.buildHashInputFromRow(row));
      if (hash !== row.hash || row.previousHash !== previousHash) {
        await this.prisma.decisionBundle.update({
          where: { id: row.id },
          data: { hash, previousHash },
        });
        repaired++;
      }
      previousHash = hash;
    }

    const verification = await this.verifyChain(familyId);
    return { repaired, ...verification };
  }
}
