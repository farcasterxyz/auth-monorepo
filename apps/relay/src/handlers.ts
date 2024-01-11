import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AUTH_KEY, URL_BASE } from "./env";
import { Logger } from "logger";
import { generateNonce } from "siwe";

export type CreateChannelRequest = {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
};

export type AuthenticateRequest = {
  message: string;
  signature: string;
  fid: number;
  username: string;
  bio: string;
  displayName: string;
  pfpUrl: string;
};

export type RelaySession = {
  state: "pending" | "completed";
  nonce: string;
  url: string;
  connectUri: string;
  message?: string;
  signature?: string;
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
};

const constructUrl = (channelToken: string, nonce: string, extraParams: CreateChannelRequest): string => {
  const params = { channelToken, nonce, ...extraParams };
  const query = new URLSearchParams(params);
  return `${URL_BASE}?${query.toString()}`;
};

export async function createChannel(request: FastifyRequest<{ Body: CreateChannelRequest }>, reply: FastifyReply) {
  const channel = await request.channels.open();
  if (channel.isOk()) {
    const channelToken = channel.value;
    const nonce = request.body.nonce ?? generateNonce();
    const url = constructUrl(channelToken, nonce, request.body);

    const update = await request.channels.update(channelToken, {
      state: "pending",
      nonce,
      url,
      connectUri: url,
    });
    if (update.isOk()) {
      reply.code(201).send({ channelToken, url, connectUri: url, nonce });
    } else {
      reply.code(500).send({ error: update.error.message });
    }
  } else {
    reply.code(500).send({ error: channel.error.message });
  }
}

export async function authenticate(request: FastifyRequest<{ Body: AuthenticateRequest }>, reply: FastifyReply) {
  const authKey = request.headers["x-farcaster-auth-relay-key"] || request.headers["x-farcaster-connect-auth-key"];
  if (authKey !== AUTH_KEY) reply.code(401).send({ error: "Unauthorized" });

  const channelToken = request.channelToken;
  const { message, signature, fid, username, displayName, bio, pfpUrl } = request.body;

  const channel = await request.channels.read(channelToken);
  if (channel.isOk()) {
    const update = await request.channels.update(channelToken, {
      ...channel.value,
      state: "completed",
      message,
      signature,
      fid,
      username,
      displayName,
      bio,
      pfpUrl,
    });
    if (update.isOk()) {
      reply.code(201).send(update.value);
    } else {
      reply.code(500).send({ error: update.error.message });
    }
  } else {
    if (channel.error.errCode === "not_found") reply.code(401).send({ error: "Unauthorized " });
    reply.code(500).send({ error: channel.error.message });
  }
}

export async function status(request: FastifyRequest, reply: FastifyReply) {
  const channel = await request.channels.read(request.channelToken);
  if (channel.isOk()) {
    const { url, connectUri, ...res } = channel.value;
    if (res.state === "completed") {
      const close = await request.channels.close(request.channelToken);
      if (close.isErr()) {
        reply.code(500).send({ error: close.error.message });
      }
      reply.code(200).send(res);
    } else {
      reply.code(202).send(res);
    }
  } else {
    if (channel.error.errCode === "not_found") reply.code(401).send({ error: "Unauthorized" });
    reply.code(500).send({ error: channel.error.message });
  }
}

export async function handleError(log: Logger, error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const { validation, statusCode } = error;
  if (validation) {
    reply.status(400).send({ error: "Validation error", message: error.message });
  } else if (statusCode) {
    reply.code(statusCode);
    if (statusCode < 500) reply.send({ error: error.message });
  } else {
    log.error({ err: error, errMsg: error.message, request }, "Error in http request");
    reply.code(500).send({ error: error.message });
  }
}
