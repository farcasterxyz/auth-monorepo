import { AuthClientError, CreateChannelAPIResponse } from "@farcaster/auth-client";

import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useConfig } from "../hooks/useConfig";

export type UseCreateChannelArgs = {
  query?: Omit<UseQueryOptions<CreateChannelAPIResponse, AuthClientError>, "queryFn" | "queryKey">;
  args?: {
    nonce?: string | (() => Promise<string>);
    notBefore?: string;
    expirationTime?: string;
    requestId?: string;
  };
};

export function useCreateChannel({
  args,
  query: { enabled, ...query } = { enabled: true },
}: UseCreateChannelArgs = {}): UseQueryResult<CreateChannelAPIResponse, AuthClientError> {
  const config = useConfig();
  const { siweUri, domain } = config;

  return useQuery({
    queryKey: ["createChannel", { args }],
    queryFn: async () => {
      if (!siweUri) throw new Error("siweUri is not defined");
      if (!domain) throw new Error("domain is not defined");

      const nonceVal = typeof args?.nonce === "function" ? await args.nonce() : args?.nonce;
      const { data } = await config.appClient.createChannel({
        nonce: nonceVal,
        siweUri,
        domain,
        notBefore: args?.notBefore,
        expirationTime: args?.expirationTime,
        requestId: args?.requestId,
      });

      return data;
    },
    ...query,
    enabled: Boolean(enabled && siweUri && domain),
  });
}

export default useCreateChannel;
