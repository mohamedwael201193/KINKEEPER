import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  APP_PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  CORS_ORIGINS: z.string(),
  DATABASE_URL: z.string().min(1),
  DATABASE_DIRECT_URL: z.string().min(1),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_PRIVATE_KEY_FILE: z.string().default(".jwt-private.pem"),
  JWT_PUBLIC_KEY_FILE: z.string().default(".jwt-public.pem"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  QVAC_NODE_URL: z.string().url(),
  QVAC_NODE_SECRET: z.string().min(32),
  REDIS_URL: z.string().min(1),
  UPLOAD_DIR: z.string().default("./uploads"),
  EVIDENCE_DIR: z.string().default("./evidence"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  TELEGRAM_LINK_TOKEN_TTL_SEC: z.coerce.number().default(900),
  PRIVY_APP_ID: z.string().min(1),
  PRIVY_APP_SECRET: z.string().min(1),
});

export type ApiEnv = z.infer<typeof envSchema> & {
  jwtPrivateKey: string;
  jwtPublicKey: string;
  corsOrigins: string[];
};

function readKeyFile(path: string): string {
  const resolved = isAbsolute(path) ? path : join(repoRoot(), path);
  return readFileSync(resolved, "utf8");
}

function readJwtKey(inline: string | undefined, filePath: string, label: string): string {
  if (inline?.trim()) {
    return inline.replace(/\\n/g, "\n");
  }
  try {
    return readKeyFile(filePath);
  } catch {
    throw new Error(
      `Missing ${label}. Set ${label} env var (Render/Vercel) or ${label}_FILE pointing to a PEM file.`,
    );
  }
}

function assertProductionQvacReachable(appEnv: string, qvacNodeUrl: string): void {
  if (appEnv !== "production") {
    return;
  }

  const host = new URL(qvacNodeUrl).hostname.toLowerCase();
  const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
  if (loopbackHosts.has(host)) {
    throw new Error(
      "QVAC_NODE_URL points to loopback in production. Render cannot reach your PC via localhost. " +
        "Run apps/qvac-node locally and set QVAC_NODE_URL to an HTTPS tunnel URL (ngrok, Cloudflare Tunnel, or Tailscale Serve).",
    );
  }
}

export function loadEnv(): ApiEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid API environment: ${parsed.error.message}`);
  }

  assertProductionQvacReachable(parsed.data.APP_ENV, parsed.data.QVAC_NODE_URL);

  return {
    ...parsed.data,
    jwtPrivateKey: readJwtKey(
      parsed.data.JWT_PRIVATE_KEY,
      parsed.data.JWT_PRIVATE_KEY_FILE,
      "JWT_PRIVATE_KEY",
    ),
    jwtPublicKey: readJwtKey(
      parsed.data.JWT_PUBLIC_KEY,
      parsed.data.JWT_PUBLIC_KEY_FILE,
      "JWT_PUBLIC_KEY",
    ),
    corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
  };
}
