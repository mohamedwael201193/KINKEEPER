import { Queue, type ConnectionOptions } from "bullmq";

export const QUEUE_NAMES = {
  sentinel: "sentinel-process-call",
  cognoscente: "cognoscente-check-in",
} as const;

export function createRedisConnection(redisUrl: string): ConnectionOptions {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: decodeURIComponent(url.password) || undefined,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export function createQueues(connection: ConnectionOptions) {
  return {
    sentinel: new Queue(QUEUE_NAMES.sentinel, { connection }),
    cognoscente: new Queue(QUEUE_NAMES.cognoscente, { connection }),
  };
}

export type Queues = ReturnType<typeof createQueues>;

export interface SentinelJobData {
  familyId: string;
  elderId: string;
  recordingId: string;
  audioPath: string;
  audioHash: string;
  transcript?: string;
  initialClassification?: string;
  initialConfidence?: number;
  initialReasoning?: string;
}

export interface CognoscenteJobData {
  familyId: string;
  elderId: string;
  checkInId: string;
  audioPath: string;
  audioHash: string;
}
