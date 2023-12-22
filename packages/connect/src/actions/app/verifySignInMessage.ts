import { SiweMessage } from "siwe";
import { Client } from "../../clients/createClient";
import { VerifyResponse, verify } from "../../messages/verify";
import { Unwrapped, unwrap } from "../../errors";

export interface VerifySignInMessageArgs {
  message: string | Partial<SiweMessage>;
  signature: `0x${string}`;
}

export type VerifySignInMessageResponse = Promise<Unwrapped<VerifyResponse>>;

export const verifySignInMessage = async (
  client: Client,
  { message, signature }: VerifySignInMessageArgs,
): VerifySignInMessageResponse => {
  const result = await verify(message, signature, {
    getFid: client.ethereum.getFid,
    provider: client.ethereum.provider,
  });
  return unwrap(result);
};
