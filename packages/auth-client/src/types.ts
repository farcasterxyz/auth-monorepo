import type { SiweMessage } from "siwe";

export type AuthMethod = "custody" | "authAddress";

export type FarcasterResourceParams = {
  fid: number;
  authMethod?: AuthMethod;
};

export type SignInMessageParams = Partial<SiweMessage> & FarcasterResourceParams;
