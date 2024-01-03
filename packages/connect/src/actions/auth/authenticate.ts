import { StatusResponse } from "../app/status";
import { post, HttpResponse } from "../../clients/transports/http";
import { Client } from "../../clients/createClient";
import { AsyncUnwrapped, unwrap } from "../../errors";

export interface AuthenticateArgs extends AuthenticateRequest {
  channelToken: string;
}

export type AuthenticateResponse = AsyncUnwrapped<HttpResponse<AuthenticateAPIResponse>>;

interface AuthenticateRequest {
  message: string;
  signature: `0x${string}`;
  fid: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
}

type AuthenticateAPIResponse = StatusResponse;

const path = "connect/authenticate";

export const authenticate = async (
  client: Client,
  { channelToken, ...request }: AuthenticateArgs,
): AuthenticateResponse => {
  const result = await post<AuthenticateRequest, AuthenticateAPIResponse>(client, path, request, {
    authToken: channelToken,
  });
  return unwrap(result);
};
