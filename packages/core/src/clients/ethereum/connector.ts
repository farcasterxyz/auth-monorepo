import { type Hex } from "viem";

export interface EthereumConnector {
  getFid: (custody: Hex) => Promise<bigint>;
}
