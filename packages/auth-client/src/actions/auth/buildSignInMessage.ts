import { Client } from "clients/createClient";
import { build, BuildResponse } from "../../messages/build";
import { SignInMessageParams } from "../../types";
import { Unwrapped, unwrap } from "../../errors";

export type BuildSignInMessageArgs = SignInMessageParams;
export type BuildSignInMessageResponse = Unwrapped<BuildResponse>;

export const buildSignInMessage = (_client: Client, args: BuildSignInMessageArgs): BuildSignInMessageResponse => {
  return unwrap(build(args));
};
