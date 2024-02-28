import { AuthClientError, CompletedStatusAPIResponse, StatusAPIResponse } from "@farcaster/auth-client";

import { useConfig } from "../hooks/useConfig";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { UsePollStatusTillSuccessArgs } from "./usePollStatusTillSuccess";
import { useProfileStore, useSignInMessageStore } from ".";
import { useCallback } from "react";

export type UseSignInMutationVariables = Omit<NonNullable<UsePollStatusTillSuccessArgs["args"]>, "channelToken"> & {
  channelToken: string;
};

export type UseSignInArgs = {
  mutation?: Omit<
    UseMutationOptions<
      CompletedStatusAPIResponse & { isAuthenticated: boolean },
      AuthClientError,
      UseSignInMutationVariables
    >,
    "mutationFn" | "mutationKey"
  >;
};

export type UseSignInData = StatusAPIResponse;

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

type UnaliasedUseSignInResult = UseMutationResult<
  CompletedStatusAPIResponse & { isAuthenticated: boolean },
  AuthClientError,
  UseSignInMutationVariables
>;
type UseSignInResult = UnaliasedUseSignInResult & {
  signIn: UnaliasedUseSignInResult["mutate"];
  signInAsync: UnaliasedUseSignInResult["mutateAsync"];
  signOut: () => void;
};

// @TODO: `Omit` breaks the return type, needs to be fixed. For now, mutate and mutateAsync will also be passed
//
// type UseSignInResult = Omit<UnaliasedUseSignInResult, 'mutate' | 'mutateAsync'> & {
//   signIn: UnaliasedUseSignInResult["mutate"];
//   signInAsync: UnaliasedUseSignInResult["mutateAsync"];
// };

export function useSignIn({ mutation }: UseSignInArgs = {}): UseSignInResult {
  const config = useConfig();
  const { siweUri, domain } = config;

  const { setProfile, resetProfile } = useProfileStore(({ set, reset }) => ({ setProfile: set, resetProfile: reset }));
  const { setSignInMessage, resetSignInMessage } = useSignInMessageStore(({ set, reset }) => ({
    setSignInMessage: set,
    resetSignInMessage: reset,
  }));
  const {
    mutate: signIn,
    mutateAsync: signInAsync,
    reset,
    ...rest
  } = useMutation({
    mutationKey: ["signIn"],
    mutationFn: async (args) => {
      if (!siweUri) throw new Error("siweUri is not defined");
      if (!domain) throw new Error("domain is not defined");

      const { data: pollStatusTillSuccessResponse } = await config.appClient.pollStatusTillSuccess({
        channelToken: args?.channelToken,
        timeout: args?.timeout ?? defaults.timeout,
        interval: args?.interval ?? defaults.interval,
      });

      setSignInMessage({
        message: pollStatusTillSuccessResponse.message,
        signature: pollStatusTillSuccessResponse.signature,
      });

      const { success: isAuthenticated } = await config.appClient.verifySignInMessage({
        nonce: pollStatusTillSuccessResponse.nonce,
        domain,
        message: pollStatusTillSuccessResponse.message,
        signature: pollStatusTillSuccessResponse.signature,
      });

      setProfile({
        isAuthenticated,
        fid: pollStatusTillSuccessResponse.fid,
        pfpUrl: pollStatusTillSuccessResponse.pfpUrl,
        username: pollStatusTillSuccessResponse.username,
        displayName: pollStatusTillSuccessResponse.displayName,
        bio: pollStatusTillSuccessResponse.bio,
        custody: pollStatusTillSuccessResponse.custody,
        verifications: pollStatusTillSuccessResponse.verifications,
      });
      return { isAuthenticated, ...pollStatusTillSuccessResponse };
    },
    ...mutation,
  });

  const signOut = useCallback(() => {
    reset();
    resetProfile();
    resetSignInMessage();
  }, [reset, resetProfile, resetSignInMessage]);

  return { signIn, signInAsync, mutate: signIn, mutateAsync: signInAsync, signOut, reset, ...rest };
}

export default useSignIn;
