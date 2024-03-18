import { AuthClientError, VerifySignInMessageArgs, VerifySignInMessageResponse } from "@farcaster/auth-client";
import { Config } from "../types/config";

export type VerifySignInMessageParameters = VerifySignInMessageArgs;

export type VerifySignInMessageReturnType = Awaited<VerifySignInMessageResponse>;
export type VerifySignInMessageErrorType = AuthClientError;

export async function verifySignInMessage(
  config: Config,
  parameters: VerifySignInMessageParameters,
): Promise<VerifySignInMessageReturnType> {
  const { nonce, domain, message, signature } = parameters;

  return await config.appClient.verifySignInMessage({
    nonce,
    domain,
    message,
    signature,
  });
}
