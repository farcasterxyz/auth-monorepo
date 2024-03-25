"use client";

import { useConfig } from "../hooks/useConfig.js";
import { useMutation } from "@tanstack/react-query";
import { useSignInMessageStore } from "./useSignInMessage.js";
import { useProfileStore } from "./useProfile.js";
import { useCallback, useEffect } from "react";
import { type UseMutationParameters, type UseMutationReturnType } from "../types/query.js";
import {
  type SignInData,
  type SignInMutate,
  type SignInMutateAsync,
  type SignInVariables,
  signInOptions,
} from "../query/signIn.js";
import { type SignInErrorType } from "../actions/signIn.js";
import { type Evaluate } from "../types/utils.js";

export type UseSignInParameters<context = unknown> = {
  mutation?: UseMutationParameters<SignInData, SignInErrorType, SignInVariables, context>;
};

export type UseSignInReturnType<context = unknown> = Evaluate<
  UseMutationReturnType<SignInData, SignInErrorType, SignInVariables, context> & {
    signIn: SignInMutate<context>;
    signInAsync: SignInMutateAsync<context>;
    signOut: () => void;
  }
>;

export function useSignIn<context = unknown>({
  mutation,
}: UseSignInParameters<context> = {}): UseSignInReturnType<context> {
  const config = useConfig();

  const { setProfile, resetProfile } = useProfileStore(({ set, reset }) => ({ setProfile: set, resetProfile: reset }));
  const { setSignInMessage, resetSignInMessage } = useSignInMessageStore(({ set, reset }) => ({
    setSignInMessage: set,
    resetSignInMessage: reset,
  }));

  const mutationOptions = signInOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  useEffect(() => {
    if (result.status !== "success") return;

    setSignInMessage({ message: result.data.message, signature: result.data.signature });
    setProfile({
      isAuthenticated: result.data.isAuthenticated,
      fid: result.data.fid,
      pfpUrl: result.data.pfpUrl,
      username: result.data.username,
      displayName: result.data.displayName,
      bio: result.data.bio,
      custody: result.data.custody,
      verifications: result.data.verifications,
    });
  }, [setSignInMessage, setProfile, result.data, result.status]);

  const signOut = useCallback(() => {
    result.reset();
    resetProfile();
    resetSignInMessage();
  }, [result.reset, resetProfile, resetSignInMessage]);

  return { signIn: mutate, signInAsync: mutateAsync, signOut, ...result };
}

export default useSignIn;
