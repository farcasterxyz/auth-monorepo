import useConnect from "./useConnect";
import useWatchStatus from "./useWatchStatus";
import useVerifySignInMessage from "./useVerifySignInMessage";
import useAppClient from "./useAppClient";
import useConnectContext from "./useConnectKitContext";
import { useEffect } from "react";

export interface UseSignInArgs {
  siweUri: string;
  domain: string;
  timeout?: number;
  interval?: number;
}

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export function useSignIn(args: UseSignInArgs) {
  const appClient = useAppClient();
  const ctx = useConnectContext();
  const { onSignIn } = ctx;
  const { siweUri, domain, timeout, interval } = {
    ...defaults,
    ...args,
  };

  const {
    connect,
    reconnect,
    data: { channelToken, connectURI, qrCodeURI },
    isError: isConnectError,
    error: connectError,
  } = useConnect({ siweUri, domain });

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
    connectURI,
    qrCodeURI,
    appClient,
    data: statusData,
    validSignature,
  };
}

export default useSignIn;
