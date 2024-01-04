import useConnect, { UseConnectArgs } from "./useConnect";
import useWatchStatus from "./useWatchStatus";
import useVerifySignInMessage from "./useVerifySignInMessage";
import useAppClient from "./useAppClient";
import useConnectContext from "./useConnectKitContext";
import { useEffect } from "react";

export type UseSignInArgs = UseConnectArgs & {
  timeout?: number;
  interval?: number;
};

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export function useSignIn(args: UseSignInArgs) {
  const appClient = useAppClient();
  const { onSignIn } = useConnectContext();
  const { timeout, interval, ...connectArgs } = {
    ...defaults,
    ...args,
  };

  const {
    connect,
    reconnect,
    data: { channelToken, connectUri, qrCodeUri },
    isError: isConnectError,
    error: connectError,
  } = useConnect(connectArgs);

  const {
    isPolling,
    data: statusData,
    isError: isWatchStatusError,
    error: watchStatusError,
  } = useWatchStatus({
    channelToken,
    timeout,
    interval,
  });

  const {
    isSuccess,
    data: { validSignature },
    isError: isVerifyError,
    error: verifyError,
  } = useVerifySignInMessage({
    message: statusData?.message,
    signature: statusData?.signature,
  });

  const isError = isConnectError || isWatchStatusError || isVerifyError;
  const error = connectError || watchStatusError || verifyError;

  const signIn = () => {
    connect();
  };

  useEffect(() => {
    if (isSuccess && statusData && validSignature) {
      onSignIn(statusData);
    }
  }, [isSuccess, statusData, validSignature, onSignIn]);

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
