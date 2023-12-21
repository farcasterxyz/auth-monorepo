import { Client } from "../../clients/createClient";
import { get, AsyncHttpResponse } from "../../clients/transports/http";

export interface StatusArgs {
  channelToken: string;
}

export type StatusResponse = AsyncHttpResponse<StatusAPIResponse>;

interface StatusAPIResponse {
  state: "pending" | "completed";
  nonce: string;
  message?: string;
  signature?: `0x${string}`;
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
}

const path = "connect/status";

export const status = async (client: Client, { channelToken }: StatusArgs): StatusResponse => {
  return get<StatusAPIResponse>(client, path, { authToken: channelToken });
};
