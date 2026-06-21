import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createReadStream, existsSync } from "node:fs";
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

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
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
          : "application/octet-stream";
  res.writeHead(200, { "content-type": type });
  createReadStream(path).pipe(res);
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
  return scenario.type === "audio" ? eng.processAudio(path) : eng.processImage(path);
}

export async function startGuardianMeshServer(port = 8787): Promise<void> {
  const config = loadGuardianMeshConfig();
  if (config.telegramBotToken && config.telegramChatId) {
    const bootstrap = new GuardianMeshEngine(new QvacService(), config);
    void bootstrap.startTelegramListener().catch((err) => {
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
      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
        staticFile(res, join(publicDir, "index.html"));
        return;
      }

      if (req.method === "GET" && url.pathname.startsWith("/public/")) {
        staticFile(res, join(publicDir, url.pathname.replace("/public/", "")));
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/status") {
        const eng = await getEngine();
        sendJson(res, 200, {
          product: "KINKEEPER Guardian Mesh",
          local: true,
          providerPublicKey: eng.getProviderPublicKey(),
          chain: eng.verifyChain(),
          lastIncident: lastResult?.incidentId ?? null,
          scenarios: getGuardianScenarios(repoRoot),
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/proof") {
        const eng = await getEngine();
        const cfg = loadGuardianMeshConfig();
        sendJson(
          res,
          200,
          buildProofSnapshot({
            engine: eng,
            config: cfg,
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

      if (req.method === "POST" && url.pathname.startsWith("/api/scenario/")) {
        const id = url.pathname.replace("/api/scenario/", "").toUpperCase();
        lastResult = await runScenario(id);
        sendJson(res, 200, { ok: true, result: lastResult });
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
        lastResult = safeResult;
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
            config: loadGuardianMeshConfig(),
            repoRoot,
            lastProfilerSummary: safeResult.profilerSummary,
          }),
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/demo/one-click") {
        lastResult = await runScenario("A");
        let ocrResult: GuardianIncidentResult | null = null;
        try {
          ocrResult = await runScenario("B");
          lastResult = ocrResult;
        } catch {
          /* optional */
        }
        sendJson(res, 200, { ok: true, audioResult: lastResult, ocrResult });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/mode") {
        const mode = (url.searchParams.get("mode") ?? "judge") as GuardianUiMode;
        sendJson(res, 200, { mode });
        return;
      }

      if (req.method === "GET" && url.pathname.startsWith("/api/tts/")) {
        const incidentId = url.pathname.replace("/api/tts/", "");
        const wavPath = join(loadGuardianMeshConfig().evidenceDir, "tts", `${incidentId}.wav`);
        if (!existsSync(wavPath)) {
          sendJson(res, 404, { error: "tts not found" });
          return;
        }
        res.writeHead(200, { "content-type": "audio/wav" });
        createReadStream(wavPath).pipe(res);
        return;
      }

      sendJson(res, 404, { error: "not found", path: url.pathname });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve());
  });

  process.stderr.write(`[guardian-mesh] Judge UI: http://127.0.0.1:${port}/\n`);
}
