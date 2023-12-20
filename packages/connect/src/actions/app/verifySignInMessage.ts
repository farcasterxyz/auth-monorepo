import { SiweMessage } from "siwe";
import { Client } from "../../clients/createClient";
import { SignInResponse, verify } from "../../messages/verify";

export interface VerifySignInMessageArgs {
  message: string | Partial<SiweMessage>;
  signature: `0x${string}`;
}

export type VerifySignInMessageResponse = Promise<SignInResponse>;

export const verifySignInMessage = async (
  client: Client,
  { message, signature }: VerifySignInMessageArgs,
): VerifySignInMessageResponse => {
  const result = await verify(message, signature, {
    getFid: client.ethereum.getFid,
  });
  if (result.isErr()) {
    throw result.error;
  } else {
    return result.value;
  }
};
