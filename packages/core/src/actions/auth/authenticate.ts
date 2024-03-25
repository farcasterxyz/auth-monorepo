import { type SessionAuthenticateParameters, type SessionAuthenticateReturnType } from "@farcaster/relay";
import { post } from "../../clients/transports/http.js";
import { type Client } from "../../clients/createClient.js";

export type AuthenticateParameters = SessionAuthenticateParameters & { sessionToken: string; authKey: string };

export type AuthenticateReturnType = SessionAuthenticateReturnType;

const path = "session/authenticate";

export const authenticate = async (
  client: Client,
  { sessionToken, authKey, ...request }: AuthenticateParameters,
): Promise<AuthenticateReturnType> => {
  return post<Omit<AuthenticateParameters, "sessionToken" | "authKey">, AuthenticateReturnType>(client, path, request, {
    sessionToken,
    headers: {
      "X-Farcaster-Auth-Relay-Key": authKey,
    },
  });
};
