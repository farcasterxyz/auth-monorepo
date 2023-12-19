import { authenticate, AuthenticateArgs, AuthenticateResponse } from "../actions/authenticate";
import { Client, ClientConfig, createClient } from "./createClient";
import { AsyncHttpResponse } from "./transports/http";

export interface AuthClient extends Client {
  authenticate: (args: AuthenticateArgs) => AsyncHttpResponse<AuthenticateResponse>;
}

export const createAuthClient = (config: ClientConfig): AuthClient => {
  const client = createClient(config);
  return {
    ...client,
    authenticate: (args: AuthenticateArgs) => authenticate(client, args),
  };
};
