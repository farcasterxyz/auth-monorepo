import { Hex, createPublicClient, http } from "viem";
import { optimism } from "viem/chains";
import { ID_REGISTRY_ADDRESS, idRegistryABI } from "@farcaster/hub-web";

export interface Ethereum {
  getFid: (custody: Hex) => Promise<BigInt>;
}

interface ViemConfigArgs {
  rpcUrl?: string;
}

export const viem = (args?: ViemConfigArgs): Ethereum => {
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(args?.rpcUrl),
  });

  const getFid = async (custody: Hex): Promise<BigInt> => {
    return publicClient.readContract({
      address: ID_REGISTRY_ADDRESS,
      abi: idRegistryABI,
      functionName: "idOf",
      args: [custody],
    });
  };

  return {
    getFid,
  };
};
