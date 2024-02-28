import { StatusAPIResponse } from "../app/status";
import { post, HttpResponse } from "../../clients/transports/http";
import { Client } from "../../clients/createClient";

export interface AuthenticateArgs extends AuthenticateRequest {
  authKey: string;
  channelToken: string;
}

export type AuthenticateResponse = Promise<HttpResponse<AuthenticateAPIResponse>>;

interface AuthenticateRequest {
  message: string;
  signature: `0x${string}`;
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
  return post<AuthenticateRequest, AuthenticateAPIResponse>(client, path, request, {
    authToken: channelToken,
    headers: {
      "X-Farcaster-Auth-Relay-Key": authKey,
    },
  });
};
