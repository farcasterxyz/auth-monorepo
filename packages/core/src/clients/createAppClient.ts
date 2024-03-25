import {
  createSession,
  type CreateSessionParameters,
  type CreateSessionReturnType,
} from "../actions/app/createSession.js";
import { session, type SessionParameters, type SessionReturnType } from "../actions/app/session.js";
import {
  pollSessionTillCompleted,
  type PollSessionTillCompletedParameters,
  type PollSessionTillCompletedReturnType,
} from "../actions/app/pollSessionTillCompleted.js";
import {
  verifySiweMessage,
  type VerifySiweMessageParameters,
  type VerifySiweMessageReturnType,
} from "../actions/app/verifySiweMessage.js";
import { type Client, type CreateClientParameters, createClient } from "./createClient.js";

export interface AppClient extends Client {
  createSession: (args: CreateSessionParameters) => Promise<CreateSessionReturnType>;
  session: (args: SessionParameters) => Promise<SessionReturnType>;
  pollSessionTillCompleted: (args: PollSessionTillCompletedParameters) => Promise<PollSessionTillCompletedReturnType>;
  verifySiweMessage: (args: VerifySiweMessageParameters) => Promise<VerifySiweMessageReturnType>;
}

export const createAppClient = (config: CreateClientParameters): AppClient => {
  const client = createClient(config);
  return {
    ...client,
    createSession: (args: CreateSessionParameters) => createSession(client, args),
    session: (args: SessionParameters) => session(client, args),
    pollSessionTillCompleted: (args: PollSessionTillCompletedParameters) => pollSessionTillCompleted(client, args),
    verifySiweMessage: (args: VerifySiweMessageParameters) => verifySiweMessage(client, args),
  };
};
