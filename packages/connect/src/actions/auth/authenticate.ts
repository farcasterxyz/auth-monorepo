import { StatusResponse } from "../app/status";
import { post, AsyncHttpResponse } from "../../clients/transports/http";
import { Client } from "../../clients/createClient";

export interface AuthenticateArgs extends AuthenticateRequest {
  channelToken: string;
}

export type AuthenticateResponse = AsyncHttpResponse<AuthenticateAPIResponse>;

interface AuthenticateRequest {
  message: string;
  signature: `0x${string}`;
  fid: number;
  username: string;
  bio: string;
  displayName: string;
  pfpUrl: string;
}

type AuthenticateAPIResponse = StatusResponse;

const path = "connect/authenticate";

export const authenticate = async (
  client: Client,
  { channelToken, ...request }: AuthenticateArgs,
): AuthenticateResponse => {
  return post<AuthenticateRequest, AuthenticateAPIResponse>(client, path, request, { authToken: channelToken });
};
