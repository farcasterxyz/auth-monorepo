import {
  authenticate,
  type AuthenticateParameters,
  type AuthenticateReturnType,
} from "../actions/auth/authenticate.js";
import { type Client, type CreateClientParameters, createClient } from "./createClient.js";

export interface WalletClient extends Client {
  authenticate: (args: AuthenticateParameters) => Promise<AuthenticateReturnType>;
}

export const createWalletClient = (config: CreateClientParameters): WalletClient => {
  const client = createClient(config);
  return {
    ...client,
    authenticate: (args: AuthenticateParameters) => authenticate(client, args),
  };
};
