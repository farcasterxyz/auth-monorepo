import { createMiddleware } from "hono/factory";
import { Redis } from "ioredis";
import { getConfig } from "../utils/getConfig.js";
import { RelayError } from "../utils/errors.js";
import { type Channel } from "../types/channel.js";

const config = getConfig();

export type ChannelVariables = {
  channel: {
    get: (token: string) => Promise<Channel>;
    update: (token: string, channels: Channel) => Promise<void>;
    create: (token: string) => Promise<void>;
    delete: (token: string) => Promise<void>;
  };
};

const { channelTtl } = getConfig();

export const channel = createMiddleware<{ Variables: ChannelVariables }>(async (c, next) => {
  const redis = new Redis(config.redisUrl);

  c.set("channel", {
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
        await redis.set(token, JSON.stringify(channels), "EX", channelTtl);
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
