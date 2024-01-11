import { useCallback, useEffect, useState } from "react";
import { AuthClientError } from "@farcaster/auth-client";
import useAppClient from "./useAppClient";

export interface UseWatchStatusArgs {
  channelToken?: string;
  timeout?: number;
  interval?: number;
  onSuccess?: (statusData: UseWatchStatusData) => void;
  onError?: (error?: AuthClientError) => void;
  onResponse?: (statusData: UseWatchStatusData) => void;
}

export type UseWatchStatusData = StatusAPIResponse;

export interface StatusAPIResponse {
  state: "" | "pending" | "completed";
  nonce: string;
  url: string;
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

export function useWatchStatus(args: UseWatchStatusArgs) {
  const appClient = useAppClient();
  const { channelToken, timeout, interval, onSuccess, onError, onResponse } = {
    ...defaults,
    ...args,
  };

  const [statusData, setStatusData] = useState<StatusAPIResponse>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<AuthClientError>();

  const resetState = () => {
    setStatusData(undefined);
    setIsError(false);
    setIsSuccess(false);
    setError(undefined);
  };

  const watchStatus = useCallback(async () => {
    if (appClient && channelToken) {
      resetState();
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
          onResponse?.(data);
        },
      });
      if (isWatchStatusError) {
        setIsError(true);
        setIsPolling(false);
        setError(watchStatusError);
        onError?.(watchStatusError);
      } else {
        setIsSuccess(true);
        setIsPolling(false);
        setStatusData(data);
        onSuccess?.(data);
      }
    }
  }, [
    appClient,
    channelToken,
    timeout,
    interval,
    onSuccess,
    onError,
    onResponse,
  ]);

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
