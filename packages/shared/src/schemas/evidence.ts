import { z } from "zod";

export const evidenceExportSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  agent: z.enum(["sentinel", "cognoscente", "chronicler", "coordinator", "all"]).default("all"),
  format: z.enum(["json", "csv"]).default("json"),
});

export type EvidenceExportInput = z.infer<typeof evidenceExportSchema>;
