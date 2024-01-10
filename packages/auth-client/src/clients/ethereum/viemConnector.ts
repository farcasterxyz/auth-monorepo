import { Hex, createPublicClient, http } from "viem";
import { optimism } from "viem/chains";
import * as ethers from "ethers";
import { ID_REGISTRY_ADDRESS, idRegistryABI } from "../../contracts/idRegistry";
import { EthereumConnector } from "./connector";

interface ViemConfigArgs {
  rpcUrl?: string;
}

export const viemConnector = (args?: ViemConfigArgs): EthereumConnector => {
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

  const getProvider = () => {
    const { chain, transport } = publicClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
    };
    const rpc = transport.url ?? chain.rpcUrls.default.http[0];

    return new (
      ethers.providers
        ? ethers.providers.JsonRpcProvider
        : // @ts-expect-error -- ethers v6 compatibility hack
          ethers.JsonRpcProvider
    )(rpc, network);
  };

  return {
    getFid,
    provider: getProvider(),
  };
};
