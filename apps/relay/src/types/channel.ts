import { type Hex } from "viem";

export type PendingChannel = { status: "pending"; nonce: string; url: string };
export type CompletedChannel = {
  status: "completed";
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
