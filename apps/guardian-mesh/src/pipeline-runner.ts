import type { PipelineHooks } from "@kinkeeper/guardian-mesh";
import { applyEngineStage } from "./processing-state.js";

export function pipelineHooks(): PipelineHooks {
  return { onStage: (stage) => applyEngineStage(stage) };
}
