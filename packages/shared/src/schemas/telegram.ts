import { z } from "zod";

export const telegramLinkResponseSchema = z.object({
  token: z.string(),
  expiresInSeconds: z.number(),
  botUsername: z.string().optional(),
  instructions: z.string(),
});
