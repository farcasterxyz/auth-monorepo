import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { AuthKitConfig } from "./AuthKitProvider";

const domainDefaults =
  typeof window !== "undefined" && window?.location
    ? {
        domain: window.location.host,
        siweUri: window.location.href,
      }
    : {};

const configDefaults = {
  relay: "https://relay.farcaster.xyz",
  version: "v1",
  ...domainDefaults,
};

export function createConfig(config: Omit<AuthKitConfig, "appClient">): AuthKitConfig {
  const authKitConfig = {
    ...configDefaults,
    ...config,
  };

  const { relay, rpcUrl, version } = authKitConfig;

  const ethereum = viemConnector(rpcUrl ? { rpcUrl } : undefined);
  const appClient = createAppClient({
    relay,
    ethereum,
    version,
  });
  return { ...authKitConfig, appClient };
}
