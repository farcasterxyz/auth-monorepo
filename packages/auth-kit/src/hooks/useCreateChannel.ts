"use client";

import { useConfig } from "../hooks/useConfig.js";
import { useMutation } from "@tanstack/react-query";
import { type UseMutationParameters, type UseMutationReturnType } from "../types/query.js";
import {
  type CreateChannelData,
  type CreateChannelMutate,
  type CreateChannelMutateAsync,
  type CreateChannelVariables,
  createChannelOptions,
} from "../query/createChannel.js";
import { type CreateChannelErrorType } from "../actions/createChannel.js";
import { type Evaluate } from "../types/utils.js";

export type UseCreateChannelParameters<context = unknown> = {
  mutation?: UseMutationParameters<CreateChannelData, CreateChannelErrorType, CreateChannelVariables, context>;
};

export type UseCreateChannelReturnType<context = unknown> = Evaluate<
  UseMutationReturnType<CreateChannelData, CreateChannelErrorType, CreateChannelVariables, context> & {
    createChannel: CreateChannelMutate<context>;
    createChannelAsync: CreateChannelMutateAsync<context>;
  }
>;

export function useCreateChannel<context = unknown>({
  mutation,
}: UseCreateChannelParameters<context> = {}): UseCreateChannelReturnType<context> {
  const config = useConfig();

  const mutationOptions = createChannelOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return { createChannel: mutate, createChannelAsync: mutateAsync, ...result } as const;
}
