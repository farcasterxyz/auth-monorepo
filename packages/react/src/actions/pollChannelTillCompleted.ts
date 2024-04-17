import {
  AuthClientError,
  type PollChannelTillCompletedParameters as client_PollChannelTilCompletedParameters,
  type PollChannelTillCompletedReturnType as client_PollChannelTilCompletedReturnType,
} from "@farcaster/auth-client";
import { type Config } from "../types/config.js";

export type PollChannelTillCompletedParameters = client_PollChannelTilCompletedParameters;

export type PollChannelTillCompletedReturnType = client_PollChannelTilCompletedReturnType;
export type PollChannelTillCompletedErrorType = AuthClientError;

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export async function pollChannelTillCompleted(
  config: Config,
  parameters: PollChannelTillCompletedParameters,
): Promise<PollChannelTillCompletedReturnType> {
  const { channelToken, timeout = defaults.timeout, interval = defaults.interval } = parameters;
  return await config.appClient.pollChannelTillCompleted({
    channelToken,
    timeout,
    interval,
  });
}
