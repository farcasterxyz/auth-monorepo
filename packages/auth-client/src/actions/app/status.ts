import { Client } from "../../clients/createClient";
import { get, HttpResponse } from "../../clients/transports/http";
import type { Hex } from "viem";

export interface StatusArgs {
  channelToken: string;
}

export type StatusResponse = Promise<HttpResponse<StatusAPIResponse>>;

export type PendingStatusAPIResponse = { state: "pending"; nonce: string; url: string };
export type CompletedStatusAPIResponse = {
  state: "completed";
  message: string;
  signature: `0x${string}`;
  fid: number;
  username: string;
  bio: string;
  displayName: string;
  pfpUrl: string;
  verifications: Hex[];
  custody: Hex;
  nonce: string;
  url: string;
};

export type StatusAPIResponse = PendingStatusAPIResponse | CompletedStatusAPIResponse;
const path = "channel/status";

export const status = (client: Client, { channelToken }: StatusArgs): StatusResponse => {
  return get<StatusAPIResponse>(client, path, {
    authToken: channelToken,
  });
};
