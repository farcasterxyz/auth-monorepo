"use client";

import { useConfig } from "../hooks/useConfig";
import { useMutation } from "@tanstack/react-query";
import { UseMutationParameters, UseMutationReturnType } from "../types/query";
import {
  CreateChannelData,
  CreateChannelMutate,
  CreateChannelMutateAsync,
  CreateChannelVariables,
  createChannelOptions,
} from "../query/createChannel";
import { CreateChannelErrorType } from "../actions/createChannel";
import { Evaluate } from "../types/utils";

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
