import type { Hex } from "viem";

export type CreateChannelRequest = {
  siweUri: string;
  domain: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
  redirectUrl?: string;
  acceptAuthAddress?: boolean;
};

export type AuthenticateRequest = {
  message: string;
  signature: string;
  authMethod?: "custody" | "authAddress";
  fid: number;
  username: string;
  bio: string;
  displayName: string;
  pfpUrl: string;
};

export type SessionMetadata = {
  ip: string;
  userAgent: string;
};

export type RelaySession = {
  state: "pending" | "completed";
  nonce: string;
  url: string;
  connectUri: string;
  message?: string;
  signature?: string;
  authMethod?: "custody" | "authAddress";
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
  verifications?: string[];
  custody?: Hex;
  signatureParams: CreateChannelRequest;
  metadata: SessionMetadata;
  acceptAuthAddress: boolean;
};

export interface RelayConfig {
  urlBase: string;
  authKey?: string | undefined;
  hubUrl: string;
  hubFallbackUrl: string;
  optimismRpcUrl: string;
}
