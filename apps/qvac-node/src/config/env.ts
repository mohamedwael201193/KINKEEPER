import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  QVAC_NODE_PORT: z.coerce.number().default(3001),
  QVAC_NODE_SECRET: z.string().min(32),
  QVAC_MODELS_CACHE_DIR: z.string().min(1),
  QVAC_HYPERSWARM_SEED: z.string().length(64),
  EVIDENCE_DIR: z.string().default("./evidence"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type QvacNodeEnv = z.infer<typeof envSchema>;

export function loadEnv(): QvacNodeEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid QVAC node environment: ${parsed.error.message}`);
  }
  return parsed.data;
}
