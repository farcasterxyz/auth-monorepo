import { StatusResponse } from "./status";
import { post, AsyncHttpResponse } from "../clients/transports/http";
import { Client } from "../clients/createClient";

export interface AuthenticateArgs extends AuthenticateRequest {
  channelToken: string;
}

interface AuthenticateRequest {
  message: string;
  signature: `0x${string}`;
  fid: number;
  username: string;
  bio: string;
  displayName: string;
  pfpUrl: string;
}

export type AuthenticateResponse = StatusResponse;

const path = "connect/authenticate";

export const authenticate = async (
  client: Client,
  { channelToken, ...request }: AuthenticateArgs,
): AsyncHttpResponse<AuthenticateResponse> => {
  return post<AuthenticateRequest, AuthenticateResponse>(client, path, request, { authToken: channelToken });
};
