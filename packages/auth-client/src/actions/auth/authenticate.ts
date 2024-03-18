import { type StatusReturnType } from "../app/status.js";
import { post } from "../../clients/transports/http.js";
import { type Client } from "../../clients/createClient.js";

export type AuthenticateParameters = {
  authKey: string;
  channelToken: string;
  message: string;
  signature: `0x${string}`;
  fid: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
};

export type AuthenticateReturnType = StatusReturnType;

const path = "channel/authenticate";

export const authenticate = async (
  client: Client,
  { channelToken, authKey, ...request }: AuthenticateParameters,
): Promise<AuthenticateReturnType> => {
  return post<Omit<AuthenticateParameters, "channelToken" | "authKey">, AuthenticateReturnType>(client, path, request, {
    authToken: channelToken,
    headers: {
      "X-Farcaster-Auth-Relay-Key": authKey,
    },
  });
};
