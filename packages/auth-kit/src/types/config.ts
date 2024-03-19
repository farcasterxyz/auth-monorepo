import { type AppClient } from "@farcaster/auth-client";

export interface Config {
  relay?: string;
  domain?: string;
  siweUri?: string;
  rpcUrl?: string;
  version?: string;
  appClient: AppClient;
}
