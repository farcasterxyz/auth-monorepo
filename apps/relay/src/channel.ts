import { randomUUID } from "crypto";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { z } from "zod";
import { generateNonce } from "siwe";
import { fromZodError } from "zod-validation-error";
import { auth } from "./middlewares/auth.js";
import { channel as channelMiddleware } from "./middlewares/channel.js";
import { getAddresses } from "./utils/getAddresses.js";
import { getConfig } from "./utils/getConfig.js";
import { RelayError } from "./utils/errors.js";
import { channelCreateSchema } from "./schemas/channelCreate.js";
import { channelAuthenticateSchema } from "./schemas/channelAuthenticate.js";
import type { ChannelAuthenticateReturnType, ChannelCreateReturnType, ChannelGetReturnType } from "./types/actions.js";

const { baseUrl, authKey } = getConfig();

export const channel = new Hono().use(
  rateLimiter({
    limit: 1000,
  }),
  channelMiddleware,
);

function constructUrl(
  parameters: { channelToken: string; nonce: string } & z.infer<typeof channelCreateSchema>,
): string {
  const query = new URLSearchParams(parameters);
  return `${baseUrl}?${query.toString()}`;
}

channel.on("POST", ["/channel", "/connect"], async (c) => {
  const parseResult = channelCreateSchema.safeParse(c.req.json());
  if (!parseResult.success) {
    c.status(400);
    return c.json({ error: "Validation error", message: fromZodError(parseResult.error) });
  }
  const body = parseResult.data;

  const channelToken = randomUUID();
  try {
    await c.var.channel.create(channelToken);

    const nonce = body.nonce ?? generateNonce();
    const url = constructUrl({ channelToken, nonce, ...body });

    const pendingChannel = {
      state: "pending",
      nonce,
      url,
      channelToken,
    } as const satisfies ChannelCreateReturnType;

    await c.var.channel.update(channelToken, pendingChannel);
    c.status(201);
    return c.json(pendingChannel);
  } catch (e) {
    if (!(e instanceof RelayError)) throw new Error("Unexpected error");

    c.status(500);
    return c.json({ error: e.message });
  }
});

channel.post("/(connect|channel)/authenticate", auth, async (c) => {
  const reqAuthKey = c.req.header("x-farcaster-auth-relay-key") ?? c.req.header("x-farcaster-connect-auth-key");
  if (reqAuthKey !== authKey) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }

  try {
    const parseResult = channelAuthenticateSchema.safeParse(c.req.json());
    if (!parseResult.success) {
      c.status(400);
      return c.json({ error: "Validation error", message: fromZodError(parseResult.error) });
    }
    const { message, signature, fid, username, displayName, bio, pfpUrl } = parseResult.data;

    const addresses = await getAddresses(fid);

    const channel = await c.var.channel.get(c.var.channelToken);

    const result = {
      ...channel,
      state: "completed",
      message,
      signature,
      fid,
      username,
      displayName,
      bio,
      pfpUrl,
      ...addresses,
    } satisfies ChannelAuthenticateReturnType;
    c.status(201);
    return c.json(result);
  } catch (e) {
    c.status(500);

    if (e instanceof RelayError) {
      if (e.errCode === "not_found") {
        c.status(401);
        return c.json({ error: "Unauthorized" });
      }
      return c.json({ error: e.message });
    }

    return c.json({ error: new RelayError("unavailable", e as Error).message });
  }
});

channel.get("/(connect|channel)/status", auth, async (c) => {
  try {
    const channel = (await c.var.channel.get(c.var.channelToken)) satisfies ChannelGetReturnType;
    if (channel.state === "completed") {
      try {
        await c.var.channel.delete(c.var.channelToken);
      } catch (e) {
        if (!(e instanceof RelayError)) throw new Error("Unexpected error");
        c.status(500);
        return c.json({ error: e.message });
      }
      return c.json(channel);
    }
    c.status(202);
    return c.json(channel);
  } catch (e) {
    if (!(e instanceof RelayError)) throw new Error("Unexpected error");

    if (e.errCode === "not_found") {
      c.status(401);
      return c.json({ error: "Unauthorized" });
    }

    c.status(500);
    return c.json({ error: e.message });
  }
});
