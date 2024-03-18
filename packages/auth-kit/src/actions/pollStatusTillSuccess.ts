import { AuthClientError } from "@farcaster/auth-client";
import { StatusAPIResponse } from "..";
import { Config } from "../types/config";

export type PollStatusTillSuccessParameters = {
  channelToken: string;
  timeout?: number;
  interval?: number;
};

export type PollStatusTillSuccessReturnType = StatusAPIResponse;
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
  const { data } = await config.appClient.pollStatusTillSuccess({
    channelToken,
    timeout,
    interval,
  });
  return data;
}
