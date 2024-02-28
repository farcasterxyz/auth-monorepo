import { Client } from "../../clients/createClient";
import { HttpResponse, post } from "../../clients/transports/http";

export type CreateChannelArgs = CreateChannelRequest;
export type CreateChannelResponse = Promise<HttpResponse<CreateChannelAPIResponse>>;

interface CreateChannelRequest {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
}

export interface CreateChannelAPIResponse {
  channelToken: string;
  url: string;
  nonce: string;
}

const path = "channel";

export const createChannel = (client: Client, { ...request }: CreateChannelArgs): CreateChannelResponse => {
  return post<CreateChannelRequest, CreateChannelAPIResponse>(client, path, request);
};
