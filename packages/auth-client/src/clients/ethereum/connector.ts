import { Hex } from "viem";
import type { providers } from "ethers";

export interface EthereumConnector {
  getFid: (custody: Hex) => Promise<BigInt>;
  provider: providers.JsonRpcProvider;
}
