import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

const AUDIO_EXT = new Set([".wav", ".mp3", ".m4a", ".aac"]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".pdf"]);

export function ensureUploadDir(uploadsDir: string): void {
  mkdirSync(uploadsDir, { recursive: true });
}

export function validateExtension(filename: string, allowed: Set<string>): string {
  const ext = extname(filename).toLowerCase();
  if (!allowed.has(ext)) {
    throw new Error(`Unsupported file type "${ext}". Allowed: ${[...allowed].join(", ")}`);
  }
  return ext;
}

export async function saveBase64Upload(
  uploadsDir: string,
  filename: string,
  base64: string,
  allowed: Set<string>,
): Promise<string> {
  ensureUploadDir(uploadsDir);
  const ext = validateExtension(filename, allowed);
  const safeName = `${randomUUID()}${ext}`;
  const dest = join(uploadsDir, safeName);
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) throw new Error("Empty file upload");
  await new Promise<void>((resolve, reject) => {
    const stream = createWriteStream(dest);
    stream.on("error", reject);
    stream.on("finish", resolve);
    stream.end(buffer);
  });
  return dest;
}

export async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

export function fileExists(path: string): boolean {
  return existsSync(path);
}

export { AUDIO_EXT, IMAGE_EXT };
