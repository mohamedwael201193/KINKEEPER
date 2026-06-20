/**
 * Pre-download MedPsy GGUF with visible progress (bypasses slow/stuck SDK 0% spam).
 * Saves to QVAC_MODELS_CACHE_DIR so loadModel() uses local path instantly.
 *
 * Usage: npm run download:medpsy
 * Optional: MEDPSY_MODEL=4B npm run download:medpsy
 * Optional: HF_TOKEN=hf_xxx for gated/rate-limited downloads
 */
import "dotenv/config";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import {
  medPsyDownloadUrl,
  medPsyExpectedBytes,
  medPsyFilename,
  medPsyVariant,
} from "@kinkeeper/qvac";

function isValidSize(bytes: number, expected: number): boolean {
  const tolerance = expected * 0.02;
  return Math.abs(bytes - expected) <= tolerance;
}

async function main(): Promise<void> {
  const cacheDir = process.env.QVAC_MODELS_CACHE_DIR;
  if (!cacheDir) {
    throw new Error("QVAC_MODELS_CACHE_DIR is required");
  }

  const variant = medPsyVariant();
  const url = medPsyDownloadUrl(variant);
  const filename = medPsyFilename(variant);
  const dest = join(cacheDir, filename);
  const expectedBytes = medPsyExpectedBytes(variant);
  const partial = `${dest}.partial`;

  mkdirSync(cacheDir, { recursive: true });

  if (existsSync(dest)) {
    const size = statSync(dest).size;
    if (isValidSize(size, expectedBytes)) {
      console.log(`Already present: ${dest} (${(size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    console.warn(`Removing corrupt file (expected ~${(expectedBytes / 1024 / 1024).toFixed(0)} MB, got ${(size / 1024 / 1024).toFixed(0)} MB)`);
    unlinkSync(dest);
  }

  if (existsSync(partial)) {
    const partialSize = statSync(partial).size;
    if (partialSize >= expectedBytes * 0.99) {
      finalizeDownload(partial, dest, expectedBytes);
      return;
    }
  }

  let startByte = 0;
  if (existsSync(partial)) {
    startByte = statSync(partial).size;
    console.log(`Resuming partial download at ${(startByte / 1024 / 1024).toFixed(1)} MB`);
  }

  console.log(`Downloading MedPsy-${variant} from HuggingFace...`);
  console.log(`URL: ${url}`);
  console.log(`Dest: ${dest}`);

  const headers: Record<string, string> = {
    "User-Agent": "kinkeeper-download/1.0",
  };
  if (process.env.HF_TOKEN) {
    headers.Authorization = `Bearer ${process.env.HF_TOKEN}`;
  }
  if (startByte > 0) {
    headers.Range = `bytes=${startByte}-`;
  }

  const response = await fetch(url, { headers, redirect: "follow" });
  if (!response.ok && response.status !== 206) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  }

  // Server ignored Range and resent full file — restart clean
  if (startByte > 0 && response.status === 200) {
    console.warn("Server did not honor Range request; restarting from byte 0");
    unlinkSync(partial);
    startByte = 0;
  }

  const contentRange = response.headers.get("content-range");
  const contentLength = response.headers.get("content-length");
  let totalBytes = expectedBytes;
  if (contentRange) {
    const match = contentRange.match(/\/(\d+)$/);
    if (match) totalBytes = Number(match[1]);
  } else if (contentLength && startByte === 0) {
    totalBytes = Number(contentLength);
  }

  console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

  const out = createWriteStream(partial, { flags: startByte > 0 ? "a" : "w" });
  const body = response.body;
  if (!body) {
    throw new Error("No response body");
  }

  let downloaded = startByte;
  let lastLog = Date.now();
  const nodeStream = Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]);

  nodeStream.on("data", (chunk: Buffer) => {
    downloaded += chunk.length;
    const now = Date.now();
    if (now - lastLog >= 3000) {
      lastLog = now;
      const pct = ((downloaded / totalBytes) * 100).toFixed(1);
      console.log(
        `Progress: ${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(totalBytes / 1024 / 1024).toFixed(1)} MB (${pct}%)`,
      );
    }
  });

  await pipeline(nodeStream, out);

  finalizeDownload(partial, dest, expectedBytes);
}

function finalizeDownload(partial: string, dest: string, expectedBytes: number): void {
  if (!existsSync(partial)) {
    if (existsSync(dest) && isValidSize(statSync(dest).size, expectedBytes)) {
      console.log(`Complete: ${dest} (${(statSync(dest).size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    throw new Error(`Partial file missing: ${partial}`);
  }

  const size = statSync(partial).size;
  if (!isValidSize(size, expectedBytes)) {
    throw new Error(
      `Download size mismatch: got ${size} bytes, expected ~${expectedBytes}. Delete ${partial} and retry.`,
    );
  }

  if (existsSync(dest)) {
    unlinkSync(dest);
  }
  renameSync(partial, dest);
  console.log(`Complete: ${dest} (${(statSync(dest).size / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch((error: unknown) => {
  console.error("MedPsy download failed:", error);
  console.error("\nIf HuggingFace is blocked or slow:");
  console.error("  1. Set HF_TOKEN if you have a Hugging Face account");
  console.error("  2. Try MEDPSY_MODEL=1.7B (default, ~1GB vs ~2.6GB for 4B)");
  console.error("  3. Manual: download the GGUF from https://huggingface.co/qvac into QVAC_MODELS_CACHE_DIR");
  process.exit(1);
});
