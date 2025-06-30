import type { StatusAPIResponse } from "../app/status";
import { post, type HttpResponse } from "../../clients/transports/http";
import type { Client } from "../../clients/createClient";
import { type AsyncUnwrapped, unwrap } from "../../errors";
import type { AuthMethod } from "types";

export interface AuthenticateArgs extends AuthenticateRequest {
  authKey: string;
  channelToken: string;
}

export type AuthenticateResponse = AsyncUnwrapped<HttpResponse<AuthenticateAPIResponse>>;

interface AuthenticateRequest {
  message: string;
  signature: `0x${string}`;
  authMethod?: AuthMethod;
  fid: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
}

export type AuthenticateAPIResponse = StatusAPIResponse;

const path = "channel/authenticate";

export const authenticate = async (
  client: Client,
  { channelToken, authKey, ...request }: AuthenticateArgs,
): AuthenticateResponse => {
  const result = await post<AuthenticateRequest, AuthenticateAPIResponse>(client, path, request, {
    authToken: channelToken,
    headers: {
      "X-Farcaster-Auth-Relay-Key": authKey,
    },
  });
  return unwrap(result);
};
