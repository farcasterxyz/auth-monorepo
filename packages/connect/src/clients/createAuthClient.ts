import { authenticate, AuthenticateArgs, AuthenticateResponse } from "../actions/auth/authenticate";
import {
  buildSignInMessage,
  BuildSignInMessageArgs,
  BuildSignInMessageResponse,
} from "../actions/auth/buildSignInMessage";
import { Client, ClientConfig, createClient } from "./createClient";

export interface AuthClient extends Client {
  authenticate: (args: AuthenticateArgs) => AuthenticateResponse;
  buildSignInMessage: (args: BuildSignInMessageArgs) => BuildSignInMessageResponse;
}

export const createAuthClient = (config: ClientConfig): AuthClient => {
  const client = createClient(config);
  return {
    ...client,
    authenticate: (args: AuthenticateArgs) => authenticate(client, args),
    buildSignInMessage: (args: BuildSignInMessageArgs) => buildSignInMessage(client, args),
  };
};
