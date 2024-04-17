import { SiweMessage } from "siwe";
import { Client } from "../../clients/createClient";
import { VerifyResponse, verify } from "../../messages/verify";
import { Unwrapped, unwrap } from "../../errors";
import type { Provider } from "ethers";

export interface VerifySignInMessageArgs {
  nonce: string;
  domain: string;
  message: string | Partial<SiweMessage>;
  signature: `0x${string}`;
}

export type VerifySignInMessageResponse = Promise<Unwrapped<VerifyResponse>>;

export const verifySignInMessage = async (
  client: Client,
  { nonce, domain, message, signature }: VerifySignInMessageArgs,
  provider?: Provider,
): VerifySignInMessageResponse => {
  const result = await verify(nonce, domain, message, signature, {
    getFid: client.ethereum.getFid,
    provider,
  });
  return unwrap(result);
};
