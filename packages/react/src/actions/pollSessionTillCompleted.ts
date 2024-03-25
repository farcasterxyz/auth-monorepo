import {
  AuthClientError,
  type PollSessionTillCompletedParameters as client_PollSessionTilCompletedParameters,
  type PollSessionTillCompletedReturnType as client_PollSessionTilCompletedReturnType,
} from "@farcaster/auth-client";
import { type Config } from "../types/config.js";

export type PollSessionTillCompletedParameters = client_PollSessionTilCompletedParameters;

export type PollSessionTillCompletedReturnType = client_PollSessionTilCompletedReturnType;
export type PollSessionTillCompletedErrorType = AuthClientError;

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export async function pollSessionTillCompleted(
  config: Config,
  parameters: PollSessionTillCompletedParameters,
): Promise<PollSessionTillCompletedReturnType> {
  const { sessionToken, timeout = defaults.timeout, interval = defaults.interval } = parameters;
  return await config.appClient.pollSessionTillCompleted({
    sessionToken,
    timeout,
    interval,
  });
}
