import { Hono } from "hono";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { auth } from "./middlewares/auth";
import { channels } from "./middlewares/channels";
import { RelayError } from "./utils/errors";
import { getAddresses } from "./utils/getAddresses";
import { getConfig } from "./utils/getConfig";

const { authKey } = getConfig();

export const connect = new Hono().use(channels, auth);

const authenticateSchema = z.object({
  message: z.string() /*.url()?*/,
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
  fid: z.number(),
  username: z.string().regex(/^[a-z0-9][a-z0-9-]{0,15}$|^[a-z0-9][a-z0-9-]{0,15}\\.eth$/).optional(),
  bio: z.string().optional(),
  displayName: z.string().optional(),
  pfpUrl: z.string().url().optional(),
});

connect.post("/authenticate", auth, async (c) => {
  const reqAuthKey = c.req.header("x-farcaster-auth-relay-key") ?? c.req.header("x-farcaster-connect-auth-key");
  if (reqAuthKey !== authKey) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }

  try {
    const parseResult = authenticateSchema.safeParse(c.req.json());
    if (!parseResult.success) {
      c.status(400);
      return c.json({ error: "Validation error", message: fromZodError(parseResult.error) });
    }
    const { message, signature, fid, username, displayName, bio, pfpUrl } = parseResult.data;

    const addresses = await getAddresses(fid);

    const channel = await c.var.channels.get(c.var.channelToken);

    c.status(201);
    return c.json({
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
    });
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

connect.get("/status", async (c) => {
  try {
    const channel = await c.var.channels.get(c.var.channelToken);
    if (channel.state === "completed") {
      try {
        await c.var.channels.delete(c.var.channelToken);
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
