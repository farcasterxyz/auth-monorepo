import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { AuthClientError, StatusAPIResponse } from "@farcaster/auth-client";
import { useConfig } from "../hooks/useConfig";

export interface UsePollStatusTillSuccessArgs {
  args:
    | {
        channelToken: string;
        timeout?: number;
        interval?: number;
      }
    | undefined;
  query?: Omit<UseQueryOptions<UsePollStatusTillSuccessData, AuthClientError>, "queryFn" | "queryKey">;
}

export type UsePollStatusTillSuccessData = StatusAPIResponse;

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export function usePollStatusTillSuccess({
  args,
  query: { enabled, ...query } = { enabled: true },
}: UsePollStatusTillSuccessArgs): UseQueryResult<UsePollStatusTillSuccessData, AuthClientError> {
  const config = useConfig();
  const { channelToken, timeout, interval } = {
    ...defaults,
    ...args,
  };

  return useQuery({
    queryFn: async () => {
      if (!channelToken) throw new Error("Missing `channelToken`.");
      const { data } = await config.appClient.pollStatusTillSuccess({
        channelToken,
        timeout,
        interval,
      });
      return data;
    },
    queryKey: ["pollStatusTillSuccess", args],
    ...query,
    enabled: Boolean(enabled && channelToken),
  });
}

export default usePollStatusTillSuccess;
