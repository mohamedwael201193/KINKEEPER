import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { PremiumAnalysisResult } from "@/components/PremiumAnalysisResult";
import { FileUploadZone } from "@/components/FileUploadZone";
import { PipelineProgress } from "@/components/PipelineProgress";
import { usePipelineAnalysis } from "@/lib/usePipelineAnalysis";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,image/*";

export function AnalyzeDocumentPage() {
  const [providerKey, setProviderKey] = useState<string | null>(null);
  const { steps, running, error, result, analyze, reset } = usePipelineAnalysis(api.uploadImage);

  useEffect(() => {
    api.status().then((s) => setProviderKey(s.providerPublicKey)).catch(console.error);
  }, [result]);

  return (
    <div className="page-shell">
      <p className="section-eyebrow">Document analysis</p>
      <h1 className="page-title mt-2">Analyze Document</h1>
      <p className="page-subtitle">Upload suspicious letters or invoices. OCR runs locally via QVAC. PNG, JPG, JPEG.</p>

      {!result && !running && (
        <div className="mt-10">
          <FileUploadZone accept={IMAGE_ACCEPT} label="Drop your document here" hint="PNG, JPG, or JPEG" onFile={analyze} disabled={running} />
        </div>
      )}

      {(running || result) && (
        <div className="mt-10 space-y-8">
          {running && steps.length > 0 && <PipelineProgress steps={steps} />}
          {error && <p className="rounded-xl border border-block/30 bg-block/10 p-4 text-sm text-block">{error}</p>}
          {result && <PremiumAnalysisResult result={result} providerKey={providerKey} />}
          {result && <button type="button" className="btn-secondary" onClick={reset}>Analyze another document</button>}
        </div>
      )}

      <p className="mt-10 text-xs text-steel">
        Sample invoice available in{" "}
        <Link to="/demo" className="text-accent-soft hover:underline">Demo Center</Link> (Scenario B).
      </p>
    </div>
  );
}
