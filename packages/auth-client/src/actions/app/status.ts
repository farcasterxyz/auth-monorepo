import type { Hex } from "viem";
import { type AsyncUnwrapped, unwrap } from "../../errors";
import type { Client } from "../../clients/createClient";
import { get, type HttpResponse } from "../../clients/transports/http";
import type { AuthMethod } from "../../types";

export interface StatusArgs {
  channelToken: string;
}

export type StatusResponse = AsyncUnwrapped<HttpResponse<StatusAPIResponse>>;

export type StatusAPIResponse = {
  state: "pending";
  nonce: string;
} | {
  state: "completed";
  nonce: string;
  url: string;
  message: string;
  signature: `0x${string}`;
  authMethod?: AuthMethod;
  fid: number;
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
  acceptAuthAddress: boolean;
}

const path = "channel/status";

export const status = async (client: Client, { channelToken }: StatusArgs): StatusResponse => {
  const response = await get<StatusAPIResponse>(client, path, {
    authToken: channelToken,
  });
  return unwrap(response);
};
