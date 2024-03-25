import { type SessionCreateParameters, type SessionCreateReturnType } from "@farcaster/relay";
import { type Client } from "../../clients/createClient.js";
import { post } from "../../clients/transports/http.js";

export type CreateSessionParameters = SessionCreateParameters;

export type CreateSessionReturnType = SessionCreateReturnType;

const path = "sessions/create";

export const createSession = (
  client: Client,
  parameters: CreateSessionParameters,
): Promise<CreateSessionReturnType> => {
  return post<CreateSessionParameters, CreateSessionReturnType>(client, path, parameters);
};
