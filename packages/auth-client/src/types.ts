import type { SiweMessage } from "siwe";

export type AuthMethod = "custody" | "authAddress";

export type FarcasterResourceParams = {
  fid: number;
  method?: AuthMethod;
};

export type SignInMessageParams = Partial<SiweMessage> & FarcasterResourceParams;
