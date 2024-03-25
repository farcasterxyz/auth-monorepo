import {
  AuthClientError,
  type CreateSessionParameters as client_CreateSessionParameters,
  type CreateSessionReturnType as client_CreateSessionReturnType,
} from "@farcaster/auth-client";
import { type Config } from "../types/config.js";
import type { Omit } from "../types/utils.js";

export type CreateSessionParameters = Omit<client_CreateSessionParameters, "nonce"> & {
  nonce?: string | (() => Promise<string>);
};

export type CreateSessionReturnType = client_CreateSessionReturnType;
export type CreateSessionErrorType = AuthClientError;

export async function createSession(
  config: Config,
  parameters: CreateSessionParameters,
): Promise<CreateSessionReturnType> {
  const { siweUri, domain } = config;
  const { nonce, expirationTime, notBefore, requestId } = parameters;

  const nonceVal = typeof nonce === "function" ? await nonce() : nonce;
  return await config.appClient.createSession({
    nonce: nonceVal,
    siweUri,
    domain,
    notBefore,
    expirationTime,
    requestId,
  });
}
