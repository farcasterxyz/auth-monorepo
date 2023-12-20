import { Client } from "../../clients/createClient";
import { AsyncHttpResponse, post } from "../../clients/transports/http";

export type ConnectArgs = ConnectRequest;
export type ConnectResponse = AsyncHttpResponse<ConnectAPIResponse>;

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
  connectURI: string;
}

const path = "connect";

export const connect = async (client: Client, { ...request }: ConnectArgs): ConnectResponse => {
  return post<ConnectRequest, ConnectAPIResponse>(client, path, request);
};
