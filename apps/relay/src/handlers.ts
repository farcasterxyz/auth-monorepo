import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import type { Hex } from "viem";
import { AUTH_KEY, URL_BASE } from "./env";
import { generateNonce } from "siwe";

export type CreateChannelRequest = {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
  redirectUrl?: string;
  acceptAuthAddress?: boolean;
};

export type AuthenticateRequest = {
  message: string;
  signature: string;
  authMethod?: "custody" | "authAddress";
  fid: number;
  username: string;
  bio: string;
  displayName: string;
  pfpUrl: string;
};

export type SessionMetadata = {
  ip: string;
  userAgent: string;
};

export type RelaySession = {
  state: "pending" | "completed";
  nonce: string;
  url: string;
  connectUri: string;
  message?: string;
  signature?: string;
  authMethod?: "custody" | "authAddress";
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
  verifications?: string[];
  custody?: Hex;
  signatureParams: CreateChannelRequest;
  metadata: SessionMetadata;
  acceptAuthAddress: boolean;
};

const constructUrl = (channelToken: string): string => {
  const params = { channelToken };
  const query = new URLSearchParams(params);
  return `${URL_BASE}?${query.toString()}`;
};

export async function createChannel(request: FastifyRequest<{ Body: CreateChannelRequest }>, reply: FastifyReply) {
  const channel = await request.channels.open();
  if (channel.isOk()) {
    const channelToken = channel.value;
    const nonce = request.body.nonce ?? generateNonce();
    const acceptAuthAddress = request.body.acceptAuthAddress ?? false;
    const url = constructUrl(channelToken);

    const update = await request.channels.update(channelToken, {
      state: "pending",
      nonce,
      url,
      connectUri: url,
      acceptAuthAddress,
      signatureParams: { ...request.body, nonce },
      metadata: {
        userAgent: request.headers["user-agent"] ?? "Unknown",
        ip: request.ip,
      },
    });
    if (update.isOk()) {
      return reply.code(201).send({ channelToken, url, connectUri: url, nonce });
    } else {
      return reply.code(500).send({ error: update.error.message });
    }
  } else {
    return reply.code(500).send({ error: channel.error.message });
  }
}

export async function authenticate(request: FastifyRequest<{ Body: AuthenticateRequest }>, reply: FastifyReply) {
  const authKey = request.headers["x-farcaster-auth-relay-key"] || request.headers["x-farcaster-connect-auth-key"];
  if (authKey !== AUTH_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const channelToken = request.channelToken;
  const { message, signature, authMethod, fid, username, displayName, bio, pfpUrl } = request.body;

  const addrs = await request.addresses.getAddresses(fid);
  if (addrs.isOk()) {
    const channel = await request.channels.read(channelToken);
    if (channel.isOk()) {
      const update = await request.channels.update(channelToken, {
        ...channel.value,
        state: "completed",
        message,
        signature,
        authMethod: authMethod ?? "custody",
        fid,
        username,
        displayName,
        bio,
        pfpUrl,
        ...addrs.value,
      });
      if (update.isOk()) {
        return reply.code(201).send(update.value);
      } else {
        return reply.code(500).send({ error: update.error.message });
      }
    } else {
      if (channel.error.errCode === "not_found") {
        return reply.code(401).send({ error: "Unauthorized " });
      }
      return reply.code(500).send({ error: channel.error.message });
    }
  } else {
    return reply.code(500).send({ error: addrs.error.message });
  }
}

export async function status(request: FastifyRequest, reply: FastifyReply) {
  const channel = await request.channels.read(request.channelToken);
  if (channel.isOk()) {
    const { url, connectUri, ...res } = channel.value;
    if (res.state === "completed") {
      const close = await request.channels.close(request.channelToken);
      if (close.isErr()) {
        return reply.code(500).send({ error: close.error.message });
      }
      return reply.code(200).send(res);
    } else {
      return reply.code(202).send(res);
    }
  } else {
    if (channel.error.errCode === "not_found") {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    return reply.code(500).send({ error: channel.error.message });
  }
}

export async function handleError(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const { validation, statusCode } = error;
  if (validation) {
    return reply.status(400).send({ error: "Validation error", message: error.message });
  }
  if (statusCode && statusCode < 500) {
    return reply.code(statusCode).send({ error: error.message });
  } else {
    request.log.error({ err: error, errMsg: error.message, request }, "Server error");
    return reply.code(500).send({ error: error.message });
  }
}
