import { AuthClientError, StatusAPIResponse } from "@farcaster/auth-client";
import { useCallback, useEffect } from "react";

import useAppClient from "./useAppClient";
import useCreateChannel, { UseCreateChannelArgs } from "./useCreateChannel";
import useAuthKitContext from "./useAuthKitContext";
import useVerifySignInMessage from "./useVerifySignInMessage";
import useWatchStatus, { UseWatchStatusData } from "./useWatchStatus";

export type UseSignInArgs = Omit<UseCreateChannelArgs, "onSuccess" | "onError"> & {
  timeout?: number;
  interval?: number;
  onSuccess?: (res: UseSignInData) => void;
  onStatusResponse?: (statusData: UseWatchStatusData) => void;
  onError?: (error?: AuthClientError) => void;
};

export type UseSignInData = StatusAPIResponse;

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export function useSignIn(args: UseSignInArgs) {
  const appClient = useAppClient();
  const {
    onSignIn,
    onSignOut,
    config: { domain, redirectUrl },
  } = useAuthKitContext();
  const { timeout, interval, onSuccess, onStatusResponse, onError, ...createChannelArgs } = {
    ...defaults,
    ...args,
  };

  const {
    connect,
    reconnect,
    reset,
    data: { channelToken, url, nonce },
    isSuccess: isConnected,
    isError: isCreateChannelError,
    error: createChannelError,
  } = useCreateChannel({ ...createChannelArgs, redirectUrl, onError });

  const {
    watch,
    isPolling,
    data: statusData,
    isError: isWatchStatusError,
    error: watchStatusError,
  } = useWatchStatus({
    channelToken,
    timeout,
    interval,
    onError,
    onResponse: onStatusResponse,
  });

  const {
    isSuccess,
    data: { validSignature },
    isError: isVerifyError,
    error: verifyError,
  } = useVerifySignInMessage({
    nonce,
    domain,
    message: statusData?.message,
    signature: statusData?.signature,
    onError,
  });

  const isError = isCreateChannelError || isWatchStatusError || isVerifyError;
  const error = createChannelError || watchStatusError || verifyError;

  const signIn = useCallback(() => {
    watch();
  }, [watch]);

  const signOut = useCallback(() => {
    onSignOut();
    reset();
  }, [onSignOut, reset]);

  useEffect(() => {
    if (isSuccess && statusData && validSignature) {
      onSignIn(statusData);
      onSuccess?.(statusData);
    }
  }, [isSuccess, statusData, validSignature, onSignIn, onSuccess]);

  return {
    signIn,
    signOut,
    connect,
    reconnect,
    isConnected,
    isSuccess,
    isPolling,
    isError,
    error,
    channelToken,
    url,
    appClient,
    data: statusData,
    validSignature,
  };
}

export default useSignIn;
