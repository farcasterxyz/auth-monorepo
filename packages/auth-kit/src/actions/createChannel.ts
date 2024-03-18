import { AuthClientError, CreateChannelAPIResponse } from "@farcaster/auth-client";
import { Config } from "../types/config";

export type CreateChannelParameters = {
  nonce?: string | (() => Promise<string>);
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
};

export type CreateChannelReturnType = CreateChannelAPIResponse;
export type CreateChannelErrorType = AuthClientError;

export async function createChannel(
  config: Config,
  parameters: CreateChannelParameters,
): Promise<CreateChannelReturnType> {
  const { siweUri, domain } = config;
  const { nonce, expirationTime, notBefore, requestId } = parameters;

  const nonceVal = typeof nonce === "function" ? await nonce() : nonce;
  const { data } = await config.appClient.createChannel({
    nonce: nonceVal,
    siweUri,
    domain,
    notBefore,
    expirationTime,
    requestId,
  });

  return data;
}
