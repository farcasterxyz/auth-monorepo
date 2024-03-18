import { AuthClientError } from "../../errors.js";
import { type Client } from "../../clients/createClient.js";
import { poll } from "../../clients/transports/http.js";
import { type CompletedStatusReturnType, type StatusReturnType } from "./status.js";

export type PollStatusTilSuccessParameters = {
  channelToken: string;
  timeout?: number;
  interval?: number;
};

export type PollStatusTilSuccessReturnType = CompletedStatusReturnType;

const path = "channel/status";

export const pollStatusTillSuccess = async (
  client: Client,
  args: PollStatusTilSuccessParameters,
): Promise<PollStatusTilSuccessReturnType> => {
  for await (const polledData of poll<StatusReturnType>(
    client,
    path,
    {
      timeout: args?.timeout ?? 300_000,
      interval: args?.interval ?? 1000,
    },
    { authToken: args.channelToken },
  )) {
    if (polledData.state === "completed") {
      // type coercing to completed as if the response status is 200
      // it is expected to have a completed status.
      return polledData as PollStatusTilSuccessReturnType;
    }
  }
  // This error should not be thrown, as the `poll` function will throw an error on timeout
  throw new AuthClientError("unknown", "unexpected error in `watchStatus`");
};
