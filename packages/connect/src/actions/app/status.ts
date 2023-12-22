import { AsyncUnwrapped, unwrap } from "../../errors";
import { Client } from "../../clients/createClient";
import { get, HttpResponse } from "../../clients/transports/http";

export interface StatusArgs {
  channelToken: string;
}

export type StatusResponse = AsyncUnwrapped<HttpResponse<StatusAPIResponse>>;

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
  const response = await get<StatusAPIResponse>(client, path, {
    authToken: channelToken,
  });
  return unwrap(response);
};
