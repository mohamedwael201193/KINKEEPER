import type { QvacCompletionResult, QvacTranscribeResult } from "./qvac-service.js";

export interface QvacClientOptions {
  baseUrl: string;
  secret: string;
}

export class QvacClient {
  constructor(private readonly options: QvacClientOptions) {}

  private async request<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.options.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.secret}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QVAC node error ${response.status}: ${errorText}`);
    }

    return (await response.json()) as T;
  }

  async health(): Promise<{ status: string; providerPublicKey: string | null }> {
    const response = await fetch(`${this.options.baseUrl}/internal/health`, {
      headers: { Authorization: `Bearer ${this.options.secret}` },
    });
    if (!response.ok) {
      throw new Error(`QVAC node health check failed: ${response.status}`);
    }
    return (await response.json()) as { status: string; providerPublicKey: string | null };
  }

  async completion(body: {
    modelSrc?: string;
    history: Array<{ role: "user" | "assistant"; content: string }>;
    captureThinking?: boolean;
    familyId?: string | null;
    deviceId?: string | null;
    bundleId?: string | null;
    delegate?: {
      providerPublicKey: string;
      fallbackToLocal?: boolean;
      timeout?: number;
    };
  }): Promise<QvacCompletionResult> {
    return this.request<QvacCompletionResult>("/internal/completion", body);
  }

  async transcribe(body: {
    audioPath: string;
    modelSrc?: string;
    familyId?: string | null;
    deviceId?: string | null;
    bundleId?: string | null;
    delegate?: {
      providerPublicKey: string;
      fallbackToLocal?: boolean;
      timeout?: number;
    };
  }): Promise<QvacTranscribeResult> {
    return this.request<QvacTranscribeResult>("/internal/transcribe", body);
  }

  async getProviderPublicKey(): Promise<string | null> {
    const health = await this.health();
    return health.providerPublicKey;
  }
}
