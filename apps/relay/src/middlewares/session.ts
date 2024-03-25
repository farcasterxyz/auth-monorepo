import { createMiddleware } from "hono/factory";
import { Redis } from "ioredis";
import { getConfig } from "../utils/getConfig.js";
import { RelayError } from "../utils/errors.js";
import { type Session } from "../types/session.js";

const config = getConfig();

export type SessionVariables = {
  session: {
    get: (token: string) => Promise<Session>;
    update: (token: string, channels: Session) => Promise<void>;
    create: (token: string) => Promise<void>;
    delete: (token: string) => Promise<void>;
  };
};

const { sessionTtl } = getConfig();

export const session = createMiddleware<{ Variables: SessionVariables }>(async (c, next) => {
  const redis = new Redis(config.redisUrl);

  c.set("session", {
    get: async (token) => {
      try {
        const serializedSession = await redis.get(token);
        if (!serializedSession) throw new RelayError("not_found", "Session not found");
        return JSON.parse(serializedSession);
      } catch (e) {
        if (e instanceof RelayError) throw e;

        throw new RelayError("unknown", e as Error);
      }
    },
    create: async (token) => {
      try {
        await redis.set(token, JSON.stringify({}), "EX", sessionTtl);
      } catch (e) {
        throw new RelayError("unknown", e as Error);
      }
    },
    update: async (token, channels) => {
      try {
        await redis.set(token, JSON.stringify(channels), "EX", sessionTtl);
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
