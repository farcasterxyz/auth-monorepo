import { randomUUID } from "crypto";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { z } from "zod";
import { generateNonce } from "siwe";
import { fromZodError } from "zod-validation-error";
import { auth } from "./middlewares/auth.js";
import { session as sessionMiddleware } from "./middlewares/session.js";
import { getAddresses } from "./utils/getAddresses.js";
import { getConfig } from "./utils/getConfig.js";
import { RelayError } from "./utils/errors.js";
import { sessionCreateSchema } from "./schemas/sessionCreate.js";
import { sessionAuthenticateSchema } from "./schemas/sessionAuthenticate.js";
import type { SessionAuthenticateReturnType, SessionCreateReturnType, SessionGetReturnType } from "./types/actions.js";

const { baseUrl, authKey } = getConfig();

export const session = new Hono().use(
  rateLimiter({
    limit: 1000,
  }),
  sessionMiddleware,
);

function constructUrl(
  parameters: { sessionToken: string; nonce: string } & z.infer<typeof sessionCreateSchema>,
): string {
  const query = new URLSearchParams(parameters);
  return `${baseUrl}?${query.toString()}`;
}

session.post("/create", async (c) => {
  const parseResult = sessionCreateSchema.safeParse(c.req.json());
  if (!parseResult.success) {
    c.status(400);
    return c.json({ error: "Validation error", message: fromZodError(parseResult.error) });
  }
  const body = parseResult.data;

  const sessionToken = randomUUID();
  try {
    await c.var.session.create(sessionToken);

    const nonce = body.nonce ?? generateNonce();
    const url = constructUrl({ sessionToken, nonce, ...body });

    const pendingSession = {
      status: "pending",
      nonce,
      url,
      sessionToken,
    } as const satisfies SessionCreateReturnType;

    await c.var.session.update(sessionToken, pendingSession);
    c.status(201);
    return c.json(pendingSession);
  } catch (e) {
    if (!(e instanceof RelayError)) throw new Error("Unexpected error");

    c.status(500);
    return c.json({ error: e.message });
  }
});

session.post("/authenticate", auth, async (c) => {
  const reqAuthKey = c.req.header("x-farcaster-auth-relay-key") ?? c.req.header("x-farcaster-connect-auth-key");
  if (reqAuthKey !== authKey) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }

  try {
    const parseResult = sessionAuthenticateSchema.safeParse(c.req.json());
    if (!parseResult.success) {
      c.status(400);
      return c.json({ error: "Validation error", message: fromZodError(parseResult.error) });
    }
    const { message, signature, fid, username, displayName, bio, pfpUrl } = parseResult.data;

    const addresses = await getAddresses(fid);

    const session = await c.var.session.get(c.var.sessionToken);

    const result = {
      ...session,
      status: "completed",
      message,
      signature,
      fid,
      username,
      displayName,
      bio,
      pfpUrl,
      ...addresses,
    } satisfies SessionAuthenticateReturnType;
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

session.get("/", auth, async (c) => {
  try {
    const session = (await c.var.session.get(c.var.sessionToken)) satisfies SessionGetReturnType;
    if (session.status === "completed") {
      return c.json(session);
    }
    c.status(202);
    return c.json(session);
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
