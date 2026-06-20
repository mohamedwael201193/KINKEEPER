import type { LoginInput, RegisterInput } from "@kinkeeper/shared";
import type { EvidencePacketContent } from "@kinkeeper/shared";
import { API_BASE, ApiError } from "@/lib/config";

export { ApiError };

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  familyId?: string | null;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AlertRecord {
  id: string;
  familyId: string;
  elderId: string | null;
  agent: string;
  severity: string;
  type: string;
  title: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  bundleId: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  bundle?: DecisionBundleRecord | null;
}

export interface DecisionBundleRecord {
  id: string;
  familyId: string;
  agent: string;
  trigger: string;
  inputs: Record<string, unknown>;
  reasoning: {
    modelSrc?: string;
    modelVersion?: string;
    thinkingText?: string;
    classification?: string;
    confidence?: number;
    latencyMs?: number;
    ttftSec?: number;
    tps?: number;
    evidenceReferences?: Array<{ type: string; ref: string; excerpt?: string }>;
  };
  delegation?: Record<string, unknown> | null;
  toolCalls: unknown[];
  action: string;
  device: string;
  hash: string;
  previousHash: string;
  createdAt: string;
}

export interface DashboardData {
  activeAlerts: number;
  resolvedAlerts: number;
  riskScore: number;
  totalAlerts: number;
  chainVerification: { valid: boolean; length: number; brokenAt?: string };
  recentAlerts: AlertRecord[];
  recentAnalyses: Array<{
    bundleId: string;
    agent: string;
    trigger: string;
    hash: string;
    createdAt: string;
    classification: string | null;
    confidence: number | null;
    modelSrc: string | null;
    latencyMs: number | null;
  }>;
  recentEvidencePackets: EvidencePacketRecord[];
  recentInferenceLogs: InferenceLogRecord[];
}

export interface EvidencePacketRecord {
  id: string;
  familyId: string;
  alertId: string;
  bundleId: string;
  format: string;
  filePath: string;
  contentHash: string;
  createdAt: string;
}

export interface InferenceLogRecord {
  id: string;
  familyId: string | null;
  deviceId: string | null;
  timestamp: string;
  modelSrc: string;
  operation: string;
  promptTokens: number;
  completionTokens: number;
  ttftSec: number | null;
  tps: number | null;
  delegateProvider: string | null;
  delegateFallbackUsed: boolean;
  bundleId: string | null;
  createdAt: string;
}

export interface FamilyMemberRecord {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
  telegramLinked: boolean;
  telegramLinkedAt: string | null;
}

export interface ElderRecord {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  timezone: string;
  createdAt: string;
}

export interface TimelineStage {
  id: string;
  label: string;
  status: "completed" | "pending" | "skipped";
  timestamp: string | null;
  metadata?: Record<string, unknown>;
}

export interface AlertTimeline {
  alertId: string;
  stages: TimelineStage[];
}

export interface TimelineSummaryItem {
  alertId: string;
  title: string;
  severity: string;
  agent: string;
  resolved: boolean;
  createdAt: string;
  hasBundle: boolean;
  hasPacket: boolean;
  chainHash: string | null;
}

export interface TelegramStatus {
  linked: boolean;
  chatId: string | null;
  linkedAt: string | null;
  botEnabled: boolean;
  botUsername: string | null | undefined;
}

export interface TelegramLinkResponse {
  token: string;
  expiresInSeconds: number;
  botUsername?: string;
  deepLinkUrl?: string;
  instructions: string;
}

export interface AuditLogRecord {
  id: string;
  familyId: string | null;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface QvacRuntimeData {
  qvacNode: { status: string; providerPublicKey: string | null } | null;
  providerPublicKey: string | null;
  devices: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    meshPublicKey: string | null;
    lastSeenAt: string | null;
  }>;
  agents: Array<{ id: string; name: string; status: string }>;
  stats: {
    totalInferences: number;
    completionCount: number;
    transcribeCount: number;
    delegatedCount: number;
    fallbackCount: number;
    avgTtftSec: number | null;
    avgTps: number | null;
    modelUsage: Record<string, number>;
  };
  recentLogs: InferenceLogRecord[];
}

export interface SystemHealthData {
  timestamp: string;
  checks: Record<string, string>;
  family: {
    openAlerts: number;
    chainVerification: { valid: boolean; length: number };
    lastEvidenceAt: string | null;
    agents: Array<{ name: string; status: string }>;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  checks: Record<string, string>;
  version: string;
}

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;

let getAccessToken: TokenGetter = () => null;
let setAccessToken: TokenSetter = () => undefined;

export function configureAuth(get: TokenGetter, set: TokenSetter) {
  getAccessToken = get;
  setAccessToken = set;
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { error?: { code?: string; message?: string } };
    return new ApiError(
      body.error?.message ?? response.statusText,
      response.status,
      body.error?.code,
    );
  } catch {
    return new ApiError(response.statusText, response.status);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && path !== "/auth/login" && path !== "/auth/register" && path !== "/auth/privy/sync") {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      const retry = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
      if (!retry.ok) throw await parseError(retry);
      if (retry.status === 204) return undefined as T;
      return (await retry.json()) as T;
    }
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      setAccessToken(null);
      return null;
    }
    const data = (await response.json()) as { accessToken: string };
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export interface PublicProofData {
  generatedAt: string;
  sources: Record<string, string>;
  sentinel: Record<string, unknown> | null;
  cognoscente: Record<string, unknown> | null;
  qvacRuntime: Record<string, unknown> | null;
  evidenceSystem: Record<string, unknown> | null;
  delegation: Record<string, unknown> | null;
}

