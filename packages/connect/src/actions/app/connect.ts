import { AsyncUnwrapped, unwrap } from "../../errors";
import { Client } from "../../clients/createClient";
import { HttpResponse, post } from "../../clients/transports/http";

export type ConnectArgs = ConnectRequest;
export type ConnectResponse = AsyncUnwrapped<HttpResponse<ConnectAPIResponse>>;

interface ConnectRequest {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
}

interface ConnectAPIResponse {
  channelToken: string;
  connectUri: string;
  nonce: string;
}

const path = "connect";

export const connect = async (client: Client, { ...request }: ConnectArgs): ConnectResponse => {
  const response = await post<ConnectRequest, ConnectAPIResponse>(client, path, request);
  return unwrap(response);
};
