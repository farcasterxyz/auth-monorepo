import { Ethereum } from "../clients/ethereum/viem";

export interface CreateClientArgs {
  relay?: string;
  version?: string;
  ethereum: Ethereum;
}

export interface ClientConfig {
  relay: string;
  version?: string;
}

export interface Client {
  config: ClientConfig;
  ethereum: Ethereum;
}

const configDefaults = {
  relay: "https://relay.farcaster.xyz",
  version: "v1",
};

export const createClient = ({ ethereum, ...config }: CreateClientArgs) => {
  return {
    config: { ...configDefaults, ...config },
    ethereum: ethereum,
  };
};
