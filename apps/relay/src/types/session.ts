import { type Hex } from "viem";

export type PendingSession = { status: "pending"; nonce: string; url: string };
export type CompletedSession = {
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

export type Session = PendingSession | CompletedSession;
