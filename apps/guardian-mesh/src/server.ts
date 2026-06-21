import { createServer, type ServerResponse } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { QvacService } from "@kinkeeper/qvac";
import {
  GuardianMeshEngine,
  buildProofSnapshot,
  getGuardianScenarios,
  loadGuardianMeshConfig,
  resolveScenarioPath,
  type GuardianIncidentResult,
  type GuardianUiMode,
} from "@kinkeeper/guardian-mesh";
import { listIncidentHistory, loadIncidentPacket, readTelegramAcks, resultToSummary } from "./history.js";
import { pipelineHooks } from "./pipeline-runner.js";
import {
  beginProcessing,
  completeProcessing,
  failProcessing,
  getProcessingState,
  markUploadComplete,
} from "./processing-state.js";
import { AUDIO_EXT, IMAGE_EXT, readJsonBody, saveBase64Upload } from "./upload.js";
import { isValidEvidencePacket, parseIncidentIdFromPath } from "./routes.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "..", "public");
const repoRoot = join(__dirname, "..", "..", "..");

let lastResult: GuardianIncidentResult | null = null;
let engine: GuardianMeshEngine | null = null;

async function getEngine(): Promise<GuardianMeshEngine> {
  if (!engine) {
    const config = loadGuardianMeshConfig();
    engine = new GuardianMeshEngine(new QvacService(), config);
    await engine.preload();
  }
  return engine;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

function staticFile(res: ServerResponse, path: string): void {
  if (!existsSync(path)) {
    sendJson(res, 404, { error: "not found" });
    return;
  }
  const ext = extname(path);
  const type =
    ext === ".html"
      ? "text/html"
      : ext === ".js"
        ? "application/javascript"
        : ext === ".css"
          ? "text/css"
          : ext === ".svg"
            ? "image/svg+xml"
            : ext === ".woff2"
              ? "font/woff2"
              : "application/octet-stream";
  res.writeHead(200, { "content-type": type });
  createReadStream(path).pipe(res);
}

function serveSpa(res: ServerResponse): void {
  const indexPath = join(publicDir, "index.html");
  if (existsSync(indexPath)) {
    staticFile(res, indexPath);
    return;
  }
  sendJson(res, 404, { error: "UI not built. Run: npm run build:ui -w @kinkeeper/guardian-mesh-app" });
}

function tryStaticAsset(res: ServerResponse, pathname: string): boolean {
  if (pathname.includes("..")) return false;
  const assetPath = join(publicDir, pathname);
  if (existsSync(assetPath) && statSync(assetPath).isFile()) {
    staticFile(res, assetPath);
    return true;
  }
  return false;
}

async function runScenario(id: string): Promise<GuardianIncidentResult> {
  const scenario = getGuardianScenarios(repoRoot).find((s) => s.id === id);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${id}`);
  }
  const path = resolveScenarioPath(repoRoot, scenario);
  if (!existsSync(path)) {
    throw new Error(`Asset missing: ${path}`);
  }
  const eng = await getEngine();
  const inputType = scenario.type === "audio" ? "audio" : "image";
  beginProcessing(inputType);
  try {
    markUploadComplete();
    const result =
      scenario.type === "audio"
        ? await eng.processAudio(path, pipelineHooks())
        : await eng.processImage(path, pipelineHooks());
    completeProcessing();
    lastResult = result;
    return result;
  } catch (error) {
    failProcessing(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function startGuardianMeshServer(port = 8787): Promise<void> {
  const config = loadGuardianMeshConfig();
  const uploadsDir = join(config.dataDir, "uploads");
  if (config.telegramBotToken && config.telegramChatId) {
    const bootstrap = new GuardianMeshEngine(new QvacService(), config);
    void bootstrap.startTelegramListener().catch((err) => {
      if (String(err).includes("409") || String(err).includes("Conflict")) {
        process.stderr.write(
          "[guardian-mesh] Telegram listener unavailable (409) — UI continues without ack polling.\n",
        );
        return;
      }
      process.stderr.write(`[guardian-mesh] Telegram listener failed: ${String(err)}\n`);
    });
  }

  const server = createServer(async (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);

    try {
      if (req.method === "GET" && url.pathname.startsWith("/assets/")) {
        if (tryStaticAsset(res, url.pathname.slice(1))) return;
      }

      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
        serveSpa(res);
        return;
      }

      if (req.method === "GET" && url.pathname.startsWith("/public/")) {
        staticFile(res, join(publicDir, url.pathname.replace("/public/", "")));
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/status") {
        const eng = await getEngine();
        const chain = eng.verifyChain();
        const history = listIncidentHistory(config.evidenceDir);
        const telegramConfigured = Boolean(config.telegramBotToken && config.telegramChatId);
        sendJson(res, 200, {
          product: "KINKEEPER Guardian Mesh",
          local: true,
          providerPublicKey: eng.getProviderPublicKey(),
          chain,
          lastIncident: lastResult?.incidentId ?? history[0]?.incidentId ?? null,
          incidentCount: history.length,
          scenarios: getGuardianScenarios(repoRoot),
          stats: {
            totalIncidents: history.length,
            blockCount: history.filter((h) => h.verdict === "BLOCK").length,
            warnCount: history.filter((h) => h.verdict === "WARN").length,
            allowCount: history.filter((h) => h.verdict === "ALLOW").length,
            chainValid: chain.valid,
            telegramConfigured,
            scamCallsDetected: history.filter(
              (h) => h.inputType === "audio" && (h.verdict === "BLOCK" || h.verdict === "WARN"),
            ).length,
            fraudAttemptsBlocked: history.filter((h) => h.verdict === "BLOCK").length,
            evidencePackagesGenerated: chain.count,
            telegramAlertsSent: telegramConfigured
              ? history.filter((h) => h.verdict === "BLOCK" || h.verdict === "WARN").length
              : 0,
          },
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/processing") {
        sendJson(res, 200, getProcessingState());
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/proof") {
        const eng = await getEngine();
        sendJson(
          res,
          200,
          buildProofSnapshot({
            engine: eng,
            config,
            repoRoot,
            lastProfilerSummary: lastResult?.profilerSummary,
          }),
        );
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/scenarios") {
        sendJson(res, 200, { scenarios: getGuardianScenarios(repoRoot) });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/history") {
        const q = url.searchParams.get("q")?.toLowerCase() ?? "";
        const verdict = url.searchParams.get("verdict")?.toUpperCase();
        let items = listIncidentHistory(config.evidenceDir);
        if (q) {
          items = items.filter(
            (i) =>
              i.incidentId.includes(q) ||
              i.scamType?.toLowerCase().includes(q) ||
              i.inputPath.toLowerCase().includes(q),
          );
        }
        if (verdict && ["ALLOW", "WARN", "BLOCK"].includes(verdict)) {
          items = items.filter((i) => i.verdict === verdict);
        }
        sendJson(res, 200, { items, count: items.length });
        return;
      }

      if (req.method === "GET" && url.pathname.startsWith("/api/incident/")) {
        const incidentId = parseIncidentIdFromPath(url.pathname, "/api/incident/");
        if (!incidentId) {
          sendJson(res, 400, { error: "invalid incident id" });
          return;
        }
        const packet = loadIncidentPacket(config.evidenceDir, incidentId);
        if (!packet) {
          sendJson(res, 404, { error: "incident not found", incidentId });
          return;
        }
        sendJson(res, 200, { incidentId, packet });
        return;
      }

      // NOTE: /api/evidence/export/ MUST be registered before /api/evidence/ (see routes.ts)
      if (req.method === "GET" && url.pathname.startsWith("/api/evidence/export/")) {
        const incidentId = parseIncidentIdFromPath(url.pathname, "/api/evidence/export/");
        if (!incidentId) {
          sendJson(res, 400, { error: "invalid incident id" });
          return;
        }
        const packet = loadIncidentPacket(config.evidenceDir, incidentId);
        if (!packet) {
          sendJson(res, 404, { error: "evidence not found", incidentId });
          return;
        }
        if (!isValidEvidencePacket(packet)) {
          sendJson(res, 500, { error: "corrupt evidence packet", incidentId });
          return;
        }
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "content-disposition": `attachment; filename="guardian-evidence-${incidentId}.json"`,
        });
        res.end(JSON.stringify(packet, null, 2));
        return;
      }

      if (req.method === "GET" && url.pathname.startsWith("/api/evidence/")) {
        const incidentId = parseIncidentIdFromPath(url.pathname, "/api/evidence/");
        if (!incidentId) {
          sendJson(res, 400, { error: "invalid incident id" });
          return;
        }
        const packet = loadIncidentPacket(config.evidenceDir, incidentId);
        if (!packet) {
          sendJson(res, 404, { error: "evidence not found", incidentId });
          return;
        }
        const eng = await getEngine();
        sendJson(res, 200, {
          incidentId,
          packet,
          chain: eng.verifyChain(),
          providerPublicKey: eng.getProviderPublicKey(),
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/telegram/status") {
        const acks = readTelegramAcks(config.evidenceDir);
        const history = listIncidentHistory(config.evidenceDir);
        const alerts = history.map((h) => ({
          incidentId: h.incidentId,
          verdict: h.verdict,
          createdAt: h.createdAt,
          messageId: h.telegramMessageId,
          telegramSent: Boolean(config.telegramBotToken && config.telegramChatId),
          acknowledged: acks.some((a) => a.incidentId === h.incidentId),
        }));
        const openIncidents = alerts.filter((a) => !a.acknowledged && a.verdict !== "ALLOW");
        const resolvedIncidents = alerts.filter((a) => a.acknowledged);
        sendJson(res, 200, {
          configured: Boolean(config.telegramBotToken && config.telegramChatId),
          chatId: config.telegramChatId ? `${config.telegramChatId.slice(0, 4)}…` : null,
          alerts,
          acks,
          pending: alerts.filter((a) => !a.acknowledged).length,
          acknowledged: alerts.filter((a) => a.acknowledged).length,
          openIncidents: openIncidents.length,
          resolvedIncidents: resolvedIncidents.length,
          alertsSent: alerts.filter((a) => a.telegramSent && (a.verdict === "BLOCK" || a.verdict === "WARN")).length,
        });
        return;
      }

      if (req.method === "POST" && url.pathname.startsWith("/api/scenario/")) {
        const id = url.pathname.replace("/api/scenario/", "").toUpperCase();
        const result = await runScenario(id);
        sendJson(res, 200, { ok: true, result });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/chain") {
        const eng = await getEngine();
        sendJson(res, 200, eng.verifyChain());
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/last") {
        sendJson(res, 200, { result: lastResult });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/upload/audio") {
        const body = await readJsonBody(req);
        const filename = String(body.filename ?? "upload.wav");
        const data = String(body.data ?? "");
        if (!data) {
          sendJson(res, 400, { error: "missing file data" });
          return;
        }
        beginProcessing("audio");
        try {
          const savedPath = await saveBase64Upload(uploadsDir, filename, data, AUDIO_EXT);
          markUploadComplete();
          const eng = await getEngine();
          lastResult = await eng.processAudio(savedPath, pipelineHooks());
          completeProcessing();
          sendJson(res, 200, { ok: true, result: lastResult, uploadedPath: savedPath });
        } catch (error) {
          failProcessing(error instanceof Error ? error.message : String(error));
          throw error;
        }
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/upload/image") {
        const body = await readJsonBody(req);
        const filename = String(body.filename ?? "upload.png");
        const data = String(body.data ?? "");
        if (!data) {
          sendJson(res, 400, { error: "missing file data" });
          return;
        }
        const ext = extname(filename).toLowerCase();
        if (ext === ".pdf") {
          sendJson(res, 400, {
            error: "PDF OCR is not yet supported by the local pipeline. Upload PNG, JPG, or JPEG.",
          });
          return;
        }
        beginProcessing("image");
        try {
          const savedPath = await saveBase64Upload(uploadsDir, filename, data, IMAGE_EXT);
          markUploadComplete();
          const eng = await getEngine();
          lastResult = await eng.processImage(savedPath, pipelineHooks());
          completeProcessing();
          sendJson(res, 200, { ok: true, result: lastResult, uploadedPath: savedPath });
        } catch (error) {
          failProcessing(error instanceof Error ? error.message : String(error));
          throw error;
        }
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/process/audio") {
        const body = await readJsonBody(req);
        const audioPath = String(body.path ?? "");
        if (!audioPath || !existsSync(audioPath)) {
          sendJson(res, 400, { error: "audio path missing or not found", path: audioPath });
          return;
        }
        const eng = await getEngine();
        lastResult = await eng.processAudio(audioPath);
        sendJson(res, 200, { ok: true, result: lastResult });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/process/image") {
        const body = await readJsonBody(req);
        const imagePath = String(body.path ?? "");
        if (!imagePath || !existsSync(imagePath)) {
          sendJson(res, 400, { error: "image path missing or not found", path: imagePath });
          return;
        }
        const eng = await getEngine();
        lastResult = await eng.processImage(imagePath);
        sendJson(res, 200, { ok: true, result: lastResult });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/demo/judge-flow") {
        const audioResult = await runScenario("A");
        const ocrResult = await runScenario("B");
        const safeResult = await runScenario("G");
        const eng = await getEngine();
        sendJson(res, 200, {
          ok: true,
          steps: [
            { id: "A", label: "Scam call", expected: "BLOCK", result: audioResult },
            { id: "B", label: "Fake invoice", expected: "BLOCK", result: ocrResult },
            { id: "G", label: "Safe check-in", expected: "ALLOW", result: safeResult },
          ],
          chain: eng.verifyChain(),
          proof: buildProofSnapshot({
            engine: eng,
            config,
            repoRoot,
            lastProfilerSummary: safeResult.profilerSummary,
          }),
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/demo/one-click") {
        const audioResult = await runScenario("A");
        let ocrResult: GuardianIncidentResult | null = null;
        try {
          ocrResult = await runScenario("B");
        } catch {
          /* optional */
        }
        sendJson(res, 200, { ok: true, audioResult, ocrResult, result: lastResult });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/mode") {
        const mode = (url.searchParams.get("mode") ?? "judge") as GuardianUiMode;
        sendJson(res, 200, { mode });
        return;
      }

      if (req.method === "GET" && url.pathname.startsWith("/api/tts/")) {
        const incidentId = parseIncidentIdFromPath(url.pathname, "/api/tts/");
        if (!incidentId) {
          sendJson(res, 400, { error: "invalid incident id" });
          return;
        }
        const wavPath = join(config.evidenceDir, "tts", `${incidentId}.wav`);
        if (!existsSync(wavPath)) {
          sendJson(res, 404, { error: "tts not found" });
          return;
        }
        res.writeHead(200, { "content-type": "audio/wav" });
        createReadStream(wavPath).pipe(res);
        return;
      }

      if (req.method === "GET" && !url.pathname.startsWith("/api/")) {
        if (tryStaticAsset(res, url.pathname.slice(1))) return;
        serveSpa(res);
        return;
      }

      sendJson(res, 404, { error: "not found", path: url.pathname });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        reject(
          new Error(
            `Port ${port} is already in use. Stop the other Guardian Mesh process and retry.`,
          ),
        );
        return;
      }
      reject(err);
    });
    server.listen(port, "127.0.0.1", () => resolve());
  });

  process.stderr.write(`[guardian-mesh] Guardian Mesh UI: http://127.0.0.1:${port}/\n`);
}

export { resultToSummary };
