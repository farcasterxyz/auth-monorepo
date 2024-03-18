import { type Client } from "../../clients/createClient.js";
import { post } from "../../clients/transports/http.js";

export type CreateChannelParameters = {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
};

export type CreateChannelReturnType = {
  channelToken: string;
  url: string;
  nonce: string;
};

const path = "channel";

export const createChannel = (
  client: Client,
  parameters: CreateChannelParameters,
): Promise<CreateChannelReturnType> => {
  return post<CreateChannelParameters, CreateChannelReturnType>(client, path, parameters);
};
