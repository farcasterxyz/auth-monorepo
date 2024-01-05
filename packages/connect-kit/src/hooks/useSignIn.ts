import { ConnectError } from "@farcaster/connect";
import { useEffect } from "react";

import useAppClient from "./useAppClient";
import useConnect, { UseConnectArgs } from "./useConnect";
import useConnectContext from "./useConnectKitContext";
import useVerifySignInMessage from "./useVerifySignInMessage";
import useWatchStatus, { StatusAPIResponse, UseWatchStatusData } from "./useWatchStatus";

export type UseSignInArgs = Omit<UseConnectArgs, "onSuccess" | "onError"> & {
  timeout?: number;
  interval?: number;
  onSuccess?: (res: UseSignInData) => void;
  onStatusResponse?: (statusData: UseWatchStatusData) => void;
  onError?: (error?: ConnectError) => void;
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
    config: { domain },
  } = useConnectContext();
  const { timeout, interval, onSuccess, onStatusResponse, onError, ...connectArgs } = {
    ...defaults,
    ...args,
  };

  const {
    connect,
    reconnect,
    data: { channelToken, connectUri, qrCodeUri, nonce },
    isError: isConnectError,
    error: connectError,
  } = useConnect({ ...connectArgs, onError });

  const {
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

  const isError = isConnectError || isWatchStatusError || isVerifyError;
  const error = connectError || watchStatusError || verifyError;

  const signIn = () => {
    connect();
  };

  useEffect(() => {
    if (isSuccess && statusData && validSignature) {
      onSignIn(statusData);
      onSuccess?.(statusData);
    }
  }, [isSuccess, statusData, validSignature, onSignIn, onSuccess]);

  return {
    signIn,
    reconnect,
    isSuccess,
    isPolling,
    isError,
    error,
    channelToken,
    connectUri,
    qrCodeUri,
    appClient,
    data: statusData,
    validSignature,
  };
}

export default useSignIn;
