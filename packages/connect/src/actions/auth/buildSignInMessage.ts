import { Client } from "clients/createClient";
import { build, SignInMessageParams } from "../../messages/build";
import { SiweMessage } from "siwe";

export type BuildSignInMessageArgs = SignInMessageParams;
export interface BuildSignInMessageResponse {
  siweMessage: SiweMessage;
  message: string;
}

export const buildSignInMessage = (_client: Client, args: BuildSignInMessageArgs): BuildSignInMessageResponse => {
  const result = build(args);
  if (result.isErr()) {
    throw result.error;
  } else {
    const siweMessage = result.value;
    return { siweMessage, message: siweMessage.toMessage() };
  }
};
