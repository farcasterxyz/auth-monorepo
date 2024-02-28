import { Hex, createPublicClient, http } from "viem";
import { optimism } from "viem/chains";
import { ID_REGISTRY_ADDRESS, idRegistryABI } from "../../contracts/idRegistry";
import { EthereumConnector } from "./connector";
import { JsonRpcProvider } from "ethers";

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

  const getProvider = () => {
    const { chain, transport } = publicClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
    };
    const rpc = transport.url ?? chain.rpcUrls.default.http[0];
    return new JsonRpcProvider(rpc, network);
  };

  return {
    getFid,
    provider: getProvider(),
  };
};
