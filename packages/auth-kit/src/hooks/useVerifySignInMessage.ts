import { AppClient } from "@farcaster/auth-client";
import { useConfig } from "../hooks/useConfig";
import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";

export type UseVerifySignInMessageArgs = {
  args:
    | {
        nonce: string;
        domain: string;
        message: string;
        signature: `0x${string}`;
      }
    | undefined;
  query?: Omit<
    UseQueryOptions<
      boolean,
      Error,
      boolean,
      ["verifySignInMessage", { args: UseVerifySignInMessageArgs["args"]; appClient: AppClient }]
    >,
    "queryKey" | "queryFn"
  >;
};

export interface UseVerifySignInMessageData {
  message?: string;
  signature?: `0x${string}`;
  validSignature: boolean;
}

export function useVerifySignInMessage({
  args,
  query: { enabled, ...query } = { enabled: true },
}: UseVerifySignInMessageArgs): UseQueryResult<boolean> {
  const config = useConfig();

  return useQuery({
    queryKey: ["verifySignInMessage", { args, appClient: config.appClient }],
    queryFn: async () => {
      if (!config.appClient || !args) throw new Error("Unexpected Error");
      const { success } = await config.appClient.verifySignInMessage({
        ...args,
      });
      return success;
    },
    ...query,
    enabled: Boolean(enabled && args),
  });
}

export default useVerifySignInMessage;
