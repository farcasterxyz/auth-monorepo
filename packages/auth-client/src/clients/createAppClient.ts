import {
  createChannel,
  type CreateChannelParameters,
  type CreateChannelReturnType,
} from "../actions/app/createChannel.js";
import { status, type StatusParameters, type StatusReturnType } from "../actions/app/status.js";
import {
  pollStatusTillSuccess,
  type PollStatusTilSuccessParameters,
  type PollStatusTilSuccessReturnType,
} from "../actions/app/pollStatusTilSuccess.js";
import {
  verifySiweMessage,
  type VerifySiweMessageParameters,
  type VerifySiweMessageReturnType,
} from "../actions/app/verifySiweMessage.js";
import { type Client, type CreateClientParameters, createClient } from "./createClient.js";

export interface AppClient extends Client {
  createChannel: (args: CreateChannelParameters) => Promise<CreateChannelReturnType>;
  status: (args: StatusParameters) => Promise<StatusReturnType>;
  pollStatusTillSuccess: (args: PollStatusTilSuccessParameters) => Promise<PollStatusTilSuccessReturnType>;
  verifySiweMessage: (args: VerifySiweMessageParameters) => Promise<VerifySiweMessageReturnType>;
}

export const createAppClient = (config: CreateClientParameters): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    createChannel: (args: CreateChannelParameters) => createChannel(client, args),
    status: (args: StatusParameters) => status(client, args),
    pollStatusTillSuccess: (args: PollStatusTilSuccessParameters) => pollStatusTillSuccess(client, args),
    verifySiweMessage: (args: VerifySiweMessageParameters) => verifySiweMessage(client, args),
  };
};
