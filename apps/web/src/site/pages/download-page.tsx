import { SITE } from "@/content/guardian-mesh";
import { CodeBlock } from "@/site/components/code-block";
import { Callout, GlassCard, PageHeader, SiteLayout } from "@/site/layout/site-layout";

export default function DownloadPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Download"
        title="Installation & downloads"
        description="Guardian Mesh runs on your machine. Binaries are rebuilt locally — unsigned Windows builds are not committed to git."
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
        <section>
          <h2 className="font-serif text-2xl text-white">Requirements</h2>
          <GlassCard className="mt-4">
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Node {SITE.nodeVersion}</li>
              <li>npm {SITE.npmVersion}</li>
              <li>~2–4 GB disk for QVAC model cache (first run)</li>
              <li>Windows for one-click Judge launcher and Electron builds</li>
            </ul>
          </GlassCard>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-white">Quick start (Windows judges)</h2>
          <CodeBlock
            className="mt-4"
            code={`git clone ${SITE.github}
cd KINKEEPER
${SITE.judgeLauncher}`}
          />
          <p className="mt-3 text-sm text-zinc-500">
            Opens browser at {SITE.judgeUrl} — click ▶ 3-Min Judge Demo after models cache.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-white">Developer setup</h2>
          <CodeBlock
            className="mt-4"
            code={`git clone ${SITE.github}
cd KINKEEPER
npm install
copy .env.example .env
npm run build:guardian-mesh
npm run dev:guardian-mesh`}
          />
        </section>

        <section>
          <h2 className="font-serif text-2xl text-white">Windows portable & installer</h2>
          <CodeBlock
            className="mt-4"
            code={`$env:CSC_IDENTITY_AUTO_DISCOVERY='false'
npm run pack -w @kinkeeper/guardian-desktop
npm run pack:installer -w @kinkeeper/guardian-desktop`}
          />
          <GlassCard className="mt-4 font-mono text-xs text-zinc-400">
            <p>release/guardian-desktop/KINKEEPER-Guardian-Mesh-Portable-0.1.0.exe</p>
            <p className="mt-1">release/guardian-desktop/KINKEEPER-Guardian-Mesh-0.1.0.exe</p>
          </GlassCard>
          <Callout variant="warning" className="mt-4">
            Binaries are unsigned — Windows SmartScreen may warn. Rebuild locally; EXEs are gitignored (~80 MB).
          </Callout>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-white">Source & GitHub</h2>
          <GlassCard>
            <p className="text-zinc-400">
              Full monorepo including engine, Judge UI, verification scripts, and scenario assets generator.
            </p>
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-violet-300 hover:underline"
            >
              {SITE.github}
            </a>
          </GlassCard>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-white">Verification after install</h2>
          <CodeBlock
            className="mt-4"
            code={`npm run guardian:verify
npm run guardian:scenarios
npm run guardian:telegram`}
          />
        </section>
      </div>
    </SiteLayout>
  );
}
