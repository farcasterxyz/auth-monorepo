"use client";

import { useConfig } from "./useConfig.js";
import { useMutation } from "@tanstack/react-query";
import { type UseMutationParameters, type UseMutationReturnType } from "../types/query.js";
import {
  type VerifySiweMessageData,
  type VerifySiweMessageMutate,
  type VerifySiweMessageMutateAsync,
  type VerifySiweMessageVariables,
  verifySiweMessageOptions,
} from "../query/verifySiweMessage.js";
import { type VerifySiweMessageErrorType } from "../actions/verifySiweMessage.js";
import { type Evaluate } from "../types/utils.js";

export type UseVerifySiweMessageParameters<context = unknown> = {
  mutation?: UseMutationParameters<
    VerifySiweMessageData,
    VerifySiweMessageErrorType,
    VerifySiweMessageVariables,
    context
  >;
};

export type UseVerifySiweMessageReturnType<context = unknown> = Evaluate<
  UseMutationReturnType<VerifySiweMessageData, VerifySiweMessageErrorType, VerifySiweMessageVariables, context> & {
    verifySiweMessage: VerifySiweMessageMutate<context>;
    verifySiweMessageAsync: VerifySiweMessageMutateAsync<context>;
  }
>;

export function useVerifySiweMessage<context = unknown>({
  mutation,
}: UseVerifySiweMessageParameters<context> = {}): UseVerifySiweMessageReturnType<context> {
  const config = useConfig();

  const mutationOptions = verifySiweMessageOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return { verifySiweMessage: mutate, verifySiweMessageAsync: mutateAsync, ...result };
}
