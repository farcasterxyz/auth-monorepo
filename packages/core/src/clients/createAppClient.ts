import {
  createChannel,
  type CreateChannelParameters,
  type CreateChannelReturnType,
} from "../actions/app/createChannel.js";
import { channel, type ChannelParameters, type ChannelReturnType } from "../actions/app/channel.js";
import {
  pollChannelTillCompleted,
  type PollChannelTillCompletedParameters,
  type PollChannelTillCompletedReturnType,
} from "../actions/app/pollChannelTillCompleted.js";
import {
  verifySiweMessage,
  type VerifySiweMessageParameters,
  type VerifySiweMessageReturnType,
} from "../actions/app/verifySiweMessage.js";
import { type Client, type CreateClientParameters, createClient } from "./createClient.js";

export interface AppClient extends Client {
  createChannel: (args: CreateChannelParameters) => Promise<CreateChannelReturnType>;
  channel: (args: ChannelParameters) => Promise<ChannelReturnType>;
  pollChannelTillCompleted: (args: PollChannelTillCompletedParameters) => Promise<PollChannelTillCompletedReturnType>;
  verifySiweMessage: (args: VerifySiweMessageParameters) => Promise<VerifySiweMessageReturnType>;
}

export const createAppClient = (config: CreateClientParameters): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    createChannel: (args: CreateChannelParameters) => createChannel(client, args),
    channel: (args: ChannelParameters) => channel(client, args),
    pollChannelTillCompleted: (args: PollChannelTillCompletedParameters) => pollChannelTillCompleted(client, args),
    verifySiweMessage: (args: VerifySiweMessageParameters) => verifySiweMessage(client, args),
  };
};
