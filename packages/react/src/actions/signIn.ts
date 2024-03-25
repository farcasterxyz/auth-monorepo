import {
  AuthClientError,
  type PollSessionTillCompletedReturnType,
  type PollSessionTillCompletedParameters,
} from "@farcaster/auth-client";
import { type Config } from "../types/config.js";
import { type Omit } from "../types/utils.js";

export type SignInErrorType = AuthClientError;

export type SignInParameters = Omit<PollSessionTillCompletedParameters, "sessionToken"> & {
  sessionToken: string;
};

export type SignInReturnType = PollSessionTillCompletedReturnType & { isAuthenticated: boolean };

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export async function signIn(config: Config, parameters: SignInParameters): Promise<SignInReturnType> {
  if (!config.domain) throw new Error("domain is not defined");
  const pollSessionTillCompletedResponse = await config.appClient.pollSessionTillCompleted({
    sessionToken: parameters?.sessionToken,
    timeout: parameters?.timeout ?? defaults.timeout,
    interval: parameters?.interval ?? defaults.interval,
  });

  const { success: isAuthenticated } = await config.appClient.verifySiweMessage({
    nonce: pollSessionTillCompletedResponse.nonce,
    domain: config.domain,
    message: pollSessionTillCompletedResponse.message,
    signature: pollSessionTillCompletedResponse.signature,
  });

  return { isAuthenticated, ...pollSessionTillCompletedResponse };
}
