import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { GuardianIncidentResult } from "@/lib/types";
import type { ProcessingStep } from "@/lib/types";

export function usePipelineAnalysis(
  uploadFn: (file: File) => Promise<{ ok: boolean; result: GuardianIncidentResult }>,
) {
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuardianIncidentResult | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPoll = useCallback(() => {
    stopPoll();
    pollRef.current = setInterval(() => {
      api.processing().then((s) => setSteps(s.steps)).catch(() => undefined);
    }, 400);
  }, [stopPoll]);

  useEffect(() => () => stopPoll(), [stopPoll]);

  const analyze = useCallback(
    async (file: File) => {
      setRunning(true);
      setError(null);
      setResult(null);
      setSteps([]);
      startPoll();
      try {
        const res = await uploadFn(file);
        stopPoll();
        const final = await api.processing();
        setSteps(final.steps);
        setResult(res.result);
      } catch (e) {
        stopPoll();
        setError(e instanceof Error ? e.message : "Analysis failed");
        const final = await api.processing().catch(() => null);
        if (final) setSteps(final.steps);
      } finally {
        setRunning(false);
      }
    },
    [uploadFn, startPoll, stopPoll],
  );

  const analyzeScenario = useCallback(
    async (run: () => Promise<{ ok: boolean; result: GuardianIncidentResult }>) => {
      setRunning(true);
      setError(null);
      setResult(null);
      startPoll();
      try {
        const res = await run();
        stopPoll();
        const final = await api.processing();
        setSteps(final.steps);
        setResult(res.result);
      } catch (e) {
        stopPoll();
        setError(e instanceof Error ? e.message : "Analysis failed");
      } finally {
        setRunning(false);
      }
    },
    [startPoll, stopPoll],
  );

  const reset = useCallback(() => {
    setResult(null);
    setSteps([]);
    setError(null);
  }, []);

  return { steps, running, error, result, analyze, analyzeScenario, reset };
}
