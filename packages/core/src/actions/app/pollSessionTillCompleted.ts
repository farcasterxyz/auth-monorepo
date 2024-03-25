import { AuthClientError } from "../../errors.js";
import { type Client } from "../../clients/createClient.js";
import { poll } from "../../clients/transports/http.js";
import { type SessionReturnType } from "./session.js";
import type { CompletedSession } from "@farcaster/relay";

export type PollSessionTillCompletedParameters = {
  sessionToken: string;
  timeout?: number;
  interval?: number;
};

export type PollSessionTillCompletedReturnType = CompletedSession;

const path = "session";

export const pollSessionTillCompleted = async (
  client: Client,
  args: PollSessionTillCompletedParameters,
): Promise<PollSessionTillCompletedReturnType> => {
  for await (const polledData of poll<SessionReturnType>(
    client,
    path,
    {
      timeout: args?.timeout ?? 300_000,
      interval: args?.interval ?? 1000,
    },
    { sessionToken: args.sessionToken },
  )) {
    if (polledData.status === "completed") {
      // type coercing to completed as if the response status is 200
      // it is expected to have a completed status.
      return polledData as PollSessionTillCompletedReturnType;
    }
  }
  // This error should not be thrown, as the `poll` function will throw an error on timeout
  throw new AuthClientError("unknown", "unexpected error in `pollSessionTillCompleted`");
};
