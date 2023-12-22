import { useCallback, useEffect, useState } from "react";
import {
  AppClient,
  ConnectError,
  createAppClient,
  viem,
} from "@farcaster/connect";
import { JsonRpcProvider } from "ethers";
import QRCode from "qrcode";

interface UseSignInArgs {
  siweUri: string;
  domain: string;
  relayURI?: string;
  timeout?: number;
  interval?: number;
}

interface StatusAPIResponse {
  state: "" | "pending" | "completed";
  nonce: string;
  connectURI: string;
  message?: string;
  signature?: `0x${string}`;
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
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

  const [enabled, setEnabled] = useState<boolean>(false);
  const [appClient, setAppClient] = useState<AppClient>();
  const [channelToken, setChannelToken] = useState<string>();
  const [connectURI, setConnectURI] = useState<string>();
  const [qrCodeURI, setQrCodeURI] = useState<string>();
  const [statusData, setStatusData] = useState<StatusAPIResponse>();
  const [validSignature, setValidSignature] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ConnectError>();

  const verifySignInMessage = useCallback(async () => {
    if (appClient && statusData?.message && statusData?.signature) {
      const {
        success,
        isError: isVerifyError,
        error: verifyError,
      } = await appClient.verifySignInMessage({
        message: statusData?.message,
        signature: statusData?.signature,
      });
      if (isVerifyError) {
        setIsError(true);
        setError(verifyError);
      } else {
        setValidSignature(success);
      }
    }
  }, [appClient, statusData?.message, statusData?.signature]);

  const generateQRCode = useCallback(async () => {
    if (connectURI) {
      const qrCode = await QRCode.toDataURL(connectURI);
      setQrCodeURI(qrCode);
    }
  }, [connectURI]);

  const watchStatus = useCallback(async () => {
    if (appClient && channelToken) {
      setIsPolling(true);
      const {
        data,
        isError: isWatchStatusError,
        error: watchStatusError,
      } = await appClient.watchStatus({
        channelToken,
        timeout,
        interval,
        onResponse: ({ data }) => {
          setStatusData(data);
        },
      });
      if (isWatchStatusError) {
        setIsError(true);
        setIsPolling(false);
        setError(watchStatusError);
      } else {
        setIsSuccess(true);
        setIsPolling(false);
        setStatusData(data);
      }
    }
  }, [appClient, channelToken, timeout, interval]);

  const connect = useCallback(async () => {
    if (appClient && !channelToken) {
      const {
        data: { channelToken, connectURI },
        isError: isConnectError,
        error: connectError,
      } = await appClient.connect({
        siweUri,
        domain,
      });
      if (isConnectError) {
        setIsError(true);
        setError(connectError);
      } else {
        setChannelToken(channelToken);
        setConnectURI(connectURI);
      }
    }
  }, [appClient, domain, siweUri, channelToken]);

  useEffect(() => {
    if (statusData?.message && statusData?.signature) {
      verifySignInMessage();
    }
  }, [statusData?.message, statusData?.signature, verifySignInMessage]);

  useEffect(() => {
    if (connectURI) {
      generateQRCode();
    }
  }, [connectURI, generateQRCode]);

  useEffect(() => {
    if (channelToken) {
      watchStatus();
    }
  }, [channelToken, watchStatus]);

  useEffect(() => {
    if (enabled) {
      connect();
    }
  }, [enabled, connect]);

  useEffect(() => {
    const client = createAppClient({
      relayURI,
      ethereum: viem(),
    });
    client.ethereum.provider = new JsonRpcProvider(
      "https://mainnet.optimism.io"
    );
    setAppClient(client);
  }, [relayURI]);

  const signIn = () => {
    setEnabled(true);
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
