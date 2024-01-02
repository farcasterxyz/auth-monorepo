import { useCallback, useEffect, useState } from "react";
import { AppClient, ConnectError } from "@farcaster/connect";

interface UseWatchStatusArgs {
  appClient?: AppClient;
  channelToken?: string;
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
  timeout: 300_000,
  interval: 1_500,
};

function useWatchStatus(args: UseWatchStatusArgs) {
  const { appClient, channelToken, timeout, interval } = {
    ...defaults,
    ...args,
  };

  const [statusData, setStatusData] = useState<StatusAPIResponse>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ConnectError>();

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

  useEffect(() => {
    if (channelToken) {
      watchStatus();
    }
  }, [channelToken, watchStatus]);

  return {
    isSuccess,
    isPolling,
    isError,
    error,
    data: statusData,
  };
}

export default useWatchStatus;
