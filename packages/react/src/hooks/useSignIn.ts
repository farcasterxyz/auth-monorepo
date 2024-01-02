import useConnect from "./useConnect";
import useWatchStatus from "./useWatchStatus";
import useVerifySignInMessage from "./useVerifySignInMessage";
import useAppClient from "./useAppClient";

interface UseSignInArgs {
  siweUri: string;
  domain: string;
  relayURI?: string;
  timeout?: number;
  interval?: number;
}

const defaults = {
  relayURI: "http://localhost:8000",
  timeout: 300_000,
  interval: 1_500,
};

function useSignIn(args: UseSignInArgs) {
  const { relayURI, siweUri, domain, timeout, interval } = {
    ...args,
    ...defaults,
  };

  const { appClient } = useAppClient({
    relayURI,
  });

  const {
    connect,
    data: { channelToken, connectURI, qrCodeURI },
    isError: isConnectError,
    error: connectError,
  } = useConnect({ appClient, siweUri, domain });

  const {
    isPolling,
    data: statusData,
    isError: isWatchStatusError,
    error: watchStatusError,
  } = useWatchStatus({
    appClient,
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
    appClient,
    message: statusData?.message,
    signature: statusData?.signature,
  });

  const isError = isConnectError || isWatchStatusError || isVerifyError;
  const error = connectError || watchStatusError || verifyError;

  const signIn = () => {
    connect();
  };

  return {
    signIn,
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
