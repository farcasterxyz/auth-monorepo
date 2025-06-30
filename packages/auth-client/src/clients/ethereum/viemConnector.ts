import { type Address, type Hex, createPublicClient, encodeAbiParameters, http, fallback } from "viem";
import { optimism } from "viem/chains";
import { ID_REGISTRY_ADDRESS, idRegistryABI } from "../../contracts/idRegistry";
import { KEY_REGISTRY_ADDRESS, keyRegistryABI } from "../../contracts/keyRegistry";
import type { EthereumConnector } from "./connector";

interface ViemConfigArgs {
  rpcUrl?: string | undefined;
  rpcUrls?: string[] | undefined;
}

export const viemConnector = (args?: ViemConfigArgs): EthereumConnector => {
  const transport = (() => {
    if (args?.rpcUrls) {
      return fallback(args.rpcUrls.map((rpcUrl) => http(rpcUrl)));
    }

    if (!args?.rpcUrl) {
      console.warn("No `rpcUrl` provided to Viem connector, using public endpoint. Do not use this in production");
    }

    return http(args?.rpcUrl);
  })();

  const publicClient = createPublicClient({
    chain: optimism,
    transport,
  });

  const getFid = async (custody: Hex): Promise<bigint> => {
    return publicClient.readContract({
      address: ID_REGISTRY_ADDRESS,
      abi: idRegistryABI,
      functionName: "idOf",
      args: [custody],
    });
  };

  const isValidAuthAddress = async (authAddress: Address, fid: bigint): Promise<boolean> => {
    const paddedAddress = encodeAbiParameters([{ name: "authAddress", type: "address" }], [authAddress]);
    const keyData = await publicClient.readContract({
      address: KEY_REGISTRY_ADDRESS,
      abi: keyRegistryABI,
      functionName: "keyDataOf",
      args: [fid, paddedAddress],
    });
    return keyData.keyType === 2 && keyData.state === 1;
  };

  return {
    getFid,
    isValidAuthAddress,
    publicClient,
  };
};
