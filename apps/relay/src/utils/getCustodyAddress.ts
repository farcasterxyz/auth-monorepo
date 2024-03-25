import { getConfig } from "./getConfig.js";
import { ID_REGISTRY_ADDRESS, idRegistryABI } from "@farcaster/core";

const { publicClient } = getConfig();

export async function getCustodyAddress(fid: number) {
  return publicClient.readContract({
    address: ID_REGISTRY_ADDRESS,
    abi: idRegistryABI,
    functionName: "custodyOf",
    args: [BigInt(fid ?? 0)],
  });
}
