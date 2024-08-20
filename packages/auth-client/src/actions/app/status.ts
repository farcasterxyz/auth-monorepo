import { AsyncUnwrapped, unwrap } from "../../errors";
import { Client } from "../../clients/createClient";
import { get, HttpResponse } from "../../clients/transports/http";
import type { Hex } from "viem";

export interface StatusArgs {
  channelToken: string;
}

export type StatusResponse = AsyncUnwrapped<HttpResponse<StatusAPIResponse>>;

export interface StatusAPIResponse {
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
  verifications?: string[];
  custody?: Hex;
  signatureParams: {
    siweUri: string;
    domain: string;
    nonce?: string;
    notBefore?: string;
    expirationTime?: string;
    requestId?: string;
    redirectUrl?: string;
  };
  metadata: {
    ip: string;
    userAgent: string;
  };
}

const path = "channel/status";

export const status = async (client: Client, { channelToken }: StatusArgs): StatusResponse => {
  const response = await get<StatusAPIResponse>(client, path, {
    authToken: channelToken,
  });
  return unwrap(response);
};
