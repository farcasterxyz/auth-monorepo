import { SiweMessage } from "siwe";
import { Client } from "../../clients/createClient";
import { VerifyResponse, verify } from "../../messages/verify";

export interface VerifySignInMessageArgs {
  nonce: string;
  domain: string;
  message: string | Partial<SiweMessage>;
  signature: `0x${string}`;
}

export type VerifySignInMessageResponse = Promise<VerifyResponse>;

export const verifySignInMessage = (
  client: Client,
  { nonce, domain, message, signature }: VerifySignInMessageArgs,
): VerifySignInMessageResponse => {
  return verify(nonce, domain, message, signature, {
    getFid: client.ethereum.getFid,
    provider: client.ethereum.provider,
  });
};
