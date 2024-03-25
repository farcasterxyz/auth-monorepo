import type { MutateOptions, MutationOptions } from "@tanstack/query-core";

import {
  type VerifySiweMessageParameters,
  type VerifySiweMessageReturnType,
  verifySiweMessage,
} from "../actions/verifySiweMessage.js";
import { type Evaluate } from "../types/utils.js";
import { type Config } from "../types/config.js";

export function verifySiweMessageOptions(config: Config) {
  return {
    mutationFn(variables) {
      return verifySiweMessage(config, variables);
    },
    mutationKey: ["verifySiweMessage"],
  } as const satisfies MutationOptions<VerifySiweMessageData, Error, VerifySiweMessageVariables>;
}

export type VerifySiweMessageData = Evaluate<VerifySiweMessageReturnType>;

export type VerifySiweMessageVariables = VerifySiweMessageParameters;

export type VerifySiweMessageMutate<context = unknown> = (
  variables: VerifySiweMessageVariables,
  options?:
    | Evaluate<MutateOptions<VerifySiweMessageData, Error, Evaluate<VerifySiweMessageVariables>, context>>
    | undefined,
) => void;

export type VerifySiweMessageMutateAsync<context = unknown> = (
  variables: VerifySiweMessageVariables,
  options?:
    | Evaluate<MutateOptions<VerifySiweMessageData, Error, Evaluate<VerifySiweMessageVariables>, context>>
    | undefined,
) => Promise<VerifySiweMessageData>;
