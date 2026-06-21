import { app, BrowserWindow } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PORT = Number(process.env.GUARDIAN_MESH_PORT ?? 8787);
let serverProc: ChildProcess | null = null;

function resolveServerEntry(): string {
  const unpacked = join(process.resourcesPath, "app.asar.unpacked");
  const candidates = [
    join(unpacked, "apps", "guardian-mesh", "dist", "main.js"),
    join(process.cwd(), "apps", "guardian-mesh", "dist", "main.js"),
    join(app.getAppPath(), "apps", "guardian-mesh", "dist", "main.js"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error("Guardian Mesh server not found — use Start-Guardian-Mesh.bat from release/GuardianMesh-Judge/");
}

async function startServer(): Promise<void> {
  if (serverProc) return;
  const entry = resolveServerEntry();
  serverProc = spawn(process.execPath, [entry], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", GUARDIAN_MESH_PORT: String(PORT) },
    stdio: "inherit",
  });
  await new Promise((r) => setTimeout(r, 8000));
}

async function createWindow(): Promise<void> {
  await startServer();

  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    title: "KINKEEPER Guardian Mesh",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await win.loadURL(`http://127.0.0.1:${PORT}/`);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  serverProc?.kill();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
