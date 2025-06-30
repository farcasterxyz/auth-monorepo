import type { Client } from "clients/createClient";
import { build, type BuildResponse } from "../../messages/build";
import type { SignInMessageParams } from "../../types";
import { type Unwrapped, unwrap } from "../../errors";

export type BuildSignInMessageArgs = SignInMessageParams;
export type BuildSignInMessageResponse = Unwrapped<BuildResponse>;

export const buildSignInMessage = (_client: Client, args: BuildSignInMessageArgs): BuildSignInMessageResponse => {
  return unwrap(build(args));
};
