import {
  AuthClientError,
  type PollStatusTillSuccessParameters as client_PollStatusTilSuccessParameters,
  type PollStatusTillSuccessReturnType as client_PollStatusTilSuccessReturnType,
} from "@farcaster/auth-client";
import { type Config } from "../types/config.js";

export type PollStatusTillSuccessParameters = client_PollStatusTilSuccessParameters;

export type PollStatusTillSuccessReturnType = client_PollStatusTilSuccessReturnType;
export type PollStatusTillSuccessErrorType = AuthClientError;

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export async function pollStatusTillSuccess(
  config: Config,
  parameters: PollStatusTillSuccessParameters,
): Promise<PollStatusTillSuccessReturnType> {
  const { channelToken, timeout = defaults.timeout, interval = defaults.interval } = parameters;
  return await config.appClient.pollStatusTillSuccess({
    channelToken,
    timeout,
    interval,
  });
}
