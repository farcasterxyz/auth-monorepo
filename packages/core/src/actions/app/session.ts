import { type Client } from "../../clients/createClient.js";
import { get } from "../../clients/transports/http.js";
import { type SessionGetReturnType } from "@farcaster/relay";

export type SessionParameters = {
  sessionToken: string;
};

export type SessionReturnType = SessionGetReturnType;

const path = "session";

export const session = (client: Client, { sessionToken }: SessionParameters): Promise<SessionReturnType> => {
  return get<SessionReturnType>(client, path, {
    sessionToken: sessionToken,
  });
};
