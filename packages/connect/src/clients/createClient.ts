import { Ethereum } from "../clients/ethereum/viem";

export interface CreateClientArgs {
  relayURI?: string;
  version?: string;
  ethereum: Ethereum;
}

export interface ClientConfig {
  relayURI: string;
  version?: string;
}

export interface Client {
  config: ClientConfig;
  ethereum: Ethereum;
}

const configDefaults = {
  relayURI: "https://connect.farcaster.xyz",
  version: "v1",
};

export const createClient = ({ ethereum, ...config }: CreateClientArgs) => {
  return {
    config: { ...configDefaults, ...config },
    ethereum: ethereum,
  };
};
