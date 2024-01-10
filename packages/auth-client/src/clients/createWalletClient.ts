import { authenticate, AuthenticateArgs, AuthenticateResponse } from "../actions/auth/authenticate";
import { parseSignInURI, ParseSignInURIArgs, ParseSignInURIResponse } from "../actions/auth/parseSignInURI";
import {
  buildSignInMessage,
  BuildSignInMessageArgs,
  BuildSignInMessageResponse,
} from "../actions/auth/buildSignInMessage";
import { Client, CreateClientArgs, createClient } from "./createClient";

export interface WalletClient extends Client {
  authenticate: (args: AuthenticateArgs) => AuthenticateResponse;
  buildSignInMessage: (args: BuildSignInMessageArgs) => BuildSignInMessageResponse;
  parseSignInURI: (args: ParseSignInURIArgs) => ParseSignInURIResponse;
}

export const createWalletClient = (config: CreateClientArgs): WalletClient => {
  const client = createClient(config);
  return {
    ...client,
    authenticate: (args: AuthenticateArgs) => authenticate(client, args),
    buildSignInMessage: (args: BuildSignInMessageArgs) => buildSignInMessage(client, args),
    parseSignInURI: (args: ParseSignInURIArgs) => parseSignInURI(client, args),
  };
};
