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
  acceptAuthAddress?: boolean;
}

export type VerifySignInMessageResponse = Promise<Unwrapped<VerifyResponse>>;

export const verifySignInMessage = async (
  client: Client,
  { nonce, domain, message, signature, acceptAuthAddress }: VerifySignInMessageArgs,
  provider?: Provider,
): VerifySignInMessageResponse => {
  const result = await verify(nonce, domain, message, signature, {
    acceptAuthAddress: acceptAuthAddress ?? false,
    getFid: client.ethereum.getFid,
    isValidAuthAddress: client.ethereum.isValidAuthAddress,
    provider,
  });
  return unwrap(result);
};
