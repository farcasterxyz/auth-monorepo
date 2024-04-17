import { createPublicClient, http } from "viem";
import { optimism } from "viem/chains";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const schema = z.object({
  corsOrigin: z.string(),
  redisUrl: z.string().url(),
  channelTtl: z.coerce.number(),
  port: z.number().optional().default(8000),
  host: z.string().optional().default("localhost"),
  baseUrl: z.string().url().optional().default("https://warpcast.com/~/sign-in-with-farcaster"),
  hubUrl: z.string().url().optional().default("https://nemes.farcaster.xyz:2281"),
  hubFallbackUrl: z.string().url().optional().default("https://hoyt.farcaster.xyz:2281"),
  optimismRpcUrl: z.string().url().optional().default("https://mainnet.optimism.io"),
  authKey: z.string(),
});

export function getConfig() {
  const parseResult = schema.safeParse({
    corsOrigin: process.env.CORS_ORIGIN,
    redisUrl: process.env.REDIS_URL,
    channelTtl: process.env.CHANNEL_TTL,
    port: process.env.PORT,
    host: process.env.HOST,
    baseUrl: process.env.BASE_URL,
    hubUrl: process.env.HUB_URL,
    hubFallbackUrl: process.env.HUB_FALLBACK_URL,
    optimismRpcUrl: process.env.OPTIMISM_RPC_URL,
    authKey: process.env.AUTH_KEY,
  });

  if (!parseResult.success) {
    throw fromZodError(parseResult.error);
  }
  const env = parseResult.data;

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(env.optimismRpcUrl),
  });

  return { ...env, publicClient };
}
