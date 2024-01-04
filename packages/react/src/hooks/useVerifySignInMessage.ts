import { useCallback, useEffect, useState } from "react";
import { ConnectError } from "@farcaster/connect";
import useAppClient from "./useAppClient";

interface UseVerifySignInMessageArgs {
  message?: string;
  signature?: `0x${string}`;
}

function useVerifySignInMessage({ message, signature }: UseVerifySignInMessageArgs) {
  const appClient = useAppClient();

  const [validSignature, setValidSignature] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ConnectError>();

  const resetState = async () => {
    setIsError(false);
    setIsSuccess(false);
    setError(undefined);
  };

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
    resetState();
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
