import type { Hex } from "viem";
import { z } from "zod";

export const sessionAuthenticateSchema = z.object({
  message: z.string() /*.url()?*/,
  signature: z.custom<Hex>((val) => /^0x[a-fA-F0-9]{130}$/.test(val as string)),
  fid: z.number(),
  username: z.string().regex(/^[a-z0-9][a-z0-9-]{0,15}$|^[a-z0-9][a-z0-9-]{0,15}\\.eth$/),
  bio: z.string(),
  displayName: z.string(),
  pfpUrl: z.string().url(),
});
export type SessionAuthenticateParameters = z.infer<typeof sessionAuthenticateSchema>;
