import { z } from "zod";

export const cognoscenteAnalysisSchema = z.object({
  wordFindingLatencySec: z.number(),
  semanticDrift: z.number().min(0).max(1),
  repetition: z.number().int().min(0),
  sentiment: z.number().min(-1).max(1),
  confabulationMarkers: z.array(z.string()),
  compositeDeviation: z.number().min(0).max(1),
  alert: z.boolean(),
  reasoning: z.string(),
});

export const checkInSchema = z.object({
  elderId: z.string().min(1),
});

export type CognoscenteAnalysis = z.infer<typeof cognoscenteAnalysisSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
