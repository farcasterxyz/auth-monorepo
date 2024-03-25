import type { MutateOptions, MutationOptions } from "@tanstack/query-core";

import { type SignInParameters, type SignInReturnType, signIn } from "../actions/signIn.js";
import { type Evaluate } from "../types/utils.js";
import { type Config } from "../types/config.js";

export function signInOptions(config: Config) {
  return {
    mutationFn(variables) {
      return signIn(config, variables);
    },
    mutationKey: ["signIn"],
  } as const satisfies MutationOptions<SignInData, Error, SignInVariables>;
}

export type SignInData = Evaluate<SignInReturnType>;

export type SignInVariables = SignInParameters;

export type SignInMutate<context = unknown> = (
  variables: SignInVariables,
  options?: Evaluate<MutateOptions<SignInData, Error, Evaluate<SignInVariables>, context>> | undefined,
) => void;

export type SignInMutateAsync<context = unknown> = (
  variables: SignInVariables,
  options?: Evaluate<MutateOptions<SignInData, Error, Evaluate<SignInVariables>, context>> | undefined,
) => Promise<SignInData>;
