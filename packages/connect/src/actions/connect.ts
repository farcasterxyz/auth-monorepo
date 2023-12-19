import { Client } from "../clients/createClient";
import { AsyncHttpResponse, post } from "../clients/transports/http";

export type ConnectArgs = ConnectRequest;

interface ConnectRequest {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
}

export interface ConnectResponse {
  channelToken: string;
  connectURI: string;
}

const path = "connect";

export const connect = async (client: Client, { ...request }: ConnectArgs): AsyncHttpResponse<ConnectResponse> => {
  return post<ConnectRequest, ConnectResponse>(client, path, request);
};
