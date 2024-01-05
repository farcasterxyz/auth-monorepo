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
  qrCodeUri?: string;
}

export function useConnect({
  nonce,
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
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ConnectError>();

  const connect = useCallback(async () => {
    if (appClient && siweUri && domain && !channelToken) {
      const {
        data,
        isError: isConnectError,
        error: connectError,
      } = await appClient.connect({
        nonce: typeof nonce === "function" ? await nonce() : nonce,
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
        const qrCodeUri = await QRCode.toDataURL(connectUri);
        setqrCodeUri(qrCodeUri);
        setIsSuccess(true);
        onSuccess?.({ channelToken, connectUri, qrCodeUri });
      }
    }
  }, [appClient, siweUri, domain, channelToken, nonce, notBefore, expirationTime, requestId, onError, onSuccess]);

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
    data: { channelToken, connectUri, qrCodeUri },
  };
}

export default useConnect;
