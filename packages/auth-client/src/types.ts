import type { SiweMessage } from "siwe";

export type AuthMethod = "custody" | "authAddress";

export type FarcasterResourceParams = {
  fid: number;
};

export type SignInMessageParams = Partial<SiweMessage> & FarcasterResourceParams;
