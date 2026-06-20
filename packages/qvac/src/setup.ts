import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Configure QVAC SDK environment before importing @qvac/sdk. */
export function setupQvacEnvironment(): void {
  if (!process.env.QVAC_MODELS_CACHE_DIR) {
    throw new Error("QVAC_MODELS_CACHE_DIR is required");
  }

  if (!process.env.QVAC_CONFIG_PATH) {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
    process.env.QVAC_CONFIG_PATH = join(root, "config", "default", "default.config.json");
  }
}
