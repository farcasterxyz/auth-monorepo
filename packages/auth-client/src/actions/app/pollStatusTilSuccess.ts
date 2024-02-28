import { AuthClientError } from "../../errors";
import { Client } from "../../clients/createClient";
import { poll, HttpResponse } from "../../clients/transports/http";
import { CompletedStatusAPIResponse, StatusAPIResponse } from "./status";

export interface PollStatusTilSuccessArgs {
  channelToken: string;
  timeout?: number;
  interval?: number;
}

export type PollStatusTilSuccessResponse = Promise<HttpResponse<CompletedStatusAPIResponse>>;

const path = "channel/status";

export const pollStatusTillSuccess = async (
  client: Client,
  args: PollStatusTilSuccessArgs,
): PollStatusTilSuccessResponse => {
  for await (const res of poll<StatusAPIResponse>(
    client,
    path,
    {
      timeout: args?.timeout ?? 300_000,
      interval: args?.interval ?? 1000,
    },
    { authToken: args.channelToken },
  )) {
    if (res.response.status === 200) {
      // type coercing to completed as if the response status is 200
      // it is expected to have a completed status.
      return res as HttpResponse<CompletedStatusAPIResponse>;
    }
  }
  // This error should not be thrown, as the `poll` function will throw an error on timeout
  throw new AuthClientError("unknown", "unexpected error in `watchStatus`");
};
