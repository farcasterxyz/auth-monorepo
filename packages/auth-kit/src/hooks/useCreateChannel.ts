import QRCode from "qrcode";
import { AuthClientError } from "@farcaster/auth-client";
import { useCallback, useState } from "react";

import { useAppClient } from "./useAppClient";
import useAuthKitContext from "./useAuthKitContext";

export interface UseCreateChannelArgs {
  nonce?: string | (() => Promise<string>);
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
  onSuccess?: (createChannelData: UseCreateChannelData) => void;
  onError?: (error?: AuthClientError) => void;
}

export interface UseCreateChannelData {
  channelToken?: string;
  url?: string;
  nonce?: string;
  qrCodeUri?: string;
}

export function useCreateChannel({
  nonce: customNonce,
  notBefore,
  expirationTime,
  requestId,
  onSuccess,
  onError,
}: UseCreateChannelArgs) {
  const { config } = useAuthKitContext();
  const { siweUri, domain } = config;
  const appClient = useAppClient();

  const [qrCodeUri, setqrCodeUri] = useState<string>();
  const [channelToken, setChannelToken] = useState<string>();
  const [url, setUrl] = useState<string>();
  const [nonce, setNonce] = useState<string>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<AuthClientError>();

  const connect = useCallback(async () => {
    if (appClient && siweUri && domain && !channelToken) {
      const nonceVal =
        typeof customNonce === "function" ? await customNonce() : customNonce;
      const {
        data,
        isError: isCreateChannelError,
        error: createChannelError,
      } = await appClient.connect({
        nonce: nonceVal,
        siweUri,
        domain,
        notBefore,
        expirationTime,
        requestId,
      });
      if (isCreateChannelError) {
        setIsError(true);
        setError(createChannelError);
        onError?.(createChannelError);
      } else {
        const { channelToken, url } = data;
        setChannelToken(channelToken);
        setUrl(url);
        setNonce(nonceVal);

        const qrCodeUri = await QRCode.toDataURL(url, { width: 360 });
        setqrCodeUri(qrCodeUri);
        setIsSuccess(true);
        onSuccess?.({ channelToken, url, qrCodeUri, nonce: nonceVal });
      }
    }
  }, [
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
  ]);

  const reconnect = useCallback(async () => {
    setChannelToken(undefined);
    setIsSuccess(false);
    setIsError(false);
    setError(undefined);

    connect();
  }, [connect, setChannelToken, setIsSuccess, setIsError, setError]);

  return {
    connect,
    reconnect,
    isSuccess,
    isError,
    error,
    data: { channelToken, url, qrCodeUri, nonce },
  };
}

export default useCreateChannel;
