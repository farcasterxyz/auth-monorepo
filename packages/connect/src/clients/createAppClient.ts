import { connect, ConnectArgs, ConnectResponse } from "../actions/app/connect";
import { status, StatusArgs, StatusResponse } from "../actions/app/status";
import {
  verifySignInMessage,
  VerifySignInMessageArgs,
  VerifySignInMessageResponse,
} from "../actions/app/verifySignInMessage";
import { Client, ClientConfig, createClient } from "./createClient";

export interface AppClient extends Client {
  connect: (args: ConnectArgs) => ConnectResponse;
  status: (args: StatusArgs) => StatusResponse;
  verifySignInMessage: (args: VerifySignInMessageArgs) => VerifySignInMessageResponse;
}

export const createAppClient = (config: ClientConfig): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    connect: (args: ConnectArgs) => connect(client, args),
    status: (args: StatusArgs) => status(client, args),
    verifySignInMessage: (args: VerifySignInMessageArgs) => verifySignInMessage(client, args),
  };
};
