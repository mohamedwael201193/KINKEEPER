import { z } from "zod";

export const sentinelClassificationSchema = z.object({
  classification: z.enum(["SCAM", "UNCERTAIN", "LEGITIMATE"]),
  confidence: z.number().min(0).max(1),
  scamType: z.string().optional(),
  reasoning: z.string(),
  techniquesIdentified: z.array(z.string()).optional(),
  informationRequested: z.array(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
});

export const callRecordingSchema = z.object({
  elderId: z.string().min(1),
  transcript: z.string().optional(),
  initialClassification: z.enum(["SCAM", "UNCERTAIN", "LEGITIMATE"]).optional(),
  initialConfidence: z.number().min(0).max(1).optional(),
  initialReasoning: z.string().optional(),
});

export type SentinelClassification = z.infer<typeof sentinelClassificationSchema>;
export type CallRecordingInput = z.infer<typeof callRecordingSchema>;
