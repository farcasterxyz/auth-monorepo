import { useCallback, useEffect, useState } from "react";
import { AuthClientError } from "@farcaster/auth-client";
import useAppClient from "./useAppClient";

export interface UseVerifySignInMessageArgs {
  nonce?: string;
  domain?: string;
  message?: string;
  signature?: `0x${string}`;
  onSuccess?: (statusData: UseVerifySignInMessageData) => void;
  onError?: (error?: AuthClientError) => void;
}

export interface UseVerifySignInMessageData {
  message?: string;
  signature?: `0x${string}`;
  validSignature: boolean;
}

export function useVerifySignInMessage({
  nonce,
  domain,
  message,
  signature,
  onSuccess,
  onError,
}: UseVerifySignInMessageArgs) {
  const appClient = useAppClient();

  const [validSignature, setValidSignature] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<AuthClientError>();

  const resetState = async () => {
    setIsError(false);
    setIsSuccess(false);
    setValidSignature(false);
    setError(undefined);
  };

  const verifySignInMessage = useCallback(async () => {
    if (appClient && nonce && domain && message && signature) {
      const {
        success,
        isError: isVerifyError,
        error: verifyError,
      } = await appClient.verifySignInMessage({
        nonce,
        domain,
        message,
        signature,
      });
      if (isVerifyError) {
        setIsError(true);
        setError(verifyError);
        onError?.(verifyError);
      } else {
        setValidSignature(success);
        setIsSuccess(true);
        onSuccess?.({ message, signature, validSignature: success });
      }
    }
  }, [appClient, nonce, domain, message, signature, onSuccess, onError]);

  useEffect(() => {
    resetState();
    if (nonce && domain && message && signature) {
      verifySignInMessage();
    }
  }, [nonce, domain, message, signature, verifySignInMessage]);

  return {
    isSuccess,
    isError,
    error,
    data: { message, signature, validSignature },
  };
}

export default useVerifySignInMessage;
