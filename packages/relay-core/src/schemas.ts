import { z } from "zod";

export const createChannelSchema = z.object({
  siweUri: z.string(),
  domain: z.string(),
  nonce: z.string().optional(),
  notBefore: z.string().optional(),
  expirationTime: z.string().optional(),
  requestId: z.string().optional(),
  redirectUrl: z.string().optional(),
  acceptAuthAddress: z.boolean().optional(),
});

export const authenticateSchema = z.object({
  message: z.string(),
  signature: z.string(),
  authMethod: z.enum(["custody", "authAddress"]).optional(),
  fid: z.number(),
  username: z.string(),
  bio: z.string(),
  displayName: z.string(),
  pfpUrl: z.string(),
});

export type CreateChannelSchemaInput = z.infer<typeof createChannelSchema>;
export type AuthenticateSchemaInput = z.infer<typeof authenticateSchema>;
