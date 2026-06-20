import { Worker, type Worker as WorkerType } from "bullmq";
import type { ApiEnv } from "../config/env.js";
import {
  createRedisConnection,
  createQueues,
  QUEUE_NAMES,
  type CognoscenteJobData,
  type SentinelJobData,
} from "../queues/index.js";
import type { AgentServices } from "../services/factory.js";
import { prisma } from "@kinkeeper/db";

export function startWorkers(
  env: ApiEnv,
  services: AgentServices,
): { workers: WorkerType[]; queues: ReturnType<typeof createQueues> } {
  const connection = createRedisConnection(env.REDIS_URL);
  const queues = createQueues(connection);

  const sentinelWorker = new Worker<SentinelJobData>(
    QUEUE_NAMES.sentinel,
    async (job) => {
      await services.sentinel.processCallRecording(job.data);
    },
    { connection },
  );

  const cognoscenteWorker = new Worker<CognoscenteJobData>(
    QUEUE_NAMES.cognoscente,
    async (job) => {
      await services.cognoscente.processCheckIn(job.data);
    },
    { connection },
  );

  sentinelWorker.on("failed", (job, error) => {
    console.error(`Sentinel job ${job?.id} failed`, error);
    if (job?.data.recordingId) {
      void prisma.sentinelCallRecording.update({
        where: { id: job.data.recordingId },
        data: { status: "failed" },
      });
    }
  });

  cognoscenteWorker.on("failed", (job, error) => {
    console.error(`Cognoscente job ${job?.id} failed`, error);
  });

  return { workers: [sentinelWorker, cognoscenteWorker], queues };
}
