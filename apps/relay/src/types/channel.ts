import { type Hex } from "viem";

export type PendingChannel = { state: "pending"; nonce: string; url: string };
export type CompletedChannel = {
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

export type Channel = PendingChannel | CompletedChannel;
