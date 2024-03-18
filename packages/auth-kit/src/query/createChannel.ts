import type { MutateOptions, MutationOptions } from "@tanstack/query-core";

import { type CreateChannelParameters, type CreateChannelReturnType, createChannel } from "../actions/createChannel";
import { type Evaluate } from "../types/utils";
import { Config } from "../types/config";

export function createChannelOptions(config: Config) {
  return {
    mutationFn(variables) {
      return createChannel(config, variables);
    },
    mutationKey: ["createChannel"],
  } as const satisfies MutationOptions<CreateChannelData, Error, CreateChannelVariables>;
}

export type CreateChannelData = Evaluate<CreateChannelReturnType>;

export type CreateChannelVariables = CreateChannelParameters;

export type CreateChannelMutate<context = unknown> = (
  variables: CreateChannelVariables,
  options?: Evaluate<MutateOptions<CreateChannelData, Error, Evaluate<CreateChannelVariables>, context>> | undefined,
) => void;

export type CreateChannelMutateAsync<context = unknown> = (
  variables: CreateChannelVariables,
  options?: Evaluate<MutateOptions<CreateChannelData, Error, Evaluate<CreateChannelVariables>, context>> | undefined,
) => Promise<CreateChannelData>;
