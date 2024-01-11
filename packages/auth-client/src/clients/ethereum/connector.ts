import { Hex } from "viem";
import type { Provider } from "./ethers";

export interface EthereumConnector {
  getFid: (custody: Hex) => Promise<BigInt>;
  provider: Provider;
}
