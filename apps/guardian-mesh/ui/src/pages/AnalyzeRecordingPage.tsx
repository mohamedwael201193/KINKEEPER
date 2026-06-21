import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PremiumAnalysisResult } from "@/components/PremiumAnalysisResult";
import { FileUploadZone, AUDIO_ACCEPT } from "@/components/FileUploadZone";
import { PipelineProgress } from "@/components/PipelineProgress";
import { usePipelineAnalysis } from "@/lib/usePipelineAnalysis";

export function AnalyzeRecordingPage() {
  const [providerKey, setProviderKey] = useState<string | null>(null);
  const { steps, running, error, result, analyze, reset } = usePipelineAnalysis(api.uploadAudio);

  useEffect(() => {
    api.status().then((s) => setProviderKey(s.providerPublicKey)).catch(console.error);
  }, [result]);

  return (
    <div className="page-shell">
      <p className="section-eyebrow">Audio analysis</p>
      <h1 className="page-title mt-2">Analyze Recording</h1>
      <p className="page-subtitle">Upload a call recording for real local QVAC analysis. Supported: WAV, MP3, M4A, AAC.</p>

      {!result && !running && (
        <div className="mt-10">
          <FileUploadZone accept={AUDIO_ACCEPT} label="Drop your recording here" hint="Real pipeline · drag & drop or browse" onFile={analyze} disabled={running} />
        </div>
      )}

      {(running || result) && (
        <div className="mt-10 space-y-8">
          {running && steps.length > 0 && <PipelineProgress steps={steps} />}
          {error && <p className="rounded-xl border border-block/30 bg-block/10 p-4 text-sm text-block">{error}</p>}
          {result && <PremiumAnalysisResult result={result} providerKey={providerKey} />}
          {result && (
            <button type="button" className="btn-secondary" onClick={reset}>Analyze another recording</button>
          )}
        </div>
      )}
    </div>
  );
}
