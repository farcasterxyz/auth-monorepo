import { createChannel, type CreateChannelArgs, type CreateChannelResponse } from "../actions/app/createChannel";
import { status, type StatusArgs, type StatusResponse } from "../actions/app/status";
import { watchStatus, type WatchStatusArgs, type WatchStatusResponse } from "../actions/app/watchStatus";
import {
  verifySignInMessage,
  type VerifySignInMessageArgs,
  type VerifySignInMessageResponse,
} from "../actions/app/verifySignInMessage";
import { type Client, type CreateClientArgs, createClient } from "./createClient";
import type { PublicClient } from "viem";

export interface AppClient extends Client {
  createChannel: (args: CreateChannelArgs) => CreateChannelResponse;
  status: (args: StatusArgs) => StatusResponse;
  watchStatus: (args: WatchStatusArgs) => WatchStatusResponse;
  verifySignInMessage: (args: VerifySignInMessageArgs) => VerifySignInMessageResponse;
}

export const createAppClient = (config: CreateClientArgs, publicClient?: PublicClient): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    createChannel: (args: CreateChannelArgs) => createChannel(client, args),
    status: (args: StatusArgs) => status(client, args),
    watchStatus: (args: WatchStatusArgs) => watchStatus(client, args),
    verifySignInMessage: (args: VerifySignInMessageArgs) => verifySignInMessage(client, args, publicClient),
  };
};
