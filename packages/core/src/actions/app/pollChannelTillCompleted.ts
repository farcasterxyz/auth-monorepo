import { AuthClientError } from "../../errors.js";
import { type Client } from "../../clients/createClient.js";
import { poll } from "../../clients/transports/http.js";
import { type ChannelReturnType } from "./channel.js";
import type { CompletedChannel } from "@farcaster/relay";

export type PollChannelTillCompletedParameters = {
  channelToken: string;
  timeout?: number;
  interval?: number;
};

export type PollChannelTillCompletedReturnType = CompletedChannel;

const path = "channel/status";

export const pollChannelTillCompleted = async (
  client: Client,
  args: PollChannelTillCompletedParameters,
): Promise<PollChannelTillCompletedReturnType> => {
  for await (const polledData of poll<ChannelReturnType>(
    client,
    path,
    {
      timeout: args?.timeout ?? 300_000,
      interval: args?.interval ?? 1000,
    },
    { channelToken: args.channelToken },
  )) {
    if (polledData.state === "completed") {
      // type coercing to completed as if the response status is 200
      // it is expected to have a completed status.
      return polledData;
    }
  }
  // This error should not be thrown, as the `poll` function will throw an error on timeout
  throw new AuthClientError("unknown", "unexpected error in `pollChannelTillCompleted`");
};
