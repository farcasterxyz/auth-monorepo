import type { Hex, PublicClient, Transport } from "viem";
import type { optimism } from "viem/chains";

export interface EthereumConnector {
  getFid: (custody: Hex) => Promise<bigint>;
  viemClient: PublicClient<Transport, typeof optimism>;
}
