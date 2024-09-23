import type { Hex, PublicClient } from "viem";

export interface EthereumConnector {
  getFid: (custody: Hex) => Promise<bigint>;
  viemClient: PublicClient;
}
