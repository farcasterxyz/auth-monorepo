import type { Client } from "../../clients/createClient";
import { type VerifyResponse, verify } from "../../messages/verify";
import { type Unwrapped, unwrap } from "../../errors";

export interface VerifySignInMessageArgs {
  nonce: string;
  domain: string;
  message: string;
  signature: `0x${string}`;

  /**
   * @default true
   */
  acceptAuthAddress?: boolean;
}

export type VerifySignInMessageResponse = Promise<Unwrapped<VerifyResponse>>;

export const verifySignInMessage = async (
  client: Client,
  { nonce, domain, message, signature, acceptAuthAddress = true }: VerifySignInMessageArgs,
): VerifySignInMessageResponse => {
  const result = await verify(nonce, domain, message, signature, {
    acceptAuthAddress: acceptAuthAddress,
    getFid: client.ethereum.getFid,
    isValidAuthAddress: client.ethereum.isValidAuthAddress,
    publicClient: client.ethereum.publicClient,
  });
  return unwrap(result);
};
