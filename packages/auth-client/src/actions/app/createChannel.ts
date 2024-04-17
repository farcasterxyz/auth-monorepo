import { AsyncUnwrapped, unwrap } from "../../errors";
import { Client } from "../../clients/createClient";
import { HttpResponse, post } from "../../clients/transports/http";

export type CreateChannelArgs = CreateChannelRequest;
export type CreateChannelResponse = AsyncUnwrapped<HttpResponse<CreateChannelAPIResponse>>;

interface CreateChannelRequest {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
  redirectUrl?: string;
}

export interface CreateChannelAPIResponse {
  channelToken: string;
  url: string;
  nonce: string;
}

const path = "channel";

export const createChannel = async (client: Client, { ...request }: CreateChannelArgs): CreateChannelResponse => {
  const response = await post<CreateChannelRequest, CreateChannelAPIResponse>(client, path, request);
  return unwrap(response);
};
