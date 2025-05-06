import { Address, Hex, createPublicClient, encodeAbiParameters, http } from "viem";
import { optimism } from "viem/chains";
import { ID_REGISTRY_ADDRESS, idRegistryABI } from "../../contracts/idRegistry";
import { KEY_REGISTRY_ADDRESS, keyRegistryABI } from "../../contracts/keyRegistry";
import { EthereumConnector } from "./connector";

interface ViemConfigArgs {
  rpcUrl?: string;
}

export const viemConnector = (args?: ViemConfigArgs): EthereumConnector => {
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(args?.rpcUrl),
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
  };
};
