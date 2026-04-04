import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { generateSiweNonce } from "viem/siwe";
import { createChannelSchema, authenticateSchema } from "./schemas";
import type { ChannelStorage } from "./storage";
import { AddressService } from "./addresses";
import type { RelaySession, CreateChannelRequest, RelayConfig } from "./types";

const RESTRICTED_DOMAINS = ["farcaster.xyz"];

export interface RelayAppConfig {
  storage: ChannelStorage<RelaySession>;
  config: RelayConfig;
}

type Variables = {
  channelToken?: string;
};

const constructUrl = (urlBase: string, channelToken: string): string => {
  const params = { channelToken };
  const query = new URLSearchParams(params);
  return `${urlBase}?${query.toString()}`;
};

export function createRelayApp({ storage, config }: RelayAppConfig) {
  const app = new Hono<{ Variables: Variables }>();
  const addresses = new AddressService({
    hubUrl: config.hubUrl,
    hubFallbackUrl: config.hubFallbackUrl,
    optimismRpcUrl: config.optimismRpcUrl,
  });

  app.use("*", cors());

  app.get("/healthcheck", (c) => c.json({ status: "OK" }));

  const v1 = new Hono<{ Variables: Variables }>();

  v1.post("/channel", zValidator("json", createChannelSchema), async (c) => {
    const body = c.req.valid("json");

    if (RESTRICTED_DOMAINS.find((d) => body.domain.includes(d))) {
      return c.json({ error: "Domain not allowed" }, 400);
    }

    const channel = await storage.open();
    if (channel.isErr()) {
      return c.json({ error: channel.error.message }, 500);
    }

    const channelToken = channel.value;
    const nonce = body.nonce ?? generateSiweNonce();
    const acceptAuthAddress = body.acceptAuthAddress ?? true;
    const url = constructUrl(config.urlBase, channelToken);

    const update = await storage.update(channelToken, {
      state: "pending",
      nonce,
      url,
      connectUri: url,
      acceptAuthAddress,
      signatureParams: { ...body, nonce } as CreateChannelRequest,
      metadata: {
        userAgent: c.req.header("user-agent") ?? "Unknown",
        ip: c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip") ?? "unknown",
      },
    });

    if (update.isErr()) {
      return c.json({ error: update.error.message }, 500);
    }

    return c.json({ channelToken, url, connectUri: url, nonce }, 201);
  });

  const protectedRoutes = new Hono<{ Variables: Variables }>();

  protectedRoutes.use("*", async (c, next) => {
    const auth = c.req.header("authorization");
    const channelToken = auth?.split(" ")[1];
    if (!channelToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("channelToken", channelToken);
    return next();
  });

  protectedRoutes.post("/channel/authenticate", zValidator("json", authenticateSchema), async (c) => {
    const authKey = c.req.header("x-farcaster-auth-relay-key") ?? c.req.header("x-farcaster-connect-auth-key");
    if (authKey !== config.authKey) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channelToken = c.get("channelToken");
    if (!channelToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = c.req.valid("json");

    const addrs = await addresses.getAddresses(body.fid);
    if (addrs.isErr()) {
      return c.json({ error: addrs.error.message }, 500);
    }

    const channel = await storage.read(channelToken);
    if (channel.isErr()) {
      if (channel.error.errCode === "not_found") {
        return c.json({ error: "Unauthorized" }, 401);
      }
      return c.json({ error: channel.error.message }, 500);
    }

    const update = await storage.update(channelToken, {
      ...channel.value,
      state: "completed",
      message: body.message,
      signature: body.signature,
      authMethod: body.authMethod ?? "custody",
      fid: body.fid,
      username: body.username,
      displayName: body.displayName,
      bio: body.bio,
      pfpUrl: body.pfpUrl,
      ...addrs.value,
    });

    if (update.isErr()) {
      return c.json({ error: update.error.message }, 500);
    }

    return c.json(update.value, 201);
  });

  protectedRoutes.get("/channel/status", async (c) => {
    const channelToken = c.get("channelToken");
    if (!channelToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channel = await storage.read(channelToken);
    if (channel.isErr()) {
      if (channel.error.errCode === "not_found") {
        return c.json({ error: "Unauthorized" }, 401);
      }
      return c.json({ error: channel.error.message }, 500);
    }

    const { url: _url, connectUri: _connectUri, ...res } = channel.value;

    if (res.state === "completed") {
      const close = await storage.close(channelToken);
      if (close.isErr()) {
        return c.json({ error: close.error.message }, 500);
      }
      return c.json(res, 200);
    }

    return c.json(res, 202);
  });

  v1.route("/", protectedRoutes);
  app.route("/v1", v1);

  return app;
}
