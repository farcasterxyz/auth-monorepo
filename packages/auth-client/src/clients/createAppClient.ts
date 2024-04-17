import { createChannel, CreateChannelArgs, CreateChannelResponse } from "../actions/app/createChannel";
import { status, StatusArgs, StatusResponse } from "../actions/app/status";
import { watchStatus, WatchStatusArgs, WatchStatusResponse } from "../actions/app/watchStatus";
import {
  verifySignInMessage,
  VerifySignInMessageArgs,
  VerifySignInMessageResponse,
} from "../actions/app/verifySignInMessage";
import { Client, CreateClientArgs, createClient } from "./createClient";
import type { Provider } from "ethers";

export { Provider };

export interface AppClient extends Client {
  createChannel: (args: CreateChannelArgs) => CreateChannelResponse;
  status: (args: StatusArgs) => StatusResponse;
  watchStatus: (args: WatchStatusArgs) => WatchStatusResponse;
  verifySignInMessage: (args: VerifySignInMessageArgs) => VerifySignInMessageResponse;
}

export const createAppClient = (config: CreateClientArgs, provider?: Provider): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    createChannel: (args: CreateChannelArgs) => createChannel(client, args),
    status: (args: StatusArgs) => status(client, args),
    watchStatus: (args: WatchStatusArgs) => watchStatus(client, args),
    verifySignInMessage: (args: VerifySignInMessageArgs) => verifySignInMessage(client, args, provider),
  };
};
