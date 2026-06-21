import { Link } from "@tanstack/react-router";
import { ExternalLink, Monitor, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/site/components/code-block";
import { SeoHead } from "@/site/components/seo-head";
import { SectionShell } from "@/site/components/section-shell";
import { MarketingShell } from "@/site/layout/marketing-shell";

export default function InstallPage() {
  return (
    <MarketingShell>
      <SeoHead title="Installation" path="/install" />
      <SectionShell eyebrow="Installation" title="Install Guardian Mesh" description="Every command below is verified in this repository.">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Monitor className="mb-2 h-6 w-6 text-accent" />
              <CardTitle>Windows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-ink-muted">
              <p>Fastest path: clone the repo and run the launcher.</p>
              <CodeBlock code={`git clone https://github.com/mohamedwael201193/KINKEEPER.git
cd KINKEEPER
release\\GuardianMesh-Judge\\Start-Guardian-Mesh.bat`} />
              <p>Opens http://127.0.0.1:8787/</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Terminal className="mb-2 h-6 w-6 text-accent" />
              <CardTitle>macOS / Linux (source)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-ink-muted">
              <p>Node ≥ 22.17. Electron installers are Windows-only today.</p>
              <CodeBlock code={`git clone https://github.com/mohamedwael201193/KINKEEPER.git
cd KINKEEPER
npm install
cp .env.example .env
npm run build:guardian-mesh
npm run dev:guardian-mesh`} />
            </CardContent>
          </Card>
        </div>

        <h3 className="mb-4 mt-12 font-serif text-2xl">Dependencies</h3>
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Requirement</th>
                <th className="px-4 py-3 font-medium">Version</th>
              </tr>
            </thead>
            <tbody className="text-ink-muted">
              <tr className="border-b border-ink/10">
                <td className="px-4 py-3">Node.js</td>
                <td className="px-4 py-3">≥ 22.17</td>
              </tr>
              <tr className="border-b border-ink/10">
                <td className="px-4 py-3">npm</td>
                <td className="px-4 py-3">≥ 10.9</td>
              </tr>
              <tr className="border-b border-ink/10">
                <td className="px-4 py-3">QVAC models cache</td>
                <td className="px-4 py-3">~2–4 GB disk</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Telegram (optional)</td>
                <td className="px-4 py-3">Bot token + chat ID</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-4 mt-12 font-serif text-2xl">Environment variables</h3>
        <CodeBlock
          title=".env (from .env.example)"
          code={`QVAC_MODELS_CACHE_DIR=./.qvac-models
GUARDIAN_MESH_DATA_DIR=./guardian-mesh-data
TELEGRAM_BOT_TOKEN=          # optional
TELEGRAM_DEMO_CHAT_ID=       # optional
GUARDIAN_ELDER_NAME=Margaret`}
        />

        <div className="mt-8 rounded-xl border border-trust-warn/30 bg-trust-warn/10 p-4 text-sm text-ink-muted">
          <strong className="text-ink">Troubleshooting:</strong> Telegram error 409 means two processes poll the same bot token.
          Stop dev:api or cloud pollers before running guardian:telegram.
        </div>
      </SectionShell>
    </MarketingShell>
  );
}

export function DownloadPage() {
  return (
    <MarketingShell>
      <SeoHead title="Download" path="/download" />
      <SectionShell eyebrow="Download" title="Get Guardian Mesh" description="Desktop builds and source install.">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle>Windows launcher</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-ink-muted">One-click start after clone — builds and opens the local console.</p>
              <Button asChild>
                <Link to="/install">Installation guide</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Electron (Windows)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-ink-muted">Build locally — binaries are not committed (~80 MB, unsigned).</p>
              <CodeBlock code={`$env:CSC_IDENTITY_AUTO_DISCOVERY='false'
npm run pack -w @kinkeeper/guardian-desktop
npm run pack:installer -w @kinkeeper/guardian-desktop`} />
            </CardContent>
          </Card>
        </div>
        <h3 className="mb-4 mt-12 font-serif text-2xl">System requirements</h3>
        <ul className="list-inside list-disc space-y-2 text-ink-muted">
          <li>Windows 10+ (primary), macOS/Linux via Node source path</li>
          <li>8 GB RAM minimum recommended for local models</li>
          <li>~2–4 GB disk for QVAC model cache</li>
          <li>Internet for first model download; optional for Telegram</li>
        </ul>
        <div className="mt-8">
          <Button asChild variant="secondary">
            <a href="https://github.com/mohamedwael201193/KINKEEPER" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Source on GitHub
            </a>
          </Button>
        </div>
      </SectionShell>
    </MarketingShell>
  );
}

export function DemoPage() {
  return (
    <MarketingShell>
      <SeoHead title="Product Preview" path="/demo" />
      <SectionShell
        eyebrow="Product preview"
        title="See Guardian Mesh in action"
        description="Run the local console on your machine for the full interactive experience."
      >
        <Card className="border-ink/10 bg-white/80">
          <CardContent className="space-y-6 p-8">
            <p className="text-ink-muted">
              Guardian Mesh runs at <strong className="text-ink">http://127.0.0.1:8787/</strong> after install.
              The console runs real QVAC inference — STT, OCR, RAG, risk engine, evidence chain, and optional Telegram.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-ink-muted">
              <li>Install via the <Link to="/install" className="text-accent underline-offset-2 hover:underline">installation guide</Link></li>
              <li>Open the local console in your browser</li>
              <li>Run scenario analysis and verify the evidence chain</li>
              <li>Refresh QVAC proof to see provider key and model identifiers</li>
            </ol>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/install">Get started</Link>
              </Button>
              <Button asChild variant="secondary">
                <a href="http://127.0.0.1:8787/" target="_blank" rel="noopener noreferrer">
                  Open local console <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </SectionShell>
    </MarketingShell>
  );
}
