import { createChannel, CreateChannelArgs, CreateChannelResponse } from "../actions/app/createChannel";
import { status, StatusArgs, StatusResponse } from "../actions/app/status";
import {
  pollStatusTillSuccess,
  PollStatusTilSuccessArgs,
  PollStatusTilSuccessResponse,
} from "../actions/app/pollStatusTilSuccess";
import {
  verifySignInMessage,
  VerifySignInMessageArgs,
  VerifySignInMessageResponse,
} from "../actions/app/verifySignInMessage";
import { Client, CreateClientArgs, createClient } from "./createClient";

export interface AppClient extends Client {
  createChannel: (args: CreateChannelArgs) => CreateChannelResponse;
  status: (args: StatusArgs) => StatusResponse;
  pollStatusTillSuccess: (args: PollStatusTilSuccessArgs) => PollStatusTilSuccessResponse;
  verifySignInMessage: (args: VerifySignInMessageArgs) => VerifySignInMessageResponse;
}

export const createAppClient = (config: CreateClientArgs): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    createChannel: (args: CreateChannelArgs) => createChannel(client, args),
    status: (args: StatusArgs) => status(client, args),
    pollStatusTillSuccess: (args: PollStatusTilSuccessArgs) => pollStatusTillSuccess(client, args),
    verifySignInMessage: (args: VerifySignInMessageArgs) => verifySignInMessage(client, args),
  };
};
