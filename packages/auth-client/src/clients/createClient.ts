import { EthereumConnector } from "./ethereum/connector";
import type { Provider } from "ethers";

export interface CreateClientArgs {
  relay?: string;
  version?: string;
  ethereum: EthereumConnector;
}

export interface ClientConfig {
  relay: string;
  version?: string;
}

export interface Client {
  config: ClientConfig;
  ethereum: EthereumConnector;
}

const configDefaults = {
  relay: "https://relay.farcaster.xyz",
  version: "v1",
};

export const createClient = ({ ethereum, ...config }: CreateClientArgs) => {
  return {
    config: { ...configDefaults, ...config },
    ethereum,
  };
};
