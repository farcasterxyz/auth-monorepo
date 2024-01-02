import { useEffect, useState } from "react";
import { AppClient, createAppClient, viem } from "@farcaster/connect";
import { JsonRpcProvider } from "ethers";

interface UseAppClientArgs {
  relayURI?: string;
}

const defaults = {
  relayURI: "http://localhost:8000",
};

function useAppClient(args: UseAppClientArgs) {
  const { relayURI } = {
    ...defaults,
    ...args,
  };

  const [appClient, setAppClient] = useState<AppClient>();

  useEffect(() => {
    const client = createAppClient({
      relayURI,
      ethereum: viem(),
    });
    client.ethereum.provider = new JsonRpcProvider(
      "https://mainnet.optimism.io"
    );
    setAppClient(client);
  }, [relayURI]);

  return {
    appClient,
  };
}

export default useAppClient;
