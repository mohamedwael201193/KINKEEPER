import type { AppStatus, GuardianIncidentResult, IncidentSummary, ProcessingState, ProofSnapshot, Scenario } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
  return data;
}

export const api = {
  status: () => request<AppStatus>("/api/status"),
  proof: () => request<ProofSnapshot>("/api/proof"),
  chain: () => request<{ valid: boolean; count: number; errors: string[] }>("/api/chain"),
  history: (params?: { q?: string; verdict?: string }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.verdict) sp.set("verdict", params.verdict);
    const q = sp.toString();
    return request<{ items: IncidentSummary[]; count: number }>(`/api/history${q ? `?${q}` : ""}`);
  },
  incident: (id: string) =>
    request<{ incidentId: string; packet: Record<string, unknown> }>(`/api/incident/${id}`),
  evidence: (id: string) =>
    request<{ incidentId: string; packet: Record<string, unknown>; chain: unknown; providerPublicKey: string | null }>(
      `/api/evidence/${id}`,
    ),
  telegram: () =>
    request<{
      configured: boolean;
      alertsSent?: number;
      openIncidents?: number;
      resolvedIncidents?: number;
      alerts: { incidentId: string; verdict: string; createdAt: string; acknowledged: boolean }[];
      acks: { at: string; incidentId: string; via: string }[];
      pending: number;
      acknowledged: number;
    }>("/api/telegram/status"),
  scenarios: () => request<{ scenarios: Scenario[] }>("/api/scenarios"),
  runScenario: (id: string) =>
    request<{ ok: boolean; result: GuardianIncidentResult }>(`/api/scenario/${id}`, { method: "POST" }),
  uploadAudio: async (file: File) => {
    const data = await fileToBase64(file);
    return request<{ ok: boolean; result: GuardianIncidentResult }>("/api/upload/audio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: file.name, data }),
    });
  },
  uploadImage: async (file: File) => {
    const data = await fileToBase64(file);
    return request<{ ok: boolean; result: GuardianIncidentResult }>("/api/upload/image", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: file.name, data }),
    });
  },
  judgeDemo: () =>
    request<{ ok: boolean; steps: { id: string; label: string; expected: string; result: GuardianIncidentResult }[] }>(
      "/api/demo/judge-flow",
      { method: "POST" },
    ),
  last: () => request<{ result: GuardianIncidentResult | null }>("/api/last"),
  processing: () => request<ProcessingState>("/api/processing"),
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1]! : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function verdictColor(v: string): string {
  if (v === "BLOCK") return "text-block";
  if (v === "WARN") return "text-warn";
  return "text-allow";
}

export function verdictBg(v: string): string {
  if (v === "BLOCK") return "bg-block-soft border-block/30";
  if (v === "WARN") return "bg-warn-soft border-warn/30";
  return "bg-allow-soft border-allow/30";
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function totalLatency(stages: { latencyMs: number }[]): number {
  return stages.reduce((s, x) => s + x.latencyMs, 0);
}
