import { serve, type ServerType } from "@hono/node-server";
import { createRelayApp, type RelaySession } from "@farcaster/relay-core";
import { RedisChannelStorage } from "./storage/redis";
import { AUTH_KEY, URL_BASE, HUB_URL, HUB_FALLBACK_URL, OPTIMISM_RPC_URL } from "./env";

interface RelayServerConfig {
  redisUrl: string;
  ttl: number;
  corsOrigin: string;
}

export class RelayServer {
  private storage: RedisChannelStorage<RelaySession>;
  private server: ServerType | null = null;
  app;

  constructor({ redisUrl, ttl }: RelayServerConfig) {
    this.storage = new RedisChannelStorage<RelaySession>({
      redisUrl,
      ttl,
    });

    this.app = createRelayApp({
      storage: this.storage,
      config: {
        urlBase: URL_BASE,
        authKey: AUTH_KEY,
        hubUrl: HUB_URL,
        hubFallbackUrl: HUB_FALLBACK_URL,
        optimismRpcUrl: OPTIMISM_RPC_URL,
      },
    });
  }

  async start(host = "0.0.0.0", port = 8000): Promise<string> {
    return new Promise((resolve) => {
      this.server = serve({
        fetch: this.app.fetch,
        hostname: host,
        port,
      });

      this.server.on("listening", () => {
        const address = this.server?.address();
        const actualPort = typeof address === "object" && address ? address.port : port;
        console.log(`Relay server started on http://${host}:${actualPort}`);
        resolve(`http://${host}:${actualPort}`);
      });
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    await this.storage.stop?.();
    console.log("Stopped relay server");
  }

  get channels() {
    return this.storage;
  }
}
