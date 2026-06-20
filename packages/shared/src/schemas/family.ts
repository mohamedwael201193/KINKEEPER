import { z } from "zod";

export const createFamilySchema = z.object({
  name: z.string().min(1).max(200),
});

export const createElderSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  timezone: z.string().min(1).default("UTC"),
});

export const registerDeviceSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(["cognition_node", "elder_phone", "caregiver_phone", "archive_node"]),
  hardwareModel: z.string().optional(),
  os: z.string().optional(),
  meshPublicKey: z.string().optional(),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type CreateElderInput = z.infer<typeof createElderSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
