import {
  AuthClientError,
  type VerifySiweMessageParameters as client_VerifySiweMessageParameters,
  type VerifySiweMessageReturnType as client_VerifySiweMessageReturnType,
} from "@farcaster/auth-client";
import { type Config } from "../types/config.js";

export type VerifySiweMessageParameters = client_VerifySiweMessageParameters;

export type VerifySiweMessageReturnType = client_VerifySiweMessageReturnType;
export type VerifySiweMessageErrorType = AuthClientError;

export async function verifySiweMessage(
  config: Config,
  parameters: VerifySiweMessageParameters,
): Promise<VerifySiweMessageReturnType> {
  const { nonce, domain, message, signature } = parameters;

  return await config.appClient.verifySiweMessage({
    nonce,
    domain,
    message,
    signature,
  });
}
