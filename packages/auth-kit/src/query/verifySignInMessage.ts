import type { MutateOptions, MutationOptions } from "@tanstack/query-core";

import {
  type VerifySignInMessageParameters,
  type VerifySignInMessageReturnType,
  verifySignInMessage,
} from "../actions/verifySignInMessage.js";
import { type Evaluate } from "../types/utils.js";
import { type Config } from "../types/config.js";

export function verifySignInMessageOptions(config: Config) {
  return {
    mutationFn(variables) {
      return verifySignInMessage(config, variables);
    },
    mutationKey: ["verifySignInMessage"],
  } as const satisfies MutationOptions<VerifySignInMessageData, Error, VerifySignInMessageVariables>;
}

export type VerifySignInMessageData = Evaluate<VerifySignInMessageReturnType>;

export type VerifySignInMessageVariables = VerifySignInMessageParameters;

export type VerifySignInMessageMutate<context = unknown> = (
  variables: VerifySignInMessageVariables,
  options?:
    | Evaluate<MutateOptions<VerifySignInMessageData, Error, Evaluate<VerifySignInMessageVariables>, context>>
    | undefined,
) => void;

export type VerifySignInMessageMutateAsync<context = unknown> = (
  variables: VerifySignInMessageVariables,
  options?:
    | Evaluate<MutateOptions<VerifySignInMessageData, Error, Evaluate<VerifySignInMessageVariables>, context>>
    | undefined,
) => Promise<VerifySignInMessageData>;
