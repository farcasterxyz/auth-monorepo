import { randomUUID } from "crypto";
import { Hono } from "hono";
import { generateNonce } from "siwe";
import { z } from "zod";
import { rateLimiter } from "hono-rate-limiter";
import { channels as channelsMiddleware } from "./middlewares/channels";
import { getConfig } from "./utils/getConfig";
import { RelayError } from "./utils/errors";
import { fromZodError } from "zod-validation-error";

const { baseUrl } = getConfig();

export const channels = new Hono().use(
  rateLimiter({
    limit: 1000,
  }),
  channelsMiddleware,
);

function constructUrl(parameters: { channelToken: string; nonce: string } & z.infer<typeof createSchema>): string {
  const query = new URLSearchParams(parameters);
  return `${baseUrl}?${query.toString()}`;
}

const createSchema = z.object({
  siweUri: z.string().url(),
  domain: z.string(),
  nonce: z.string().optional(),
  notBefore: z.string().optional(),
  expirationTime: z.string().optional(),
  requestId: z.string().optional(),
});

channels.post("/create", async (c) => {
  const parseResult = createSchema.safeParse(c.req.json());
  if (!parseResult.success) {
    c.status(400);
    return c.json({ error: "Validation error", message: fromZodError(parseResult.error) });
  }
  const body = parseResult.data;

  const channelToken = randomUUID();
  try {
    await c.var.channels.create(channelToken);

    const nonce = body.nonce ?? generateNonce();
    const connectUri = constructUrl({ channelToken, nonce, ...body });

    const pendingChannel = {
      state: "pending",
      nonce,
      url: connectUri,
      connectUri,
    } as const;

    await c.var.channels.update(channelToken, pendingChannel);
    c.status(201);
    return c.json(pendingChannel);
  } catch (e) {
    if (!(e instanceof RelayError)) throw new Error("Unexpected error");

    c.status(500);
    return c.json({ error: e.message });
  }
});
