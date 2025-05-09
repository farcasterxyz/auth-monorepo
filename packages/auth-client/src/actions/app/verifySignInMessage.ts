import type { Client } from "../../clients/createClient";
import { type VerifyResponse, verify } from "../../messages/verify";
import { type Unwrapped, unwrap } from "../../errors";
import type { PublicClient } from "viem";

export interface VerifySignInMessageArgs {
  nonce: string;
  domain: string;
  message: string;
  signature: `0x${string}`;
  acceptAuthAddress?: boolean;
}

export type VerifySignInMessageResponse = Promise<Unwrapped<VerifyResponse>>;

export const verifySignInMessage = async (
  client: Client,
  { nonce, domain, message, signature, acceptAuthAddress }: VerifySignInMessageArgs,
  publicClient?: PublicClient,
): VerifySignInMessageResponse => {
  const result = await verify(nonce, domain, message, signature, {
    acceptAuthAddress: acceptAuthAddress ?? false,
    getFid: client.ethereum.getFid,
    isValidAuthAddress: client.ethereum.isValidAuthAddress,
    publicClient,
  });
  return unwrap(result);
};
