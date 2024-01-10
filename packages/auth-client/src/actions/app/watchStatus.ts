import { AsyncUnwrapped, unwrap } from "../../errors";
import { Client } from "../../clients/createClient";
import { poll, HttpResponse } from "../../clients/transports/http";

export interface WatchStatusArgs {
  channelToken: string;
  timeout?: number;
  interval?: number;
  onResponse?: (response: HttpResponse<StatusAPIResponse>) => void;
}

export type WatchStatusResponse = AsyncUnwrapped<HttpResponse<StatusAPIResponse>>;

interface StatusAPIResponse {
  state: "pending" | "completed";
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

const path = "channel/status";

const voidCallback = () => {};

export const watchStatus = async (client: Client, args: WatchStatusArgs): WatchStatusResponse => {
  const result = await poll<StatusAPIResponse>(
    client,
    path,
    {
      timeout: args?.timeout ?? 300_000,
      interval: args?.interval ?? 1000,
      onResponse: args?.onResponse ?? voidCallback,
    },
    { authToken: args.channelToken },
  );
  return unwrap(result);
};
