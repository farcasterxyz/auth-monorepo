import type { Address, Client } from "viem";

export interface EthereumConnector {
  getFid: (custody: Address) => Promise<bigint>;
  isValidAuthAddress: (authAddress: Address, fid: bigint) => Promise<boolean>;
  publicClient: Client;
}
