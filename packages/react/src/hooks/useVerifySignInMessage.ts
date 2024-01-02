import { useCallback, useEffect, useState } from "react";
import { AppClient, ConnectError } from "@farcaster/connect";

interface UseVerifySignInMessageArgs {
  appClient?: AppClient;
  message?: string;
  signature?: `0x${string}`;
}

function useVerifySignInMessage(args: UseVerifySignInMessageArgs) {
  const { appClient, message, signature } = args;

  const [validSignature, setValidSignature] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ConnectError>();

  const verifySignInMessage = useCallback(async () => {
    if (appClient && message && signature) {
      const {
        success,
        isError: isVerifyError,
        error: verifyError,
      } = await appClient.verifySignInMessage({
        message,
        signature,
      });
      if (isVerifyError) {
        setIsError(true);
        setError(verifyError);
      } else {
        setValidSignature(success);
        setIsSuccess(true);
      }
    }
  }, [appClient, message, signature]);

  useEffect(() => {
    if (message && signature) {
      verifySignInMessage();
    }
  }, [message, signature, verifySignInMessage]);

  return {
    isSuccess,
    isError,
    error,
    data: { validSignature },
  };
}

export default useVerifySignInMessage;
