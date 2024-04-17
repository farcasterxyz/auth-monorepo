import { type AppClient } from "@farcaster/auth-client";
import { type Provider } from "ethers";

export interface Config {
  relay?: string;
  domain: string;
  siweUri: string;
  rpcUrl?: string;
  redirectUrl?: string;
  version?: string;
  appClient: AppClient;
  provider?: Provider;
}
