import { Client } from "../clients/createClient";
import { get, AsyncHttpResponse } from "../clients/transports/http";

export interface StatusArgs {
  channelToken: string;
}

export interface StatusResponse {
  state: "pending" | "completed";
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

const path = "connect/status";

export const status = async (client: Client, { channelToken }: StatusArgs): AsyncHttpResponse<StatusResponse> => {
  return get(client, path, { authToken: channelToken });
};
