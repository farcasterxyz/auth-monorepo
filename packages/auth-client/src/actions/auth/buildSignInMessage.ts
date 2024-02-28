import { Client } from "clients/createClient";
import { build, BuildResponse, SignInMessageParams } from "../../messages/build";

export type BuildSignInMessageArgs = SignInMessageParams;
export type BuildSignInMessageResponse = BuildResponse;

export const buildSignInMessage = (_client: Client, args: BuildSignInMessageArgs): BuildSignInMessageResponse => {
  return build(args);
};
