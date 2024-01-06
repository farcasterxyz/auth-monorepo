import { useCallback, useState } from "react";
import { ConnectError } from "@farcaster/connect";
import QRCode from "qrcode";
import { useAppClient } from "./useAppClient";
import useConnectKitContext from "./useConnectKitContext";

export interface UseConnectArgs {
  nonce?: string | (() => Promise<string>);
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
  onSuccess?: (connectData: UseConnectData) => void;
  onError?: (error?: ConnectError) => void;
}

export interface UseConnectData {
  channelToken?: string;
  connectUri?: string;
  nonce?: string;
  qrCodeUri?: string;
}

export function useConnect({
  nonce: customNonce,
  notBefore,
  expirationTime,
  requestId,
  onSuccess,
  onError,
}: UseConnectArgs) {
  const { config } = useConnectKitContext();
  const { siweUri, domain } = config;
  const appClient = useAppClient();

  const [qrCodeUri, setqrCodeUri] = useState<string>();
  const [channelToken, setChannelToken] = useState<string>();
  const [connectUri, setConnectUri] = useState<string>();
  const [nonce, setNonce] = useState<string>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ConnectError>();

  const connect = useCallback(async () => {
    if (appClient && siweUri && domain && !channelToken) {
      const nonceVal = typeof customNonce === "function" ? await customNonce() : customNonce;
      const {
        data,
        isError: isConnectError,
        error: connectError,
      } = await appClient.connect({
        nonce: nonceVal,
        siweUri,
        domain,
        notBefore,
        expirationTime,
        requestId,
      });
      if (isConnectError) {
        setIsError(true);
        setError(connectError);
        onError?.(connectError);
      } else {
        const { channelToken, connectUri } = data;
        setChannelToken(channelToken);
        setConnectUri(connectUri);
        setNonce(nonceVal);

        const qrCodeUri = await QRCode.toDataURL(connectUri, { width: 360 });
        setqrCodeUri(qrCodeUri);
        setIsSuccess(true);
        onSuccess?.({ channelToken, connectUri, qrCodeUri, nonce });
      }
    }
  }, [appClient, siweUri, domain, channelToken, customNonce, notBefore, expirationTime, requestId, onError, onSuccess]);

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
    data: { channelToken, connectUri, qrCodeUri, nonce },
  };
}

export default useConnect;
