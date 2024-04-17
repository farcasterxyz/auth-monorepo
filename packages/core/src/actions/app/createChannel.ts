import { type ChannelCreateParameters, type ChannelCreateReturnType } from "@farcaster/relay";
import { type Client } from "../../clients/createClient.js";
import { post } from "../../clients/transports/http.js";

export type CreateChannelParameters = ChannelCreateParameters;

export type CreateChannelReturnType = ChannelCreateReturnType;

const path = "channel";

export const createChannel = (
  client: Client,
  parameters: CreateChannelParameters,
): Promise<CreateChannelReturnType> => {
  return post<CreateChannelParameters, CreateChannelReturnType>(client, path, parameters);
};
