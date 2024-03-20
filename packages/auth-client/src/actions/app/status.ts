import { type Client } from "../../clients/createClient.js";
import { get } from "../../clients/transports/http.js";
import type { Hex } from "viem";

export type StatusParameters = {
  channelToken: string;
};

export type StatusReturnType = PendingStatusReturnType | CompletedStatusReturnType;

export type PendingStatusReturnType = { state: "pending"; nonce: string; url: string };
export type CompletedStatusReturnType = {
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

const path = "channel/status";

export const status = (client: Client, { channelToken }: StatusParameters): Promise<StatusReturnType> => {
  return get<StatusReturnType>(client, path, {
    authToken: channelToken,
  });
};
