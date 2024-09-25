import { SiweMessage } from "viem/siwe";
import { Client } from "../../clients/createClient";
import { VerifyResponse, verify } from "../../messages/verify";
import { Unwrapped, unwrap } from "../../errors";
import type { ExactPartial, PublicClient, Transport } from "viem";
import { optimism } from "viem/chains";

export interface VerifySignInMessageArgs {
  nonce: string;
  domain: string;
  message: string | ExactPartial<SiweMessage>;
  signature: `0x${string}`;
}

export type VerifySignInMessageResponse = Promise<Unwrapped<VerifyResponse>>;

export const verifySignInMessage = async (
  client: Client,
  { nonce, domain, message, signature }: VerifySignInMessageArgs,
  publicClient: PublicClient<Transport, typeof optimism>,
): VerifySignInMessageResponse => {
  const result = await verify(nonce, domain, message, signature, {
    getFid: client.ethereum.getFid,
    client: publicClient,
  });
  return unwrap(result);
};
