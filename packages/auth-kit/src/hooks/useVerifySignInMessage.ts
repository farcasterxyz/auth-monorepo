"use client";

import { useConfig } from "../hooks/useConfig";
import { useMutation } from "@tanstack/react-query";
import { UseMutationParameters, UseMutationReturnType } from "../types/query";
import {
  VerifySignInMessageData,
  VerifySignInMessageMutate,
  VerifySignInMessageMutateAsync,
  VerifySignInMessageVariables,
  verifySignInMessageOptions,
} from "../query/verifySignInMessage";
import { VerifySignInMessageErrorType } from "../actions/verifySignInMessage";
import { Evaluate } from "../types/utils";

export type UseVerifySignInMessageParameters<context = unknown> = {
  mutation?: UseMutationParameters<
    VerifySignInMessageData,
    VerifySignInMessageErrorType,
    VerifySignInMessageVariables,
    context
  >;
};

export type UseVerifySignInMessageReturnType<context = unknown> = Evaluate<
  UseMutationReturnType<
    VerifySignInMessageData,
    VerifySignInMessageErrorType,
    VerifySignInMessageVariables,
    context
  > & {
    verifySignInMessage: VerifySignInMessageMutate<context>;
    verifySignInMessageAsync: VerifySignInMessageMutateAsync<context>;
  }
>;

export function useVerifySignInMessage<context = unknown>({
  mutation,
}: UseVerifySignInMessageParameters<context> = {}): UseVerifySignInMessageReturnType<context> {
  const config = useConfig();

  const mutationOptions = verifySignInMessageOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return { verifySignInMessage: mutate, verifySignInMessageAsync: mutateAsync, ...result };
}

export default useVerifySignInMessage;
