/** Registered GET prefixes — more specific paths MUST appear before broader ones. */
export const ORDERED_GET_API_PREFIXES = [
  "/api/incident/",
  "/api/evidence/export/",
  "/api/evidence/",
  "/api/tts/",
] as const;

const INCIDENT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Which ordered prefix matches first (used to guard against route shadowing). */
export function matchOrderedGetApiPrefix(pathname: string): string | null {
  for (const prefix of ORDERED_GET_API_PREFIXES) {
    if (pathname.startsWith(prefix)) return prefix;
  }
  return null;
}

export function parseIncidentIdFromPath(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null;
  const raw = decodeURIComponent(pathname.slice(prefix.length)).split("/")[0]?.trim() ?? "";
  if (!raw || !INCIDENT_UUID.test(raw)) return null;
  return raw;
}

export function isValidEvidencePacket(packet: unknown): packet is Record<string, unknown> {
  if (!packet || typeof packet !== "object") return false;
  const p = packet as Record<string, unknown>;
  return Boolean(p.incidentId && p.risk && p.chainVerification);
}
