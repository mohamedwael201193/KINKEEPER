import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface IncidentListItem {
  incidentId: string;
  verdict: string;
  createdAt: string;
  bundleHash: string;
}

export function listRecentIncidents(evidenceDir: string, limit = 8): IncidentListItem[] {
  const packetsDir = join(evidenceDir, "packets");
  if (!existsSync(packetsDir)) return [];

  const items: IncidentListItem[] = [];
  for (const file of readdirSync(packetsDir).filter((f) => f.endsWith(".json"))) {
    try {
      const packet = JSON.parse(readFileSync(join(packetsDir, file), "utf8")) as Record<string, unknown>;
      const incidentId = String(packet.incidentId ?? file.replace(/\.json$/, ""));
      const risk = packet.risk as Record<string, unknown> | undefined;
      const chain = packet.chainVerification as Record<string, unknown> | undefined;
      items.push({
        incidentId,
        verdict: String(risk?.verdict ?? "UNKNOWN"),
        createdAt: String(
          (packet.timestamps as Record<string, string> | undefined)?.packetGeneratedAt ??
            new Date().toISOString(),
        ),
        bundleHash: String(chain?.bundleHash ?? "").slice(0, 12),
      });
    } catch {
      /* skip corrupt packets */
    }
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items.slice(0, limit);
}
