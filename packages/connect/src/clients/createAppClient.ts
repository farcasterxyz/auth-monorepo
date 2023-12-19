import { connect, ConnectArgs, ConnectResponse } from "../actions/connect";
import { status, StatusArgs, StatusResponse } from "../actions/status";
import { Client, ClientConfig, createClient } from "./createClient";
import { AsyncHttpResponse } from "./transports/http";

export interface AppClient extends Client {
  connect: (args: ConnectArgs) => AsyncHttpResponse<ConnectResponse>;
  status: (args: StatusArgs) => AsyncHttpResponse<StatusResponse>;
}

export const createAppClient = (config: ClientConfig): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    connect: (args: ConnectArgs) => connect(client, args),
    status: (args: StatusArgs) => status(client, args),
  };
};
