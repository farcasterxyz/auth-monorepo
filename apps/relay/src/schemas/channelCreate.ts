import { z } from "zod";

export const channelCreateSchema = z.object({
  siweUri: z.string().url(),
  domain: z.string(),
  nonce: z.string().optional(),
  notBefore: z.string().optional(),
  expirationTime: z.string().optional(),
  requestId: z.string().optional(),
});

export type ChannelCreateParameters = z.infer<typeof channelCreateSchema>;