export interface PublicRuntimeData {
  live: { status: string; providerPublicKey: string | null } | null;
  verified: Record<string, unknown> | null;
  source: string;
}

export interface OnboardingStatus {
  steps: {
    elder: boolean;
    caregiver: boolean;
    telegram: boolean;
    baselineScan: boolean;
    protectionActivated: boolean;
  };
  currentStep: "elder" | "caregiver" | "telegram" | "baselineScan" | "protectionActivated";
  progress: number;
  caregiverInviteEmail: string | null;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  publicProof: () => request<PublicProofData>("/public/proof"),

  publicRuntime: () => request<PublicRuntimeData>("/public/runtime"),

  register: (body: RegisterInput) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  syncPrivy: (body: { accessToken: string }) =>
    request<AuthResponse>("/auth/privy/sync", { method: "POST", body: JSON.stringify(body) }),

  login: (body: LoginInput) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  me: () => request<AuthUser>("/users/me"),

  createFamily: (name: string) =>
    request<{ id: string; name: string; accessToken: string }>("/families", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getFamily: () => request<{ id: string; name: string; meshPublicKey: string | null } | null>("/families/current"),

  listElders: () => request<ElderRecord[]>("/families/current/elders"),

  createElder: (body: { firstName: string; lastName: string; birthYear: number; timezone: string }) =>
    request<ElderRecord>("/families/current/elders", { method: "POST", body: JSON.stringify(body) }),

  getOnboarding: () => request<OnboardingStatus>("/families/current/onboarding"),

  inviteCaregiver: (email: string) =>
    request<{ email: string }>("/families/current/onboarding/caregiver-invite", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  dashboard: () => request<DashboardData>("/families/current/dashboard"),

  listAlerts: () => request<AlertRecord[]>("/families/current/alerts"),

  getAlert: (id: string) => request<AlertRecord>(`/families/current/alerts/${id}`),

  resolveAlert: (id: string) =>
    request<AlertRecord>(`/families/current/sentinel/alerts/${id}/resolve`, { method: "POST" }),

  getAlertTimeline: (id: string) => request<AlertTimeline>(`/families/current/alerts/${id}/timeline`),

  getTimeline: () => request<TimelineSummaryItem[]>("/families/current/timeline"),

  listBundles: () => request<DecisionBundleRecord[]>("/families/current/evidence/bundles"),

  getBundle: (id: string) => request<DecisionBundleRecord>(`/families/current/evidence/bundles/${id}`),

  verifyChain: () => request<{ valid: boolean; length: number; brokenAt?: string }>("/families/current/evidence/chain"),

  listEvidencePackets: () => request<EvidencePacketRecord[]>("/families/current/evidence/packets"),

  getEvidencePacket: (alertId: string) =>
    request<EvidencePacketContent>(`/families/current/alerts/${alertId}/evidence-packet`),

  listMembers: () => request<FamilyMemberRecord[]>("/families/current/members"),

  listAgents: () => request<Array<{ id: string; name: string; status: string; config: unknown }>>("/families/current/agents"),

  listDevices: () =>
    request<Array<{ id: string; name: string; role: string; status: string; meshPublicKey: string | null }>>(
      "/families/current/devices",
    ),

  listInferenceLogs: () => request<InferenceLogRecord[]>("/families/current/inference-logs"),

  qvacRuntime: () => request<QvacRuntimeData>("/families/current/qvac/runtime"),

  systemHealth: () => request<SystemHealthData>("/families/current/system-health"),

  telegramStatus: () => request<TelegramStatus>("/telegram/status"),

  telegramLink: () => request<TelegramLinkResponse>("/telegram/link", { method: "POST" }),

  telegramNotifications: () => request<AuditLogRecord[]>("/telegram/notifications"),

  uploadCognoscenteCheckIn: (elderId: string, file: File) =>
    uploadAudioFile("/families/current/cognoscente/check-in", elderId, file),

  uploadSentinelRecording: (elderId: string, file: File) =>
    uploadAudioFile("/families/current/sentinel/call-recording", elderId, file),
};

async function uploadAudioFile(path: string, elderId: string, file: File): Promise<{ checkInId?: string; recordingId?: string; status: string }> {
  const form = new FormData();
  form.append("elderId", elderId);
  form.append("audio", file);
  return request(path, { method: "POST", body: form });
}

export type { EvidencePacketContent };
