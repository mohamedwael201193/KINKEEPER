import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface JwtPayload {
  sub: string;
  familyId: string | null;
  role: string;
}
