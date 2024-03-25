import { createMiddleware } from "hono/factory";
import { Redis } from "ioredis";
import { getConfig } from "../utils/getConfig";
import { Hex } from "viem";
import { RelayError } from "../utils/errors";

const config = getConfig();

export type ChannelVariables = {
  channels: {
    get: (token: string) => Promise<Channel>;
    update: (token: string, channels: Channel) => Promise<void>;
    create: (token: string) => Promise<void>;
    delete: (token: string) => Promise<void>;
  };
};

export type PendingChannel = { state: "pending"; nonce: string; url: string };
export type CompletedChannel = {
  state: "completed";
  message: string;
  signature: `0x${string}`;
  fid: number;
  username: string;
  bio: string;
  displayName: string;
  pfpUrl: string;
  verifications: Hex[];
  custody: Hex;
  nonce: string;
  url: string;
};

export type Channel = PendingChannel | CompletedChannel;

const { channelTtl } = getConfig();

export const channels = createMiddleware<{ Variables: ChannelVariables }>(async (c, next) => {
  const redis = new Redis(config.redisUrl);

  c.set("channels", {
    get: async (token) => {
      try {
        const serializedChannel = await redis.get(token);
        if (!serializedChannel) throw new RelayError("not_found", "Channel not found");
        return JSON.parse(serializedChannel);
      } catch (e) {
        if (e instanceof RelayError) throw e;

        throw new RelayError("unknown", e as Error);
      }
    },
    create: async (token) => {
      try {
        await redis.set(token, JSON.stringify({}), "EX", channelTtl);
      } catch (e) {
        throw new RelayError("unknown", e as Error);
      }
    },
    update: async (token, channels) => {
      try {
        await redis.set(token, JSON.stringify(channels), "KEEPTTL");
      } catch (e) {
        throw new RelayError("unknown", e as Error);
      }
    },
    delete: async (token) => {
      try {
        await redis.del(token);
      } catch (e) {
        throw new RelayError("unknown", e as Error);
      }
    },
  });
  await next();
});
