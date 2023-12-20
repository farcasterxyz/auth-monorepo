import { Client } from "clients/createClient";
import { build, SignInMessageParams } from "../../messages/build";
import { SiweMessage } from "siwe";

export type BuildSignInMessageArgs = SignInMessageParams;
export type BuildSignInMessageResponse = SiweMessage;

export const buildSignInMessage = (_client: Client, args: BuildSignInMessageArgs): BuildSignInMessageResponse => {
  const result = build(args);
  if (result.isErr()) {
    throw result.error;
  } else {
    return result.value;
  }
};
