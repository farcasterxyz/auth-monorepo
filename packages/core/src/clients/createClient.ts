import { type EthereumConnector } from "./ethereum/connector.js";

export interface CreateClientParameters {
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

export const createClient = ({ ethereum, ...config }: CreateClientParameters) => {
  return {
    config: { ...configDefaults, ...config },
    ethereum,
  };
};
