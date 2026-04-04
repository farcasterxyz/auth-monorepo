import { createRelayApp, type RelaySession } from "@farcaster/relay-core";
import { KVChannelStorage } from "./storage/kv";

export interface Env {
  RELAY_KV: KVNamespace;
  AUTH_KEY: string;
  URL_BASE: string;
  HUB_URL: string;
  HUB_FALLBACK_URL: string;
  OPTIMISM_RPC_URL: string;
  CHANNEL_TTL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const storage = new KVChannelStorage<RelaySession>({
      kv: env.RELAY_KV,
      ttl: Number.parseInt(env.CHANNEL_TTL, 10) || 3600,
    });

    const app = createRelayApp({
      storage,
      config: {
        urlBase: env.URL_BASE,
        authKey: env.AUTH_KEY,
        hubUrl: env.HUB_URL,
        hubFallbackUrl: env.HUB_FALLBACK_URL,
        optimismRpcUrl: env.OPTIMISM_RPC_URL,
      },
    });

    return app.fetch(request);
  },
};
