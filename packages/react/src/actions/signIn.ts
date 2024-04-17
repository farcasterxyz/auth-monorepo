import {
  AuthClientError,
  type PollChannelTillCompletedReturnType,
  type PollChannelTillCompletedParameters,
} from "@farcaster/auth-client";
import { type Config } from "../types/config.js";
import { type Omit } from "../types/utils.js";

export type SignInErrorType = AuthClientError;

export type SignInParameters = Omit<PollChannelTillCompletedParameters, "channelToken"> & {
  channelToken: string;
};

export type SignInReturnType = PollChannelTillCompletedReturnType & { isAuthenticated: boolean };

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export async function signIn(config: Config, parameters: SignInParameters): Promise<SignInReturnType> {
  if (!config.domain) throw new Error("domain is not defined");
  const pollChannelTillCompletedResponse = await config.appClient.pollChannelTillCompleted({
    channelToken: parameters?.channelToken,
    timeout: parameters?.timeout ?? defaults.timeout,
    interval: parameters?.interval ?? defaults.interval,
  });

  const { success: isAuthenticated } = await config.appClient.verifySiweMessage({
    nonce: pollChannelTillCompletedResponse.nonce,
    domain: config.domain,
    message: pollChannelTillCompletedResponse.message,
    signature: pollChannelTillCompletedResponse.signature,
  });

  return { isAuthenticated, ...pollChannelTillCompletedResponse };
}
