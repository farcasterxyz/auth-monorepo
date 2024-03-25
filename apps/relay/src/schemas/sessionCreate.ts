import { z } from "zod";

export const sessionCreateSchema = z.object({
  siweUri: z.string().url(),
  domain: z.string(),
  nonce: z.string().optional(),
  notBefore: z.string().optional(),
  expirationTime: z.string().optional(),
  requestId: z.string().optional(),
});

export type SessionCreateParameters = z.infer<typeof sessionCreateSchema>;
