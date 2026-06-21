import { execSync } from "node:child_process";

export function grammyErrorCode(error: unknown): number | undefined {
  if (error && typeof error === "object" && "error_code" in error) {
    return Number((error as { error_code?: number }).error_code);
  }
  if (error && typeof error === "object" && "error" in error) {
    const inner = (error as { error?: { error_code?: number } }).error;
    return inner?.error_code;
  }
  return undefined;
}

export function isTelegramPollConflict(error: unknown): boolean {
  return grammyErrorCode(error) === 409;
}

export async function deleteTelegramWebhook(token: string): Promise<void> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
    const body = (await res.json()) as { ok?: boolean };
    if (!body.ok) {
      process.stderr.write("[guardian-mesh] deleteWebhook returned not ok — continuing\n");
    }
  } catch (err) {
    process.stderr.write(`[guardian-mesh] deleteWebhook failed: ${String(err)}\n`);
  }
}

/** Best-effort: stop local dev:api Telegram pollers so Guardian Mesh can listen for acks. */
export function stopLocalTelegramPollers(): void {
  if (process.platform !== "win32") return;
  try {
    execSync(
      `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='node.exe'\\" | Where-Object { $_.CommandLine -match 'apps/api/src/main|dev:api' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
      { stdio: "ignore" },
    );
    process.stderr.write("[guardian-mesh] Stopped local dev:api Telegram pollers (if any)\n");
  } catch {
    /* best effort */
  }
}

export function telegramAckListenerEnabled(): boolean {
  const flag = process.env.GUARDIAN_TELEGRAM_ACK_LISTENER?.trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") {
    return false;
  }
  return true;
}
