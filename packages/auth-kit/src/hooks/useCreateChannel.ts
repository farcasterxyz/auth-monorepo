import { AuthClientError } from "@farcaster/auth-client";
import { useCallback, useEffect, useState } from "react";

import { useAppClient } from "./useAppClient";
import useAuthKitContext from "./useAuthKitContext";

export interface UseCreateChannelArgs {
  nonce?: string | (() => Promise<string>);
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
  redirectUrl?: string;
  onSuccess?: (createChannelData: UseCreateChannelData) => void;
  onError?: (error?: AuthClientError) => void;
}

export interface UseCreateChannelData {
  channelToken?: string;
  url?: string;
  nonce?: string;
}

export function useCreateChannel({
  nonce: customNonce,
  notBefore,
  expirationTime,
  requestId,
  onSuccess,
  onError,
  redirectUrl,
}: UseCreateChannelArgs) {
  const { config } = useAuthKitContext();
  const { siweUri, domain } = config;
  const appClient = useAppClient();

  const [connected, setConnected] = useState<boolean>(false);
  const [channelToken, setChannelToken] = useState<string>();
  const [url, setUrl] = useState<string>();
  const [nonce, setNonce] = useState<string>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<AuthClientError>();

  const createChannel = useCallback(async () => {
    if (connected && appClient && siweUri && domain && !channelToken) {
      const nonceVal = typeof customNonce === "function" ? await customNonce() : customNonce;
      const {
        data,
        isError: isCreateChannelError,
        error: createChannelError,
      } = await appClient.createChannel({
        nonce: nonceVal,
        siweUri,
        domain,
        notBefore,
        expirationTime,
        requestId,
        redirectUrl,
      });
      if (isCreateChannelError) {
        setIsError(true);
        setError(createChannelError);
        onError?.(createChannelError);
      } else {
        const { channelToken, url, nonce } = data;
        setChannelToken(channelToken);
        setUrl(url);
        setNonce(nonce);

        setIsSuccess(true);
        onSuccess?.({ channelToken, url, nonce });
      }
    }
  }, [
    connected,
    appClient,
    siweUri,
    domain,
    channelToken,
    customNonce,
    notBefore,
    expirationTime,
    requestId,
    onError,
    onSuccess,
    redirectUrl,
  ]);

  useEffect(() => {
    createChannel();
  }, [createChannel]);

  const connect = useCallback(async () => {
    setConnected(true);
  }, [setConnected]);

  const reset = useCallback(() => {
    setChannelToken(undefined);
    setUrl(undefined);
    setIsSuccess(false);
    setIsError(false);
    setError(undefined);
  }, [setChannelToken, setUrl, setIsSuccess, setIsError, setError]);

  const reconnect = useCallback(() => {
    reset();
    connect();
  }, [connect, reset]);

  return {
    connect,
    reconnect,
    reset,
    isSuccess,
    isError,
    error,
    data: { channelToken, url, nonce },
  };
}

export default useCreateChannel;
