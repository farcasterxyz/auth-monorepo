import { AsyncUnwrapped, unwrap } from "../../errors";
import { Client } from "../../clients/createClient";
import { poll, HttpResponse } from "../../clients/transports/http";
import { StatusAPIResponse } from "./status";

export interface WatchStatusArgs {
  channelToken: string;
  timeout?: number;
  interval?: number;
  onResponse?: (response: HttpResponse<StatusAPIResponse>) => void;
}

export type WatchStatusResponse = AsyncUnwrapped<HttpResponse<StatusAPIResponse>>;

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
